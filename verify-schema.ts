import { sql } from './server/database/connection.ts';

async function verifySchema() {
  try {
    console.log('📊 Database Schema Verification');
    console.log('===============================\n');

    // Get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log(`✅ Total Tables: ${tables.length}\n`);
    console.log('Tables created:');
    tables.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.table_name}`);
    });

    // Verify key tables exist
    const keyTables = [
      'users',
      'bookings',
      'payments',
      'notifications',
      'crew_members',
      'crew_groups',
      'admin_settings',
      'system_notifications',
      'branches',
      'service_packages'
    ];

    console.log('\n🔍 Key Tables Verification:');
    console.log('============================');
    
    for (const tableName of keyTables) {
      const exists = tables.some(t => t.table_name === tableName);
      console.log(`${exists ? '✅' : '❌'} ${tableName}`);
    }

    // Get users table structure
    console.log('\n📋 Users Table Structure:');
    console.log('=========================');
    const usersColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;

    usersColumns.forEach((col, i) => {
      console.log(`  ${i + 1}. ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}`);
    });

    // Test login capability
    console.log('\n🔐 Testing Login Infrastructure:');
    console.log('=================================');
    
    const superadmin = await sql`SELECT id, email, role FROM users WHERE email = 'fffayeed@gmail.com' LIMIT 1;`;
    if (superadmin.length > 0) {
      console.log('✅ Superadmin user exists');
      console.log(`   Email: ${superadmin[0].email}`);
      console.log(`   Role: ${superadmin[0].role}`);
    } else {
      console.log('❌ Superadmin user not found');
    }

    const userCount = await sql`SELECT COUNT(*) as count FROM users;`;
    console.log(`✅ Total users in database: ${userCount[0].count}`);

    console.log('\n✅ Schema Verification Complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifySchema();
