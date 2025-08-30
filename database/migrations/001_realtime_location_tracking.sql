-- Real-time Location Tracking Database Schema
-- Version 1.0 - Initial migration for live tracking system

-- ============================================================================
-- CREW MANAGEMENT TABLES
-- ============================================================================

-- Crew Groups/Teams table
CREATE TABLE crew_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id INT NULL,
    color_code VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for map display
    max_members INT DEFAULT 10,
    status ENUM('active', 'inactive', 'disbanded') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Crew Members table
CREATE TABLE crew_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL, -- Links to existing users table
    crew_group_id INT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    hire_date DATE,
    status ENUM('active', 'inactive', 'suspended', 'terminated') DEFAULT 'active',
    specializations JSON, -- ['exterior', 'interior', 'detailing', 'motorcycle']
    skill_level ENUM('trainee', 'junior', 'senior', 'expert') DEFAULT 'trainee',
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (crew_group_id) REFERENCES crew_groups(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_crew_group (crew_group_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_phone (phone)
);

-- Real-time Crew Locations table
CREATE TABLE crew_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crew_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(6, 2), -- GPS accuracy in meters
    altitude DECIMAL(8, 2), -- Altitude in meters
    heading DECIMAL(5, 2), -- Direction in degrees (0-360)
    speed DECIMAL(6, 2), -- Speed in km/h
    address TEXT, -- Reverse geocoded address
    location_source ENUM('gps', 'manual', 'estimated') DEFAULT 'gps',
    battery_level INT, -- Device battery percentage
    signal_strength INT, -- Network signal strength
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crew_id) REFERENCES crew_members(id) ON DELETE CASCADE,
    INDEX idx_crew_timestamp (crew_id, timestamp DESC),
    INDEX idx_location (latitude, longitude),
    INDEX idx_timestamp (timestamp DESC)
);

-- Crew Status Tracking table
CREATE TABLE crew_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crew_id INT NOT NULL,
    status ENUM('online', 'offline', 'busy', 'available', 'break', 'emergency') NOT NULL,
    previous_status ENUM('online', 'offline', 'busy', 'available', 'break', 'emergency'),
    reason VARCHAR(255), -- Reason for status change
    auto_generated BOOLEAN DEFAULT FALSE, -- True if status was automatically set
    location_id INT, -- Reference to crew_locations
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    duration_minutes INT GENERATED ALWAYS AS (
        CASE 
            WHEN ended_at IS NOT NULL 
            THEN TIMESTAMPDIFF(MINUTE, started_at, ended_at)
            ELSE NULL
        END
    ) STORED,
    FOREIGN KEY (crew_id) REFERENCES crew_members(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES crew_locations(id) ON DELETE SET NULL,
    INDEX idx_crew_status (crew_id, status),
    INDEX idx_active_status (crew_id, ended_at),
    INDEX idx_started_at (started_at DESC)
);

-- ============================================================================
-- JOB AND SERVICE MANAGEMENT TABLES
-- ============================================================================

-- Service Types table
CREATE TABLE service_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('basic', 'premium', 'deluxe', 'vip', 'specialty') NOT NULL,
    wash_type ENUM('exterior', 'interior', 'full', 'detailing', 'maintenance') NOT NULL,
    vehicle_types JSON NOT NULL, -- ['car', 'suv', 'motorcycle', 'truck']
    base_price DECIMAL(10,2) NOT NULL,
    estimated_duration INT NOT NULL, -- in minutes
    description TEXT,
    requirements JSON, -- Required tools, chemicals, etc.
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_wash_type (wash_type),
    INDEX idx_active (active)
);

-- Jobs table (individual wash jobs)
CREATE TABLE jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL, -- Links to existing customers table
    service_type_id INT NOT NULL,
    vehicle_type ENUM('car', 'suv', 'motorcycle', 'truck', 'van', 'pickup') NOT NULL,
    vehicle_info JSON, -- {make, model, year, color, plate_number}
    
    -- Location information
    service_location_type ENUM('branch', 'customer_location', 'pickup_delivery') NOT NULL,
    service_address TEXT,
    service_latitude DECIMAL(10, 8),
    service_longitude DECIMAL(11, 8),
    
    -- Crew assignment
    assigned_crew_id INT,
    assigned_at TIMESTAMP NULL,
    
    -- Job status and timing
    status ENUM('pending', 'assigned', 'en_route', 'in_progress', 'completed', 'cancelled', 'on_hold') DEFAULT 'pending',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    
    -- Scheduling
    scheduled_start TIMESTAMP,
    scheduled_end TIMESTAMP,
    actual_start TIMESTAMP NULL,
    actual_end TIMESTAMP NULL,
    estimated_duration INT, -- in minutes
    actual_duration INT GENERATED ALWAYS AS (
        CASE 
            WHEN actual_start IS NOT NULL AND actual_end IS NOT NULL 
            THEN TIMESTAMPDIFF(MINUTE, actual_start, actual_end)
            ELSE NULL
        END
    ) STORED,
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    additional_charges DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (base_price + additional_charges - discount_amount) STORED,
    
    -- Special instructions and notes
    special_instructions TEXT,
    customer_notes TEXT,
    crew_notes TEXT,
    admin_notes TEXT,
    
    -- Quality and completion
    completion_photos JSON, -- Array of photo URLs
    quality_rating DECIMAL(2,1), -- 1.0 to 5.0
    customer_satisfaction INT, -- 1-10 scale
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    FOREIGN KEY (assigned_crew_id) REFERENCES crew_members(id) ON DELETE SET NULL,
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_assigned_crew (assigned_crew_id),
    INDEX idx_scheduled_start (scheduled_start),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_job_number (job_number)
);

-- Job Progress Tracking table
CREATE TABLE job_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    stage ENUM('preparation', 'pre_wash', 'washing', 'rinsing', 'drying', 'interior', 'detailing', 'inspection', 'completed') NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    duration_minutes INT GENERATED ALWAYS AS (
        CASE 
            WHEN started_at IS NOT NULL AND completed_at IS NOT NULL 
            THEN TIMESTAMPDIFF(MINUTE, started_at, completed_at)
            ELSE NULL
        END
    ) STORED,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00, -- 0.00 to 100.00
    notes TEXT,
    photos JSON, -- Array of progress photos
    crew_location_id INT, -- Location where this stage was performed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (crew_location_id) REFERENCES crew_locations(id) ON DELETE SET NULL,
    INDEX idx_job_stage (job_id, stage),
    INDEX idx_status (status),
    INDEX idx_progress (progress_percentage)
);

-- ============================================================================
-- CUSTOMER LOCATION TRACKING
-- ============================================================================

-- Customer Locations table (for home service tracking)
CREATE TABLE customer_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., "Home", "Office", "Mall"
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_type ENUM('residential', 'commercial', 'office', 'public', 'other') DEFAULT 'residential',
    access_instructions TEXT, -- How to reach the location
    parking_info TEXT, -- Parking availability and instructions
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_service_date TIMESTAMP NULL,
    total_services INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer (customer_id),
    INDEX idx_location (latitude, longitude),
    INDEX idx_primary (customer_id, is_primary),
    INDEX idx_active (is_active)
);

-- Real-time Customer Status (when they're requesting service)
CREATE TABLE customer_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    status ENUM('offline', 'online', 'requesting', 'being_served', 'completed') NOT NULL,
    current_location_id INT,
    requested_service_type_id INT,
    special_requests TEXT,
    urgency_level ENUM('low', 'normal', 'high', 'emergency') DEFAULT 'normal',
    estimated_ready_time TIMESTAMP, -- When customer will be ready
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_started TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (current_location_id) REFERENCES customer_locations(id) ON DELETE SET NULL,
    FOREIGN KEY (requested_service_type_id) REFERENCES service_types(id) ON DELETE SET NULL,
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_requesting (status, urgency_level),
    INDEX idx_last_activity (last_activity DESC)
);

-- ============================================================================
-- REAL-TIME COMMUNICATION AND NOTIFICATIONS
-- ============================================================================

-- Real-time Messages between crew, customers, and admin
CREATE TABLE realtime_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT,
    sender_type ENUM('crew', 'customer', 'admin', 'system') NOT NULL,
    sender_id INT NOT NULL,
    recipient_type ENUM('crew', 'customer', 'admin', 'broadcast') NOT NULL,
    recipient_id INT, -- NULL for broadcast messages
    message_type ENUM('text', 'location', 'photo', 'status_update', 'alert') NOT NULL,
    content TEXT NOT NULL,
    metadata JSON, -- Additional data like location coordinates, photo URLs
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    read_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job (job_id),
    INDEX idx_recipient (recipient_type, recipient_id),
    INDEX idx_unread (recipient_type, recipient_id, read_at),
    INDEX idx_created_at (created_at DESC)
);

-- Location-based Alerts and Geofences
CREATE TABLE location_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    alert_type ENUM('geofence_enter', 'geofence_exit', 'speed_limit', 'idle_time', 'emergency') NOT NULL,
    center_latitude DECIMAL(10, 8),
    center_longitude DECIMAL(11, 8),
    radius_meters INT, -- For geofence alerts
    speed_limit DECIMAL(5,2), -- For speed alerts (km/h)
    idle_threshold_minutes INT, -- For idle time alerts
    target_type ENUM('crew', 'customer', 'all') NOT NULL,
    target_ids JSON, -- Array of specific IDs, NULL for all
    is_active BOOLEAN DEFAULT TRUE,
    notification_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (center_latitude, center_longitude),
    INDEX idx_active (is_active),
    INDEX idx_alert_type (alert_type)
);

-- ============================================================================
-- ANALYTICS AND REPORTING TABLES
-- ============================================================================

-- Location Analytics (aggregated data for performance)
CREATE TABLE location_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date_recorded DATE NOT NULL,
    hour_recorded INT NOT NULL, -- 0-23
    crew_id INT,
    total_distance_km DECIMAL(8,2) DEFAULT 0.00,
    total_active_minutes INT DEFAULT 0,
    jobs_completed INT DEFAULT 0,
    average_speed_kmh DECIMAL(5,2) DEFAULT 0.00,
    fuel_efficiency_score DECIMAL(5,2), -- Custom scoring algorithm
    service_area_coverage JSON, -- Areas covered during this period
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crew_id) REFERENCES crew_members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_crew_date_hour (crew_id, date_recorded, hour_recorded),
    INDEX idx_date_hour (date_recorded, hour_recorded),
    INDEX idx_crew_date (crew_id, date_recorded)
);

-- ============================================================================
-- SYSTEM CONFIGURATION AND SETTINGS
-- ============================================================================

-- Real-time System Settings
CREATE TABLE realtime_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_sensitive BOOLEAN DEFAULT FALSE, -- For passwords, API keys, etc.
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_key (setting_key)
);

-- Insert default settings
INSERT INTO realtime_settings (setting_key, setting_value, setting_type, description, category) VALUES
('location_update_interval', '10', 'number', 'Crew location update interval in seconds', 'tracking'),
('location_accuracy_threshold', '50', 'number', 'Minimum GPS accuracy required in meters', 'tracking'),
('offline_timeout_minutes', '5', 'number', 'Minutes before marking crew as offline', 'tracking'),
('geofence_default_radius', '100', 'number', 'Default geofence radius in meters', 'alerts'),
('max_idle_time_minutes', '30', 'number', 'Maximum idle time before alert', 'alerts'),
('emergency_response_time', '300', 'number', 'Emergency response time in seconds', 'emergency'),
('map_default_zoom', '12', 'number', 'Default map zoom level', 'ui'),
('realtime_refresh_rate', '5000', 'number', 'Real-time data refresh rate in milliseconds', 'performance');

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Composite indexes for common real-time queries
CREATE INDEX idx_crew_current_status ON crew_status (crew_id, ended_at) WHERE ended_at IS NULL;
CREATE INDEX idx_active_jobs_crew ON jobs (assigned_crew_id, status) WHERE status IN ('assigned', 'en_route', 'in_progress');
CREATE INDEX idx_recent_locations ON crew_locations (crew_id, timestamp DESC) LIMIT 1000;
CREATE INDEX idx_customer_active_requests ON customer_status (status, urgency_level, last_activity) WHERE status IN ('requesting', 'being_served');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Current crew status view
CREATE VIEW current_crew_status AS
SELECT 
    cm.id as crew_id,
    cm.name,
    cm.phone,
    cm.crew_group_id,
    cg.name as group_name,
    cs.status,
    cs.started_at as status_since,
    cl.latitude,
    cl.longitude,
    cl.address,
    cl.timestamp as last_location_update,
    j.id as current_job_id,
    j.status as job_status
FROM crew_members cm
LEFT JOIN crew_groups cg ON cm.crew_group_id = cg.id
LEFT JOIN crew_status cs ON cm.id = cs.crew_id AND cs.ended_at IS NULL
LEFT JOIN crew_locations cl ON cm.id = cl.crew_id 
    AND cl.timestamp = (
        SELECT MAX(timestamp) 
        FROM crew_locations cl2 
        WHERE cl2.crew_id = cm.id
    )
LEFT JOIN jobs j ON cm.id = j.assigned_crew_id AND j.status IN ('assigned', 'en_route', 'in_progress')
WHERE cm.status = 'active';

-- Active jobs with crew location view
CREATE VIEW active_jobs_with_location AS
SELECT 
    j.id,
    j.job_number,
    j.status,
    j.customer_id,
    j.service_address,
    j.service_latitude,
    j.service_longitude,
    j.scheduled_start,
    j.actual_start,
    cm.id as crew_id,
    cm.name as crew_name,
    cl.latitude as crew_latitude,
    cl.longitude as crew_longitude,
    cl.timestamp as crew_last_update,
    st.name as service_name,
    st.category as service_category
FROM jobs j
LEFT JOIN crew_members cm ON j.assigned_crew_id = cm.id
LEFT JOIN crew_locations cl ON cm.id = cl.crew_id 
    AND cl.timestamp = (
        SELECT MAX(timestamp) 
        FROM crew_locations cl2 
        WHERE cl2.crew_id = cm.id
    )
LEFT JOIN service_types st ON j.service_type_id = st.id
WHERE j.status IN ('assigned', 'en_route', 'in_progress');

-- ============================================================================
-- TRIGGERS FOR DATA CONSISTENCY
-- ============================================================================

-- Update crew status when location is updated
DELIMITER //
CREATE TRIGGER update_crew_activity_on_location
AFTER INSERT ON crew_locations
FOR EACH ROW
BEGIN
    -- Update last activity and potentially status
    UPDATE crew_members 
    SET updated_at = NEW.timestamp
    WHERE id = NEW.crew_id;
    
    -- Auto-set to online if location is updated and currently offline
    INSERT INTO crew_status (crew_id, status, auto_generated, location_id)
    SELECT NEW.crew_id, 'online', TRUE, NEW.id
    WHERE NOT EXISTS (
        SELECT 1 FROM crew_status 
        WHERE crew_id = NEW.crew_id AND ended_at IS NULL
    );
END//

-- Close previous status when new status is set
CREATE TRIGGER close_previous_crew_status
BEFORE INSERT ON crew_status
FOR EACH ROW
BEGIN
    UPDATE crew_status 
    SET ended_at = NEW.started_at
    WHERE crew_id = NEW.crew_id AND ended_at IS NULL;
END//

DELIMITER ;

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Create default crew groups
INSERT INTO crew_groups (name, description, color_code) VALUES
('Team Alpha', 'Main crew team for central Manila area', '#3B82F6'),
('Team Beta', 'Secondary team for Makati and BGC', '#10B981'),
('Team Gamma', 'Specialized team for premium services', '#8B5CF6'),
('Team Delta', 'Mobile team for home services', '#F59E0B'),
('Team Echo', 'Emergency response and urgent services', '#EF4444');

-- Create default service types
INSERT INTO service_types (name, category, wash_type, vehicle_types, base_price, estimated_duration, description) VALUES
('Basic Exterior Wash', 'basic', 'exterior', '["car", "suv"]', 200.00, 30, 'Standard exterior wash with soap and rinse'),
('Premium Full Service', 'premium', 'full', '["car", "suv", "van"]', 500.00, 60, 'Complete wash including interior cleaning'),
('Deluxe Detailing', 'deluxe', 'detailing', '["car", "suv"]', 800.00, 120, 'Full detailing with wax and interior deep clean'),
('VIP Concierge Service', 'vip', 'full', '["car", "suv", "truck"]', 1200.00, 90, 'Premium service with pickup and delivery'),
('Motorcycle Wash', 'basic', 'exterior', '["motorcycle"]', 150.00, 20, 'Specialized motorcycle cleaning'),
('Truck/Van Service', 'basic', 'exterior', '["truck", "van", "pickup"]', 400.00, 45, 'Large vehicle washing service');

-- ============================================================================
-- PERFORMANCE OPTIMIZATION NOTES
-- ============================================================================

-- For production deployment:
-- 1. Set up proper MySQL configuration for real-time performance
-- 2. Enable query cache for frequently accessed views
-- 3. Set up read replicas for analytics queries
-- 4. Implement proper backup strategy for location data
-- 5. Monitor and optimize slow queries regularly
-- 6. Consider partitioning large tables by date for performance

-- Recommended MySQL settings for real-time tracking:
-- innodb_buffer_pool_size = 70% of available RAM
-- innodb_log_file_size = 256M
-- max_connections = 500
-- query_cache_size = 128M
-- query_cache_type = 1
