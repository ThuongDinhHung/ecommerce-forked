
%-------- PART 2 ---------
% -------- INSERT PRODUCT ----------
CREATE OR ALTER PROCEDURE sp_Seller_AddProduct
    @Bar_code VARCHAR(100),
    @Name VARCHAR(100),
    @Description TEXT,
    @Manufacturing_date DATE,
    @Expired_date DATE,
    @SellerID VARCHAR(100),
    @Status VARCHAR(20) = 'Active'
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 1. Validation: Check if Product already exists
    IF EXISTS (SELECT 1 FROM Product_SKU WHERE Bar_code = @Bar_code)
    BEGIN
        RAISERROR('Error: A product with this Barcode already exists.', 16, 1);
        RETURN;
    END

    -- 2. Validation: Check Logical Dates
    IF @Manufacturing_date >= @Expired_date
    BEGIN
        RAISERROR('Error: Manufacturing Date must be earlier than Expiration Date.', 16, 1);
        RETURN;
    END

    -- 3. Validation: Check Seller Existence
    IF NOT EXISTS (SELECT 1 FROM Seller WHERE Id = @SellerID)
    BEGIN
        RAISERROR('Error: Seller Account not found.', 16, 1);
        RETURN;
    END

    -- 4. Insert Logic
    BEGIN TRY
        INSERT INTO Product_SKU (Bar_code, Name, Description, Manufacturing_date, Expired_date, sellerID, Status)
        VALUES (@Bar_code, @Name, @Description, @Manufacturing_date, @Expired_date, @SellerID, @Status);
        
        PRINT 'Success: Product created successfully.';
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO


% -------------- REMOVE PRODUCT --------------
CREATE OR ALTER PROCEDURE sp_Seller_DeleteProduct
    @Bar_code VARCHAR(100),
    @SellerID VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Validation: Ownership Check
    IF NOT EXISTS (SELECT 1 FROM Product_SKU WHERE Bar_code = @Bar_code AND sellerID = @SellerID)
    BEGIN
        RAISERROR('Error: You do not have permission to delete this product.', 16, 1);
        RETURN;
    END

    -- 2. Validation: Check for Pending Orders (Optional, if strict)
    -- If there are active orders, we might block even a soft delete
    -- (This logic depends on your specific business rules)

    -- 3. Soft Delete Logic
    BEGIN TRY
        UPDATE Product_SKU
        SET Status = 'Deleted'
        WHERE Bar_code = @Bar_code;
        
        PRINT 'Success: Product removed from catalog.';
    END TRY
    BEGIN CATCH
        RAISERROR('Error: Could not delete product.', 16, 1);
    END CATCH
END;
GO


% -------------- UPDATE PRODUCT --------------
CREATE OR ALTER PROCEDURE sp_Seller_UpdateProduct
    @Bar_code VARCHAR(100),
    @Name VARCHAR(100),
    @Description TEXT,
    @Status VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Validation: Product must exist
    IF NOT EXISTS (SELECT 1 FROM Product_SKU WHERE Bar_code = @Bar_code)
    BEGIN
        RAISERROR('Error: Product not found.', 16, 1);
        RETURN;
    END

    -- 2. Update Logic
    BEGIN TRY
        UPDATE Product_SKU
        SET Name = @Name,
            Description = @Description,
            Status = @Status
        WHERE Bar_code = @Bar_code;
        
        PRINT 'Success: Product details updated.';
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO


% -------- GET DASHBOARD FOR SELLER  ----------
CREATE OR ALTER PROCEDURE sp_Seller_GetDashboardData
    @SellerID VARCHAR(100),
    @SearchKeyword VARCHAR(100) = NULL,
    @StatusFilter VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.Bar_code,
        p.Name,
        p.Status,
        p.Manufacturing_date,
        -- Aggregate data for display
        ISNULL(SUM(v.STOCK), 0) AS TotalStock,
        ISNULL(MIN(v.PRICE), 0) AS MinPrice,
        ISNULL(MAX(v.PRICE), 0) AS MaxPrice,
        COUNT(v.NAME) AS VariantCount
    FROM 
        Product_SKU p
    LEFT JOIN 
        VARIATIONS v ON p.Bar_code = v.Bar_code
    WHERE 
        p.sellerID = @SellerID
        -- Dynamic Search Filter
        AND (@SearchKeyword IS NULL OR p.Name LIKE '%' + @SearchKeyword + '%')
        -- Dynamic Status Filter
        AND (@StatusFilter IS NULL OR p.Status = @StatusFilter)
    GROUP BY 
        p.Bar_code, p.Name, p.Status, p.Manufacturing_date
    ORDER BY 
        p.Manufacturing_date DESC;
END;
GO

