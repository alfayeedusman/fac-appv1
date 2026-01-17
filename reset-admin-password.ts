import { sql } from './server/database/connection.ts';
import bcrypt from 'bcryptjs';

async function resetPassword() {
  try {
    console.log('🔐 Resetting Superadmin Password\n');

    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      UPDATE users 
      SET password = ${hashedPassword}
      WHERE role = 'superadmin';
    `;

    console.log('✅ Password reset successfully!\n');
    console.log('📋 New Credentials:');
    console.log(`   Email: superadmin@fayeedautocare.com`);
    console.log(`   Password: ${password}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
