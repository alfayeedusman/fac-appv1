import { getDatabase, getSqlClient, testConnection } from "./connection";
import bcrypt from "bcryptjs";
import { seedPremiumUsers } from "./seed-premium-users";

// SQL client is created lazily via connection.ts

// Database migration script to create all tables
export async function runMigrations() {
  console.log("🚀 Starting database migrations...");

  try {
    let sql;
    try {
      sql = await getSqlClient();
    } catch (error) {
      console.warn(
        "⚠️ Database connection unavailable, skipping migrations:",
        error,
      );
      return false;
    }

    if (!sql) {
      console.warn("⚠️ DATABASE_URL/SUPABASE_DATABASE_URL is not configured");
      return false;
    }

    // Test connection first
    let isConnected = false;
    try {
      isConnected = await testConnection(false); // Don't auto-reconnect during migration
    } catch (error) {
      console.warn("⚠️ Database connection test failed, skipping migrations");
      return false;
    }

    if (!isConnected) {
      console.warn("⚠️ Database connection failed, skipping migrations");
      return false;
    }

    let db;
    try {
      db = await getDatabase();
    } catch (error) {
      console.warn("⚠️ Database initialization failed, skipping migrations");
      return false;
    }

    if (!db) {
      console.warn("⚠️ Database not initialized, skipping migrations");
      return false;
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

    await sql`
      ALTER TABLE crew_members
      ADD COLUMN IF NOT EXISTS wash_bay VARCHAR(50);
    `;

    // Create crew commission rates table
    await sql`
      CREATE TABLE IF NOT EXISTS crew_commission_rates (
        id TEXT PRIMARY KEY,
        service_type VARCHAR(255) NOT NULL,
        rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create crew commission entries table
    await sql`
      CREATE TABLE IF NOT EXISTS crew_commission_entries (
        id TEXT PRIMARY KEY,
        crew_user_id TEXT NOT NULL,
        entry_date TIMESTAMP NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        notes TEXT,
        recorded_by TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        payout_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create crew payouts table
    await sql`
      CREATE TABLE IF NOT EXISTS crew_payouts (
        id TEXT PRIMARY KEY,
        crew_user_id TEXT NOT NULL,
        period_start TIMESTAMP NOT NULL,
        period_end TIMESTAMP NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_by TEXT NOT NULL,
        released_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create daily income table
    await sql`
      CREATE TABLE IF NOT EXISTS daily_income (
        id TEXT PRIMARY KEY,
        branch VARCHAR(255) NOT NULL,
        income_date TIMESTAMP NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        recorded_by TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        password TEXT NOT NULL,
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

    // Convert password column from varchar to text if needed (for bcrypt compatibility)
    try {
      await sql`
        ALTER TABLE users
        ALTER COLUMN password TYPE TEXT USING password::text;
      `;
      console.log("✅ password column converted to TEXT type");
    } catch (error: any) {
      if (
        error.message?.includes("already text type") ||
        error.message?.includes("no conversion")
      ) {
        console.log("✅ password column is already TEXT type");
      } else {
        console.warn(
          "⚠️ Could not convert password column to TEXT:",
          error.message,
        );
      }
    }

    try {
      await sql`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS default_address TEXT;
      `;
      console.log("✅ default_address column check complete");
    } catch (error: any) {
      console.warn(
        "⚠️ Could not add default_address column (may already exist):",
        error.message,
      );
    }

    try {
      await sql`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS can_view_all_branches BOOLEAN NOT NULL DEFAULT false;
      `;
      console.log("✅ can_view_all_branches column check complete");
    } catch (error: any) {
      console.warn(
        "⚠️ Could not add can_view_all_branches column (may already exist):",
        error.message,
      );
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
        bay_number INTEGER,
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

    // ============= ADD MISSING COLUMNS TO EXISTING TABLES =============
    console.log("🔧 Adding missing columns to existing tables...");

    // Add missing columns to bookings table
    try {
      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);
      `;
      console.log("✅ total_price column added to bookings");
    } catch (error: any) {
      console.warn("⚠️ total_price column (may already exist):", error.message?.substring(0, 100));
    }

    try {
      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS service_type VARCHAR(20) DEFAULT 'branch';
      `;
      console.log("✅ service_type column added to bookings");
    } catch (error: any) {
      console.warn("⚠️ service_type column (may already exist):", error.message?.substring(0, 100));
    }

    try {
      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS assigned_crew JSONB;
      `;
      console.log("✅ assigned_crew column added to bookings");
    } catch (error: any) {
      console.warn("⚠️ assigned_crew column (may already exist):", error.message?.substring(0, 100));
    }

    try {
      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS service VARCHAR(255);
      `;
      console.log("✅ service column added to bookings");
    } catch (error: any) {
      console.warn("⚠️ service column (may already exist):", error.message?.substring(0, 100));
    }

    // Add missing columns to users table
    try {
      await sql`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS car_type VARCHAR(100);
      `;
      console.log("✅ car_type column added to users");
    } catch (error: any) {
      console.warn("⚠️ car_type column (may already exist):", error.message?.substring(0, 100));
    }

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

    // Add missing columns to service_packages table
    try {
      await sql`
        ALTER TABLE service_packages
        ADD COLUMN IF NOT EXISTS duration_type VARCHAR(20) DEFAULT 'preset';
      `;
      console.log("✅ duration_type column added to service_packages");
    } catch (error: any) {
      console.warn("⚠️ duration_type column (may already exist):", error.message?.substring(0, 100));
    }

    try {
      await sql`
        ALTER TABLE service_packages
        ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
      `;
      console.log("✅ sort_order column added to service_packages");
    } catch (error: any) {
      console.warn("⚠️ sort_order column (may already exist):", error.message?.substring(0, 100));
    }

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
        gradient VARCHAR(100) DEFAULT 'from-gray-400 to-gray-600',
        badge_shape VARCHAR(20) DEFAULT 'circle',
        badge_pattern VARCHAR(20) DEFAULT 'solid',
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`ALTER TABLE customer_levels ADD COLUMN IF NOT EXISTS gradient VARCHAR(100) DEFAULT 'from-gray-400 to-gray-600';`;
    await sql`ALTER TABLE customer_levels ADD COLUMN IF NOT EXISTS badge_shape VARCHAR(20) DEFAULT 'circle';`;
    await sql`ALTER TABLE customer_levels ADD COLUMN IF NOT EXISTS badge_pattern VARCHAR(20) DEFAULT 'solid';`;

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

    // Create pos_sessions table (Opening and Closing)
    await sql`
      CREATE TABLE IF NOT EXISTS pos_sessions (
        id TEXT PRIMARY KEY,
        status VARCHAR(20) NOT NULL DEFAULT 'open',
        session_date TIMESTAMP NOT NULL,
        cashier_id TEXT NOT NULL,
        cashier_name VARCHAR(255) NOT NULL,
        branch_id TEXT NOT NULL,
        opening_balance DECIMAL(10,2) NOT NULL,
        opened_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        closing_balance DECIMAL(10,2),
        closed_at TIMESTAMP,
        total_cash_sales DECIMAL(10,2) DEFAULT 0,
        total_card_sales DECIMAL(10,2) DEFAULT 0,
        total_gcash_sales DECIMAL(10,2) DEFAULT 0,
        total_bank_sales DECIMAL(10,2) DEFAULT 0,
        total_expenses DECIMAL(10,2) DEFAULT 0,
        expected_cash DECIMAL(10,2),
        actual_cash DECIMAL(10,2),
        cash_variance DECIMAL(10,2),
        expected_digital DECIMAL(10,2),
        actual_digital DECIMAL(10,2),
        digital_variance DECIMAL(10,2),
        remittance_notes TEXT,
        is_balanced BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create pos_expenses table
    await sql`
      CREATE TABLE IF NOT EXISTS pos_expenses (
        id TEXT PRIMARY KEY,
        pos_session_id TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        notes TEXT,
        recorded_by TEXT NOT NULL,
        recorded_by_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    await sql`CREATE INDEX IF NOT EXISTS idx_pos_sessions_cashier ON pos_sessions(cashier_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pos_sessions_status ON pos_sessions(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pos_sessions_date ON pos_sessions(session_date);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pos_expenses_session ON pos_expenses(pos_session_id);`;

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

    // Add missing columns to bookings table (for carwash bay management and service type)
    await sql`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS bay_number INTEGER;
    `;
    console.log("✅ Bay management column added to bookings table");

    // Add service_type column if missing (critical for booking flow)
    try {
      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS service_type VARCHAR(20) NOT NULL DEFAULT 'branch';
      `;
      console.log("✅ service_type column added to bookings table");
    } catch (error: any) {
      if (error.message?.includes("column already exists")) {
        console.log("✅ service_type column already exists");
      } else {
        console.warn("⚠️ Could not add service_type column:", error.message);
      }
    }

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

    // Create User Preferences table
    console.log("📝 Creating user preferences table...");
    await sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        theme VARCHAR(20) DEFAULT 'light',
        notifications_enabled BOOLEAN DEFAULT true,
        email_notifications BOOLEAN DEFAULT true,
        push_notifications BOOLEAN DEFAULT true,
        sms_notifications BOOLEAN DEFAULT false,
        language VARCHAR(10) DEFAULT 'en',
        timezone VARCHAR(50) DEFAULT 'UTC',
        preferences JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create User Notifications table
    console.log("📢 Creating user notifications table...");
    await sql`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        notification_id TEXT,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        action_url TEXT,
        image_url TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create Printer Templates table
    console.log("🖨️ Creating printer templates table...");
    await sql`
      CREATE TABLE IF NOT EXISTS printer_templates (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        template_content TEXT NOT NULL,
        is_default BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        paper_size VARCHAR(50) DEFAULT '80mm',
        layout VARCHAR(50) DEFAULT 'landscape',
        margin_top INTEGER DEFAULT 0,
        margin_bottom INTEGER DEFAULT 0,
        margin_left INTEGER DEFAULT 0,
        margin_right INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create Printer Configurations table
    console.log("🖨️ Creating printer configurations table...");
    await sql`
      CREATE TABLE IF NOT EXISTS printer_configurations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        printer_name VARCHAR(255) NOT NULL,
        printer_type VARCHAR(50) NOT NULL,
        connection_type VARCHAR(50) NOT NULL,
        device_id VARCHAR(255),
        ip_address VARCHAR(45),
        port INTEGER,
        is_active BOOLEAN DEFAULT true,
        is_default BOOLEAN DEFAULT false,
        template_id TEXT,
        settings JSONB,
        last_used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create Gamification User Progress table
    console.log("🎮 Creating gamification user progress table...");
    await sql`
      CREATE TABLE IF NOT EXISTS gamification_user_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        current_level INTEGER DEFAULT 1,
        current_xp INTEGER DEFAULT 0,
        total_xp INTEGER DEFAULT 0,
        level_progress JSONB,
        unlocked_achievements JSONB,
        badges JSONB,
        streak_days INTEGER DEFAULT 0,
        last_activity_date TIMESTAMP,
        total_bookings_completed INTEGER DEFAULT 0,
        total_washes_completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indexes for new tables
    await sql`CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(is_read);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_printer_templates_user_id ON printer_templates(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_printer_configs_user_id ON printer_configurations(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gamification_progress_user_id ON gamification_user_progress(user_id);`;

    console.log(
      "✅ User preferences, notifications, printer, and gamification tables created successfully!",
    );

    console.log("✅ Database migrations completed successfully!");
    return true;
  } catch (error) {
    console.warn("⚠️ Migration failed (non-critical):", error);
    // Don't throw - allow server to start even if migrations fail
    return false;
  }
}

// Function to seed initial data
export async function seedInitialData() {
  console.log("🌱 Seeding initial data...");

  try {
    let sql, db;
    try {
      sql = await getSqlClient();
      db = await getDatabase();
    } catch (error) {
      console.warn(
        "⚠️ Database not initialized, skipping initial data seeding",
      );
      return false;
    }

    if (!db || !sql) {
      console.warn(
        "⚠️ Database not initialized, skipping initial data seeding",
      );
      return false;
    }

    // Create or update superadmin user
    const superAdminExists =
      await sql`SELECT id FROM users WHERE email = 'superadmin@fayeedautocare.com' LIMIT 1`;

    // Use environment variable for superadmin password, fallback to secure default
    const defaultPassword =
      process.env.SUPERADMIN_PASSWORD || "SuperAdmin2024!";
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

    // Seed service packages (subscriptions)
    console.log("📦 Seeding service packages...");
    const packages = [
      {
        name: "Free Account",
        type: "free",
        basePrice: 0,
        features: [
          "Basic car wash services",
          "Pay per service",
          "Email support",
        ],
        description: "Perfect for occasional car wash needs",
        isPopular: false,
        isFeatured: false,
      },
      {
        name: "Classic Pro",
        type: "classic",
        basePrice: 500,
        features: [
          "10 washes per month",
          "Basic car wash services",
          "Priority booking",
          "Email support",
        ],
        description: "Great for regular customers",
        isPopular: true,
        isFeatured: true,
      },
      {
        name: "VIP Silver Elite",
        type: "silver",
        basePrice: 1500,
        features: [
          "Unlimited basic washes",
          "Premium detailing included",
          "Priority support",
          "Free add-on services",
          "24/7 customer support",
        ],
        description: "Premium membership with unlimited benefits",
        isPopular: false,
        isFeatured: true,
      },
      {
        name: "VIP Gold Ultimate",
        type: "gold",
        basePrice: 3000,
        features: [
          "All services unlimited",
          "Premium detailing included",
          "VIP concierge service",
          "Free home pickup & delivery",
          "Priority support",
          "Exclusive member events",
        ],
        description: "Ultimate premium experience",
        isPopular: true,
        isFeatured: true,
      },
    ];

    for (const pkg of packages) {
      const pkgExists =
        await sql`SELECT id FROM service_packages WHERE name = ${pkg.name} LIMIT 1`;
      if (pkgExists.length === 0) {
        await sql`
          INSERT INTO service_packages (
            id, name, description, category, type, base_price, currency, features,
            is_active, is_popular, is_featured, color, priority
          ) VALUES (
            'pkg_' || ${pkg.type} || '_' || extract(epoch from now())::text,
            ${pkg.name},
            ${pkg.description},
            'subscription',
            'recurring',
            ${pkg.basePrice},
            'PHP',
            ${JSON.stringify(pkg.features)},
            true,
            ${pkg.isPopular},
            ${pkg.isFeatured},
            ${pkg.type === "gold" ? "#FFD700" : pkg.type === "silver" ? "#C0C0C0" : pkg.type === "classic" ? "#8B4513" : "#E5E7EB"},
            ${pkg.basePrice / 500}
          );
        `;
      }
    }
    console.log("✅ Service packages seeded successfully!");

    console.log("✅ Initial data seeded successfully!");
    return true;
  } catch (error) {
    console.warn("⚠️ Seeding failed (non-critical):", error);
    // Don't throw - allow server to start even if seeding fails
    return false;
  }
}

// Main migration function
export async function migrate() {
  // In production, check for skip flags; in dev, always run
  const isDev = process.env.NODE_ENV !== "production";
  const shouldSkip =
    (!isDev && process.env.SKIP_MIGRATIONS === "true") ||
    (!isDev && process.env.DISABLE_MIGRATIONS === "true");
  const databaseUrl =
    process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

  console.log("🔍 Migration check - isDev:", isDev, "shouldSkip:", shouldSkip, "hasDbUrl:", !!databaseUrl);

  if (shouldSkip) {
    console.warn(
      "⚠️ Skipping database migrations: migrations disabled.",
    );
    return;
  }

  if (!databaseUrl) {
    console.warn(
      "⚠️ Skipping database migrations: missing database URL.",
    );
    return;
  }

  try {
    await runMigrations();
    await seedInitialData();

    // Seed premium users and test accounts
    try {
      await seedPremiumUsers();
    } catch (err) {
      console.warn("⚠️ Premium user seeding failed (non-critical):", err);
    }
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    if (process.env.MIGRATIONS_STRICT === "true") {
      throw error;
    }
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate().catch(console.error);
}
