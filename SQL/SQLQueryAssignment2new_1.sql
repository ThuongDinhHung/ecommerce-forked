USE ThuanHung
GO

-- =============================================================================
-- SECTION 1: CREATE TABLES (NO FOREIGN KEYS)
-- All tables are created here without Foreign Key constraints.
-- Constraints like PK, UNIQUE, CHECK, and DEFAULT are included.
-- =============================================================================

-- Table 4: Entity Mapping of Review
CREATE TABLE Review
(
    ID VARCHAR(20),
    [Time] DATETIME2,
    Rating INT,
    [Type] VARCHAR(20),
    PRIMARY KEY (ID),
    CHECK (Rating >= 1 AND Rating <= 5)
)
GO

-- Table 5: Entity Mapping of Membership
CREATE TABLE Membership
(
    [Rank] VARCHAR(10),
    Benefit NVARCHAR(50),
    LoyaltyPoint INTEGER,
    PRIMARY KEY ([Rank])
)
GO


-- Table 6: Entity Mapping of Cart
CREATE TABLE Cart
(
    ID VARCHAR(20),
    PRIMARY KEY (ID)
)
GO

-- Table 1: Entity Mapping of Category
CREATE TABLE Category
(
    [Name] NVARCHAR(50),
    PRIMARY KEY ([Name])
)
GO

-- Table 2: Entity Mapping of Transaction
CREATE TABLE [Transaction]
(
    ID VARCHAR(20),
    [Time] DATETIME2,
    [Status] VARCHAR(20),
    Method VARCHAR(30),
    Amount INTEGER,
    PRIMARY KEY (ID)
)
GO

-- Table 3: Entity Mapping of Vehicle
CREATE TABLE Vehicle
(
    ID VARCHAR(20),
    Capacity INT,
    [Status] VARCHAR(20),
    Maintenance DATE,
    PRIMARY KEY (ID)
)
GO

-- Table 10: User
CREATE TABLE [User]
(
    ID VARCHAR(20),
    Email VARCHAR(50) UNIQUE NOT NULL,
    Username VARCHAR(50) UNIQUE NOT NULL,
    [Password] VARCHAR(100) NOT NULL,
    BirthDate DATE,
    Gender VARCHAR(6),
    [Status] VARCHAR(10) NOT NULL DEFAULT 'Active',
    [Address] NVARCHAR(100),
    Full_Name NVARCHAR(50),
    [Rank] VARCHAR(10) DEFAULT 'Bronze',
    LoyaltyPoint INTEGER,
    PRIMARY KEY (ID),
    CHECK (Gender IN ('Male', 'Female')),
    CHECK (DATEDIFF(YEAR, BirthDate, GETDATE()) >= 13),
    CHECK ([Status] IN ('Active', 'Suspended', 'Banned')),
    CHECK (LoyaltyPoint >= 0),
)
GO

-- Table 14: PhoneNumbers
CREATE TABLE PhoneNumbers
(
    UserID VARCHAR(20),
    aPhoneNum VARCHAR(15) UNIQUE NOT NULL,
    PRIMARY KEY (UserID, aPhoneNum)
)
GO

-- Table 15: Reactions
CREATE TABLE Reactions
(
    ReviewID VARCHAR(20),
    [Type] VARCHAR(20),
    Author VARCHAR(50),
    PRIMARY KEY (ReviewID, [Type], Author)
)
GO

-- Table 16: Replies
CREATE TABLE Replies
(
    ReviewID VARCHAR(20),
    Content NVARCHAR(200),
    Author VARCHAR(50),
    [Time] DATETIME2,
    PRIMARY KEY (ReviewID, Content, Author, [Time])
)
GO

-- Table 20: Seller
CREATE TABLE Seller
(
    UserID VARCHAR(20),
    [Status] VARCHAR(20) DEFAULT 'PendingVerification' NOT NULL,
    PRIMARY KEY (UserID),
    CHECK ([Status] IN ('Banned', 'Active', 'Rejected'))
)
GO

-- Table 21: Buyer
CREATE TABLE Buyer
(
    UserID VARCHAR(20),
    CartID VARCHAR(20) UNIQUE NOT NULL,
    PRIMARY KEY (UserID)
)
GO

-- Table 22: Shipper
CREATE TABLE Shipper
(
    UserID VARCHAR(20),
    LicensePlate VARCHAR(20),
    Company NVARCHAR(50),
    PRIMARY KEY (UserID)
)
GO

-- Table 23: Admin
CREATE TABLE [Admin]
(
    ID VARCHAR(20),
    [Role] NVARCHAR(20),
    PRIMARY KEY (ID)
)
GO

-- Table 11: Promotion
CREATE TABLE Promotion
(
    ID VARCHAR(20),
    [Type] VARCHAR(20),
    StartDate DATETIME2,
    EndDate DATETIME2,
    AdminID VARCHAR(20) NOT NULL,
    Value DECIMAL(10,2),
    PRIMARY KEY (ID)
)
GO

-- Table 12: Product SKU
CREATE TABLE Product_SKU
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
    CHECK (Price > 0),
    CHECK (Stock >= 0)
)
GO

-- Table 13: Belongs_to
CREATE TABLE Belongs_to
(
    CategoryName NVARCHAR(50),
    ProductID VARCHAR(20),
    PRIMARY KEY (CategoryName, ProductID)
)
GO

-- Table 8: CartItem
CREATE TABLE CartItem
(
    ID VARCHAR(20),
    CartID VARCHAR(20),
    Quantity INT,
    Barcode VARCHAR(20) NOT NULL,
    PRIMARY KEY (ID, CartID)
)
GO

-- Table 9: Order
CREATE TABLE [Order]
(
    ID VARCHAR(20),
    Total INTEGER,
    [Address] NVARCHAR(100),
    UserID VARCHAR(20) NOT NULL,
    Order_Time DATETIME2,
    [Status] VARCHAR(20) DEFAULT 'Pending' NOT NULL,
    PRIMARY KEY (ID),
    CHECK ([Status] IN ('Pending', 'Processing', 'Shipping', 'Delivered', 'Completed', 'Cancelled'))
)
GO

-- Table 7: Order_item
CREATE TABLE Order_item
(
    ID VARCHAR(20),
    OrderID VARCHAR(20),
    Total INTEGER,
    Quantity INTEGER,
    Price INTEGER,
    BARCODE VARCHAR(20) NOT NULL,
    PRIMARY KEY (ID,OrderID)
)
GO

-- Table 17: Pay
CREATE TABLE Pay
(
    BuyerID VARCHAR(20),
    OrderID VARCHAR(20),
    TransactionID VARCHAR(20),
    PRIMARY KEY (TransactionID, OrderID)
)
GO

-- Table 18: Deliver
CREATE TABLE Deliver (
    ShipperID VARCHAR(20),
    OrderID VARCHAR(20),
    VehicleID VARCHAR(20),
    Finish_Time DATETIME2,
    Departure_Time DATETIME2,
    Distance INT,
    PRIMARY KEY (ShipperID, OrderID)
);
GO

-- Table 19: Write_review
CREATE TABLE Write_review
(
    ReviewID VARCHAR(20),
    UserID VARCHAR(20),
    Order_itemID VARCHAR(20),
    OrderID VARCHAR(20),
    PRIMARY KEY (ReviewID,UserID)
)
GO


-- =============================================================================
-- SECTION 2: INSERT DATA
-- Data can now be inserted in any order, as there are no FK constraints.
-- =============================================================================

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
INSERT INTO Review (ID, [Time], Rating, [Type])
VALUES
('RV001', '2025-10-01T10:30:00', 5, 'Rating'),
('RV002', '2025-10-02T11:45:00', 4, 'Rating'),
('RV003', '2025-10-03T14:22:00', 3, 'Rating'),
('RV004', '2025-10-04T18:10:00', 1, 'Complaint'),
('RV005', '2025-10-05T20:55:00', 5, 'Rating');
GO

-- Table 6: Entity Mapping of Cart
INSERT INTO Cart (ID)
VALUES
('C001'), ('C002'), ('C003'), ('C004'), ('C005');
GO

-- Table 1: Entity Mapping of Category
INSERT INTO Category ([Name])
VALUES
('Books'), ('Electronics'), ('Fashion'), ('Groceries'), ('Hardware');
GO

-- Table 2: Entity Mapping of Transaction
INSERT INTO [Transaction] (ID, [Time], [Status], Method, Amount)
VALUES
('TRX001', '2023-11-10 10:01:00', 'Completed', 'CreditCard', 500000),
('TRX002', '2023-11-10 11:31:00', 'Completed', 'EWallet', 205000),
('TRX003', '2023-11-11 09:01:00', 'Completed', 'CreditCard', 15000000),
('TRX004', '2023-11-11 14:01:00', 'Completed', 'EWallet', 1100000),
('TRX005', '2023-11-12 08:01:00', 'Completed', 'COD', 25000);
GO

-- Table 3: Entity Mapping of Vehicle
INSERT INTO Vehicle (ID, Capacity, [Status], Maintenance)
VALUES
('XE001', 50, 'Active', '2025-01-01'),
('XE002', 50, 'Active', '2025-02-01'),
('XE003', 1000, 'Active', '2025-03-01'),
('XE004', 500, 'Maintenance', '2025-04-01'),
('XE005', 50, 'Active', '2025-05-01');
GO

-- Table 10: User
INSERT INTO [User] (ID, Email, Username, [Password], BirthDate, Gender, [Status], [Address], Full_Name, [Rank],LoyaltyPoint)
VALUES
-- Admins (5 users)
('U_ADM001', 'super.admin@shop.com', 'admin1', 'pass123', '1990-01-01', 'Male', 'Active', '1 Admin Way', 'Super Admin', 'Platinum',10000),
('U_ADM002', 'finance.admin@shop.com', 'admin2', 'pass123', '1991-01-01', 'Female', 'Active', '2 Admin Way', 'Finance Admin', 'Platinum',10000),
('U_ADM003', 'support.admin@shop.com', 'admin3', 'pass123', '1992-01-01', 'Male', 'Active', '3 Admin Way', 'Support Admin', 'Platinum',10000),
('U_ADM004', 'ops.admin@shop.com', 'admin4', 'pass123', '1993-01-01', 'Female', 'Active', '4 Admin Way', 'Operations Admin', 'Platinum',10000),
('U_ADM005', 'hr.admin@shop.com', 'admin5', 'pass123', '1994-01-01', 'Male', 'Active', '5 Admin Way', 'HR Admin', 'Platinum',10000),
-- Sellers (5 users)
('U_SEL001', 'bookstore@shop.com', 'seller1', 'pass123', '1995-01-01', 'Female', 'Active', '123 Book St', 'The Book Nook', 'Gold',5000),
('U_SEL002', 'techworld@shop.com', 'seller2', 'pass123', '1996-01-01', 'Male', 'Active', '456 Tech Ave', 'Tech World', 'Silver',1000),
('U_SEL003', 'fashionhub@shop.com', 'seller3', 'pass123', '1997-01-01', 'Female', 'Active', '789 Fashion Blvd', 'Fashion Hub', 'Gold',5000),
('U_SEL004', 'gourmet@shop.com', 'seller4', 'pass123', '1998-01-01', 'Male', 'Active', '101 Food Crt', 'Gourmet Foods', 'Bronze',100),
('U_SEL005', 'hardware@shop.com', 'seller5', 'pass123', '1999-01-01', 'Female', 'Active', '202 Tool Ln', 'Hardware Central', 'Silver',1000),
-- Buyers (5 users)
('U_BUY001', 'alice@gmail.com', 'buyer1', 'pass123', '2000-01-01', 'Female', 'Active', '1 Buyer Lane', 'Alice Smith', 'Gold',5000),
('U_BUY002', 'bob@gmail.com', 'buyer2', 'pass123', '2001-01-01', 'Male', 'Active', '2 Buyer Ave', 'Bob Johnson', 'Silver',1000),
('U_BUY003', 'charlie@gmail.com', 'buyer3', 'pass123', '2002-01-01', 'Male', 'Active', '3 Buyer Pl', 'Charlie Brown', 'Bronze',100),
('U_BUY004', 'david@gmail.com', 'buyer4', 'pass123', '2003-01-01', 'Male', 'Active', '4 Buyer Rd', 'David Lee', 'Gold',5000),
('U_BUY005', 'eve@gmail.com', 'buyer5', 'pass123', '2004-01-01', 'Female', 'Active', '5 Buyer Crt', 'Eve Davis', 'Platinum',10000),
-- Shippers (5 users)
('U_SHP001', 'shipper1@delivery.com', 'shipper1', 'pass123', '2000-02-01', 'Male', 'Active', '10 Ship St', 'Shipper One', 'Bronze',100),
('U_SHP002', 'shipper2@delivery.com', 'shipper2', 'pass123', '2001-02-01', 'Female', 'Active', '12 Ship St', 'Shipper Two', 'Silver',1000),
('U_SHP003', 'shipper3@delivery.com', 'shipper3', 'pass123', '2002-02-01', 'Male', 'Active', '14 Ship St', 'Shipper Three', 'Bronze',100),
('U_SHP004', 'shipper4@delivery.com', 'shipper4', 'pass123', '2003-02-01', 'Female', 'Active', '16 Ship St', 'Shipper Four', 'Silver',1000),
('U_SHP005', 'shipper5@delivery.com', 'shipper5', 'pass123', '2004-02-01', 'Male', 'Active', '18 Ship St', 'Shipper Five', 'Bronze',100);
GO

-- Table 14: PhoneNumbers
INSERT INTO PhoneNumbers (UserID, aPhoneNum)
VALUES
('U_ADM001', '0900000001'),
('U_SEL001', '0900000002'),
('U_BUY001', '0900000003'),
('U_SHP001', '0900000004'),
('U_BUY002', '0900000005');
GO

-- Table 15: Reactions
INSERT INTO Reactions (ReviewID, [Type], Author)
VALUES
('RV001', 'Like', 'Bob'),
('RV001', 'Love', 'Charlie'),
('RV004', 'Haha', 'Alice'),
('RV004', 'Wow', 'Alice'),
('RV004', 'Angry', 'Alice'),
('RV004', 'Sad', 'Alice');
GO

-- Table 16: Replies
INSERT INTO Replies (ReviewID, Content, Author, [Time])
VALUES
('RV004', 'We are very sorry for this experience, please contact support.', 'U_SEL002', '2025-10-04T19:00:00'),
('RV004', 'Sorry for the bad experience', 'U_SEL002', '2025-10-04T19:00:00'),
('RV004', 'Please do not leave bad reviews.', 'U_SEL002', '2025-10-04T19:00:00'),
('RV004', 'Thank you for your purchase.', 'U_SEL002', '2025-10-04T19:00:00'),
('RV004', 'Hope you come back', 'U_SEL002', '2025-10-04T19:00:00');
GO

-- Table 20: Seller
INSERT INTO Seller (UserID, [Status])
VALUES
('U_SEL001', 'Active'),
('U_SEL002', 'Active'),
('U_SEL003', 'Active'),
('U_SEL004', 'Banned'),
('U_SEL005', 'Active');
GO

-- Table 21: Buyer
INSERT INTO Buyer (UserID, CartID)
VALUES
('U_BUY001', 'C001'),
('U_BUY002', 'C002'),
('U_BUY003', 'C003'),
('U_BUY004', 'C004'),
('U_BUY005', 'C005');
GO

-- Table 22: Shipper
INSERT INTO Shipper (UserID, LicensePlate, Company)
VALUES
('U_SHP001', '51F-12345', 'Giaohangnhanh'),
('U_SHP002', '29H-67890', 'ShopeeExpress'),
('U_SHP003', '30A-11111', 'VNPost'),
('U_SHP004', '92G-22222', 'ViettelPost'),
('U_SHP005', '43C-33333', 'J&T Express');
GO

-- Table 23: Admin
INSERT INTO [Admin] (ID, [Role])
VALUES
('AD001', 'SuperAdmin'),
('AD002', 'SellerAdmin'),
('AD003', 'BuyerAdmin'),
('AD004', 'ShipperAdmin'),
('AD005', 'SellerAdmin'),
('AD006', 'BuyerAdmin'),
('AD007', 'ShipperAdmin');
GO

-- Table 11: Promotion
INSERT INTO Promotion (ID, [Type], StartDate, EndDate, AdminID,[Value])
VALUES
('PROMO001', 'Discount', '2023-11-01', '2023-11-30', 'U_ADM004',0.1),
('PROMO002', 'Gift', '2023-11-01', '2023-11-30', 'U_ADM004',10000),
('PROMO003', 'Discount', '2023-12-01', '2023-12-31', 'U_ADM004',0.1),
('PROMO004', 'Discount', '2023-11-01', '2023-12-31', 'U_ADM004',0.1),
('PROMO005', 'Gift', '2023-11-15', '2023-11-20', 'U_ADM004',10000);
GO
-- Table 12: Product SKU
INSERT INTO Product_SKU (Barcode, Stock, Size, Color, Price, [Name], ManufacturingDate, ExpiredDate, SellerID)
VALUES
('00000001', 200, NULL, NULL, 120000, 'Database Systems Book', '2024-01-01', NULL, 'U_SEL001'),
('00000002', 30, 16, 'Silver', 15000000, 'Laptop 16in', '2025-01-01', NULL, 'U_SEL002'),
('00000003', 100, 39, 'Black', 500000, 'Running Shoes', '2025-03-01', NULL, 'U_SEL003'),
('00000004', 50, 40, 'White', 550000, 'Running Shoes', '2025-03-01', NULL, 'U_SEL003'),
('00000005', 75, NULL, NULL, 85000, 'Organic Coffee 1kg', '2025-09-01', '2026-09-01', 'U_SEL004'),
('00000006', 150, NULL, NULL, 25000, 'Hammer', '2024-05-01', NULL, 'U_SEL005');
GO

-- Table 13: Belongs_to
INSERT INTO Belongs_to (CategoryName, ProductID)
VALUES
('Books', 'SKU_BOOK_DB'),
('Electronics', 'SKU_TECH_LAP'),
('Fashion', 'SKU_FASH_SHOE_B'),
('Fashion', 'SKU_FASH_SHOE_W'),
('Groceries', 'SKU_FOOD_COFFEE'),
('Hardware', 'SKU_TOOL_HAMMER');
GO

-- Table 8: CartItem
INSERT INTO CartItem (ID, CartID, Quantity, Barcode)
VALUES
('CI001', 'C001', 2, 'SKU_BOOK_DB'), -- Alice's cart
('CI002', 'C001', 1, 'SKU_TECH_LAP'), -- Alice's cart
('CI003', 'C002', 1, 'SKU_FASH_SHOE_B'), -- Bob's cart
('CI004', 'C003', 5, 'SKU_TOOL_HAMMER'), -- Charlie's cart
('CI005', 'C004', 1, 'SKU_FOOD_COFFEE'); -- David's cart
GO

-- Table 9: Order
INSERT INTO [Order] (ID, Total, [Address], UserID, Order_Time, [Status])
VALUES
('ORD001', 500000, '1 Buyer Lane', 'U_BUY001', '2023-11-10 10:00:00', 'Delivered'),
('ORD002', 205000, '2 Buyer Ave', 'U_BUY002', '2023-11-10 11:30:00', 'Delivered'),
('ORD003', 15000000, '3 Buyer Pl', 'U_BUY003', '2023-11-11 09:00:00', 'Completed'),
('ORD004', 1100000, '4 Buyer Rd', 'U_BUY004', '2023-11-11 14:00:00', 'Shipping'),
('ORD005', 25000, '5 Buyer Crt', 'U_BUY005', '2023-11-12 08:00:00', 'Pending');
GO

-- Table 7: Order_item
INSERT INTO Order_item (ID, OrderID, Total, Quantity, Price, BARCODE)
VALUES
('OI_001', 'ORD001', 500000, 1, 500000, 'SKU_FASH_SHOE_B'),
('OI_002', 'ORD002', 120000, 1, 120000, 'SKU_BOOK_DB'),
('OI_003', 'ORD002', 85000, 1, 85000, 'SKU_FOOD_COFFEE'),
('OI_004', 'ORD003', 15000000, 1, 15000000, 'SKU_TECH_LAP'),
('OI_005', 'ORD004', 1100000, 2, 550000, 'SKU_FASH_SHOE_W'),
('OI_006', 'ORD005', 25000, 1, 25000, 'SKU_TOOL_HAMMER');
GO

-- Table 17: Pay
INSERT INTO Pay (BuyerID, OrderID, TransactionID)
VALUES
('U_BUY001', 'ORD001', 'TRX001'),
('U_BUY002', 'ORD002', 'TRX002'),
('U_BUY003', 'ORD003', 'TRX003'),
('U_BUY004', 'ORD004', 'TRX004'),
('U_BUY005', 'ORD005', 'TRX005');
GO


-- Table 18: Deliver
INSERT INTO Deliver (ShipperID, OrderID, VehicleID, Departure_Time, Finish_Time, Distance) VALUES
('U_SHP001', 'ORD001', 'XE001', '2023-11-10 10:30:00', '2023-11-10 11:00:00', 5000), -- 5km
('U_SHP001', 'ORD002', 'XE001', '2023-11-10 12:00:00', '2023-11-10 12:45:00', 8500), -- 8.5km
('U_SHP002', 'ORD003', 'XE002', '2023-11-11 09:15:00', '2023-11-11 09:50:00', 6000), -- 6km
('U_SHP003', 'ORD004', 'XE003', '2023-11-11 14:30:00', '2023-11-11 14:55:00', 3500), -- 3.5km
('U_SHP002', 'ORD005', 'XE002', '2023-11-12 08:10:00', '2023-11-12 09:00:00', 10200); -- 10.2km
GO


-- Table 19: Write_review
INSERT INTO Write_review (ReviewID, UserID, Order_itemID, OrderID)
VALUES
('RV001', 'U_BUY001', 'OI_001', 'ORD001'), -- Alice reviews Black Shoes
('RV002', 'U_BUY002', 'OI_002', 'ORD002'), -- Bob reviews Book
('RV003', 'U_BUY002', 'OI_003', 'ORD002'), -- Bob reviews Coffee
('RV004', 'U_BUY003', 'OI_004', 'ORD003'), -- Charlie reviews Laptop
('RV005', 'U_BUY004', 'OI_005', 'ORD004'); -- David reviews White Shoes
GO

PRINT '--- All tables created and data inserted successfully (without Foreign Keys). ---'
GO

/* ==========================================================================
   SCRIPT: ADD FOREIGN KEYS
   Based on document: DATABASE_SYSTEM_ASSIGNMENT_2_251_CC02.pdf (Section 3)
   Executor: Data Engineer
   ========================================================================== */

USE ThuanHung; -- Ensure you are using the correct database
GO

-- 1. SUBCLASS RELATIONSHIPS (Inheritance from User)
-- Table 22: Seller -> User
ALTER TABLE Seller
ADD CONSTRAINT FK_Seller_User FOREIGN KEY (UserID) REFERENCES [User](ID);
GO

-- Table 23: Buyer -> User
ALTER TABLE Buyer
ADD CONSTRAINT FK_Buyer_User FOREIGN KEY (UserID) REFERENCES [User](ID);
GO

-- Table 24: Shipper -> User
ALTER TABLE Shipper
ADD CONSTRAINT FK_Shipper_User FOREIGN KEY (UserID) REFERENCES [User](ID);
GO

-- 2. RELATIONSHIPS FOR BUYER & CART
-- Table 23: Buyer also links to Cart (1-1 relationship)
ALTER TABLE Buyer
ADD CONSTRAINT FK_Buyer_Cart FOREIGN KEY (CartID) REFERENCES Cart(ID);
GO

-- 3. WEAK ENTITIES
-- Table 8: Order_item (Links to Order and Product)
ALTER TABLE Order_item
ADD CONSTRAINT FK_OrderItem_Order FOREIGN KEY (OrderID) REFERENCES [Order](ID);

ALTER TABLE Order_item
ADD CONSTRAINT FK_OrderItem_Product FOREIGN KEY (BARCODE) REFERENCES Product_SKU(Barcode);
GO

-- Table 9: CartItem (Links to Cart and Product)
ALTER TABLE CartItem
ADD CONSTRAINT FK_CartItem_Cart FOREIGN KEY (CartID) REFERENCES Cart(ID);

ALTER TABLE CartItem
ADD CONSTRAINT FK_CartItem_Product FOREIGN KEY (Barcode) REFERENCES Product_SKU(Barcode);
GO

-- 4. 1:N RELATIONSHIPS (One-to-Many)
-- Table 10: Order -> User (The Buyer placing the order)
ALTER TABLE [Order]
ADD CONSTRAINT FK_Order_User FOREIGN KEY (UserID) REFERENCES [User](ID);
GO

-- Table 13: Product_SKU -> User (The Seller selling the item)
-- Note: Mapping (Table 13) specifies reference to User.ID
ALTER TABLE Product_SKU
ADD CONSTRAINT FK_Product_User FOREIGN KEY (SellerID) REFERENCES [User](ID);
GO

-- Table 11: Promotion -> Admin (The Admin creating the promotion)
-- Based on PDF page 29, Promotion has AdminID
ALTER TABLE Promotion
ADD CONSTRAINT FK_Promotion_Admin FOREIGN KEY (AdminID) REFERENCES [Admin](ID);
GO

-- 5. MULTIVALUED ATTRIBUTES
-- Table 16: PhoneNumbers -> User
ALTER TABLE PhoneNumbers
ADD CONSTRAINT FK_PhoneNumbers_User FOREIGN KEY (UserID) REFERENCES [User](ID);
GO

-- Table 17: Reactions -> Review
ALTER TABLE Reactions
ADD CONSTRAINT FK_Reactions_Review FOREIGN KEY (ReviewID) REFERENCES Review(ID);
GO

-- Table 18: Replies -> Review
ALTER TABLE Replies
ADD CONSTRAINT FK_Replies_Review FOREIGN KEY (ReviewID) REFERENCES Review(ID);
GO

-- 6. M:N RELATIONSHIPS & N-ARY (Many-to-Many & High-Order Relationships)
-- Table 14: Belongs_to (Category <-> Product)
ALTER TABLE Belongs_to
ADD CONSTRAINT FK_BelongsTo_Category FOREIGN KEY (CategoryName) REFERENCES Category([Name]);

ALTER TABLE Belongs_to
ADD CONSTRAINT FK_BelongsTo_Product FOREIGN KEY (ProductID) REFERENCES Product_SKU(Barcode);
GO

-- Table 19: Pay (Buyer pays for Order via Transaction)
ALTER TABLE Pay
ADD CONSTRAINT FK_Pay_Transaction FOREIGN KEY (TransactionID) REFERENCES [Transaction](ID);

ALTER TABLE Pay
ADD CONSTRAINT FK_Pay_Order FOREIGN KEY (OrderID) REFERENCES [Order](ID);

ALTER TABLE Pay
ADD CONSTRAINT FK_Pay_Buyer FOREIGN KEY (BuyerID) REFERENCES [User](ID); 
-- Note: Mapping Table 19 (page 22) states Buyer.ID -> User.ID
GO

-- Table 20: Deliver (Shipper delivers Order using Vehicle)
ALTER TABLE Deliver
ADD CONSTRAINT FK_Deliver_Shipper FOREIGN KEY (ShipperID) REFERENCES [User](ID); 
-- Mapping Table 20 (page 22) states Shipper.userID -> Shipper.userID -> User.ID (Since Shipper is a subclass)

ALTER TABLE Deliver
ADD CONSTRAINT FK_Deliver_Order FOREIGN KEY (OrderID) REFERENCES [Order](ID);

ALTER TABLE Deliver
ADD CONSTRAINT FK_Deliver_Vehicle FOREIGN KEY (VehicleID) REFERENCES Vehicle(ID);
GO

-- Table 21: Write_review (User writes Review for a specific Order Item)
ALTER TABLE Write_review
ADD CONSTRAINT FK_WriteReview_Review FOREIGN KEY (ReviewID) REFERENCES Review(ID);

ALTER TABLE Write_review
ADD CONSTRAINT FK_WriteReview_User FOREIGN KEY (UserID) REFERENCES [User](ID);

-- Composite Foreign Key referencing Order_item
ALTER TABLE Write_review
ADD CONSTRAINT FK_WriteReview_OrderItem FOREIGN KEY (Order_itemID, OrderID) REFERENCES Order_item(ID, OrderID);
GO

PRINT '=== ALL FOREIGN KEYS CREATED SUCCESSFULLY ===';



Chào "Tech Lead",

Dựa vào hình ảnh bạn cung cấp, tôi thấy danh sách Buyer có ID từ B-001 đến B-005 và Seller là S-001 đến S-005.

Để tạo được Review hợp lệ (vượt qua các Trigger kiểm tra logic), chúng ta buộc phải tạo Đơn hàng (Order) trạng thái Completed cho từng Buyer đó trước, sau đó mới Insert được Review.

Dưới đây là script SQL đã được chuyển sang tiếng Anh hoàn toàn, fix lỗi logic (Barcode khớp nhau) và thêm 5 review mẫu.

SQL

USE [BK-Bay]
GO

-- =============================================
-- STEP 1: CREATE CATEGORY & PRODUCT
-- =============================================
-- Create Category
IF NOT EXISTS (SELECT 1 FROM Category WHERE Name = 'Electronics')
    INSERT INTO Category (Name) VALUES ('Electronics');

-- Create Product (Seller ID S-001 taken from your image)
DELETE FROM Product_SKU WHERE Bar_code = '00000001';

INSERT INTO Product_SKU (Bar_code, Name, Description, sellerID, AvgRating, ReviewCount) 
VALUES 
('00000001', 'Logitech G102 Gaming Mouse', 'Affordable and high-performance gaming mouse', 'S-001', 0, 0);

-- Create Variations (Black/White) - Linked to Product 00000001
INSERT INTO VARIATIONS (Bar_code, NAME, STOCK, PRICE) 
VALUES 
('00000001', 'Black', 100, 500000),
('00000001', 'White', 50, 520000);

-- Create Image
INSERT INTO IMAGES (Bar_code, IMAGE_URL)
VALUES ('00000001', 'https://example.com/mouse-black.jpg');

-- =============================================
-- STEP 2: CREATE COMPLETED ORDERS FOR 5 BUYERS
-- (Prerequisite: Users B-001 to B-005 must exist in your DB as per the image)
-- =============================================

-- Order 1 for Buyer B-001
INSERT INTO [Order] (ID, Total, Address, Status, buyerID, Time) 
VALUES ('ORD-001', 500000, '1 Consumer Ct, CO', 'Completed', 'B-001', GETDATE());

INSERT INTO Order_Item (orderID, ID, Quantity, Price, BarCode, Variation_Name) 
VALUES ('ORD-001', 'ITEM-001', 1, 500000, '00000001', 'Black');

-- Order 2 for Buyer B-002
INSERT INTO [Order] (ID, Total, Address, Status, buyerID, Time) 
VALUES ('ORD-002', 500000, '2 Shopping Cir, AZ', 'Completed', 'B-002', GETDATE());

INSERT INTO Order_Item (orderID, ID, Quantity, Price, BarCode, Variation_Name) 
VALUES ('ORD-002', 'ITEM-002', 1, 500000, '00000001', 'Black');

-- Order 3 for Buyer B-003
INSERT INTO [Order] (ID, Total, Address, Status, buyerID, Time) 
VALUES ('ORD-003', 520000, '3 Wishlist Pl, MN', 'Completed', 'B-003', GETDATE());

INSERT INTO Order_Item (orderID, ID, Quantity, Price, BarCode, Variation_Name) 
VALUES ('ORD-003', 'ITEM-003', 1, 520000, '00000001', 'White');

-- Order 4 for Buyer B-004
INSERT INTO [Order] (ID, Total, Address, Status, buyerID, Time) 
VALUES ('ORD-004', 500000, '4 Order Way, NV', 'Completed', 'B-004', GETDATE());

INSERT INTO Order_Item (orderID, ID, Quantity, Price, BarCode, Variation_Name) 
VALUES ('ORD-004', 'ITEM-004', 1, 500000, '00000001', 'Black');

-- Order 5 for Buyer B-005
INSERT INTO [Order] (ID, Total, Address, Status, buyerID, Time) 
VALUES ('ORD-005', 520000, '5 Discount Dr, VT', 'Completed', 'B-005', GETDATE());

INSERT INTO Order_Item (orderID, ID, Quantity, Price, BarCode, Variation_Name) 
VALUES ('ORD-005', 'ITEM-005', 1, 520000, '00000001', 'White');

-- =============================================
-- STEP 3: CREATE 5 REVIEWS (ENGLISH CONTENT)
-- =============================================

-- Review 1 by B-001 (Kelly User)
INSERT INTO Review (ID, Rating, [Time]) VALUES ('REV-001', 5, GETDATE());
INSERT INTO Write_review (ReviewID, UserID, OrderID, Order_itemID) 
VALUES ('REV-001', 'B-001', 'ORD-001', 'ITEM-001');

-- Review 2 by B-002 (Leo User)
INSERT INTO Review (ID, Rating, [Time]) VALUES ('REV-002', 4, GETDATE());
INSERT INTO Write_review (ReviewID, UserID, OrderID, Order_itemID) 
VALUES ('REV-002', 'B-002', 'ORD-002', 'ITEM-002');
-- Note: Assuming "Content" is handled via Replies or a separate column if you added it. 
-- If you want to mock content in a separate table or column, you'd add it here.
-- Assuming standard schema, content is often in Review or Write_review depending on your specific modification.
-- *If your Review table DOES NOT have a Content column yet, these entries just set the rating.*

-- Review 3 by B-003 (Mia User)
INSERT INTO Review (ID, Rating, [Time]) VALUES ('REV-003', 5, GETDATE());
INSERT INTO Write_review (ReviewID, UserID, OrderID, Order_itemID) 
VALUES ('REV-003', 'B-003', 'ORD-003', 'ITEM-003');

-- Review 4 by B-004 (Noah User)
INSERT INTO Review (ID, Rating, [Time]) VALUES ('REV-004', 3, GETDATE());
INSERT INTO Write_review (ReviewID, UserID, OrderID, Order_itemID) 
VALUES ('REV-004', 'B-004', 'ORD-004', 'ITEM-004');

-- Review 5 by B-005 (Olive User)
INSERT INTO Review (ID, Rating, [Time]) VALUES ('REV-005', 5, GETDATE());
INSERT INTO Write_review (ReviewID, UserID, OrderID, Order_itemID) 
VALUES ('REV-005', 'B-005', 'ORD-005', 'ITEM-005');

PRINT '=== SAMPLE DATA INSERTION COMPLETED SUCCESSFULLY ===';

USE [BK-Bay]
GO

-- =============================================
-- BƯỚC 1: CHUẨN BỊ SẢN PHẨM (Barcode 00000001)
-- =============================================
-- Đảm bảo sản phẩm 00000001 tồn tại và có biến thể để mua
IF NOT EXISTS (SELECT 1 FROM Product_SKU WHERE Bar_code = '00000001')
BEGIN
    -- Nếu chưa có thì tạo lại (dùng Seller S-001 có sẵn)
    INSERT INTO Product_SKU (Bar_code, Name, Description, sellerID, AvgRating, ReviewCount) 
    VALUES ('00000001', 'Logitech G102 Gaming Mouse', 'High performance mouse', 'S-001', 0, 0);
END

-- Đảm bảo có biến thể "Màu Đen"
IF NOT EXISTS (SELECT 1 FROM VARIATIONS WHERE Bar_code = '00000001' AND NAME = N'Màu Đen')
BEGIN
    INSERT INTO VARIATIONS (Bar_code, NAME, STOCK, PRICE) VALUES ('00000001', N'Màu Đen', 100, 500000);
END

-- =============================================
-- BƯỚC 2: TẠO ĐƠN HÀNG CHO USER "HUNGLU" (Để bạn test viết Review)
-- =============================================
DECLARE @HungLuID VARCHAR(100) = '3cc0db8ccbd1c6c3cd5c91a5bc143419'; -- ID lấy từ ảnh

-- Đảm bảo hunglu nằm trong bảng Buyer
IF NOT EXISTS (SELECT 1 FROM Buyer WHERE ID = @HungLuID)
    INSERT INTO Buyer (ID) VALUES (@HungLuID);

-- Tạo đơn hàng đã hoàn thành cho HungLu
DELETE FROM [Order] WHERE ID = 'ORD-008-HUNGLU'; -- Xóa nếu trùng

INSERT INTO [Order] (ID, Total, Address, Status, buyerID, Time) 
VALUES ('ORD-008-HUNGLU', 500000, N'268 Ly Thuong Kiet', 'Completed', @HungLuID, GETDATE());

INSERT INTO Order_Item (orderID, ID, Quantity, Price, BarCode, Variation_Name) 
VALUES ('ORD-008-HUNGLU', 'ITEM-008-HL', 1, 500000, '00000001', N'Màu Đen');

-- =============================================
-- BƯỚC 3: CÁC BUYER KHÁC MUA VÀ REVIEW SẢN PHẨM NÀY (Tạo data mẫu)
-- =============================================

-- --- Buyer B-001 (Kelly) ---
-- 1. Mua hàng
INSERT INTO [Order] (ID, Total, Address, Status, buyerID, Time) VALUES ('ORD-008-01', 500000, 'USA', 'Completed', 'B-001', DATEADD(day, -10, GETDATE()));
INSERT INTO Order_Item (orderID, ID, Quantity, Price, BarCode, Variation_Name) VALUES ('ORD-008-01', 'ITM-008-01', 1, 500000, '00000001', N'Màu Đen');
-- 2. Review (5 Sao)
INSERT INTO Review (ID, Rating, [Time]) VALUES ('REV-008-01', 5, DATEADD(day, -9, GETDATE()));
INSERT INTO Write_review (ReviewID, UserID, OrderID, Order_itemID) VALUES ('REV-008-01', 'B-001', 'ORD-008-01', 'ITM-008-01');
-- 3. Thả tim (Reaction) cho review này
INSERT INTO Reactions (ReviewID, Type, Author) VALUES ('REV-008-01', 'Like', 'B-002'); -- B-002 like bài B-001

-- --- Buyer B-002 (Leo) ---
-- 1. Mua hàng
INSERT INTO [Order] (ID, Total, Address, Status, buyerID, Time) VALUES ('ORD-008-02', 500000, 'UK', 'Completed', 'B-002', DATEADD(day, -5, GETDATE()));
INSERT INTO Order_Item (orderID, ID, Quantity, Price, BarCode, Variation_Name) VALUES ('ORD-008-02', 'ITM-008-02', 1, 500000, '00000001', N'Màu Đen');
-- 2. Review (4 Sao)
INSERT INTO Review (ID, Rating, [Time]) VALUES ('REV-008-02', 4, DATEADD(day, -4, GETDATE()));
INSERT INTO Write_review (ReviewID, UserID, OrderID, Order_itemID) VALUES ('REV-008-02', 'B-002', 'ORD-008-02', 'ITM-008-02');

-- --- Buyer B-003 (Mia) ---
-- 1. Mua hàng
INSERT INTO [Order] (ID, Total, Address, Status, buyerID, Time) VALUES ('ORD-008-03', 500000, 'VN', 'Completed', 'B-003', DATEADD(day, -2, GETDATE()));
INSERT INTO Order_Item (orderID, ID, Quantity, Price, BarCode, Variation_Name) VALUES ('ORD-008-03', 'ITM-008-03', 1, 500000, '00000001', N'Màu Đen');
-- 2. Review (5 Sao)
INSERT INTO Review (ID, Rating, [Time]) VALUES ('REV-008-03', 5, DATEADD(day, -1, GETDATE()));
INSERT INTO Write_review (ReviewID, UserID, OrderID, Order_itemID) VALUES ('REV-008-03', 'B-003', 'ORD-008-03', 'ITM-008-03');

-- --- Buyer B-004 (Noah) ---
-- 1. Mua hàng
INSERT INTO [Order] (ID, Total, Address, Status, buyerID, Time) VALUES ('ORD-008-04', 500000, 'CA', 'Completed', 'B-004', GETDATE());
INSERT INTO Order_Item (orderID, ID, Quantity, Price, BarCode, Variation_Name) VALUES ('ORD-008-04', 'ITM-008-04', 1, 500000, '00000001', N'Màu Đen');
-- 2. Review (3 Sao - Hơi chê)
INSERT INTO Review (ID, Rating, [Time]) VALUES ('REV-008-04', 3, GETDATE());
INSERT INTO Write_review (ReviewID, UserID, OrderID, Order_itemID) VALUES ('REV-008-04', 'B-004', 'ORD-008-04', 'ITM-008-04');

-- =============================================
-- BƯỚC 4: UPDATE LẠI SỐ LIỆU THỐNG KÊ (Cho Trigger chạy)
-- =============================================
-- Tính toán lại AvgRating và ReviewCount cho sản phẩm 00000001
UPDATE Product_SKU 
SET ReviewCount = (SELECT COUNT(*) FROM Write_review wr JOIN Order_Item oi ON wr.Order_itemID = oi.ID WHERE oi.BarCode = '00000001'),
    AvgRating = (SELECT AVG(CAST(r.Rating AS DECIMAL(10,2))) 
                 FROM Review r 
                 JOIN Write_review wr ON r.ID = wr.ReviewID 
                 JOIN Order_Item oi ON wr.Order_itemID = oi.ID 
                 WHERE oi.BarCode = '00000001')
WHERE Bar_code = '00000001';

PRINT '=== DONE: User HungLu da mua hang & co 4 review mau tu nguoi khac ===';
