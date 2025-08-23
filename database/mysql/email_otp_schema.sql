-- Email OTP table for email verification and password reset
CREATE TABLE IF NOT EXISTS email_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    type ENUM('signup', 'forgot_password', 'login') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    
    INDEX idx_email_type (email, type),
    INDEX idx_expires (expires_at),
    INDEX idx_verified (is_verified)
);

-- Add this table to your existing database by running:
-- mysql -u root -p fayeed_auto_care < email_otp_schema.sql
