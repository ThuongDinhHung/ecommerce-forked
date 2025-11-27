USE [BK-Bay]
GO

PRINT '============================================================';
PRINT '      PART 1: SCHEMA SETUP (PROCEDURES & TRIGGERS)          ';
PRINT '============================================================';

-- 1.1. Add 'Description' column to Review table if missing
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Review' AND COLUMN_NAME = 'Description')
BEGIN
    -- Check if 'Content' exists (legacy name), rename it
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Review' AND COLUMN_NAME = 'Content')
    BEGIN
        EXEC sp_rename 'Review.Content', 'Description', 'COLUMN';
        PRINT '=> [INFO] Renamed column Content to Description.';
    END
    ELSE
    BEGIN
        ALTER TABLE Review ADD Description NVARCHAR(MAX) NULL;
        PRINT '=> [INFO] Added Description column to Review table.';
    END
END
GO

-- 1.2. Stored Procedure: Get Product Reviews
CREATE OR ALTER PROCEDURE usp_GetProductReviews
    @Barcode VARCHAR(100),
    @FilterRating INT = NULL,
    @SortByDate VARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        r.ID AS ReviewID,
        u.FullName AS AuthorName,
        r.Rating,
        r.Description AS Content, -- Alias as Content for Frontend compatibility
        r.[Time] AS ReviewDate,
        v.NAME AS VariationName,
        (SELECT COUNT(*) FROM Reactions WHERE ReviewID = r.ID) AS TotalReactions
    FROM Product_SKU p
    JOIN Order_Item oi ON p.Bar_code = oi.BarCode
    JOIN Write_review wr ON oi.ID = wr.Order_itemID AND oi.orderID = wr.OrderID
    JOIN Review r ON wr.ReviewID = r.ID
    JOIN Buyer b ON wr.UserID = b.ID
    JOIN [User] u ON b.ID = u.ID
    LEFT JOIN VARIATIONS v ON oi.BarCode = v.Bar_code AND oi.Variation_Name = v.NAME
    WHERE p.Bar_code = @Barcode
      AND (@FilterRating IS NULL OR r.Rating = @FilterRating)
    ORDER BY 
        CASE WHEN @SortByDate = 'DESC' THEN r.[Time] END DESC,
        CASE WHEN @SortByDate = 'ASC' THEN r.[Time] END ASC;
END
GO

-- 1.3. Stored Procedure: Get Product List Simple (Dropdown)
CREATE OR ALTER PROCEDURE usp_GetAllProductsSimple
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.Bar_code AS ProductID,
        p.Name AS ProductName,
        (SELECT TOP 1 IMAGE_URL FROM IMAGES img WHERE img.Bar_code = p.Bar_code) AS Thumbnail
    FROM Product_SKU p
    ORDER BY p.Name ASC;
END
GO

-- 1.4. Stored Procedure: Get Purchased Items For Review
CREATE OR ALTER PROCEDURE usp_GetPurchasedItemsForReview
    @UserID VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        o.ID AS OrderID,
        oi.ID AS Order_ItemID,
        p.Name AS ProductName,
        v.NAME AS VariationName,
        oi.Price,
        o.Time AS PurchaseDate,
        (SELECT TOP 1 IMAGE_URL FROM IMAGES img WHERE img.Bar_code = p.Bar_code) AS ProductImage
    FROM [Order] o
    JOIN Order_Item oi ON o.ID = oi.orderID
    JOIN Product_SKU p ON oi.BarCode = p.Bar_code
    JOIN VARIATIONS v ON oi.BarCode = v.Bar_code AND oi.Variation_Name = v.NAME
    LEFT JOIN Write_review wr ON o.ID = wr.OrderID AND oi.ID = wr.Order_itemID
    WHERE o.buyerID = @UserID
      AND o.Status IN ('Completed', 'Delivered')
      AND wr.ReviewID IS NULL -- Only show items not reviewed yet
    ORDER BY o.Time DESC;
END
GO

-- 1.5. Stored Procedure: Upsert Reactions
CREATE OR ALTER PROCEDURE usp_Reactions_Upsert
    @ReviewID VARCHAR(100),
    @Type VARCHAR(50),
    @Author VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;
    
    IF EXISTS (SELECT 1 FROM Reactions WHERE ReviewID = @ReviewID AND Author = @Author)
    BEGIN
        DECLARE @CurrentType VARCHAR(50);
        SELECT @CurrentType = Type FROM Reactions WHERE ReviewID = @ReviewID AND Author = @Author;

        IF @CurrentType = @Type
        BEGIN
            DELETE FROM Reactions WHERE ReviewID = @ReviewID AND Author = @Author; -- Toggle Off
        END
        ELSE
        BEGIN
            UPDATE Reactions SET Type = @Type WHERE ReviewID = @ReviewID AND Author = @Author; -- Update
        END
    END
    ELSE
    BEGIN
        INSERT INTO Reactions (ReviewID, Type, Author) VALUES (@ReviewID, @Type, @Author); -- Insert
    END
    COMMIT TRANSACTION;
END
GO

-- 1.6. Trigger: Check Review Eligibility
CREATE OR ALTER TRIGGER trgCheckReviewEligibility
ON Write_review
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    -- Rule 1: Order must be Completed/Delivered
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN [Order] o ON i.OrderID = o.ID
        WHERE o.Status NOT IN ('Completed', 'Delivered')
    )
    BEGIN
        RAISERROR('Error: Order must be "Completed" before reviewing.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    -- Rule 2: Seller cannot review own product
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN Order_Item oi ON i.Order_itemID = oi.ID AND i.OrderID = oi.orderID
        JOIN Product_SKU p ON oi.BarCode = p.Bar_code
        WHERE p.sellerID = i.UserID
    )
    BEGIN
        RAISERROR('Error: Sellers cannot review their own products.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END
GO

-- 1.7. Trigger: Maintain Product Aggregates (AvgRating)
CREATE OR ALTER TRIGGER trg_Review_MaintainProductAggregates
ON Review
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @AffectedProducts TABLE (Bar_code VARCHAR(100));

    INSERT INTO @AffectedProducts (Bar_code)
    SELECT DISTINCT oi.BarCode
    FROM (SELECT ID FROM inserted UNION SELECT ID FROM deleted) r
    JOIN Write_review wr ON r.ID = wr.ReviewID
    JOIN Order_Item oi ON wr.Order_itemID = oi.ID AND wr.OrderID = oi.orderID;

    UPDATE p
    SET 
        p.ReviewCount = Stats.NewCount,
        p.AvgRating = CASE WHEN Stats.NewCount = 0 THEN 0 ELSE Stats.AvgScore END
    FROM Product_SKU p
    JOIN (
        SELECT 
            oi.BarCode,
            COUNT(r.ID) AS NewCount,
            CAST(AVG(CAST(r.Rating AS DECIMAL(10, 2))) AS DECIMAL(3, 2)) AS AvgScore
        FROM Order_Item oi
        JOIN Write_review wr ON oi.ID = wr.Order_itemID AND oi.orderID = wr.OrderID
        JOIN Review r ON wr.ReviewID = r.ID
        WHERE oi.BarCode IN (SELECT Bar_code FROM @AffectedProducts)
        GROUP BY oi.BarCode
    ) Stats ON p.Bar_code = Stats.BarCode;
END
GO

PRINT '=> [SUCCESS] Schema setup completed.';


PRINT '';
PRINT '============================================================';
PRINT '      PART 2: BULK DATA GENERATION (FOR TESTING)            ';
PRINT '============================================================';

-- 2.1. Prepare Test Users
DECLARE @TestUsers TABLE (UserID VARCHAR(100), UserName NVARCHAR(100));
INSERT INTO @TestUsers (UserID, UserName) VALUES 
('3cc0db8ccbd1c6c3cd5c91a5bc143419', 'hunglu'),      -- Main User
('1fae30b9757e8a7718f374c21605c661', 'newbuyer1'),
('92fd282b5ee113b7a6d3556559c6ba94', 'newbuyer2'),
('80f3da12ad74886aad8d031a5bf1d0ff', 'newbuyer3'),
('87fc7a86948207b2a003a7271c2816f8', 'newbuyer4');

INSERT INTO Buyer (ID)
SELECT UserID FROM @TestUsers WHERE UserID NOT IN (SELECT ID FROM Buyer);

-- 2.2. Ensure Product Variations
INSERT INTO VARIATIONS (Bar_code, NAME, STOCK, PRICE)
SELECT Bar_code, 'Standard', 100, 100000
FROM Product_SKU p
WHERE NOT EXISTS (SELECT 1 FROM VARIATIONS v WHERE v.Bar_code = p.Bar_code);

-- 2.3. Generate "Buy All" Orders
DECLARE @CurrentUserID VARCHAR(100);
DECLARE @CurrentUserName NVARCHAR(100);
DECLARE @NewOrderID VARCHAR(100);

DECLARE user_cursor CURSOR FOR SELECT UserID, UserName FROM @TestUsers;
OPEN user_cursor;
FETCH NEXT FROM user_cursor INTO @CurrentUserID, @CurrentUserName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @NewOrderID = 'ORD-ALL-' + @CurrentUserName;
    
    DELETE FROM Order_Item WHERE orderID = @NewOrderID;
    DELETE FROM [Order] WHERE ID = @NewOrderID;

    INSERT INTO [Order] (ID, Total, Address, Status, buyerID, Time)
    VALUES (@NewOrderID, 9999999, N'Test Address - Buy All', 'Completed', @CurrentUserID, GETDATE());

    INSERT INTO Order_Item (orderID, ID, Quantity, Price, BarCode, Variation_Name)
    SELECT 
        @NewOrderID, 
        'ITEM-' + p.Bar_code + '-' + @CurrentUserName, 
        1, 100000, p.Bar_code,
        ISNULL((SELECT TOP 1 NAME FROM VARIATIONS v WHERE v.Bar_code = p.Bar_code), 'Standard') 
    FROM Product_SKU p;

    PRINT '=> [INFO] Generated order ' + @NewOrderID + ' for user ' + @CurrentUserName;
    FETCH NEXT FROM user_cursor INTO @CurrentUserID, @CurrentUserName;
END
CLOSE user_cursor;
DEALLOCATE user_cursor;

PRINT '=> [SUCCESS] Bulk data generation completed.';


PRINT '';
PRINT '============================================================';
PRINT '      PART 3: TEST USAGE EXAMPLE (MANUAL REVIEW)            ';
PRINT '============================================================';

DECLARE @TargetProductID VARCHAR(100) = '00000001'; -- Product ID to review
DECLARE @ReviewerID VARCHAR(100) = '3cc0db8ccbd1c6c3cd5c91a5bc143419'; -- User: hunglu
DECLARE @Rating INT = 5;
DECLARE @Content NVARCHAR(MAX) = N'Manual SQL Review: Excellent quality!';

DECLARE @FoundOrderID VARCHAR(100);
DECLARE @FoundOrderItemID VARCHAR(100);
DECLARE @NewReviewID VARCHAR(100) = 'REV-SQL-' + FORMAT(GETDATE(), 'yyyyMMddHHmmss');

-- Auto-detect eligible order
SELECT TOP 1 @FoundOrderID = o.ID, @FoundOrderItemID = oi.ID
FROM [Order] o
JOIN Order_Item oi ON o.ID = oi.orderID
LEFT JOIN Write_review wr ON o.ID = wr.OrderID AND oi.ID = wr.Order_itemID
WHERE o.buyerID = @ReviewerID AND oi.BarCode = @TargetProductID AND o.Status IN ('Completed', 'Delivered') AND wr.ReviewID IS NULL;

IF @FoundOrderID IS NULL
BEGIN
    PRINT '❌ [ERROR] No eligible order found for Product: ' + @TargetProductID;
END
ELSE
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
            INSERT INTO Review (ID, Rating, Description, [Time]) VALUES (@NewReviewID, @Rating, @Content, GETDATE());
            INSERT INTO Write_review (ReviewID, UserID, OrderID, Order_itemID) VALUES (@NewReviewID, @ReviewerID, @FoundOrderID, @FoundOrderItemID);
        COMMIT TRANSACTION;
        PRINT '✅ [SUCCESS] Review inserted for Order: ' + @FoundOrderID;
        
        -- Check Trigger Result
        SELECT Bar_code, Name, AvgRating, ReviewCount FROM Product_SKU WHERE Bar_code = @TargetProductID;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        PRINT '❌ [SQL ERROR] ' + ERROR_MESSAGE();
    END CATCH
END

USE [BK-Bay]
GO

-- 1. Tạo thủ tục thêm Reply
CREATE OR ALTER PROCEDURE usp_InsertReply
    @ReviewID VARCHAR(100),
    @Author VARCHAR(100),
    @Content NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Insert vào bảng Replies
    INSERT INTO Replies (ReviewID, Author, Content, [Time])
    VALUES (@ReviewID, @Author, @Content, GETDATE());

    -- Trả về thông tin vừa tạo để UI hiển thị ngay
    SELECT TOP 1 
        Content, 
        Author AS Username, 
        [Time] AS Date
    FROM Replies 
    WHERE ReviewID = @ReviewID AND Author = @Author 
    ORDER BY [Time] DESC;
END
GO

-- 2. Nâng cấp thủ tục Lấy Review (Kèm Replies dạng JSON)
CREATE OR ALTER PROCEDURE usp_GetProductReviews
    @Barcode VARCHAR(100),
    @FilterRating INT = NULL,
    @SortByDate VARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        r.ID AS ReviewID,
        u.FullName AS AuthorName,
        r.Rating,
        r.Description AS Content,
        r.[Time] AS ReviewDate,
        v.NAME AS VariationName,
        (SELECT COUNT(*) FROM Reactions WHERE ReviewID = r.ID) AS TotalReactions,
        
        -- [MỚI] Lấy danh sách Reply lồng nhau dưới dạng JSON
        (
            SELECT 
                rep.Content AS content,
                rep.[Time] AS date,
                u_rep.FullName AS username,
                -- Tạo avatar giả cho reply user
                NULL AS avatar 
            FROM Replies rep
            JOIN [User] u_rep ON rep.Author = u_rep.ID
            WHERE rep.ReviewID = r.ID
            ORDER BY rep.[Time] ASC
            FOR JSON PATH
        ) AS RepliesJSON

    FROM Product_SKU p
    JOIN Order_Item oi ON p.Bar_code = oi.BarCode
    JOIN Write_review wr ON oi.ID = wr.Order_itemID AND oi.orderID = wr.OrderID
    JOIN Review r ON wr.ReviewID = r.ID
    JOIN Buyer b ON wr.UserID = b.ID
    JOIN [User] u ON b.ID = u.ID
    LEFT JOIN VARIATIONS v ON oi.BarCode = v.Bar_code AND oi.Variation_Name = v.NAME
    WHERE p.Bar_code = @Barcode
      AND (@FilterRating IS NULL OR r.Rating = @FilterRating)
    ORDER BY 
        CASE WHEN @SortByDate = 'DESC' THEN r.[Time] END DESC,
        CASE WHEN @SortByDate = 'ASC' THEN r.[Time] END ASC;
END
GO
