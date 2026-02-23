-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active),
  INDEX idx_valid_until (valid_until)
);

-- Create user_vouchers table (tracks usage per user)
CREATE TABLE IF NOT EXISTS user_vouchers (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  voucher_id VARCHAR(255) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP,
  booking_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
  INDEX idx_user_id (user_id),
  INDEX idx_voucher_id (voucher_id),
  INDEX idx_used_at (used_at),
  UNIQUE KEY unique_user_voucher (user_id, voucher_id)
);

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_code (code)
);

-- Create referrals table (tracks referral relationships)
CREATE TABLE IF NOT EXISTS referrals (
  id VARCHAR(255) PRIMARY KEY,
  referrer_id VARCHAR(255) NOT NULL,
  referred_user_id VARCHAR(255),
  code VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  reward_type VARCHAR(100),
  reward_value DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  INDEX idx_referrer_id (referrer_id),
  INDEX idx_referred_user_id (referred_user_id),
  INDEX idx_code (code),
  INDEX idx_status (status)
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('card', 'ewallet')),
  provider VARCHAR(100),
  last4 VARCHAR(4),
  expiry_month INTEGER,
  expiry_year INTEGER,
  holder_name VARCHAR(255),
  token VARCHAR(500),
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_is_default (is_default)
);
