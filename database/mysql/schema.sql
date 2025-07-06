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
    vehicle_type ENUM('sedan', 'suv', 'hatchback', 'pickup', 'van', 'motorcycle') NOT NULL,
    car_model VARCHAR(255) NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    color VARCHAR(50),
    year INT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_plate (plate_number),
    INDEX idx_default (is_default)
);

-- Branches table
CREATE TABLE branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone_number VARCHAR(20),
    operating_hours VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    current_wait_time INT DEFAULT 0, -- in minutes
    rating DECIMAL(3,2) DEFAULT 0.00,
    max_capacity INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active),
    INDEX idx_location (latitude, longitude)
);

-- Services table
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('basic', 'standard', 'premium', 'luxury') NOT NULL,
    base_price DECIMAL(8,2) NOT NULL,
    duration_minutes INT NOT NULL,
    features JSON,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_active (is_active),
    INDEX idx_price (base_price)
);

-- Service pricing by vehicle type
CREATE TABLE service_pricing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    vehicle_type ENUM('sedan', 'suv', 'hatchback', 'pickup', 'van', 'motorcycle') NOT NULL,
    price_multiplier DECIMAL(3,2) DEFAULT 1.00,
    fixed_price DECIMAL(8,2) NULL,
    
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_service_vehicle (service_id, vehicle_type)
);

-- Memberships table
CREATE TABLE memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('regular', 'classic', 'vip_silver', 'vip_gold') NOT NULL,
    monthly_price DECIMAL(8,2) NOT NULL,
    included_washes INT DEFAULT 0, -- 0 means unlimited
    included_credits DECIMAL(8,2) DEFAULT 0.00,
    benefits JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_active (is_active)
);

-- User memberships
CREATE TABLE user_memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    membership_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    remaining_washes INT DEFAULT 0,
    remaining_credits DECIMAL(8,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (membership_id) REFERENCES memberships(id),
    INDEX idx_user_id (user_id),
    INDEX idx_active (is_active),
    INDEX idx_dates (start_date, end_date)
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    service_id INT NOT NULL,
    branch_id INT NOT NULL,
    vehicle_id INT,
    scheduled_date DATETIME NOT NULL,
    vehicle_type ENUM('sedan', 'suv', 'hatchback', 'pickup', 'van', 'motorcycle'),
    plate_number VARCHAR(20),
    special_instructions TEXT,
    queue_number INT,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    total_amount DECIMAL(8,2),
    payment_method ENUM('cash', 'credit_card', 'gcash', 'paymaya', 'membership_credits'),
    payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
    staff_notes TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_branch_date (branch_id, scheduled_date),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status)
);

-- QR Check-ins table
CREATE TABLE qr_checkins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    branch_id INT NOT NULL,
    qr_code_data VARCHAR(255) NOT NULL,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    INDEX idx_user_branch (user_id, branch_id),
    INDEX idx_active (is_active),
    INDEX idx_check_in_time (check_in_time)
);

-- QR Scan logs
CREATE TABLE qr_scan_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    scan_type ENUM('branch_checkin', 'service_activation', 'payment_qr') NOT NULL,
    qr_data TEXT NOT NULL,
    branch_id INT,
    booking_id INT,
    scan_result ENUM('success', 'failed', 'invalid') NOT NULL,
    error_message TEXT,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_scan_type (scan_type),
    INDEX idx_scan_time (scanned_at)
);

-- Payments table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    payment_method ENUM('cash', 'credit_card', 'gcash', 'paymaya', 'membership_credits') NOT NULL,
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    gateway_response JSON,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (payment_status),
    INDEX idx_transaction (transaction_id)
);

-- Vouchers table
CREATE TABLE vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount', 'free_service') NOT NULL,
    discount_value DECIMAL(8,2) NOT NULL,
    minimum_amount DECIMAL(8,2) DEFAULT 0.00,
    usage_limit INT DEFAULT 1,
    used_count INT DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    applicable_services JSON, -- Array of service IDs
    applicable_memberships JSON, -- Array of membership types
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_validity (valid_from, valid_until)
);

-- User vouchers (assigned vouchers)
CREATE TABLE user_vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    voucher_id INT NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    booking_id INT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON SET NULL,
    INDEX idx_user_voucher (user_id, voucher_id),
    INDEX idx_used (is_used)
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NULL, -- NULL for broadcast notifications
    type ENUM('booking_reminder', 'promotion', 'membership_renewal', 'system_update', 'payment_confirmation') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    is_pushed BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
);

-- Branch availability (for dynamic wait times)
CREATE TABLE branch_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL,
    date DATE NOT NULL,
    hour INT NOT NULL CHECK (hour >= 0 AND hour <= 23),
    capacity INT NOT NULL,
    booked_slots INT DEFAULT 0,
    estimated_wait_minutes INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_branch_datetime (branch_id, date, hour),
    INDEX idx_branch_date (branch_id, date)
);

-- Staff table (for admin users)
CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Firebase UID
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    role ENUM('admin', 'manager', 'staff', 'cashier') NOT NULL,
    branch_id INT,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    hired_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON SET NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_role (role),
    INDEX idx_branch (branch_id)
);

-- Insert default data
INSERT INTO memberships (name, type, monthly_price, included_washes, included_credits, benefits) VALUES
('Regular Member', 'regular', 0.00, 0, 0.00, '["Pay per service", "Basic customer support"]'),
('Classic Pro', 'classic', 500.00, 10, 500.00, '["10 washes per month", "Basic services included", "Priority booking"]'),
('VIP Silver Elite', 'vip_silver', 1500.00, 999, 1500.00, '["Unlimited basic washes", "Premium services included", "Priority support", "Free add-ons"]'),
('VIP Gold Ultimate', 'vip_gold', 3000.00, 999, 3000.00, '["All services unlimited", "Premium detailing included", "VIP treatment", "Concierge service", "Free home pickup"]');

INSERT INTO branches (name, address, latitude, longitude, phone_number, operating_hours) VALUES
('Fayeed Auto Care - Tumaga', 'Tumaga, Zamboanga City, Philippines', 6.9214, 122.0790, '+63 998 123 4567', '7:00 AM - 7:00 PM'),
('Fayeed Auto Care - Boalan', 'Boalan, Zamboanga City, Philippines', 6.9100, 122.0730, '+63 998 765 4321', '7:00 AM - 7:00 PM');

INSERT INTO services (name, description, category, base_price, duration_minutes, features) VALUES
('Quick Wash', 'Basic exterior wash and dry', 'basic', 250.00, 20, '["Exterior wash", "Basic drying", "Tire cleaning"]'),
('Classic Wash', 'Complete wash with interior cleaning', 'standard', 450.00, 45, '["Exterior wash & wax", "Interior vacuum", "Window cleaning", "Dashboard care"]'),
('Premium Wash', 'Full service with detailing', 'premium', 850.00, 90, '["Complete exterior detail", "Interior deep clean", "Tire & rim care", "Engine bay clean"]'),
('Detailing Service', 'Professional car detailing', 'luxury', 2500.00, 180, '["Paint correction", "Interior shampooing", "Engine bay detail", "Ceramic coating"]');

INSERT INTO service_pricing (service_id, vehicle_type, price_multiplier) VALUES
(1, 'motorcycle', 0.5), (1, 'sedan', 1.0), (1, 'hatchback', 1.0), (1, 'suv', 1.2), (1, 'pickup', 1.2), (1, 'van', 1.3),
(2, 'motorcycle', 0.5), (2, 'sedan', 1.0), (2, 'hatchback', 1.0), (2, 'suv', 1.2), (2, 'pickup', 1.2), (2, 'van', 1.3),
(3, 'motorcycle', 0.5), (3, 'sedan', 1.0), (3, 'hatchback', 1.0), (3, 'suv', 1.2), (3, 'pickup', 1.2), (3, 'van', 1.3),
(4, 'motorcycle', 0.5), (4, 'sedan', 1.0), (4, 'hatchback', 1.0), (4, 'suv', 1.2), (4, 'pickup', 1.2), (4, 'van', 1.3);
