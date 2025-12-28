-- =====================================================
-- SQL Script: Khởi tạo Database cho Net_Manager (PostgreSQL)
-- Cập nhật: 2025-12-28
-- Đồng bộ với Sequelize Models
-- =====================================================

-- LƯU Ý: Chạy script này sau khi đã tạo database CyberOps
-- CREATE DATABASE "CyberOps" ENCODING 'UTF8';

-- =====================================================
-- XÓA CÁC BẢNG VÀ TYPES CŨ (theo thứ tự phụ thuộc)
-- =====================================================
DROP TABLE IF EXISTS promotion CASCADE;
DROP TABLE IF EXISTS topup_transaction CASCADE;
DROP TABLE IF EXISTS message CASCADE;
DROP TABLE IF EXISTS order_details CASCADE;
DROP TABLE IF EXISTS food_order CASCADE;
DROP TABLE IF EXISTS "Menu_Item" CASCADE;
DROP TABLE IF EXISTS computer CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS role CASCADE;

-- Xóa ENUM types (để có thể chạy lại script)
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS topup_status CASCADE;
DROP TYPE IF EXISTS promotion_type CASCADE;

-- =====================================================
-- 1. BẢNG ROLE (Vai trò)
-- Model: Role.js -> tableName: "role"
-- =====================================================
CREATE TABLE role (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO role (role_id, role_name) VALUES 
(1, 'admin'),
(2, 'staff'),
(3, 'user');

SELECT setval('role_role_id_seq', 3, true);

-- =====================================================
-- 2. BẢNG USER (Người dùng)
-- Model: User.js -> tableName: "User"
-- =====================================================
CREATE TABLE "User" (
    user_id BIGSERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT REFERENCES role(role_id) ON DELETE SET NULL,
    balance INT DEFAULT 0,
    status VARCHAR(255) DEFAULT 'offline',
    avatar VARCHAR(255) NULL                      -- [THÊM] Cột avatar
);

-- Dữ liệu mẫu (password: 123456 - hash bằng bcrypt)
INSERT INTO "User" (user_name, password, role_id, balance, status, avatar) VALUES 
('staff1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 0, 'offline', NULL),
('user1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 100000, 'offline', NULL),
('user2', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 50000, 'offline', NULL);

-- =====================================================
-- 3. BẢNG COMPUTER (Máy tính - Sơ đồ phòng máy)
-- Model: Computer.js -> tableName: "computer"
-- =====================================================
CREATE TABLE computer (
    computer_id SERIAL PRIMARY KEY,
    computer_name VARCHAR(255) NOT NULL DEFAULT 'May Moi',
    x INT NOT NULL,
    y INT NOT NULL,
    status VARCHAR(255) DEFAULT 'bao tri',
    current_user_id BIGINT REFERENCES "User"(user_id) ON DELETE SET NULL,  -- [SỬA] INT -> BIGINT
    session_start_time TIMESTAMP NULL,
    UNIQUE (x, y)
);

-- Dữ liệu mẫu: Phòng máy Grid 12x20
-- Khu thường (Hàng 1-2, 4-5)
INSERT INTO computer (computer_name, x, y, status) VALUES 
('PC-01', 1, 1, 'trong'), ('PC-02', 1, 2, 'trong'), ('PC-03', 1, 3, 'trong'),
('PC-04', 1, 5, 'trong'), ('PC-05', 1, 6, 'trong'),
('PC-06', 2, 1, 'trong'), ('PC-07', 2, 2, 'trong'), ('PC-08', 2, 3, 'trong'),
('PC-09', 2, 5, 'trong'), ('PC-10', 2, 6, 'trong'),
('PC-11', 4, 1, 'trong'), ('PC-12', 4, 2, 'trong'), ('PC-13', 4, 3, 'trong'),
('PC-14', 4, 5, 'trong'), ('PC-15', 4, 6, 'trong'),
('PC-16', 5, 1, 'trong'), ('PC-17', 5, 2, 'trong'), ('PC-18', 5, 3, 'trong'),
('PC-19', 5, 5, 'trong'), ('PC-20', 5, 6, 'trong');

-- Khu VIP (Hàng 7-8)
INSERT INTO computer (computer_name, x, y, status) VALUES 
('VIP-01', 7, 10, 'trong'), ('VIP-02', 7, 11, 'trong'),
('VIP-03', 7, 12, 'trong'), ('VIP-04', 7, 13, 'trong'),
('VIP-05', 8, 10, 'trong'), ('VIP-06', 8, 11, 'trong'),
('VIP-07', 8, 12, 'trong'), ('VIP-08', 8, 13, 'trong');

-- =====================================================
-- 4. BẢNG MENU_ITEM (Thực đơn đồ ăn/uống)
-- Model: MenuItem.js -> tableName: "Menu_Item"
-- =====================================================
CREATE TABLE "Menu_Item" (
    item_id SERIAL PRIMARY KEY,
    food_name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    stock BOOLEAN DEFAULT true,
    image_url VARCHAR(255) NULL
);

INSERT INTO "Menu_Item" (food_name, price, stock, image_url) VALUES 
('Mì tôm', 15000, true, '/images/menu/mi-tom.jpg'),
('Coca Cola', 12000, true, '/images/menu/coca.jpg'),
('Pepsi', 12000, true, '/images/menu/pepsi.jpg'),
('Sting', 10000, true, '/images/menu/sting.jpg'),
('Nước suối', 8000, true, '/images/menu/nuoc-suoi.jpg'),
('Snack Oishi', 10000, true, '/images/menu/snack.jpg'),
('Bánh mì', 20000, true, '/images/menu/banh-mi.jpg'),
('Cơm hộp', 35000, true, '/images/menu/com-hop.jpg'),
('Trà đào', 18000, true, '/images/menu/tra-dao.jpg'),
('Cà phê sữa', 20000, true, '/images/menu/ca-phe.jpg');

-- =====================================================
-- 5. BẢNG FOOD_ORDER (Đơn hàng đồ ăn)
-- Model: FoodOrder.js -> tableName: "food_order"
-- =====================================================
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');

CREATE TABLE food_order (
    bill_id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,  -- [SỬA] INT -> BIGINT
    total_amount INT NOT NULL,
    status order_status DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. BẢNG ORDER_DETAILS (Chi tiết đơn hàng)
-- Model: OrderDetail.js -> tableName: "order_details"
-- =====================================================
CREATE TABLE order_details (
    detail_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES food_order(bill_id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES "Menu_Item"(item_id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    unit_price INT NOT NULL,
    subtotal INT NOT NULL
);

-- =====================================================
-- 7. BẢNG MESSAGE (Tin nhắn chat)
-- Model: Message.js -> tableName: "message"
-- =====================================================
CREATE TABLE message (
    message_id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(50) NULL,
    sender_id BIGINT NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,  -- [SỬA] INT -> BIGINT
    sender_name VARCHAR(255) NOT NULL,
    role_id INT DEFAULT 3,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. BẢNG TOPUP_TRANSACTION (Giao dịch nạp tiền)
-- Model: TopupTransaction.js -> tableName: "topup_transaction"
-- =====================================================
CREATE TYPE topup_status AS ENUM ('pending', 'success', 'expired', 'cancelled');

CREATE TABLE topup_transaction (
    transaction_id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
    amount INT NOT NULL,
    transaction_code VARCHAR(20) NOT NULL UNIQUE,
    status topup_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL
);

-- =====================================================
-- 9. BẢNG PROMOTION (Khuyến mãi & Sự kiện)
-- Model: Promotion.js -> tableName: "promotion"
-- =====================================================
CREATE TYPE promotion_type AS ENUM ('announcement', 'topup_bonus', 'event');

CREATE TABLE promotion (
    promotion_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    type promotion_type DEFAULT 'announcement',
    bonus_percent INT DEFAULT 0,
    min_amount INT DEFAULT 0,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO promotion (title, description, type, bonus_percent, min_amount, start_date, end_date, is_active) VALUES
('🔥 Nạp 100K nhận 120K', 'Khuyến mãi nạp tiền +20% áp dụng từ 28/12 - 31/12', 'topup_bonus', 20, 100000, '2025-12-28 00:00:00+07', '2025-12-31 23:59:59+07', true),
('🎄 Sự kiện Giáng Sinh', 'Giảm giá 50% dịch vụ trong tuần lễ Giáng Sinh', 'event', 0, 0, '2025-12-20 00:00:00+07', '2025-12-27 23:59:59+07', false),
('🛠️ Bảo trì hệ thống', 'Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày 01/01/2026', 'announcement', 0, 0, '2025-12-30 00:00:00+07', '2026-01-01 04:00:00+07', true);

-- =====================================================
-- HOÀN TẤT
-- =====================================================
SELECT 'Database CyberOps đã được khởi tạo thành công!' AS result;
