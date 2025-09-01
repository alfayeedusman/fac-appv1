import { neon } from '@neondatabase/serverless';
import { getDatabase, testConnection } from './connection';
import bcrypt from 'bcryptjs';

// Initialize Neon SQL client at module scope
const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';
const sql = DATABASE_URL ? neon(DATABASE_URL) : null as any;

// Database migration script to create all tables
export async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  try {
    if (!sql) {
      throw new Error('DATABASE_URL/NEON_DATABASE_URL is not configured');
    }

    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    const db = getDatabase();
    if (!db) {
      throw new Error('Database not initialized');
    }

    // Create CUID2 extension if needed (for better ID generation)
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

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

    console.log('✅ Database migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Function to seed initial data
export async function seedInitialData() {
  console.log('🌱 Seeding initial data...');
  
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('Database not initialized');
    }

    // Create or update superadmin user
    const superAdminExists = await sql`SELECT id FROM users WHERE email = 'superadmin@fayeedautocare.com' LIMIT 1`;
    const superAdminPassword = await bcrypt.hash('SuperAdmin2025!', 10);

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
      console.log('✅ Superadmin user created: superadmin@fayeedautocare.com / SuperAdmin2025!');
    } else {
      await sql`
        UPDATE users
        SET password = ${superAdminPassword}, role = 'superadmin', updated_at = NOW()
        WHERE email = 'superadmin@fayeedautocare.com';
      `;
      console.log('✅ Superadmin user password updated');
    }

    // Create or update default admin user
    const adminExists = await sql`SELECT id FROM users WHERE email = 'admin@fayeedautocare.com' LIMIT 1`;
    const hashedPassword = await bcrypt.hash('admin123', 10);

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
      console.log('✅ Default admin user created with properly hashed password');
    } else {
      await sql`
        UPDATE users
        SET password = ${hashedPassword}, updated_at = NOW()
        WHERE email = 'admin@fayeedautocare.com';
      `;
      console.log('✅ Default admin user password updated with proper hash');
    }

    // Insert default admin settings
    const defaultSettings = [
      { key: 'booking_advance_days', value: '7', description: 'How many days in advance bookings can be made', category: 'booking' },
      { key: 'notification_sound_enabled', value: 'true', description: 'Enable sound notifications', category: 'notification' },
      { key: 'loyalty_points_rate', value: '100', description: 'Points earned per 100 PHP spent', category: 'general' },
      { key: 'business_hours_start', value: '08:00', description: 'Business opening time', category: 'general' },
      { key: 'business_hours_end', value: '18:00', description: 'Business closing time', category: 'general' },
    ];

    for (const setting of defaultSettings) {
      const exists = await sql`SELECT id FROM admin_settings WHERE key = ${setting.key} LIMIT 1`;
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

    console.log('✅ Initial data seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Seeding failed:', error);
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
