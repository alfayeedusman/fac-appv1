import { getDatabase } from "./connection.js";
import * as schema from "./schema.js";

export async function seedBranches() {
  const db = getDatabase();
  if (!db) {
    console.error("❌ Database not connected");
    return;
  }

  try {
    console.log("🏪 Seeding branch data...");

    // Check if branches already exist
    const existingBranches = await db.select().from(schema.branches);
    
    if (existingBranches.length > 0) {
      console.log("✅ Branches already exist:", existingBranches.length, "branches found");
      return;
    }

    // Sample branch data
    const sampleBranches = [
      {
        name: "Tumaga Branch",
        code: "TMA01",
        type: "full_service",
        address: "Tumaga Road, Zamboanga City, Philippines",
        city: "Zamboanga City",
        state: "Zamboanga del Sur",
        postalCode: "7000",
        country: "Philippines",
        phone: "+63 962 123 4567",
        email: "tumaga@facautocare.com",
        latitude: "6.9214",
        longitude: "122.079",
        timezone: "Asia/Manila",
        managerName: "Juan Dela Cruz",
        managerPhone: "+63 962 123 4567",
        capacity: 15,
        services: ["Classic Wash", "VIP Silver", "VIP Gold", "Premium Detail", "Graphene Coating"],
        specializations: ["Auto Detailing", "Paint Protection", "Interior Cleaning"],
        operatingHours: {
          monday: { open: "07:00", close: "19:00" },
          tuesday: { open: "07:00", close: "19:00" },
          wednesday: { open: "07:00", close: "19:00" },
          thursday: { open: "07:00", close: "19:00" },
          friday: { open: "07:00", close: "19:00" },
          saturday: { open: "07:00", close: "19:00" },
          sunday: { open: "08:00", close: "18:00" }
        },
        isActive: true,
        isMainBranch: true,
        hasWifi: true,
        hasParking: true,
        hasWaitingArea: true,
        has24HourService: false,
        images: [],
      },
      {
        name: "Boalan Branch",
        code: "BOA01", 
        type: "full_service",
        address: "Boalan Road, Zamboanga City, Philippines",
        city: "Zamboanga City",
        state: "Zamboanga del Sur",
        postalCode: "7000",
        country: "Philippines",
        phone: "+63 962 987 6543",
        email: "boalan@facautocare.com",
        latitude: "6.9094",
        longitude: "122.0736",
        timezone: "Asia/Manila",
        managerName: "Maria Santos",
        managerPhone: "+63 962 987 6543",
        capacity: 12,
        services: ["Classic Wash", "VIP Silver", "VIP Gold", "Premium Detail"],
        specializations: ["Car Wash", "Auto Detailing"],
        operatingHours: {
          monday: { open: "08:00", close: "18:00" },
          tuesday: { open: "08:00", close: "18:00" },
          wednesday: { open: "08:00", close: "18:00" },
          thursday: { open: "08:00", close: "18:00" },
          friday: { open: "08:00", close: "18:00" },
          saturday: { open: "08:00", close: "18:00" },
          sunday: { open: "09:00", close: "17:00" }
        },
        isActive: true,
        isMainBranch: false,
        hasWifi: true,
        hasParking: true,
        hasWaitingArea: true,
        has24HourService: false,
        images: [],
      }
    ];

    // Insert branches
    const insertedBranches = await db
      .insert(schema.branches)
      .values(sampleBranches)
      .returning();

    console.log("✅ Successfully seeded", insertedBranches.length, "branches");

    // Now seed some users for these branches
    await seedBranchUsers(db, insertedBranches);

  } catch (error) {
    console.error("❌ Error seeding branches:", error);
    throw error;
  }
}

async function seedBranchUsers(db: any, branches: any[]) {
  try {
    console.log("👥 Seeding users for branches...");

    // Check if users already exist
    const existingUsers = await db.select().from(schema.users);
    
    if (existingUsers.length > 10) {
      console.log("✅ Users already exist, skipping user seeding");
      return;
    }

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const sampleUsers = [
      // Tumaga Branch Users
      {
        email: "customer1@tumaga.com",
        fullName: "Maria Santos",
        password: hashedPassword,
        role: "user",
        contactNumber: "+63 918 765 4321",
        address: "Tumaga, Zamboanga City",
        carUnit: "Honda Civic 2019",
        carPlateNumber: "XYZ 5678",
        branchLocation: "Tumaga Branch",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 150,
        subscriptionStatus: "basic",
      },
      {
        email: "customer2@tumaga.com", 
        fullName: "John Dela Cruz",
        password: hashedPassword,
        role: "user",
        contactNumber: "+63 912 345 6789",
        address: "Tumaga, Zamboanga City",
        carUnit: "Toyota Vios 2020",
        carPlateNumber: "ABC 1234",
        branchLocation: "Tumaga Branch",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 300,
        subscriptionStatus: "premium",
      },
      {
        email: "manager@tumaga.com",
        fullName: "Juan Dela Cruz",
        password: hashedPassword,
        role: "manager",
        contactNumber: "+63 962 123 4567",
        branchLocation: "Tumaga Branch",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 0,
        subscriptionStatus: "free",
      },
      {
        email: "staff1@tumaga.com",
        fullName: "Carlo Reyes",
        password: hashedPassword,
        role: "crew",
        contactNumber: "+63 918 111 2222",
        branchLocation: "Tumaga Branch",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 0,
        subscriptionStatus: "free",
        crewSkills: ["washing", "detailing"],
        crewStatus: "available",
      },
      {
        email: "staff2@tumaga.com",
        fullName: "Anna Garcia",
        password: hashedPassword,
        role: "crew",
        contactNumber: "+63 918 333 4444",
        branchLocation: "Tumaga Branch",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 0,
        subscriptionStatus: "free",
        crewSkills: ["washing", "coating"],
        crewStatus: "available",
      },

      // Boalan Branch Users  
      {
        email: "customer1@boalan.com",
        fullName: "Ana Rodriguez",
        password: hashedPassword,
        role: "user",
        contactNumber: "+63 920 123 4567",
        address: "Boalan, Zamboanga City",
        carUnit: "Ford EcoSport 2021",
        carPlateNumber: "GHI 3456",
        branchLocation: "Boalan Branch",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 75,
        subscriptionStatus: "basic",
      },
      {
        email: "customer2@boalan.com",
        fullName: "Pedro Martinez",
        password: hashedPassword,
        role: "user",
        contactNumber: "+63 920 987 6543",
        address: "Boalan, Zamboanga City",
        carUnit: "Mitsubishi Montero 2021",
        carPlateNumber: "DEF 9012",
        branchLocation: "Boalan Branch",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 250,
        subscriptionStatus: "premium",
      },
      {
        email: "manager@boalan.com",
        fullName: "Maria Santos",
        password: hashedPassword,
        role: "manager",
        contactNumber: "+63 962 987 6543",
        branchLocation: "Boalan Branch",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 0,
        subscriptionStatus: "free",
      },
      {
        email: "staff1@boalan.com",
        fullName: "Luis Santos",
        password: hashedPassword,
        role: "crew",
        contactNumber: "+63 918 555 6666",
        branchLocation: "Boalan Branch",
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 0,
        subscriptionStatus: "free",
        crewSkills: ["washing", "detailing"],
        crewStatus: "available",
      },
    ];

    const insertedUsers = await db
      .insert(schema.users)
      .values(sampleUsers)
      .returning();

    console.log("✅ Successfully seeded", insertedUsers.length, "users for branches");

  } catch (error) {
    console.error("❌ Error seeding branch users:", error);
    // Don't throw - users are optional
  }
}

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBranches()
    .then(() => {
      console.log("🎉 Branch seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Branch seeding failed:", error);
      process.exit(1);
    });
}
