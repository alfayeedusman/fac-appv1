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

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_target_roles ON system_notifications USING GIN(target_roles);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(is_active);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);`;

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

    // Create default admin user
    const adminExists = await sql`SELECT id FROM users WHERE email = 'admin@fayeedautocare.com' LIMIT 1`;

    if (adminExists.length === 0) {
      // Hash the password properly
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await sql`
        INSERT INTO users (
          id, email, full_name, password, role, branch_location, is_active, email_verified
        ) VALUES (
          'admin_' || extract(epoch from now())::text,
          'admin@fayeedautocare.com',
          'FAC Administrator',
          ${hashedPassword},
          'admin',
          'Main Branch',
          true,
          true
        );
      `;
      console.log('✅ Default admin user created with properly hashed password');
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
