import { neon } from "@neondatabase/serverless";
import { getDatabase, testConnection } from "./connection";
import bcrypt from "bcryptjs";

// Initialize Neon SQL client at module scope
const DATABASE_URL =
  process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "";
const sql = DATABASE_URL ? neon(DATABASE_URL) : (null as any);

// Database migration script to create all tables
export async function runMigrations() {
  console.log("🚀 Starting database migrations...");

  try {
    if (!sql) {
      throw new Error("DATABASE_URL/NEON_DATABASE_URL is not configured");
    }

    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error("Database connection failed");
    }

    const db = getDatabase();
    if (!db) {
      throw new Error("Database not initialized");
    }

    // Create CUID2 extension if needed (for better ID generation)
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create crew tracking tables first
    console.log("�� Creating crew tracking tables...");

    // Create crew groups table
    await sql`
      CREATE TABLE IF NOT EXISTS crew_groups (
        id TEXT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        leader_id TEXT,
        color_code VARCHAR(7) DEFAULT '#3B82F6',
        max_members INTEGER DEFAULT 10,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create crew members table
    await sql`
      CREATE TABLE IF NOT EXISTS crew_members (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        crew_group_id TEXT,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        hire_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        specializations JSONB,
        skill_level VARCHAR(20) DEFAULT 'trainee',
        hourly_rate DECIMAL(10,2) DEFAULT 0.00,
        commission_rate DECIMAL(5,2) DEFAULT 0.00,
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create crew locations table
    await sql`
      CREATE TABLE IF NOT EXISTS crew_locations (
        id TEXT PRIMARY KEY,
        crew_id TEXT NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        accuracy DECIMAL(6,2),
        altitude DECIMAL(8,2),
        heading DECIMAL(5,2),
        speed DECIMAL(6,2),
        address TEXT,
        location_source VARCHAR(20) DEFAULT 'gps',
        battery_level INTEGER,
        signal_strength INTEGER,
        timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create crew status table
    await sql`
      CREATE TABLE IF NOT EXISTS crew_status (
        id TEXT PRIMARY KEY,
        crew_id TEXT NOT NULL,
        status VARCHAR(20) NOT NULL,
        previous_status VARCHAR(20),
        reason VARCHAR(255),
        auto_generated BOOLEAN DEFAULT FALSE,
        location_id TEXT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create customer sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS customer_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        session_type VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        device_info JSONB,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP
      )
    `;

    console.log("�� Crew tracking tables created successfully");

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        contact_number VARCHAR(20),
        address TEXT,
        default_address TEXT,
        car_unit VARCHAR(255),
        car_plate_number VARCHAR(20),
        car_type VARCHAR(100),
        branch_location VARCHAR(255) NOT NULL,
        profile_image TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        email_verified BOOLEAN NOT NULL DEFAULT false,
        loyalty_points INTEGER NOT NULL DEFAULT 0,
        subscription_status VARCHAR(20) NOT NULL DEFAULT 'free',
        subscription_expiry TIMESTAMP,
        crew_skills JSONB,
        crew_status VARCHAR(20) DEFAULT 'available',
        current_assignment TEXT,
        crew_rating DECIMAL(3,2),
        crew_experience INTEGER,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Add missing columns to existing users table (safe migration)
    console.log("🔧 Checking for missing columns in users table...");
    try {
      await sql`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS default_address TEXT;
      `;
      console.log("✅ default_address column check complete");
    } catch (error: any) {
      console.warn("⚠️ Could not add default_address column (may already exist):", error.message);
    }

    try {
      await sql`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS can_view_all_branches BOOLEAN NOT NULL DEFAULT false;
      `;
      console.log("✅ can_view_all_branches column check complete");
    } catch (error: any) {
      console.warn("⚠️ Could not add can_view_all_branches column (may already exist):", error.message);
    }

    // Create user_vehicles table for multiple vehicle support
    await sql`
      CREATE TABLE IF NOT EXISTS user_vehicles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        unit_type VARCHAR(20) NOT NULL,
        unit_size VARCHAR(50) NOT NULL,
        plate_number VARCHAR(20) NOT NULL,
        vehicle_model VARCHAR(255) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create bookings table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        guest_info JSONB,
        type VARCHAR(20) NOT NULL,
        confirmation_code VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        service VARCHAR(255) NOT NULL,
        unit_type VARCHAR(20) NOT NULL,
        unit_size VARCHAR(50),
        plate_number VARCHAR(20),
        vehicle_model VARCHAR(255),
        date VARCHAR(20) NOT NULL,
        time_slot VARCHAR(50) NOT NULL,
        branch VARCHAR(255) NOT NULL,
        service_location TEXT,
        estimated_duration INTEGER,
        base_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'PHP',
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        receipt_url TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        notes TEXT,
        special_requests TEXT,
        points_earned INTEGER DEFAULT 0,
        loyalty_rewards_applied JSONB,
        assigned_crew JSONB,
        crew_notes TEXT,
        completed_at TIMESTAMP,
        customer_rating DECIMAL(3,2),
        customer_feedback TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create system_notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS system_notifications (
        id TEXT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority VARCHAR(20) NOT NULL,
        target_roles JSONB NOT NULL,
        target_users JSONB,
        data JSONB,
        scheduled_for TIMESTAMP,
        sent_at TIMESTAMP,
        read_by JSONB NOT NULL DEFAULT '[]',
        actions JSONB,
        play_sound BOOLEAN DEFAULT false,
        sound_type VARCHAR(50),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create admin_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id TEXT PRIMARY KEY,
        key VARCHAR(255) NOT NULL UNIQUE,
        value JSONB NOT NULL,
        description TEXT,
        category VARCHAR(100),
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create ads table
    await sql`
      CREATE TABLE IF NOT EXISTS ads (
        id TEXT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        duration VARCHAR(20) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        target_pages JSONB NOT NULL,
        admin_email VARCHAR(255) NOT NULL,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create ad_dismissals table
    await sql`
      CREATE TABLE IF NOT EXISTS ad_dismissals (
        id TEXT PRIMARY KEY,
        ad_id TEXT NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        dismissed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create booking_status_history table
    await sql`
      CREATE TABLE IF NOT EXISTS booking_status_history (
        id TEXT PRIMARY KEY,
        booking_id TEXT NOT NULL,
        from_status VARCHAR(50),
        to_status VARCHAR(50) NOT NULL,
        notes TEXT,
        changed_by TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create user_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create inventory_items table
    await sql`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        current_stock INTEGER NOT NULL DEFAULT 0,
        min_stock_level INTEGER NOT NULL DEFAULT 10,
        max_stock_level INTEGER NOT NULL DEFAULT 1000,
        unit_price DECIMAL(10,2),
        supplier VARCHAR(255),
        barcode VARCHAR(100),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create stock_movements table
    await sql`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY,
        item_id TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        quantity INTEGER NOT NULL,
        reason VARCHAR(255),
        reference VARCHAR(255),
        performed_by TEXT,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // ============= SUPPLIERS SYSTEM =============

    // Create suppliers table
    await sql`
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        website VARCHAR(255),
        tax_id VARCHAR(100),
        payment_terms VARCHAR(100) DEFAULT 'Net 30',
        credit_limit DECIMAL(12,2) DEFAULT 0.00,
        current_balance DECIMAL(12,2) DEFAULT 0.00,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_orders INTEGER DEFAULT 0,
        total_value DECIMAL(12,2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'active',
        notes TEXT,
        tags JSONB DEFAULT '[]',
        average_lead_time INTEGER,
        delivery_reliability DECIMAL(5,2) DEFAULT 100.00,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create purchase_orders table
    await sql`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id TEXT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        supplier_id TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        order_date TIMESTAMP NOT NULL DEFAULT NOW(),
        expected_delivery TIMESTAMP,
        actual_delivery TIMESTAMP,
        subtotal DECIMAL(12,2) NOT NULL,
        tax_amount DECIMAL(12,2) DEFAULT 0.00,
        shipping_cost DECIMAL(12,2) DEFAULT 0.00,
        discount_amount DECIMAL(12,2) DEFAULT 0.00,
        total_amount DECIMAL(12,2) NOT NULL,
        requested_by TEXT NOT NULL,
        approved_by TEXT,
        approved_at TIMESTAMP,
        notes TEXT,
        internal_reference VARCHAR(100),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create purchase_order_items table
    await sql`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id TEXT PRIMARY KEY,
        purchase_order_id TEXT NOT NULL,
        inventory_item_id TEXT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        item_sku VARCHAR(100),
        quantity_ordered INTEGER NOT NULL,
        quantity_received INTEGER DEFAULT 0,
        quantity_pending INTEGER NOT NULL,
        unit_cost DECIMAL(10,2) NOT NULL,
        line_total DECIMAL(12,2) NOT NULL,
        received_date TIMESTAMP,
        received_by TEXT,
        quality_status VARCHAR(50) DEFAULT 'pending',
        quality_notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // ============= SERVICE PACKAGES SYSTEM =============

    // Create service_packages table
    await sql`
      CREATE TABLE IF NOT EXISTS service_packages (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'PHP',
        duration_type VARCHAR(20) DEFAULT 'preset',
        duration VARCHAR(50),
        hours INTEGER,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        features JSONB NOT NULL DEFAULT '[]',
        inclusions JSONB DEFAULT '[]',
        exclusions JSONB DEFAULT '[]',
        vehicle_types JSONB NOT NULL DEFAULT '["car"]',
        car_price DECIMAL(10,2),
        motorcycle_price DECIMAL(10,2),
        suv_price DECIMAL(10,2),
        truck_price DECIMAL(10,2),
        image_url TEXT,
        banner_url TEXT,
        color VARCHAR(50) DEFAULT '#f97316',
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_popular BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        available_branches JSONB,
        max_bookings_per_day INTEGER,
        max_bookings_per_month INTEGER,
        min_advance_booking INTEGER,
        max_advance_booking INTEGER,
        tags JSONB DEFAULT '[]',
        priority INTEGER DEFAULT 0,
        created_by TEXT,
        updated_by TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create package_subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS package_subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        package_id TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        auto_renew BOOLEAN DEFAULT true,
        renewal_date TIMESTAMP,
        original_price DECIMAL(10,2) NOT NULL,
        discount_applied DECIMAL(10,2) DEFAULT 0,
        final_price DECIMAL(10,2) NOT NULL,
        usage_count INTEGER DEFAULT 0,
        usage_limit INTEGER,
        remaining_credits INTEGER,
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'pending',
        last_payment_date TIMESTAMP,
        next_payment_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // ============= BRANCHES SYSTEM =============

    // Create branches table
    await sql`
      CREATE TABLE IF NOT EXISTS branches (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(20) NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL DEFAULT 'full_service',
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) NOT NULL DEFAULT 'Philippines',
        phone VARCHAR(20),
        email VARCHAR(255),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        timezone VARCHAR(100) DEFAULT 'Asia/Manila',
        manager_name VARCHAR(255),
        manager_phone VARCHAR(20),
        capacity INTEGER DEFAULT 10,
        services JSONB NOT NULL DEFAULT '[]',
        specializations JSONB DEFAULT '[]',
        operating_hours JSONB,
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_main_branch BOOLEAN DEFAULT false,
        has_wifi BOOLEAN DEFAULT true,
        has_parking BOOLEAN DEFAULT true,
        has_waiting_area BOOLEAN DEFAULT true,
        has_24_hour_service BOOLEAN DEFAULT false,
        images JSONB DEFAULT '[]',
        logo_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // ============= ENHANCED GAMIFICATION SYSTEM =============

    // Create customer_levels table
    await sql`
      CREATE TABLE IF NOT EXISTS customer_levels (
        id TEXT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        min_points INTEGER NOT NULL,
        max_points INTEGER,
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        priority INTEGER DEFAULT 0,
        special_perks JSONB DEFAULT '[]',
        badge_icon VARCHAR(100),
        badge_color VARCHAR(50) DEFAULT '#6B7280',
        level_color VARCHAR(50) DEFAULT '#F97316',
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create achievements table
    await sql`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        target_value INTEGER,
        requirement_data JSONB,
        points_reward INTEGER DEFAULT 0,
        badge_icon VARCHAR(100),
        badge_color VARCHAR(50) DEFAULT '#10B981',
        is_active BOOLEAN DEFAULT true,
        is_repeatable BOOLEAN DEFAULT false,
        valid_from TIMESTAMP,
        valid_until TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create user_achievements table
    await sql`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        points_earned INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create loyalty_transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS loyalty_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount INTEGER NOT NULL,
        description TEXT,
        reference_type VARCHAR(50),
        reference_id TEXT,
        balance_before INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        expires_at TIMESTAMP,
        processed_by TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // ============= POS SYSTEM =============

    // Create pos_categories table
    await sql`
      CREATE TABLE IF NOT EXISTS pos_categories (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        color VARCHAR(50) DEFAULT '#F97316',
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create pos_products table
    await sql`
      CREATE TABLE IF NOT EXISTS pos_products (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id TEXT,
        base_price DECIMAL(10,2) NOT NULL,
        car_price DECIMAL(10,2),
        motorcycle_price DECIMAL(10,2),
        suv_price DECIMAL(10,2),
        truck_price DECIMAL(10,2),
        sku VARCHAR(100),
        barcode VARCHAR(100),
        unit VARCHAR(50) DEFAULT 'piece',
        track_inventory BOOLEAN DEFAULT false,
        current_stock INTEGER DEFAULT 0,
        min_stock_level INTEGER DEFAULT 0,
        is_service BOOLEAN DEFAULT false,
        estimated_duration INTEGER,
        vehicle_types JSONB DEFAULT '["car"]',
        image_url TEXT,
        color VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        available_branches JSONB,
        tags JSONB DEFAULT '[]',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create pos_transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS pos_transactions (
        id TEXT PRIMARY KEY,
        transaction_number VARCHAR(50) NOT NULL UNIQUE,
        customer_id TEXT,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        type VARCHAR(50) NOT NULL DEFAULT 'sale',
        status VARCHAR(50) NOT NULL DEFAULT 'completed',
        branch_id TEXT NOT NULL,
        cashier_id TEXT NOT NULL,
        cashier_name VARCHAR(255) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_reference VARCHAR(255),
        amount_paid DECIMAL(10,2) NOT NULL,
        change_amount DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        receipt_data JSONB,
        points_earned INTEGER DEFAULT 0,
        points_redeemed INTEGER DEFAULT 0,
        refunded_at TIMESTAMP,
        refund_reason TEXT,
        refunded_by TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create pos_transaction_items table
    await sql`
      CREATE TABLE IF NOT EXISTS pos_transaction_items (
        id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL,
        product_id TEXT,
        item_name VARCHAR(255) NOT NULL,
        item_sku VARCHAR(100),
        item_category VARCHAR(100),
        unit_price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        subtotal DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        final_price DECIMAL(10,2) NOT NULL,
        vehicle_type VARCHAR(50),
        service_notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // ============= IMAGE MANAGEMENT SYSTEM =============

    // Create images table
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        width INTEGER,
        height INTEGER,
        storage_type VARCHAR(50) NOT NULL DEFAULT 'local',
        storage_path TEXT NOT NULL,
        public_url TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        tags JSONB DEFAULT '[]',
        uploaded_by TEXT,
        associated_with VARCHAR(50),
        associated_id TEXT,
        alt_text TEXT,
        description TEXT,
        processing_status VARCHAR(50) DEFAULT 'completed',
        thumbnail_url TEXT,
        medium_url TEXT,
        download_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create image_collections table
    await sql`
      CREATE TABLE IF NOT EXISTS image_collections (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        is_public BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_by TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create image_collection_items table
    await sql`
      CREATE TABLE IF NOT EXISTS image_collection_items (
        id TEXT PRIMARY KEY,
        collection_id TEXT NOT NULL,
        image_id TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        caption TEXT,
        added_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // ============= VOUCHER SYSTEM =============

    // Create vouchers table
    await sql`
      CREATE TABLE IF NOT EXISTS vouchers (
        id TEXT PRIMARY KEY,
        code VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        discount_type VARCHAR(20) NOT NULL, -- 'percentage' | 'fixed_amount'
        discount_value DECIMAL(10,2) NOT NULL,
        minimum_amount DECIMAL(10,2) DEFAULT 0.00,
        audience VARCHAR(20) NOT NULL DEFAULT 'registered', -- 'all' | 'registered'
        valid_from TIMESTAMP,
        valid_until TIMESTAMP,
        usage_limit INTEGER,
        per_user_limit INTEGER DEFAULT 1,
        total_used INTEGER DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create voucher_redemptions table
    await sql`
      CREATE TABLE IF NOT EXISTS voucher_redemptions (
        id TEXT PRIMARY KEY,
        voucher_code VARCHAR(100) NOT NULL,
        user_email VARCHAR(255), -- null allowed for guest if voucher audience = 'all'
        booking_id TEXT,
        discount_amount DECIMAL(10,2) NOT NULL,
        redeemed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Add voucher fields to bookings if not exists
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(100);`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS voucher_discount DECIMAL(10,2) DEFAULT 0.00;`;

    // ============= PUSH NOTIFICATION SYSTEM =============

    // Create fcm_tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS fcm_tokens (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        user_id TEXT,
        device_type VARCHAR(50),
        browser_info TEXT,
        device_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        last_used TIMESTAMP DEFAULT NOW(),
        notification_types JSONB DEFAULT '["booking_updates", "loyalty_updates", "system"]',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create push_notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS push_notifications (
        id TEXT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        image_url TEXT,
        target_type VARCHAR(50) NOT NULL,
        target_ids JSONB,
        notification_type VARCHAR(100) NOT NULL,
        data JSONB,
        total_targets INTEGER DEFAULT 0,
        successful_deliveries INTEGER DEFAULT 0,
        failed_deliveries INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        scheduled_for TIMESTAMP,
        sent_at TIMESTAMP,
        created_by TEXT,
        campaign VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create notification_deliveries table
    await sql`
      CREATE TABLE IF NOT EXISTS notification_deliveries (
        id TEXT PRIMARY KEY,
        notification_id TEXT NOT NULL,
        fcm_token_id TEXT NOT NULL,
        user_id TEXT,
        status VARCHAR(50) NOT NULL,
        error_message TEXT,
        delivered_at TIMESTAMP,
        clicked_at TIMESTAMP,
        dismissed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_vehicles_user_id ON user_vehicles(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_vehicles_is_default ON user_vehicles(user_id, is_default);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_target_roles ON system_notifications USING GIN(target_roles);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(is_active);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);`;

    // Service Packages indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_service_packages_active ON service_packages(is_active);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_packages_category ON service_packages(category);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_packages_featured ON service_packages(is_featured);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_package_subscriptions_user ON package_subscriptions(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_package_subscriptions_status ON package_subscriptions(status);`;

    // Branches indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_branches_active ON branches(is_active);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(code);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_branches_city ON branches(city);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_branches_location ON branches(latitude, longitude);`;

    // Gamification indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_levels_points ON customer_levels(min_points, max_points);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(completed);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON loyalty_transactions(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(type);`;

    // POS System indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_pos_products_active ON pos_products(is_active);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pos_products_category ON pos_products(category_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pos_transactions_branch ON pos_transactions(branch_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pos_transactions_cashier ON pos_transactions(cashier_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pos_transactions_date ON pos_transactions(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_transaction ON pos_transaction_items(transaction_id);`;

    // Image Management indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_images_active ON images(is_active);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_images_uploaded_by ON images(uploaded_by);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_images_associated ON images(associated_with, associated_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_image_collection_items_collection ON image_collection_items(collection_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_image_collection_items_image ON image_collection_items(image_id);`;

    // Push Notification indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user ON fcm_tokens(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_fcm_tokens_active ON fcm_tokens(is_active);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_push_notifications_type ON push_notifications(notification_type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON push_notifications(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification ON notification_deliveries(notification_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notification_deliveries_user ON notification_deliveries(user_id);`;

    // ============= CMS CONTENT MANAGEMENT SYSTEM =============

    console.log("🎨 Creating CMS tables...");

    // Create homepage_content table
    await sql`
      CREATE TABLE IF NOT EXISTS homepage_content (
        id TEXT PRIMARY KEY,
        hero_section JSONB,
        services_section JSONB,
        vision_mission_section JSONB,
        locations_section JSONB,
        footer_section JSONB,
        theme_settings JSONB,
        version VARCHAR(50) DEFAULT '1.0.0',
        is_active BOOLEAN DEFAULT true,
        published_at TIMESTAMP,
        created_by TEXT,
        updated_by TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create cms_content_history table
    await sql`
      CREATE TABLE IF NOT EXISTS cms_content_history (
        id TEXT PRIMARY KEY,
        content_id TEXT NOT NULL,
        action VARCHAR(50) NOT NULL,
        content_snapshot JSONB,
        changed_fields JSONB,
        change_description TEXT,
        changed_by TEXT,
        changed_by_name VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create cms_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS cms_settings (
        id TEXT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value JSONB,
        description TEXT,
        category VARCHAR(50) DEFAULT 'general',
        is_system BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Create indexes for CMS tables
    await sql`
      CREATE INDEX IF NOT EXISTS idx_homepage_content_active
      ON homepage_content(is_active, updated_at DESC);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_cms_content_history_content_id
      ON cms_content_history(content_id, created_at DESC);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_cms_settings_key
      ON cms_settings(setting_key);
    `;

    console.log("✅ CMS tables created successfully!");

    console.log("✅ Database migrations completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Function to seed initial data
export async function seedInitialData() {
  console.log("🌱 Seeding initial data...");

  try {
    const db = getDatabase();
    if (!db) {
      throw new Error("Database not initialized");
    }

    // Create or update superadmin user
    const superAdminExists =
      await sql`SELECT id FROM users WHERE email = 'superadmin@fayeedautocare.com' LIMIT 1`;

    // Use environment variable for superadmin password, fallback to secure default
    const defaultPassword =
      process.env.SUPERADMIN_PASSWORD || "SuperAdmin2025!";
    const superAdminPassword = await bcrypt.hash(defaultPassword, 10);

    if (superAdminExists.length === 0) {
      await sql`
        INSERT INTO users (
          id, email, full_name, password, role, branch_location, is_active, email_verified, loyalty_points, subscription_status
        ) VALUES (
          'superadmin_' || extract(epoch from now())::text,
          'superadmin@fayeedautocare.com',
          'Super Administrator',
          ${superAdminPassword},
          'superadmin',
          'Head Office',
          true,
          true,
          0,
          'vip'
        );
      `;
      console.log("✅ Superadmin user created: superadmin@fayeedautocare.com");
    } else {
      await sql`
        UPDATE users
        SET password = ${superAdminPassword}, role = 'superadmin', updated_at = NOW()
        WHERE email = 'superadmin@fayeedautocare.com';
      `;
      console.log("✅ Superadmin user password updated");
    }

    // Create or update default admin user
    const adminExists =
      await sql`SELECT id FROM users WHERE email = 'admin@fayeedautocare.com' LIMIT 1`;

    // Use environment variable for admin password, fallback to secure default
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

    if (adminExists.length === 0) {
      await sql`
        INSERT INTO users (
          id, email, full_name, password, role, branch_location, is_active, email_verified, loyalty_points, subscription_status
        ) VALUES (
          'admin_' || extract(epoch from now())::text,
          'admin@fayeedautocare.com',
          'FAC Administrator',
          ${hashedPassword},
          'admin',
          'Main Branch',
          true,
          true,
          0,
          'premium'
        );
      `;
      console.log("✅ Default admin user created");
    } else {
      await sql`
        UPDATE users
        SET password = ${hashedPassword}, updated_at = NOW()
        WHERE email = 'admin@fayeedautocare.com';
      `;
      console.log("✅ Default admin user password updated");
    }

    // Insert default admin settings
    const defaultSettings = [
      {
        key: "booking_advance_days",
        value: "7",
        description: "How many days in advance bookings can be made",
        category: "booking",
      },
      {
        key: "notification_sound_enabled",
        value: "true",
        description: "Enable sound notifications",
        category: "notification",
      },
      {
        key: "loyalty_points_rate",
        value: "100",
        description: "Points earned per 100 PHP spent",
        category: "general",
      },
      {
        key: "business_hours_start",
        value: "08:00",
        description: "Business opening time",
        category: "general",
      },
      {
        key: "business_hours_end",
        value: "18:00",
        description: "Business closing time",
        category: "general",
      },
    ];

    for (const setting of defaultSettings) {
      const exists =
        await sql`SELECT id FROM admin_settings WHERE key = ${setting.key} LIMIT 1`;
      if (exists.length === 0) {
        await sql`
          INSERT INTO admin_settings (id, key, value, description, category)
          VALUES (
            'setting_' || extract(epoch from now())::text || '_' || ${setting.key},
            ${setting.key},
            ${JSON.stringify(setting.value)},
            ${setting.description},
            ${setting.category}
          );
        `;
      }
    }

    console.log("✅ Initial data seeded successfully!");
    return true;
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

// Main migration function
export async function migrate() {
  await runMigrations();
  await seedInitialData();
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate().catch(console.error);
}
