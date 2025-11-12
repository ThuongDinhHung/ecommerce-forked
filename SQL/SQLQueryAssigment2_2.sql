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


CREATE PROCEDURE sp_GetShipperDeliveryStats
    @MinDistance INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Select aggregated data
    -- Joins 3 tables: Shipper, [User], Deliver
    SELECT
        s.UserID,
        u.Full_Name,
        COUNT(d.OrderID) AS TotalOrdersDelivered, -- Aggregate function
        SUM(d.Distance) AS TotalDistance
    FROM
        Shipper s
    JOIN
        [User] u ON s.UserID = u.ID
    JOIN
        Deliver d ON s.UserID = d.ShipperID
    WHERE
        d.Finish_Time IS NOT NULL -- WHERE clause (only count finished deliveries)
    GROUP BY
        s.UserID, u.Full_Name     -- GROUP BY clause
    HAVING
        SUM(d.Distance) > @MinDistance -- HAVING clause
    ORDER BY
        TotalDistance DESC;       -- ORDER BY clause
END;
GO

CREATE FUNCTION fn_GetSellerRevenue
(
    @SellerID VARCHAR(20),
    @StartDate DATETIME2,
    @EndDate DATETIME2
)
RETURNS INT
AS
BEGIN
    DECLARE @TotalRevenue INT = 0;
    DECLARE @ItemTotal INT;

    -- 1. Parameter Validation (IF)
    IF (@SellerID IS NULL OR @StartDate IS NULL OR @EndDate IS NULL)
        RETURN NULL;
    IF (@StartDate > @EndDate)
        RETURN NULL;

    -- 2. Cursor (CURSOR, LOOP)
    -- This cursor selects the total price of all order items
    -- sold by the specified seller within the date range.
    DECLARE item_cursor CURSOR FOR
        SELECT
            oi.Total
        FROM
            Order_item oi
        -- 3. Query (Query)
        JOIN
            Product_SKU psku ON oi.BARCODE = psku.Barcode
        JOIN
            [Order] o ON oi.OrderID = o.ID
        -- We need a 'CompletedTime' on the [Order] table,
        -- assuming [Order].ID is created at the time of purchase.
        -- For this example, we'll use OrderID creation time as "Sale Time".
        WHERE
            psku.SellerID = @SellerID
            AND CAST(o.ID AS DATETIME2) BETWEEN @StartDate AND @EndDate; -- Simplified time check

    OPEN item_cursor;
    FETCH NEXT FROM item_cursor INTO @ItemTotal;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @TotalRevenue = @TotalRevenue + @ItemTotal;
        FETCH NEXT FROM item_cursor INTO @ItemTotal;
    END;

    CLOSE item_cursor;
    DEALLOCATE item_cursor;

    RETURN @TotalRevenue;
END;
GO

/* -- This function assumes Table 18 (Deliver) exists.
-- If not, create it first:
CREATE TABLE Deliver (
    ShipperID VARCHAR(20),
    OrderID VARCHAR(20),
    VehicleID VARCHAR(20),
    Finish_Time DATETIME2,
    Departure_Time DATETIME2,
    Distance INT,
    PRIMARY KEY (ShipperID, OrderID),
    FOREIGN KEY (ShipperID) REFERENCES Shipper(UserID) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (OrderID) REFERENCES [Order](ID) ON UPDATE CASCADE ON DELETE NO ACTION
);
GO
*/

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

SELECT *
FROM dbo.fn_GetSellerProductReport('U_SEL001');
