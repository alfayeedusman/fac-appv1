import { getDatabase } from "./connection.js";
import * as schema from "./schema.js";
import bcrypt from "bcryptjs";

export async function seedUsers() {
  const db = getDatabase();
  if (!db) {
    console.error("❌ Database not connected");
    return;
  }

  try {
    console.log("👥 Seeding user data...");

    // Check if users already exist
    const existingUsers = await db.select().from(schema.users);

    if (existingUsers.length > 0) {
      console.log("✅ Users already exist:", existingUsers.length, "users found");
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

    console.log("✅ Sample users seeded successfully:", insertedUsers.length, "users created");
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
