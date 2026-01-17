import { sql } from './server/database/connection.ts';
import bcrypt from 'bcryptjs';

async function createSuperadmin() {
  try {
    console.log('🔐 Creating Superadmin User for Production\n');

    // Check if superadmin already exists
    const existing = await sql`SELECT * FROM users WHERE role = 'superadmin';`;
    
    if (existing.length > 0) {
      console.log('⚠️ Superadmin user already exists:');
      console.log(`   Email: ${existing[0].email}`);
      console.log('No changes made.');
      return;
    }

    // Create superadmin with bcrypted password
    const email = 'fffayeed@gmail.com';
    const password = 'password123'; // Default password - user should change after first login
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (
        id, 
        email, 
        full_name, 
        password, 
        role, 
        branch_location, 
        is_active, 
        email_verified, 
        loyalty_points, 
        subscription_status,
        can_view_all_branches,
        created_at, 
        updated_at
      ) VALUES (
        ${crypto.randomUUID()},
        ${email},
        'Superadmin User',
        ${hashedPassword},
        'superadmin',
        'main',
        true,
        true,
        0,
        'free',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
    `;

    console.log('✅ Superadmin user created successfully!\n');
    console.log('📋 Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️ Important: Change this password after first login!\n');

  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
    process.exit(1);
  }
}

createSuperadmin();
