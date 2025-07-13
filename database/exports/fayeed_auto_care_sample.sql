-- SQLite Sample Data for Fayeed Auto Care
-- Run this after creating the schema

INSERT INTO users (id, email, full_name, phone_number, address, is_active, email_verified) VALUES
('superadmin-001', 'superadmin@fayeedautocare.com', 'Fayeed Admin', '+639123456789', 'Cagayan de Oro City', 1, 1),
('admin-tumaga-001', 'manager.tumaga@fayeedautocare.com', 'Maria Santos', '+639234567890', 'Tumaga, Cagayan de Oro', 1, 1),
('admin-boalan-001', 'manager.boalan@fayeedautocare.com', 'Jose Dela Cruz', '+639345678901', 'Boalan, Cagayan de Oro', 1, 1),
('customer-vip-001', 'john.doe@gmail.com', 'John Doe', '+639456789012', '123 Main St, Cagayan de Oro', 1, 1),
('customer-regular-001', 'anna.lopez@gmail.com', 'Anna Lopez', '+639567890123', '456 Oak Ave, Cagayan de Oro', 1, 1),
('customer-new-001', 'mike.johnson@yahoo.com', 'Mike Johnson', '+639678901234', '789 Pine Rd, Cagayan de Oro', 1, 1);

INSERT INTO user_profiles (user_id, loyalty_points, total_bookings, total_spent, referral_code, notification_preferences) VALUES
('superadmin-001', 0, 0, 0.00, 'ADMIN001', '{"email": true, "sms": true, "push": true}'),
('admin-tumaga-001', 0, 0, 0.00, 'STAFF001', '{"email": true, "sms": false, "push": true}'),
('admin-boalan-001', 0, 0, 0.00, 'STAFF002', '{"email": true, "sms": false, "push": true}'),
('customer-vip-001', 1250, 15, 3500.00, 'VIP001', '{"email": true, "sms": true, "push": true}'),
('customer-regular-001', 450, 8, 1200.00, 'REG001', '{"email": true, "sms": false, "push": true}'),
('customer-new-001', 100, 2, 300.00, 'NEW001', '{"email": false, "sms": false, "push": true}');

INSERT INTO branches (name, address, phone_number, email, latitude, longitude, branch_code, qr_code_data, operating_hours, services_offered) VALUES
('Fayeed Auto Care - Tumaga', 'Tumaga Road, Cagayan de Oro City', '+639123456789', 'tumaga@fayeedautocare.com', 8.4730, 124.6426, 'TUMAGA-001', 
'{"type":"branch","id":"TUMAGA-001","name":"Fayeed Auto Care - Tumaga"}',
'{"monday":"7:00-19:00","tuesday":"7:00-19:00","wednesday":"7:00-19:00","thursday":"7:00-19:00","friday":"7:00-19:00","saturday":"7:00-20:00","sunday":"8:00-18:00"}',
'["car_wash","detailing","oil_change","tire_service"]'),

('Fayeed Auto Care - Boalan', 'Boalan Road, Cagayan de Oro City', '+639234567890', 'boalan@fayeedautocare.com', 8.4542, 124.6319, 'BOALAN-002',
'{"type":"branch","id":"BOALAN-002","name":"Fayeed Auto Care - Boalan"}',
'{"monday":"7:00-19:00","tuesday":"7:00-19:00","wednesday":"7:00-19:00","thursday":"7:00-19:00","friday":"7:00-19:00","saturday":"7:00-20:00","sunday":"8:00-18:00"}',
'["car_wash","detailing","maintenance"]');

INSERT INTO services (name, description, category, base_price, duration_minutes, image_url) VALUES
('Basic Car Wash', 'External wash with soap and rinse', 'wash', 120.00, 30, '/images/services/basic-wash.jpg'),
('Premium Detailing', 'Complete interior and exterior detailing', 'detailing', 800.00, 120, '/images/services/detailing.jpg'),
('Oil Change Service', 'Engine oil and filter replacement', 'maintenance', 450.00, 45, '/images/services/oil-change.jpg'),
('Tire Service', 'Tire rotation and pressure check', 'maintenance', 200.00, 30, '/images/services/tire-service.jpg');

INSERT INTO branch_services (branch_id, service_id, custom_price, is_available) VALUES
(1, 1, 120.00, 1), (1, 2, 800.00, 1), (1, 3, 450.00, 1), (1, 4, 200.00, 1),
(2, 1, 130.00, 1), (2, 2, 850.00, 1), (2, 3, NULL, 0), (2, 4, NULL, 0);

INSERT INTO vehicles (user_id, plate_number, make, model, year, color, vehicle_type, is_primary) VALUES
('customer-vip-001', 'ABC-1234', 'Toyota', 'Camry', 2020, 'White', 'sedan', 1),
('customer-vip-001', 'DEF-5678', 'Honda', 'CR-V', 2019, 'Black', 'suv', 0),
('customer-regular-001', 'GHI-9012', 'Mitsubishi', 'Mirage', 2018, 'Red', 'sedan', 1),
('customer-new-001', 'JKL-3456', 'Nissan', 'Navara', 2021, 'Blue', 'truck', 1);

INSERT INTO bookings (user_id, branch_id, service_id, vehicle_id, booking_date, booking_time, status, total_amount, payment_status) VALUES
('customer-vip-001', 1, 1, 1, '2024-01-15', '09:00:00', 'completed', 120.00, 'paid'),
('customer-vip-001', 1, 2, 2, '2024-01-20', '14:00:00', 'completed', 800.00, 'paid'),
('customer-regular-001', 2, 1, 3, '2024-01-22', '10:30:00', 'confirmed', 130.00, 'pending'),
('customer-new-001', 1, 3, 4, '2024-01-25', '11:00:00', 'pending', 450.00, 'pending');

INSERT INTO staff (user_id, branch_id, role, employee_id, hire_date, shift_schedule, permissions) VALUES
('admin-tumaga-001', 1, 'manager', 'EMP-TUM-001', '2023-01-15', 
'{"monday":"8:00-17:00","tuesday":"8:00-17:00","wednesday":"8:00-17:00","thursday":"8:00-17:00","friday":"8:00-17:00"}',
'{"booking_management": true, "payment_processing": true, "staff_management": true}'),

('admin-boalan-001', 2, 'manager', 'EMP-BOA-001', '2023-02-01',
'{"monday":"8:00-17:00","tuesday":"8:00-17:00","wednesday":"8:00-17:00","thursday":"8:00-17:00","friday":"8:00-17:00"}',
'{"booking_management": true, "payment_processing": true, "staff_management": true}');

INSERT INTO vouchers (code, name, description, discount_type, discount_value, minimum_amount, valid_from, valid_until, applicable_services, applicable_branches) VALUES
('FIRST20', 'First Time Customer', '20% discount for new customers', 'percentage', 20.00, 100.00, '2024-01-01', '2024-12-31', '[1,2,3,4]', '[1,2]'),
('WASH50', 'Basic Wash Discount', '₱50 off basic car wash', 'fixed_amount', 50.00, 0.00, '2024-01-01', '2024-06-30', '[1]', '[1,2]');

INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
('customer-vip-001', 'Booking Confirmed', 'Your car wash appointment is confirmed for Jan 15, 9:00 AM', 'booking', 1),
('customer-regular-001', 'Payment Reminder', 'Please complete payment for your upcoming appointment', 'payment', 0),
('customer-new-001', 'Welcome!', 'Welcome to Fayeed Auto Care! Book your first service and get 20% off', 'promotion', 0);

INSERT INTO qr_scan_logs (user_id, scan_type, qr_data, branch_id, scan_result, device_info) VALUES
('customer-vip-001', 'checkin', '{"type":"branch","id":"TUMAGA-001"}', 1, 'success', '{"device":"iPhone 12","app_version":"1.0.0"}'),
('customer-regular-001', 'branch_info', '{"type":"branch","id":"BOALAN-002"}', 2, 'success', '{"device":"Samsung Galaxy S21","app_version":"1.0.0"}');

INSERT INTO payments (booking_id, user_id, amount, payment_method, payment_status, transaction_id, processed_at) VALUES
(1, 'customer-vip-001', 120.00, 'gcash', 'completed', 'GCASH-20240115-001', '2024-01-15 08:45:00'),
(2, 'customer-vip-001', 800.00, 'card', 'completed', 'CARD-20240120-002', '2024-01-20 13:30:00');
