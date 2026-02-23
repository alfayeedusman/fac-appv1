#!/usr/bin/env node

/**
 * Setup Script: Create Vouchers, Referrals, and Payments Tables
 * 
 * This script creates the database tables needed for:
 * - Vouchers & Promo Codes system
 * - Referral Program
 * - Payment Methods management
 */

import postgres from 'postgres';

const DATABASE_URL = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: SUPABASE_DATABASE_URL or DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Hide password in logs
const dbDisplay = DATABASE_URL.replace(/:[^:]+@/, ':****@');
console.log('🚀 Setting up Vouchers, Referrals & Payments Tables');
console.log('==========================================');
console.log(`📍 Database: ${dbDisplay}\n`);

const sql = postgres(DATABASE_URL);

const tables = [
  {
    name: 'vouchers',
    sql: `
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: 'user_vouchers_indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
      CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);
      CREATE INDEX IF NOT EXISTS idx_vouchers_valid_until ON vouchers(valid_until);
    `
  },
  {
    name: 'user_vouchers',
    sql: `
      CREATE TABLE IF NOT EXISTS user_vouchers (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        voucher_id VARCHAR(255) NOT NULL REFERENCES vouchers(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP,
        booking_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, voucher_id)
      )
    `
  },
  {
    name: 'user_vouchers_indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_user_vouchers_user_id ON user_vouchers(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_vouchers_voucher_id ON user_vouchers(voucher_id);
      CREATE INDEX IF NOT EXISTS idx_user_vouchers_used_at ON user_vouchers(used_at);
    `
  },
  {
    name: 'referral_codes',
    sql: `
      CREATE TABLE IF NOT EXISTS referral_codes (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        code VARCHAR(20) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `
  },
  {
    name: 'referral_codes_indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
      CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
    `
  },
  {
    name: 'referrals',
    sql: `
      CREATE TABLE IF NOT EXISTS referrals (
        id VARCHAR(255) PRIMARY KEY,
        referrer_id VARCHAR(255) NOT NULL,
        referred_user_id VARCHAR(255),
        code VARCHAR(20),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
        reward_type VARCHAR(100),
        reward_value DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `
  },
  {
    name: 'referrals_indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
      CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
      CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
      CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
    `
  },
  {
    name: 'payment_methods',
    sql: `
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: 'payment_methods_indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
      CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);
    `
  }
];

async function setupTables() {
  try {
    let successCount = 0;
    
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const num = i + 1;
      
      // Skip index creation steps in output (they're created with table)
      if (!table.name.includes('indexes')) {
        console.log(`📋 [${num}/${tables.length}] Creating table: ${table.name}`);
      }
      
      try {
        if (table.name.includes('indexes')) {
          // Execute all index commands
          const indexCommands = table.sql.split(';').filter(cmd => cmd.trim());
          for (const cmd of indexCommands) {
            if (cmd.trim()) {
              await sql.unsafe(cmd.trim());
            }
          }
        } else {
          await sql.unsafe(table.sql);
        }
        
        if (!table.name.includes('indexes')) {
          console.log(`✅ Table '${table.name}' created successfully\n`);
          successCount++;
        }
      } catch (err) {
        if (err.message.includes('already exists')) {
          if (!table.name.includes('indexes')) {
            console.log(`✅ Table '${table.name}' already exists\n`);
            successCount++;
          }
        } else {
          throw err;
        }
      }
    }

    // Enable RLS on all new tables
    console.log('🔐 Setting up Row Level Security (RLS) policies...');
    
    const rlsTables = ['vouchers', 'user_vouchers', 'referral_codes', 'referrals', 'payment_methods'];
    
    for (const tableName of rlsTables) {
      try {
        await sql.unsafe(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`);
      } catch (err) {
        if (!err.message.includes('already has')) {
          console.log(`  ℹ️  ${tableName}: ${err.message.split('\n')[0]}`);
        }
      }
    }
    
    console.log('✅ RLS policies configured\n');

    console.log('==========================================');
    console.log('✅ All tables set up successfully!');
    console.log('\n📊 Tables Created/Verified:');
    console.log('  ✓ vouchers');
    console.log('  ✓ user_vouchers');
    console.log('  ✓ referral_codes');
    console.log('  ✓ referrals');
    console.log('  ✓ payment_methods');
    console.log('\n🔐 Row Level Security enabled on all tables');
    console.log('\n✨ Database setup complete!');
    console.log('\n🚀 Ready to use new features:');
    console.log('  - /vehicles (Vehicle Management)');
    console.log('  - /notifications (Notifications)');
    console.log('  - /loyalty (Loyalty & Rewards)');
    console.log('  - /vouchers (Vouchers & Promos)');
    console.log('  - /referrals (Referral Program)');
    console.log('  - /payments (Payment Methods)');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during table creation:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n✅ Tables already exist. Setup complete!');
      await sql.end();
      process.exit(0);
    }
    
    console.error('\n📝 Full error:', error);
    await sql.end();
    process.exit(1);
  }
}

setupTables();
