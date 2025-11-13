USE Assignment2
GO

CREATE TRIGGER trg_UpdateOrderTotal
ON Order_item
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    -- This trigger updates the [Order].Total column
    -- based on the SUM of its Order_items.

    SET NOCOUNT ON;

    -- Get all unique OrderIDs affected by the DML operation
    -- (Can be from 'inserted' or 'deleted' tables)
    DECLARE @AffectedOrderIDs TABLE (ID VARCHAR(20) PRIMARY KEY);
    INSERT INTO @AffectedOrderIDs (ID) SELECT OrderID FROM inserted;
    INSERT INTO @AffectedOrderIDs (ID) SELECT OrderID FROM deleted
        WHERE OrderID NOT IN (SELECT ID FROM @AffectedOrderIDs);

    -- Update the [Order] table by joining with the affected IDs
    UPDATE o
    SET
        -- Calculate the new total from Order_item
        o.Total = (
            SELECT SUM(oi.Total)
            FROM Order_item oi
            WHERE oi.OrderID = o.ID
        )
    FROM
        [Order] o
    JOIN
        @AffectedOrderIDs a ON o.ID = a.ID;
END;
GO

CREATE PROCEDURE sp_GetShippersByCompany
    @Company NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Select shipper details and user details
    -- Join 2 tables: Shipper and [User]
    SELECT
        s.UserID,
        u.Full_Name,
        u.Email,
        s.LicensePlate,
        s.Company
    FROM
        Shipper s
    JOIN
        [User] u ON s.UserID = u.ID
    WHERE
        s.Company = @Company  -- WHERE clause
    ORDER BY
        u.Full_Name;          -- ORDER BY clause
END;
GO


-- This assumes you have created 


-- Drop the old version of the stored procedure if it exists
IF OBJECT_ID('sp_GetShipperDeliveryStats', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetShipperDeliveryStats;
GO

CREATE PROCEDURE sp_GetShipperDeliveryStats
    @MinDistance INT -- Parameter: Minimum total distance delivered (in meters/km)
AS
BEGIN
    SET NOCOUNT ON;

    -- Select aggregated delivery statistics for shippers
    -- Joins 4 tables: Shipper, [User], Deliver, and [Order]
    SELECT
        s.UserID,
        u.Full_Name,
        COUNT(d.OrderID) AS TotalOrdersDelivered,      -- Aggregate function: Count of orders
        SUM(d.Distance) AS TotalDistance,              -- Aggregate function: Sum of delivery distances
        SUM(o.Total) AS TotalRevenueDelivered          -- Aggregate function: Sum of order totals delivered
    FROM
        Shipper s
    JOIN
        [User] u ON s.UserID = u.ID
    JOIN
        Deliver d ON s.UserID = d.ShipperID
    JOIN
        [Order] o ON d.OrderID = o.ID                  -- Join to access Order.Total for TotalRevenueDelivered
    WHERE
        d.Finish_Time IS NOT NULL                      -- Filter: Only include completed deliveries
    GROUP BY
        s.UserID, u.Full_Name
    HAVING
        SUM(d.Distance) > @MinDistance                 -- Filter by aggregated total distance (as per original logic)
    ORDER BY
        TotalDistance DESC;                            -- Sort by total distance delivered
END;
GO

IF OBJECT_ID('fn_GetShipperRevenue', 'FN') IS NOT NULL
    DROP FUNCTION fn_GetShipperRevenue;
GO

CREATE FUNCTION fn_GetShipperRevenue
(
    @ShipperID VARCHAR(20),   -- Changed parameter to ShipperID
    @StartDate DATETIME2,
    @EndDate DATETIME2
)
RETURNS INT
AS
BEGIN
    DECLARE @TotalRevenue INT = 0;
    DECLARE @OrderItemTotal INT; -- Renamed for clarity, it will store o.Total

    -- 1. Parameter Validation
    -- Return 0 for INT function if parameters are invalid/null
    IF (@ShipperID IS NULL OR @StartDate IS NULL OR @EndDate IS NULL)
        RETURN 0;
    IF (@StartDate > @EndDate)
        RETURN 0;

    -- 2. Cursor
    -- This cursor selects the total price of all orders delivered by the specified shipper
    -- within the given date range (based on Finish_Time).
    DECLARE order_cursor CURSOR FOR
        SELECT
            o.Total -- Select the total of the Order
        FROM
            Deliver d
        JOIN
            [Order] o ON d.OrderID = o.ID -- Join with [Order] table to get Order.Total
        WHERE
            d.ShipperID = @ShipperID
            AND d.Finish_Time IS NOT NULL -- Only consider completed deliveries
            AND d.Finish_Time BETWEEN @StartDate AND @EndDate;

    OPEN order_cursor;
    FETCH NEXT FROM order_cursor INTO @OrderItemTotal;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @TotalRevenue = @TotalRevenue + ISNULL(@OrderItemTotal, 0); -- Add ISNULL to handle potential NULLs safely
        FETCH NEXT FROM order_cursor INTO @OrderItemTotal;
    END;

    CLOSE order_cursor;
    DEALLOCATE order_cursor;

    RETURN @TotalRevenue;
END;
GO

CREATE FUNCTION fn_GetSellerProductReport
(
    -- 1. Input Parameter
    @SellerID VARCHAR(20)
)
RETURNS @Report TABLE (
    -- This is the table structure the function will return
    Barcode VARCHAR(20),
    ProductName NVARCHAR(100),
    Price INT,
    PriceCategory NVARCHAR(20) -- This is the calculated column
)
AS
BEGIN
    -- 2. Parameter Validation (IF)
    IF (@SellerID IS NULL)
        RETURN;
    
    -- Check if the SellerID actually exists in the Seller table
    IF NOT EXISTS (SELECT 1 FROM Seller WHERE UserID = @SellerID)
        RETURN;

    -- Declare variables for the cursor loop
    DECLARE @Barcode VARCHAR(20);
    DECLARE @ProductName NVARCHAR(100);
    DECLARE @Price INT;
    DECLARE @Category NVARCHAR(20);

    -- 3. Cursor (CURSOR)
    -- Select all products sold by this specific seller
    DECLARE product_cursor CURSOR FOR
        -- 4. Query (Query)
        SELECT Barcode, [Name], Price
        FROM Product_SKU
        WHERE SellerID = @SellerID;

    OPEN product_cursor;
    FETCH NEXT FROM product_cursor INTO @Barcode, @ProductName, @Price;

    -- 5. Loop (LOOP)
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- 6. IF Statement (Logic)
        -- Categorize the product price based on simple rules
        IF @Price < 100000 -- Less than 100k
            SET @Category = 'Budget';
        ELSE IF @Price < 1000000 -- Less than 1 million
            SET @Category = 'Standard';
        ELSE
            SET @Category = 'Premium';

        -- Insert the categorized row into the return table
        INSERT INTO @Report (Barcode, ProductName, Price, PriceCategory)
        VALUES (@Barcode, @ProductName, @Price, @Category);

        -- Fetch the next product
        FETCH NEXT FROM product_cursor INTO @Barcode, @ProductName, @Price;
    END;

    CLOSE product_cursor;
    DEALLOCATE product_cursor;

    -- The function automatically returns the @Report table
    RETURN;
END;
GO
DELETE FROM Order_item
WHERE ID = 'OI_002' AND OrderID = 'ORD001' AND BARCODE = 'SKU_BOOK_DB';
PRINT '--- Product report for  U_SEL001---';
SELECT *
FROM dbo.fn_GetSellerProductReport('U_SEL001');

PRINT '--- UpdateOrderTotal ---';
SELECT ID, Total FROM [Order] WHERE ID = 'ORD001'; -- Change 'ORD001' by OrderID

INSERT INTO Order_item (ID,OrderID, BARCODE, Quantity, Total)
VALUES ('OI_002','ORD001', 'SKU_BOOK_DB', 2, 100000);

PRINT 'Order_item inserted. Checking Order.Total...';

SELECT ID, Total FROM [Order] WHERE ID = 'ORD001';

UPDATE Order_item
SET Quantity = 3, Total = 150000
WHERE OrderID = 'ORD001' AND BARCODE = 'SKU_BOOK_DB';

PRINT 'Order_item updated. Checking Order.Total again...';
SELECT ID, Total FROM [Order] WHERE ID = 'ORD001';

DELETE FROM Order_item
WHERE OrderID = 'ORD001' AND BARCODE = 'SKU_BOOK_DB';

PRINT 'Order_item deleted. Checking Order.Total one last time...';
SELECT ID, Total FROM [Order] WHERE ID = 'ORD001';

PRINT '--- End UpdateOrderTotal ---';

PRINT '--- GetShipperDeliveryStats ---';

EXEC sp_GetShipperDeliveryStats @MinDistance = 6000;

PRINT '--- GetShipperDeliveryStats ---';

PRINT '--- GetShippersByCompany ---';

EXEC sp_GetShippersByCompany @Company = 'Giaohangnhanh';

PRINT '--- GetShippersByCompany ---';

PRINT '--- GetShipperRevenue ---';
SELECT dbo.fn_GetShipperRevenue('U_SHP001', '2023-11-01', '2023-11-30') AS ShipperRevenue;

SELECT dbo.fn_GetShipperRevenue('U_SHP002', '2023-11-01', '2023-11-30') AS ShipperRevenue;

SELECT dbo.fn_GetShipperRevenue('U_SHP_UNKNOWN', '2023-11-01', '2023-11-30') AS ShipperRevenue;

PRINT '--- End GetShipperRevenue ---';
