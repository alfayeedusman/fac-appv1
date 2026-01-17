import { sql } from './server/database/connection.ts';

async function checkUsers() {
  try {
    console.log('👥 Checking Users in Database\n');

    const users = await sql`
      SELECT id, email, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 10;
    `;

    console.log(`Found ${users.length} users:\n`);
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active}`);
      console.log('');
    });

    // Check for specific test users
    const testEmails = [
      'fffayeed@gmail.com',
      'superadmin@fayeed.com',
      'admin@fayeed.com',
      'test@fayeed.com'
    ];

    console.log('\n🔍 Looking for specific test users:\n');
    for (const email of testEmails) {
      const user = await sql`SELECT email, role FROM users WHERE email = ${email};`;
      if (user.length > 0) {
        console.log(`✅ Found: ${email} (${user[0].role})`);
      } else {
        console.log(`❌ Not found: ${email}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
