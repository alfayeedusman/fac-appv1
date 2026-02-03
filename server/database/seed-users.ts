import { getDatabase } from "./connection";
import * as schema from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function seedUsers() {
  try {
    console.log("👥 Seeding user data...");

    // Wait for database to be ready
    let db = getDatabase();
    let retries = 0;
    while (!db && retries < 3) {
      console.log(
        "⏳ Waiting for database connection... (attempt",
        retries + 1,
        ")",
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      db = getDatabase();
      retries++;
    }

    if (!db) {
      console.error("❌ Database not connected after retries");
      return;
    }

    // Hash password helper with logging
    const hashPassword = async (password: string): Promise<string> => {
      try {
        const hashed = await bcrypt.hash(password, 10);
        console.log(
          "   ✓ Password hashed:",
          password.substring(0, 3) + "**** →",
          hashed.substring(0, 20) + "...",
        );
        return hashed;
      } catch (err) {
        console.error("   ✗ Error hashing password:", err);
        throw err;
      }
    };

    // Check if users already exist
    const existingUsers = await db.select().from(schema.users);

    if (existingUsers.length > 0) {
      console.log(
        "✅ Users already exist:",
        existingUsers.length,
        "users found",
      );

      // Update passwords for sample accounts if they exist
      console.log("🔄 Updating sample user passwords with new hashes...");

      const superadmin = existingUsers.find(
        (u) => u.email === "superadmin@fayeedautocare.com",
      );
      if (superadmin) {
        console.log("   → Updating superadmin@fayeedautocare.com");
        const hashedPassword = await hashPassword("SuperAdmin2024!");
        await db
          .update(schema.users)
          .set({ password: hashedPassword })
          .where(eq(schema.users.id, superadmin.id));
        console.log("   ✅ Updated superadmin password");
      }

      const adminFayeed = existingUsers.find(
        (u) => u.email === "admin.fayeed@gmail.com",
      );
      if (adminFayeed) {
        console.log("   → Updating admin.fayeed@gmail.com");
        const hashedPassword = await hashPassword("FayeedSuper123!");
        await db
          .update(schema.users)
          .set({ password: hashedPassword })
          .where(eq(schema.users.id, adminFayeed.id));
        console.log("   ✅ Updated admin.fayeed password");
      }

      // Update other sample user passwords
      const sampleEmails: Record<string, string> = {
        "manager.tumaga@fayeedautocare.com": "TumagaAdmin2024!",
        "manager.boalan@fayeedautocare.com": "BoalanAdmin2024!",
        "cashier.tumaga@fayeedautocare.com": "Cashier123!",
        "john.doe@gmail.com": "Customer123!",
        "maria.santos@gmail.com": "Maria2024!",
        "carlos.reyes@gmail.com": "Carlos123!",
        "anna.lopez@gmail.com": "Anna2024!",
      };

      for (const [email, password] of Object.entries(sampleEmails)) {
        const user = existingUsers.find((u) => u.email === email);
        if (user) {
          console.log(`   → Updating ${email}`);
          const hashedPassword = await hashPassword(password);
          await db
            .update(schema.users)
            .set({ password: hashedPassword })
            .where(eq(schema.users.id, user.id));
          console.log(`   ✅ Updated ${email} password`);
        }
      }

      console.log("✅ All user passwords updated successfully!");
      return;
    }

    // Hash passwords
    const hashPassword = async (password: string) =>
      await bcrypt.hash(password, 10);

    // Sample user data based on SAMPLE_LOGIN_CREDENTIALS.md
    const sampleUsers = [
      {
        email: "superadmin@fayeedautocare.com",
        fullName: "Super Admin",
        password: await hashPassword("SuperAdmin2024!"),
        role: "superadmin" as const,
        contactNumber: "+63 999 111 1111",
        address: "Head Office, Zamboanga City, Philippines",
        branchLocation: "Head Office",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 10000,
        subscriptionStatus: "premium" as const,
        canViewAllBranches: true,
      },
      {
        email: "admin.fayeed@gmail.com",
        fullName: "Admin Fayeed",
        password: await hashPassword("FayeedSuper123!"),
        role: "superadmin" as const,
        contactNumber: "+63 999 111 2222",
        address: "Head Office, Zamboanga City, Philippines",
        branchLocation: "Head Office",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 10000,
        subscriptionStatus: "premium" as const,
        canViewAllBranches: true,
      },
      {
        email: "manager.tumaga@fayeedautocare.com",
        fullName: "Manager Tumaga",
        password: await hashPassword("TumagaAdmin2024!"),
        role: "manager" as const,
        contactNumber: "+63 962 123 4567",
        address: "Tumaga Branch, Zamboanga City, Philippines",
        branchLocation: "Tumaga",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 5000,
        subscriptionStatus: "premium" as const,
        canViewAllBranches: false,
      },
      {
        email: "manager.boalan@fayeedautocare.com",
        fullName: "Manager Boalan",
        password: await hashPassword("BoalanAdmin2024!"),
        role: "manager" as const,
        contactNumber: "+63 962 234 5678",
        address: "Boalan Branch, Zamboanga City, Philippines",
        branchLocation: "Boalan",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 5000,
        subscriptionStatus: "premium" as const,
        canViewAllBranches: false,
      },
      {
        email: "cashier.tumaga@fayeedautocare.com",
        fullName: "Cashier Tumaga",
        password: await hashPassword("Cashier123!"),
        role: "cashier" as const,
        contactNumber: "+63 962 345 6789",
        address: "Tumaga Branch, Zamboanga City, Philippines",
        branchLocation: "Tumaga",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 2000,
        subscriptionStatus: "basic" as const,
        canViewAllBranches: false,
      },
      {
        email: "john.doe@gmail.com",
        fullName: "John Doe",
        password: await hashPassword("Customer123!"),
        role: "user" as const,
        contactNumber: "+63 998 123 4567",
        address: "Zamboanga City, Philippines",
        branchLocation: "Tumaga",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 3000,
        subscriptionStatus: "premium" as const,
        canViewAllBranches: false,
      },
      {
        email: "maria.santos@gmail.com",
        fullName: "Maria Santos",
        password: await hashPassword("Maria2024!"),
        role: "user" as const,
        contactNumber: "+63 998 234 5678",
        address: "Zamboanga City, Philippines",
        branchLocation: "Tumaga",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 1500,
        subscriptionStatus: "premium" as const,
        canViewAllBranches: false,
      },
      {
        email: "carlos.reyes@gmail.com",
        fullName: "Carlos Reyes",
        password: await hashPassword("Carlos123!"),
        role: "user" as const,
        contactNumber: "+63 998 345 6789",
        address: "Zamboanga City, Philippines",
        branchLocation: "Boalan",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 500,
        subscriptionStatus: "basic" as const,
        canViewAllBranches: false,
      },
      {
        email: "anna.lopez@gmail.com",
        fullName: "Anna Lopez",
        password: await hashPassword("Anna2024!"),
        role: "user" as const,
        contactNumber: "+63 998 456 7890",
        address: "Zamboanga City, Philippines",
        branchLocation: "Tumaga",
        isActive: true,
        emailVerified: false,
        loyaltyPoints: 0,
        subscriptionStatus: "free" as const,
        canViewAllBranches: false,
      },
    ];

    // Insert users
    const insertedUsers = await db
      .insert(schema.users)
      .values(sampleUsers)
      .returning();

    console.log(
      "✅ Sample users seeded successfully:",
      insertedUsers.length,
      "users created",
    );
    console.log(
      "📧 Sample accounts created:",
      insertedUsers.map((u: any) => u.email).join(", "),
    );

    return insertedUsers;
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
}
