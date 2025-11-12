--Create Database
CREATE DATABASE Assignment2
GO

USE Assignment2
GO

--Forgein table below
--Table 4: Entity Mapping of Review
CREATE TABlE Review
(
	ID VARCHAR(20),
	[Time] DATETIME2,
	PRIMARY KEY (ID)
)
GO

--Table 5: Entity Mapping of Membership
CREATE TABlE Membership
(
	[Rank] VARCHAR(10),
	Benefit NVARCHAR(50),
	LoyaltyPoint INTEGER,
	PRIMARY KEY ([Rank])
)
GO
--Table 10: User- Foreign key approach
CREATE TABlE [User]
(
	ID VARCHAR(20),
	Email VARCHAR(50) UNIQUE NOT NULL,
	[Address] NVARCHAR(100),
	Full_Name NVARCHAR(50),
	[Rank] VARCHAR(10),
	PRIMARY KEY (ID),
	FOREIGN KEY ([Rank]) REFERENCES Membership([Rank]) ON UPDATE CASCADE ON DELETE SET NULL,
)
GO

--Table 9: Order- Foreign key approach
CREATE TABlE [Order]
(
	ID VARCHAR(20),
	Total INTEGER,
	[Address] NVARCHAR(100),
	UserID VARCHAR(20) NOT NULL,
	PRIMARY KEY (ID),
	FOREIGN KEY (UserID) REFERENCES [User](ID) ON UPDATE CASCADE ON DELETE CASCADE
)
GO

--Table 12: Product SKU- Foreign key approach
CREATE TABlE Product_SKU
(
	Barcode VARCHAR(20),
	Stock INTEGER,
	Size INTEGER,
	Color NVARCHAR(20),
	Price INTEGER,
	[Name] NVARCHAR(100),
	ManufacturingDate DATETIME2,
	ExpiredDate DATETIME2,
	SellerID VARCHAR(20) NOT NULL,
	PRIMARY KEY (Barcode),
	FOREIGN KEY (SellerID) REFERENCES [User](ID) ON UPDATE CASCADE ON DELETE CASCADE,
)
GO

--Table 7: Weak Entity Mapping of Order Item
CREATE TABlE Order_item
(
	ID VARCHAR(20),
	OrderID VARCHAR(20),
	Total INTEGER,
	Quantity INTEGER,
	Price INTEGER,
	BARCODE VARCHAR(20) NOT NULL,
	PRIMARY KEY (ID,OrderID),
	FOREIGN KEY (OrderID) REFERENCES [Order](ID) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (Barcode) REFERENCES Product_SKU(Barcode) ON UPDATE NO ACTION ON DELETE NO ACTION,
)
GO

--Table 6: Entity Mapping of Cart
CREATE TABlE Cart
(
	ID VARCHAR(20),
	PRIMARY KEY (ID)
)
GO

--Table 18: Deliver
CREATE TABLE Deliver (
    ShipperID VARCHAR(20),
    OrderID VARCHAR(20),
    VehicleID VARCHAR(20),
    Finish_Time DATETIME2,
    Departure_Time DATETIME2,
    Distance INT,
    PRIMARY KEY (ShipperID, OrderID),
    FOREIGN KEY (ShipperID) REFERENCES Shipper(UserID),
    FOREIGN KEY (OrderID) REFERENCES [Order](ID)
);

--My work below
--Table 19: Write review- Relationship relation approach
CREATE TABlE Write_review
(
	ReviewID VARCHAR(20),
	UserID VARCHAR(20),
	Order_itemID VARCHAR(20),
	OrderID VARCHAR(20),
	PRIMARY KEY (ReviewID,UserID),
	
	-- SỬA LỖI: Bỏ comment và sửa FK
	FOREIGN KEY (ReviewID) REFERENCES Review(ID) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (UserID) REFERENCES [User](ID) ON UPDATE CASCADE ON DELETE CASCADE,
	
	-- SỬA LỖI: Tham chiếu đến Order_item phải dùng PK phức hợp (ID, OrderID) 
	FOREIGN KEY (Order_itemID, OrderID) REFERENCES Order_item(ID, OrderID) ON UPDATE NO ACTION ON DELETE NO ACTION
	
)
GO

--Table 20: Seller- Subclass of User
CREATE TABlE Seller
(
	UserID VARCHAR(20),
	PRIMARY KEY (UserID),
	FOREIGN KEY (UserID) REFERENCES [User](ID) ON UPDATE CASCADE ON DELETE CASCADE,
)
GO

--Table 21: Buyer- Subclass of User
CREATE TABlE Buyer
(
	UserID VARCHAR(20),
	CartID VARCHAR(20) UNIQUE NOT NULL,
	PRIMARY KEY (UserID),
	FOREIGN KEY (UserID) REFERENCES [User](ID) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (CartID) REFERENCES Cart(ID) ON UPDATE CASCADE ON DELETE CASCADE,
)
GO

--Table 22: Shipper- Subclass of User
CREATE TABLE Shipper
(
	UserID VARCHAR(20),
	LicensePlate VARCHAR(20),
	Company NVARCHAR(50),
	PRIMARY KEY (UserID),
	FOREIGN KEY (UserID) REFERENCES [User](ID) ON UPDATE CASCADE ON DELETE CASCADE,
)
GO

--Table 23: Admin- Subclass of User
CREATE TABLE [Admin]
(
	UserID VARCHAR(20),
	[Role] NVARCHAR(20),
	PRIMARY KEY (UserID),
	FOREIGN KEY (UserID) REFERENCES [User](ID) ON UPDATE CASCADE ON DELETE CASCADE,
)
GO


--Code trigger for total specialization of User
/* =============================================================================
CONSTRAINT 3 (Part 1): 
Prevent deleting the Seller role if this is the User's last role.
=============================================================================
*/
CREATE TRIGGER trg_Seller_CheckTotalSpecialization
ON Seller
AFTER DELETE
AS
BEGIN
    -- Check if the UserID that was just deleted from Seller still exists in the other 3 tables.
    IF EXISTS (
        SELECT 1 FROM deleted d
        WHERE NOT EXISTS (SELECT 1 FROM Buyer b WHERE b.UserID = d.UserID)
          AND NOT EXISTS (SELECT 1 FROM Shipper s WHERE s.UserID = d.UserID)
          AND NOT EXISTS (SELECT 1 FROM [Admin] a WHERE a.UserID = d.UserID)
    )
    BEGIN
        RAISERROR('A User must belong to at least one subclass. Deleting this last role (Seller) is not allowed.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

/* =============================================================================
CONSTRAINT 3 (Part 2): 
Prevent deleting the Buyer role if this is the User's last role.
=============================================================================
*/
CREATE TRIGGER trg_Buyer_CheckTotalSpecialization
ON Buyer
AFTER DELETE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM deleted d
        WHERE NOT EXISTS (SELECT 1 FROM Seller sl WHERE sl.UserID = d.UserID)
          AND NOT EXISTS (SELECT 1 FROM Shipper s WHERE s.UserID = d.UserID)
          AND NOT EXISTS (SELECT 1 FROM [Admin] a WHERE a.UserID = d.UserID)
    )
    BEGIN
        RAISERROR('A User must belong to at least one subclass. Deleting this last role (Buyer) is not allowed.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

/* =============================================================================
CONSTRAINT 3 (Part 3): 
Prevent deleting the Shipper role if this is the User's last role.
=============================================================================
*/
CREATE TRIGGER trg_Shipper_CheckTotalSpecialization
ON Shipper
AFTER DELETE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM deleted d
        WHERE NOT EXISTS (SELECT 1 FROM Seller sl WHERE sl.UserID = d.UserID)
          AND NOT EXISTS (SELECT 1 FROM Buyer b WHERE b.UserID = d.UserID)
          AND NOT EXISTS (SELECT 1 FROM [Admin] a WHERE a.UserID = d.UserID)
    )
    BEGIN
        RAISERROR('A User must belong to at least one subclass. Deleting this last role (Shipper) is not allowed.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

/* =============================================================================
CONSTRAINT 3 (Part 4): 
Prevent deleting the Admin role if this is the User's last role.
=============================================================================
*/
CREATE TRIGGER trg_Admin_CheckTotalSpecialization
ON [Admin]
AFTER DELETE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM deleted d
        WHERE NOT EXISTS (SELECT 1 FROM Seller sl WHERE sl.UserID = d.UserID)
          AND NOT EXISTS (SELECT 1 FROM Buyer b WHERE b.UserID = d.UserID)
          AND NOT EXISTS (SELECT 1 FROM Shipper s WHERE s.UserID = d.UserID)
    )
    BEGIN
        RAISERROR('A User must belong to at least one subclass. Deleting this last role (Admin) is not allowed.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO
--INSERT DATA
/* =============================================================================
STEP 1: INSERT data into tables with NO dependencies
=============================================================================
*/

-- Table 5: Entity Mapping of Membership
INSERT INTO Membership ([Rank], Benefit, LoyaltyPoint)
VALUES
('Bronze', 'Basic benefits', 0),
('Silver', 'Silver benefits, 5% discount', 1000),
('Gold', 'Gold benefits, 10% discount', 5000),
('Platinum', 'Platinum benefits, free shipping', 10000),
('Diamond', 'All benefits, 24/7 support', 50000);
GO

-- Table 4: Entity Mapping of Review
INSERT INTO Review (ID, [Time])
VALUES
('RV001', '2025-10-01T10:30:00'),
('RV002', '2025-10-02T11:45:00'),
('RV003', '2025-10-03T14:22:00'),
('RV004', '2025-10-04T18:10:00'),
('RV005', '2025-10-05T20:55:00');
GO

-- Table 6: Entity Mapping of Cart
INSERT INTO Cart (ID)
VALUES
('C001'),
('C002'),
('C003'),
('C004'),
('C005');
GO

/* =============================================================================
STEP 2: INSERT data into [User] table (depends on Membership)
We will create users for all subclasses (Admin, Seller, Buyer, Shipper)
to ensure we have 5 of each.
=============================================================================
*/
-- Table 10: User- Foreign key approach
INSERT INTO [User] (ID, Email, [Address], Full_Name, [Rank])
VALUES
-- Admins (5 users)
('U_ADM001', 'super.admin@shop.com', '1 Admin Way', 'Super Admin', 'Platinum'),
('U_ADM002', 'finance.admin@shop.com', '2 Admin Way', 'Finance Admin', 'Platinum'),
('U_ADM003', 'support.admin@shop.com', '3 Admin Way', 'Support Admin', 'Platinum'),
('U_ADM004', 'ops.admin@shop.com', '4 Admin Way', 'Operations Admin', 'Platinum'),
('U_ADM005', 'hr.admin@shop.com', '5 Admin Way', 'HR Admin', 'Platinum'),
-- Sellers (5 users)
('U_SEL001', 'bookstore@shop.com', '123 Book St', 'The Book Nook', 'Gold'),
('U_SEL002', 'techworld@shop.com', '456 Tech Ave', 'Tech World', 'Silver'),
('U_SEL003', 'fashionhub@shop.com', '789 Fashion Blvd', 'Fashion Hub', 'Gold'),
('U_SEL004', 'gourmet@shop.com', '101 Food Crt', 'Gourmet Foods', 'Bronze'),
('U_SEL005', 'hardware@shop.com', '202 Tool Ln', 'Hardware Central', 'Silver'),
-- Buyers (5 users)
('U_BUY001', 'alice@gmail.com', '1 Buyer Lane', 'Alice Smith', 'Gold'),
('U_BUY002', 'bob@gmail.com', '2 Buyer Ave', 'Bob Johnson', 'Silver'),
('U_BUY003', 'charlie@gmail.com', '3 Buyer Pl', 'Charlie Brown', 'Bronze'),
('U_BUY004', 'david@gmail.com', '4 Buyer Rd', 'David Lee', 'Gold'),
('U_BUY005', 'eve@gmail.com', '5 Buyer Crt', 'Eve Davis', 'Platinum'),
-- Shippers (5 users)
('U_SHP001', 'shipper1@delivery.com', '10 Ship St', 'Shipper One', 'Bronze'),
('U_SHP002', 'shipper2@delivery.com', '12 Ship St', 'Shipper Two', 'Silver'),
('U_SHP003', 'shipper3@delivery.com', '14 Ship St', 'Shipper Three', 'Bronze'),
('U_SHP004', 'shipper4@delivery.com', '16 Ship St', 'Shipper Four', 'Silver'),
('U_SHP005', 'shipper5@delivery.com', '18 Ship St', 'Shipper Five', 'Bronze');
GO

/* =============================================================================
STEP 3: INSERT data into Subclass tables (depend on [User] and Cart)
=============================================================================
*/

-- Table 20: Seller- Subclass of User
INSERT INTO Seller (UserID)
VALUES
('U_SEL001'),
('U_SEL002'),
('U_SEL003'),
('U_SEL004'),
('U_SEL005');
GO

-- Table 21: Buyer- Subclass of User (depends on [User] and Cart)
INSERT INTO Buyer (UserID, CartID)
VALUES
('U_BUY001', 'C001'),
('U_BUY002', 'C002'),
('U_BUY003', 'C003'),
('U_BUY004', 'C004'),
('U_BUY005', 'C005');
GO

-- Table 22: Shipper- Subclass of User
INSERT INTO Shipper (UserID, LicensePlate, Company)
VALUES
('U_SHP001', '51F-12345', 'Giaohangnhanh'),
('U_SHP002', '29H-67890', 'ShopeeExpress'),
('U_SHP003', '30A-11111', 'VNPost'),
('U_SHP004', '92G-22222', 'ViettelPost'),
('U_SHP005', '43C-33333', 'J&T Express');
GO

-- Table 23: Admin- Subclass of User
INSERT INTO [Admin] (UserID, [Role])
VALUES
('U_ADM001', 'SuperAdmin'),
('U_ADM002', 'Finance'),
('U_ADM003', 'Support'),
('U_ADM004', 'Operations'),
('U_ADM005', 'HR');
GO

/* =============================================================================
STEP 4: INSERT data into Product_SKU and [Order] (depend on subclasses)
=============================================================================
*/

-- Table 12: Product SKU- Foreign key approach (depends on Seller)
INSERT INTO Product_SKU (Barcode, Stock, Size, Color, Price, [Name], ManufacturingDate, ExpiredDate, SellerID)
VALUES
('SKU_BOOK_DB', 200, NULL, NULL, 120000, 'Database Systems Book', '2024-01-01', NULL, 'U_SEL001'),
('SKU_TECH_LAP', 30, 16, 'Silver', 15000000, 'Laptop 16in', '2025-01-01', NULL, 'U_SEL002'),
('SKU_FASH_SHOE_B', 100, 39, 'Black', 500000, 'Running Shoes', '2025-03-01', NULL, 'U_SEL003'),
('SKU_FASH_SHOE_W', 50, 40, 'White', 550000, 'Running Shoes', '2025-03-01', NULL, 'U_SEL003'),
('SKU_FOOD_COFFEE', 75, NULL, NULL, 85000, 'Organic Coffee 1kg', '2025-09-01', '2026-09-01', 'U_SEL004'),
('SKU_TOOL_HAMMER', 150, NULL, NULL, 25000, 'Hammer', '2024-05-01', NULL, 'U_SEL005');
GO

-- Table 9: Order- Foreign key approach (depends on Buyer)
INSERT INTO [Order] (ID, Total, [Address], UserID)
VALUES
('ORD001', 500000, '1 Buyer Lane', 'U_BUY001'), -- Alice buys Black Shoes
('ORD002', 205000, '2 Buyer Ave', 'U_BUY002'), -- Bob buys Book and Coffee
('ORD003', 15000000, '3 Buyer Pl', 'U_BUY003'), -- Charlie buys Laptop
('ORD004', 1100000, '4 Buyer Rd', 'U_BUY004'), -- David buys 2x White Shoes
('ORD005', 25000, '5 Buyer Crt', 'U_BUY005'); -- Eve buys Hammer
GO

/* =============================================================================
STEP 5: INSERT data into Order_item (depends on [Order] and Product_SKU)
=============================================================================
*/

-- Table 7: Weak Entity Mapping of Order Item
INSERT INTO Order_item (ID, OrderID, Total, Quantity, Price, BARCODE)
VALUES
('OI_001', 'ORD001', 500000, 1, 500000, 'SKU_FASH_SHOE_B'),
('OI_002', 'ORD002', 120000, 1, 120000, 'SKU_BOOK_DB'),
('OI_003', 'ORD002', 85000, 1, 85000, 'SKU_FOOD_COFFEE'),
('OI_004', 'ORD003', 15000000, 1, 15000000, 'SKU_TECH_LAP'),
('OI_005', 'ORD004', 1100000, 2, 550000, 'SKU_FASH_SHOE_W'),
('OI_006', 'ORD005', 25000, 1, 25000, 'SKU_TOOL_HAMMER');
GO

/* =============================================================================
STEP 6: INSERT data into Write_review (depends on Review, [User], Order_item)
=============================================================================
*/

-- Table 19: Write review- Relationship relation approach
INSERT INTO Write_review (ReviewID, UserID, Order_itemID, OrderID)
VALUES
('RV001', 'U_BUY001', 'OI_001', 'ORD001'), -- Alice reviews Black Shoes
('RV002', 'U_BUY002', 'OI_002', 'ORD002'), -- Bob reviews Book
('RV003', 'U_BUY002', 'OI_003', 'ORD002'), -- Bob reviews Coffee
('RV004', 'U_BUY003', 'OI_004', 'ORD003'), -- Charlie reviews Laptop
('RV005', 'U_BUY004', 'OI_005', 'ORD004'); -- David reviews White Shoes
GO

SELECT * FROM [User]
SELECT * FROM [Admin]
SELECT * FROM Buyer
SELECT * FROM Seller
SELECT * FROM Shipper
SELECT * FROM Product_SKU



