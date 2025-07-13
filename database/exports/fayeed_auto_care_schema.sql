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
