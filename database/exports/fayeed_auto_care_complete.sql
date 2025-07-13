-- Fayeed Auto Care Complete Database Export
-- Schema + Sample Data for MySQL

-- Fayeed Auto Care Database Schema
-- MySQL Database Setup for Flutter/Dart App

CREATE DATABASE IF NOT EXISTS fayeed_auto_care;
USE fayeed_auto_care;

-- Users table (synced with Firebase Auth)
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,  -- Firebase UID
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_phone (phone_number),
    INDEX idx_active (is_active)
);

-- User Profiles (additional customer information)
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    preferred_branch_id INT,
    notification_preferences JSON,
    loyalty_points INT DEFAULT 0,
    total_bookings INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    referral_code VARCHAR(20) UNIQUE,
    referred_by VARCHAR(255),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_branch (preferred_branch_id),
    INDEX idx_referral (referral_code)
);

-- Vehicles table
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(30),
    vehicle_type ENUM('sedan', 'suv', 'truck', 'van', 'motorcycle', 'other') DEFAULT 'sedan',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_plate (plate_number),
    UNIQUE KEY unique_user_primary (user_id, is_primary)
);

-- Branches table
CREATE TABLE branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    operating_hours JSON,
    services_offered JSON,
    is_active BOOLEAN DEFAULT TRUE,
    qr_code_data TEXT,
    branch_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active),
    INDEX idx_branch_code (branch_code)
);

-- Services table
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('wash', 'detailing', 'maintenance', 'repair', 'other') DEFAULT 'wash',
    base_price DECIMAL(8,2) NOT NULL,
    duration_minutes INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

-- Branch Services (many-to-many relationship)
CREATE TABLE branch_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL,
    service_id INT NOT NULL,
    custom_price DECIMAL(8,2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_branch_service (branch_id, service_id),
    INDEX idx_branch (branch_id),
    INDEX idx_service (service_id)
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    branch_id INT NOT NULL,
    service_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    total_amount DECIMAL(8,2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    special_requests TEXT,
    qr_checkin_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    INDEX idx_user (user_id),
    INDEX idx_branch (branch_id),
    INDEX idx_date (booking_date),
    INDEX idx_status (status)
);

-- QR Check-ins table
CREATE TABLE qr_checkins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    branch_id INT NOT NULL,
    qr_code_scanned TEXT NOT NULL,
    checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info JSON,
    location_data JSON,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    INDEX idx_booking (booking_id),
    INDEX idx_user (user_id),
    INDEX idx_checkin_time (checkin_time)
);

-- Payments table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'gcash', 'paymaya', 'bank_transfer') NOT NULL,
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_gateway_response JSON,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_user (user_id),
    INDEX idx_status (payment_status),
    INDEX idx_transaction (transaction_id)
);

-- Vouchers table
CREATE TABLE vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
    discount_value DECIMAL(8,2) NOT NULL,
    minimum_amount DECIMAL(8,2) DEFAULT 0,
    max_uses INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_services JSON,
    applicable_branches JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_validity (valid_from, valid_until)
);

-- Voucher Usage table
CREATE TABLE voucher_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voucher_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    booking_id INT NOT NULL,
    discount_amount DECIMAL(8,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_voucher (voucher_id),
    INDEX idx_user (user_id),
    INDEX idx_booking (booking_id)
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('booking', 'payment', 'promotion', 'system', 'reminder') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    action_data JSON,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type),
    INDEX idx_sent (sent_at)
);

-- Staff table
CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    branch_id INT NOT NULL,
    role ENUM('manager', 'cashier', 'washer', 'admin') NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    shift_schedule JSON,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    INDEX idx_user (user_id),
    INDEX idx_branch (branch_id),
    INDEX idx_role (role),
    INDEX idx_employee_id (employee_id)
);

-- QR Scan Logs table
CREATE TABLE qr_scan_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    scan_type ENUM('checkin', 'branch_info', 'service_info', 'payment') NOT NULL,
    qr_data TEXT NOT NULL,
    branch_id INT,
    scan_result ENUM('success', 'invalid', 'expired', 'error') NOT NULL,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info JSON,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    INDEX idx_user (user_id),
    INDEX idx_type (scan_type),
    INDEX idx_result (scan_result),
    INDEX idx_scanned (scanned_at)
);

-- Sync Queue table (for offline sync)
CREATE TABLE sync_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    operation ENUM('insert', 'update', 'delete') NOT NULL,
    data JSON,
    sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP NULL,
    retry_count INT DEFAULT 0,
    
    INDEX idx_status (sync_status),
    INDEX idx_created (created_at),
    INDEX idx_table (table_name)
);

-- INSERT SAMPLE DATA

-- Sample Users (Firebase Auth compatible)
INSERT INTO users (id, email, full_name, phone_number, address, is_active, email_verified) VALUES
('superadmin-001', 'superadmin@fayeedautocare.com', 'Fayeed Admin', '+639123456789', 'Cagayan de Oro City', TRUE, TRUE),
('admin-tumaga-001', 'manager.tumaga@fayeedautocare.com', 'Maria Santos', '+639234567890', 'Tumaga, Cagayan de Oro', TRUE, TRUE),
('admin-boalan-001', 'manager.boalan@fayeedautocare.com', 'Jose Dela Cruz', '+639345678901', 'Boalan, Cagayan de Oro', TRUE, TRUE),
('customer-vip-001', 'john.doe@gmail.com', 'John Doe', '+639456789012', '123 Main St, Cagayan de Oro', TRUE, TRUE),
('customer-regular-001', 'anna.lopez@gmail.com', 'Anna Lopez', '+639567890123', '456 Oak Ave, Cagayan de Oro', TRUE, TRUE),
('customer-new-001', 'mike.johnson@yahoo.com', 'Mike Johnson', '+639678901234', '789 Pine Rd, Cagayan de Oro', TRUE, TRUE);

-- User Profiles
INSERT INTO user_profiles (user_id, loyalty_points, total_bookings, total_spent, referral_code, notification_preferences) VALUES
('superadmin-001', 0, 0, 0.00, 'ADMIN001', '{"email": true, "sms": true, "push": true}'),
('admin-tumaga-001', 0, 0, 0.00, 'STAFF001', '{"email": true, "sms": false, "push": true}'),
('admin-boalan-001', 0, 0, 0.00, 'STAFF002', '{"email": true, "sms": false, "push": true}'),
('customer-vip-001', 1250, 15, 3500.00, 'VIP001', '{"email": true, "sms": true, "push": true}'),
('customer-regular-001', 450, 8, 1200.00, 'REG001', '{"email": true, "sms": false, "push": true}'),
('customer-new-001', 100, 2, 300.00, 'NEW001', '{"email": false, "sms": false, "push": true}');

-- Branches
INSERT INTO branches (name, address, phone_number, email, latitude, longitude, branch_code, qr_code_data, operating_hours, services_offered) VALUES
('Fayeed Auto Care - Tumaga', 'Tumaga Road, Cagayan de Oro City', '+639123456789', 'tumaga@fayeedautocare.com', 8.4730, 124.6426, 'TUMAGA-001', 
'{"type":"branch","id":"TUMAGA-001","name":"Fayeed Auto Care - Tumaga"}',
'{"monday":"7:00-19:00","tuesday":"7:00-19:00","wednesday":"7:00-19:00","thursday":"7:00-19:00","friday":"7:00-19:00","saturday":"7:00-20:00","sunday":"8:00-18:00"}',
'["car_wash","detailing","oil_change","tire_service"]'),

('Fayeed Auto Care - Boalan', 'Boalan Road, Cagayan de Oro City', '+639234567890', 'boalan@fayeedautocare.com', 8.4542, 124.6319, 'BOALAN-002',
'{"type":"branch","id":"BOALAN-002","name":"Fayeed Auto Care - Boalan"}',
'{"monday":"7:00-19:00","tuesday":"7:00-19:00","wednesday":"7:00-19:00","thursday":"7:00-19:00","friday":"7:00-19:00","saturday":"7:00-20:00","sunday":"8:00-18:00"}',
'["car_wash","detailing","maintenance"]');

-- Services
INSERT INTO services (name, description, category, base_price, duration_minutes, image_url) VALUES
('Basic Car Wash', 'External wash with soap and rinse', 'wash', 120.00, 30, '/images/services/basic-wash.jpg'),
('Premium Detailing', 'Complete interior and exterior detailing', 'detailing', 800.00, 120, '/images/services/detailing.jpg'),
('Oil Change Service', 'Engine oil and filter replacement', 'maintenance', 450.00, 45, '/images/services/oil-change.jpg'),
('Tire Service', 'Tire rotation and pressure check', 'maintenance', 200.00, 30, '/images/services/tire-service.jpg');

-- Branch Services (all services available at both branches)
INSERT INTO branch_services (branch_id, service_id, custom_price, is_available) VALUES
(1, 1, 120.00, TRUE), (1, 2, 800.00, TRUE), (1, 3, 450.00, TRUE), (1, 4, 200.00, TRUE),
(2, 1, 130.00, TRUE), (2, 2, 850.00, TRUE), (2, 3, NULL, FALSE), (2, 4, NULL, FALSE);

-- Vehicles
INSERT INTO vehicles (user_id, plate_number, make, model, year, color, vehicle_type, is_primary) VALUES
('customer-vip-001', 'ABC-1234', 'Toyota', 'Camry', 2020, 'White', 'sedan', TRUE),
('customer-vip-001', 'DEF-5678', 'Honda', 'CR-V', 2019, 'Black', 'suv', FALSE),
('customer-regular-001', 'GHI-9012', 'Mitsubishi', 'Mirage', 2018, 'Red', 'sedan', TRUE),
('customer-new-001', 'JKL-3456', 'Nissan', 'Navara', 2021, 'Blue', 'truck', TRUE);

-- Sample Bookings
INSERT INTO bookings (user_id, branch_id, service_id, vehicle_id, booking_date, booking_time, status, total_amount, payment_status) VALUES
('customer-vip-001', 1, 1, 1, '2024-01-15', '09:00:00', 'completed', 120.00, 'paid'),
('customer-vip-001', 1, 2, 2, '2024-01-20', '14:00:00', 'completed', 800.00, 'paid'),
('customer-regular-001', 2, 1, 3, '2024-01-22', '10:30:00', 'confirmed', 130.00, 'pending'),
('customer-new-001', 1, 3, 4, '2024-01-25', '11:00:00', 'pending', 450.00, 'pending');

-- Staff
INSERT INTO staff (user_id, branch_id, role, employee_id, hire_date, shift_schedule, permissions) VALUES
('admin-tumaga-001', 1, 'manager', 'EMP-TUM-001', '2023-01-15', 
'{"monday":"8:00-17:00","tuesday":"8:00-17:00","wednesday":"8:00-17:00","thursday":"8:00-17:00","friday":"8:00-17:00"}',
'{"booking_management": true, "payment_processing": true, "staff_management": true}'),

('admin-boalan-001', 2, 'manager', 'EMP-BOA-001', '2023-02-01',
'{"monday":"8:00-17:00","tuesday":"8:00-17:00","wednesday":"8:00-17:00","thursday":"8:00-17:00","friday":"8:00-17:00"}',
'{"booking_management": true, "payment_processing": true, "staff_management": true}');

-- Sample Vouchers
INSERT INTO vouchers (code, name, description, discount_type, discount_value, minimum_amount, valid_from, valid_until, applicable_services, applicable_branches) VALUES
('FIRST20', 'First Time Customer', '20% discount for new customers', 'percentage', 20.00, 100.00, '2024-01-01', '2024-12-31', '[1,2,3,4]', '[1,2]'),
('WASH50', 'Basic Wash Discount', '₱50 off basic car wash', 'fixed_amount', 50.00, 0.00, '2024-01-01', '2024-06-30', '[1]', '[1,2]');

-- Sample Notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
('customer-vip-001', 'Booking Confirmed', 'Your car wash appointment is confirmed for Jan 15, 9:00 AM', 'booking', TRUE),
('customer-regular-001', 'Payment Reminder', 'Please complete payment for your upcoming appointment', 'payment', FALSE),
('customer-new-001', 'Welcome!', 'Welcome to Fayeed Auto Care! Book your first service and get 20% off', 'promotion', FALSE);

-- Sample QR Scan Logs
INSERT INTO qr_scan_logs (user_id, scan_type, qr_data, branch_id, scan_result, device_info) VALUES
('customer-vip-001', 'checkin', '{"type":"branch","id":"TUMAGA-001"}', 1, 'success', '{"device":"iPhone 12","app_version":"1.0.0"}'),
('customer-regular-001', 'branch_info', '{"type":"branch","id":"BOALAN-002"}', 2, 'success', '{"device":"Samsung Galaxy S21","app_version":"1.0.0"}');

-- Sample Payments
INSERT INTO payments (booking_id, user_id, amount, payment_method, payment_status, transaction_id, processed_at) VALUES
(1, 'customer-vip-001', 120.00, 'gcash', 'completed', 'GCASH-20240115-001', '2024-01-15 08:45:00'),
(2, 'customer-vip-001', 800.00, 'card', 'completed', 'CARD-20240120-002', '2024-01-20 13:30:00');
