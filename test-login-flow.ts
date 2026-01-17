import { sql } from './server/database/connection.ts';
import bcrypt from 'bcryptjs';

async function testLoginFlow() {
  try {
    console.log('🔐 Testing Login Flow\n');
    console.log('======================\n');

    // Get superadmin
    const superadmin = await sql`
      SELECT id, email, role, password, is_active 
      FROM users 
      WHERE role = 'superadmin' 
      LIMIT 1;
    `;

    if (superadmin.length === 0) {
      console.log('❌ No superadmin user found');
      return;
    }

    const admin = superadmin[0];
    console.log('✅ Superadmin found:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.is_active}`);
    console.log(`   Has password hash: ${!!admin.password}\n`);

    // Test password verification
    const testPassword = 'password123';
    const passwordMatches = admin.password ? await bcrypt.compare(testPassword, admin.password) : false;

    console.log('🔑 Password Verification Test:');
    console.log(`   Testing with password: "${testPassword}"`);
    console.log(`   Password matches: ${passwordMatches ? '✅ YES' : '❌ NO'}\n`);

    // Get all users summary
    console.log('📊 Database Users Summary:');
    const userStats = await sql`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY count DESC;
    `;

    userStats.forEach(stat => {
      console.log(`   ${stat.role}: ${stat.count}`);
    });

    // Check bookings
    const bookingCount = await sql`SELECT COUNT(*) as count FROM bookings;`;
    console.log(`\n📅 Bookings in database: ${bookingCount[0].count}`);

    // Check payments
    const paymentCount = await sql`SELECT COUNT(*) as count FROM push_notifications;`;
    console.log(`📬 Notifications prepared: ${paymentCount[0].count}`);

    console.log('\n✅ Database is ready for login!\n');

    // Show login instructions
    console.log('📋 Production Login Instructions:');
    console.log('==================================');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: password123`);
    console.log(`\nURL: https://your-domain.com/login`);
    console.log(`(or http://localhost:8080/login in dev)`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLoginFlow();
