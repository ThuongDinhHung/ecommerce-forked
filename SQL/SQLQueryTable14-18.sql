CREATE TABLE "PhoneNumbers" (
    userID VARCHAR(20),
    aPhoneNum VARCHAR(15) NOT NULL,
    PRIMARY KEY (userID, aPhoneNum),
    FOREIGN KEY (userID) REFERENCES [User](ID) ON DELETE CASCADE 
);
GO

CREATE TABLE "Reactions" (
    ReviewID VARCHAR(20),
    [Type] VARCHAR(20) CHECK ([Type] IN ('Like', 'Helpful', 'Love', 'Haha', 'Sad', 'Angry')),
    Author VARCHAR(100),
    PRIMARY KEY (ReviewID, [Type], Author),
    FOREIGN KEY (ReviewID) REFERENCES Review(ID) ON DELETE CASCADE
);
GO

CREATE TABLE "Replies" (
    ReviewID VARCHAR(20),
    Content VARCHAR(500) NOT NULL,
    Author VARCHAR(100) NOT NULL,
    [Time] DATETIME NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY (ReviewID, Content, Author, [Time]),
    FOREIGN KEY (ReviewID) REFERENCES Review(ID) ON DELETE CASCADE 
);
GO

CREATE TABLE Pay (
    BuyerID VARCHAR(20),
    OrderID VARCHAR(20),
    TransactionID VARCHAR(20),
    PRIMARY KEY (TransactionID, OrderID),
    FOREIGN KEY (BuyerID) REFERENCES [User](ID), 
    FOREIGN KEY (OrderID) REFERENCES [Order](ID),
    FOREIGN KEY (TransactionID) REFERENCES [Transaction](ID)
);
GO

INSERT INTO PhoneNumbers (userID, aPhoneNum)
VALUES
('U_BUY001', '0909111222'),
('U_BUY002', '0909333444'),
('U_SEL001', '0988001001'),
('U_SHP001', '0977555666'),
('U_ADM001', '0903123456');
GO

INSERT INTO Reactions (ReviewID, [Type], Author)
VALUES
('RV001', 'Helpful', 'Bob Johnson'), -- Bob finds Alice's review helpful
('RV001', 'Like', 'Charlie Brown'), -- Charlie likes Alice's review
('RV002', 'Like', 'Alice Smith'), -- Alice likes Bob's review
('RV003', 'Helpful', 'David Lee'), -- David finds Bob's other review helpful
('RV004', 'Love', 'Alice Smith'); -- Alice loves Charlie's review
GO

INSERT INTO Replies (ReviewID, Content, Author, [Time])
VALUES
('RV001', 'Thank you for your purchase, Alice!', 'Fashion Hub', '2025-10-01T11:00:00'), -- RV001 is for product from U_SEL003
('RV002', 'We are glad you like the book!', 'The Book Nook', '2025-10-02T12:00:00'), -- RV002 is for product from U_SEL001
('RV003', 'Enjoy the coffee, Bob!', 'Gourmet Foods', '2025-10-03T15:00:00'), -- RV003 is for product from U_SEL004
('RV004', 'A great choice for a laptop!', 'Tech World', '2025-10-04T19:00:00'), -- RV004 is for product from U_SEL002
('RV001', 'What a great review!', 'Charlie Brown', '2025-10-01T14:00:00'); -- Another user (Charlie) replies
GO

INSERT INTO Pay (BuyerID, OrderID, TransactionID)
VALUES
('U_BUY001', 'ORD001', 'T001'), -- Alice's order
('U_BUY002', 'ORD002', 'T002'), -- Bob's order
('U_BUY003', 'ORD003', 'T003'), -- Charlie's order
('U_BUY004', 'ORD004', 'T004'), -- David's order
('U_BUY005', 'ORD005', 'T005'); -- Eve's order
GO

CREATE PROCEDURE sp_CreateUser
    @ID INT,
    @Email VARCHAR(100),
    @Address VARCHAR(255),
    @FullName VARCHAR(100),
    @Rank VARCHAR(50), 
    @Gender VARCHAR(10),
    @DateOfBirth DATE, 

    -- User type and subclass attributes
    @UserType VARCHAR(10), -- 'Buyer', 'Seller', 'Admin', 'Shipper'
    @Role VARCHAR(50) = NULL, -- For Admin
    @LicensePlate VARCHAR(15) = NULL, -- For Shipper
    @Company VARCHAR(100) = NULL, -- For Shipper 
    @CartID INT = NULL -- For Buyer
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION;
    BEGIN TRY
        -- Insert into the superclass table
        INSERT INTO [User] (ID, Email, [Address], [Full name], [Rank])
        VALUES (@ID, @Email, @Address, @FullName, @Rank);

        -- Insert into the subclass table
        IF @UserType = 'Buyer'
            INSERT INTO Buyer (userID, cartID) VALUES (@ID, @CartID);
        ELSE IF @UserType = 'Seller'
            INSERT INTO Seller (userID) VALUES (@ID);
        ELSE IF @UserType = 'Admin'
            INSERT INTO Admin (userID, Role) VALUES (@ID, @Role);
        ELSE IF @UserType = 'Shipper'
            INSERT INTO Shipper (userID, LicensePlate, Company) VALUES (@ID, @LicensePlate, @Company);
        ELSE
            RAISERROR('Invalid user type specified.', 16, 1);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE PROCEDURE sp_UpdateUser
    @UserID INT,
    @Address VARCHAR(255),
    @FullName VARCHAR(100),
    @Rank VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validation
    IF NOT EXISTS (SELECT 1 FROM [User] WHERE ID = @UserID)
    BEGIN
        RAISERROR('User ID not found.', 16, 1); 
        RETURN;
    END;

    -- Update the User table
    UPDATE [User]
    SET [Address] = @Address,
        [Full name] = @FullName,
        [Rank] = @Rank
    WHERE ID = @UserID;
END;
GO

CREATE PROCEDURE sp_DeleteUser
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    /*
    == Justification (Requirement 2.1) ==
    Deletion of a User is DISALLOWED if they have associated business records. 
    This is a soft-delete policy required to maintain historical integrity.
    A user cannot be deleted if they are a:
    1. Seller with products (Product_SKU)
    2. Buyer with orders (Order) [cite: 160]
    3. Admin who created promotions (Promotion) 
    4. Shipper with deliveries (Deliver) 
    5. Buyer who wrote reviews (Write_review)
    
    Instead of hard deletion, an 'IsActive' flag in [User] would be set to 0. 
    For now, prevent the delete and raise an error.
    */

    -- Validation
    IF EXISTS (SELECT 1 FROM Product_SKU WHERE sellerID = @UserID) OR
       EXISTS (SELECT 1 FROM [Order] WHERE userID = @UserID) OR
       EXISTS (SELECT 1 FROM Promotion WHERE AdminID = @UserID) OR
       EXISTS (SELECT 1 FROM Deliver WHERE ShiperID = @UserID) OR
       EXISTS (SELECT 1 FROM Write_review WHERE UserID = @UserID)
    BEGIN
        RAISERROR('Cannot delete user. This user has associated products, orders, or other business records.', 16, 1);
        RETURN;
    END;

    -- If no records found, proceed with deletion from all tables
    BEGIN TRANSACTION;
    BEGIN TRY
        DELETE FROM Buyer WHERE userID = @UserID;
        DELETE FROM Seller WHERE userID = @UserID;
        DELETE FROM [Admin] WHERE userID = @UserID;
        DELETE FROM Shipper WHERE userID = @UserID;
        DELETE FROM [User] WHERE ID = @UserID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        RAISERROR('An error occurred during deletion. No data was changed.', 16, 1);
        THROW;
    END CATCH
END;
GO

CREATE TRIGGER trg_CheckSellerReview
ON Write_review
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if the user writing the review is the seller of the product
    IF EXISTS (
        SELECT 1
        FROM inserted i
        -- Find the product associated with the review
        JOIN Order_Item oi ON i.Order_itemID = oi.ID AND i.OrderID = oi.orderID 
        -- Find the seller of that product
        JOIN Product_SKU p ON oi.BarCode = p.[Bar code] 
        -- Check if the reviewer's ID matches the seller's ID
        WHERE i.UserID = p.sellerID 
    )
    BEGIN
        -- If a match is found, violate the rule
        RAISERROR('Sellers are not permitted to review their own products. The review has been cancelled.', 16, 1);
        ROLLBACK TRANSACTION; -- Cancel the INSERT
    END;
END;
GO

CREATE PROCEDURE sp_SearchUsers
    @SearchName VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        U.ID, 
        U.[Full name], 
        U.Email, 
        U.[Address],
        M.[Rank], 
        M.[Loyalty Point]
    FROM 
        [User] U
    JOIN 
        Membership M ON U.[Rank] = M.[Rank]
    WHERE 
        U.[Full name] LIKE '%' + @SearchName + '%' -- Show partial name matching
    ORDER BY 
        U.[Full name];
END;
GO

CREATE PROCEDURE sp_GetUserActivityReport
    @MinOrderCount INT,
    @StartDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        U.[Full name],
        U.Email,
        COUNT(O.ID) AS TotalOrders, 
        SUM(O.Total) AS TotalSpent 
    FROM 
        [User] U
    JOIN 
        Buyer B ON U.ID = B.userID 
    JOIN 
        [Order] O ON B.userID = O.userID 
    WHERE 
        O.Time >= @StartDate -- Show order after @StartDate
    GROUP BY 
        U.ID, U.[Full name], U.Email 
    HAVING 
        COUNT(O.ID) >= @MinOrderCount -- Show user with orders > @MinOrderCount
    ORDER BY 
        TotalSpent DESC; 
END;
GO


