import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { getSqlClient } from "./connection";

export async function seedPremiumUsers() {
  console.log("🌱 Seeding premium users and test accounts...");

  const sql = await getSqlClient();
  if (!sql) {
    console.error("❌ SUPABASE_DATABASE_URL not configured");
    return;
  }

  try {
    // Hash passwords
    const hashPassword = async (password: string) =>
      await bcrypt.hash(password, 10);

    // Premium Customer Accounts
    const premiumUsers = [
      {
        id: `user_premium_1_${Date.now()}`,
        email: "premium.customer1@example.com",
        fullName: "Premium Customer 1",
        password: await hashPassword("password123"),
        role: "user",
        contactNumber: "+63 998 111 2222",
        branchLocation: "Tumaga",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 5000,
        subscriptionStatus: "premium",
      },
      {
        id: `user_premium_2_${Date.now()}`,
        email: "premium.customer2@example.com",
        fullName: "Premium Customer 2",
        password: await hashPassword("password123"),
        role: "user",
        contactNumber: "+63 998 333 4444",
        branchLocation: "Boalan",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 3500,
        subscriptionStatus: "premium",
      },
      {
        id: `user_vip_${Date.now()}`,
        email: "vip.customer@example.com",
        fullName: "VIP Customer",
        password: await hashPassword("password123"),
        role: "user",
        contactNumber: "+63 998 555 6666",
        branchLocation: "Tumaga",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 10000,
        subscriptionStatus: "vip",
      },
      {
        id: `user_basic_${Date.now()}`,
        email: "basic.customer@example.com",
        fullName: "Basic Customer",
        password: await hashPassword("password123"),
        role: "user",
        contactNumber: "+63 998 777 8888",
        branchLocation: "Boalan",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 1000,
        subscriptionStatus: "basic",
      },
      {
        id: `user_free_${Date.now()}`,
        email: "free.customer@example.com",
        fullName: "Free Customer",
        password: await hashPassword("password123"),
        role: "user",
        contactNumber: "+63 998 999 9999",
        branchLocation: "Tumaga",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 0,
        subscriptionStatus: "free",
      },
    ];

    // Admin Test Accounts
    const adminUsers = [
      {
        id: `admin_test_${Date.now()}`,
        email: "test.admin@example.com",
        fullName: "Test Admin",
        password: await hashPassword("password123"),
        role: "admin",
        contactNumber: "+63 999 111 1111",
        branchLocation: "Head Office",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 0,
        subscriptionStatus: "premium",
        canViewAllBranches: true,
      },
      {
        id: `manager_test_${Date.now()}`,
        email: "test.manager@example.com",
        fullName: "Test Manager",
        password: await hashPassword("password123"),
        role: "manager",
        contactNumber: "+63 999 222 2222",
        branchLocation: "Tumaga",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 0,
        subscriptionStatus: "premium",
        canViewAllBranches: false,
      },
      {
        id: `cashier_test_${Date.now()}`,
        email: "test.cashier@example.com",
        fullName: "Test Cashier",
        password: await hashPassword("password123"),
        role: "cashier",
        contactNumber: "+63 999 333 3333",
        branchLocation: "Tumaga",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 0,
        subscriptionStatus: "basic",
        canViewAllBranches: false,
      },
    ];

    // Combine all users
    const allUsers = [...premiumUsers, ...adminUsers];

    // Insert users
    for (const user of allUsers) {
      try {
        await sql`
          INSERT INTO users (
            id, email, full_name, password, role, contact_number, branch_location,
            is_active, email_verified, loyalty_points, subscription_status, 
            can_view_all_branches, created_at, updated_at
          ) VALUES (
            ${user.id},
            ${user.email},
            ${user.fullName},
            ${user.password},
            ${user.role},
            ${user.contactNumber},
            ${user.branchLocation},
            ${user.isActive},
            ${user.emailVerified},
            ${user.loyaltyPoints},
            ${user.subscriptionStatus},
            ${(user as any).canViewAllBranches || false},
            NOW(),
            NOW()
          )
          ON CONFLICT (email) DO UPDATE SET
            password = EXCLUDED.password,
            subscription_status = EXCLUDED.subscription_status,
            loyalty_points = EXCLUDED.loyalty_points,
            is_active = true,
            email_verified = true,
            updated_at = NOW()
        `;
        console.log(`✅ Seeded user: ${user.email} (${user.role})`);
      } catch (err) {
        console.warn(`⚠️ Could not seed ${user.email}:`, (err as any).message);
      }
    }

    // Verify seeded users
    console.log("\n📋 Verifying seeded users:");
    const results = await sql`
      SELECT email, role, subscription_status, is_active, email_verified
      FROM users
      WHERE email IN (
        'premium.customer1@example.com',
        'premium.customer2@example.com',
        'vip.customer@example.com',
        'basic.customer@example.com',
        'free.customer@example.com',
        'test.admin@example.com',
        'test.manager@example.com',
        'test.cashier@example.com'
      )
      ORDER BY email
    `;

    console.log("✅ Premium users seeded successfully:");
    (results as any).forEach((user: any) => {
      console.log(
        `  • ${user.email} - ${user.role} (${user.subscription_status})`,
      );
    });

    return results;
  } catch (error) {
    console.error("❌ Error seeding premium users:", error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPremiumUsers()
    .then(() => {
      console.log("🎉 Premium users seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Premium users seeding failed:", error);
      process.exit(1);
    });
}
