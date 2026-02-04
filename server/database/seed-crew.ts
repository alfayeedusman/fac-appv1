import { createId } from "@paralleldrive/cuid2";
import * as schema from "./schema";
import { initializeDatabase } from "./connection";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";

export async function seedCrewData() {
  const db = initializeDatabase();
  if (!db) {
    throw new Error("Database connection failed");
  }

  console.log("🌱 Seeding crew data...");

  try {
    // Create sample crew users
    const crewUsers = [
      {
        id: createId(),
        email: "john.santos@fac.com",
        fullName: "John Santos",
        password: await bcrypt.hash("password123", 10),
        role: "crew",
        contactNumber: "+639123456789",
        branchLocation: "Makati Branch",
        isActive: true,
        emailVerified: true,
        crewRating: 4.5,
        crewExperience: 3,
        crewSkills: ["exterior_wash", "interior_detailing", "engine_cleaning"],
      },
      {
        id: createId(),
        email: "maria.garcia@fac.com",
        fullName: "Maria Garcia",
        password: await bcrypt.hash("password123", 10),
        role: "crew",
        contactNumber: "+639123456790",
        branchLocation: "BGC Branch",
        isActive: true,
        emailVerified: true,
        crewRating: 4.7,
        crewExperience: 5,
        crewSkills: ["premium_wash", "paint_protection", "ceramic_coating"],
      },
      {
        id: createId(),
        email: "carlos.reyes@fac.com",
        fullName: "Carlos Reyes",
        password: await bcrypt.hash("password123", 10),
        role: "crew",
        contactNumber: "+639123456791",
        branchLocation: "Makati Branch",
        isActive: true,
        emailVerified: true,
        crewRating: 4.2,
        crewExperience: 2,
        crewSkills: ["basic_wash", "tire_service", "window_cleaning"],
      },
      {
        id: createId(),
        email: "ana.lopez@fac.com",
        fullName: "Ana Lopez",
        password: await bcrypt.hash("password123", 10),
        role: "crew",
        contactNumber: "+639123456792",
        branchLocation: "BGC Branch",
        isActive: true,
        emailVerified: true,
        crewRating: 4.6,
        crewExperience: 4,
        crewSkills: ["detailing", "upholstery_cleaning", "leather_care"],
      },
      {
        id: createId(),
        email: "david.tan@fac.com",
        fullName: "David Tan",
        password: await bcrypt.hash("password123", 10),
        role: "crew",
        contactNumber: "+639123456793",
        branchLocation: "Makati Branch",
        isActive: true,
        emailVerified: true,
        crewRating: 4.1,
        crewExperience: 1,
        crewSkills: ["basic_wash", "vacuum_service"],
      },
    ];

    // Insert crew users
    for (const user of crewUsers) {
      await db.insert(schema.users).values(user).onConflictDoNothing();
    }
    console.log("✅ Crew users created");

    // Create crew groups
    const groups = [
      {
        id: createId(),
        name: "Alpha Team",
        description: "Premium service specialists",
        leaderId: crewUsers[1].id,
        colorCode: "#3B82F6",
        status: "active",
      },
      {
        id: createId(),
        name: "Beta Squad",
        description: "Quick service team",
        leaderId: crewUsers[0].id,
        colorCode: "#22C55E",
        status: "active",
      },
      {
        id: createId(),
        name: "Gamma Unit",
        description: "Detailing experts",
        leaderId: crewUsers[3].id,
        colorCode: "#A855F7",
        status: "active",
      },
    ];

    // Insert crew groups
    for (const group of groups) {
      await db.insert(schema.crewGroups).values(group).onConflictDoNothing();
    }
    console.log("✅ Crew groups created");

    // Create crew members (linking users to groups)
    const crewMembers = [
      {
        id: createId(),
        userId: crewUsers[0].id,
        crewGroupId: groups[1].id,
        employeeId: "EMP001",
        name: crewUsers[0].fullName,
        phone: crewUsers[0].contactNumber,
        email: crewUsers[0].email,
        hireDate: new Date("2021-03-15"),
        status: "active",
        skillLevel: "senior",
      },
      {
        id: createId(),
        userId: crewUsers[1].id,
        crewGroupId: groups[0].id,
        employeeId: "EMP002",
        name: crewUsers[1].fullName,
        phone: crewUsers[1].contactNumber,
        email: crewUsers[1].email,
        hireDate: new Date("2020-01-10"),
        status: "active",
        skillLevel: "expert",
      },
      {
        id: createId(),
        userId: crewUsers[2].id,
        crewGroupId: groups[1].id,
        employeeId: "EMP003",
        name: crewUsers[2].fullName,
        phone: crewUsers[2].contactNumber,
        email: crewUsers[2].email,
        hireDate: new Date("2022-06-20"),
        status: "active",
        skillLevel: "junior",
      },
      {
        id: createId(),
        userId: crewUsers[3].id,
        crewGroupId: groups[2].id,
        employeeId: "EMP004",
        name: crewUsers[3].fullName,
        phone: crewUsers[3].contactNumber,
        email: crewUsers[3].email,
        hireDate: new Date("2021-08-12"),
        status: "active",
        skillLevel: "senior",
      },
      {
        id: createId(),
        userId: crewUsers[4].id,
        crewGroupId: groups[1].id,
        employeeId: "EMP005",
        name: crewUsers[4].fullName,
        phone: crewUsers[4].contactNumber,
        email: crewUsers[4].email,
        hireDate: new Date("2023-02-01"),
        status: "active",
        skillLevel: "trainee",
      },
    ];

    // Insert crew members
    for (const member of crewMembers) {
      await db.insert(schema.crewMembers).values(member).onConflictDoNothing();
    }
    console.log("✅ Crew members created");

    // Create crew status records (current status for each crew member)
    const currentTime = new Date();
    const crewStatuses = [
      {
        id: createId(),
        crewId: crewMembers[0].id,
        status: "online",
        autoGenerated: true,
        startedAt: new Date(currentTime.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        id: createId(),
        crewId: crewMembers[1].id,
        status: "busy",
        autoGenerated: true,
        startedAt: new Date(currentTime.getTime() - 1 * 60 * 60 * 1000),
      },
      {
        id: createId(),
        crewId: crewMembers[2].id,
        status: "online",
        autoGenerated: true,
        startedAt: new Date(currentTime.getTime() - 30 * 60 * 1000),
      },
      {
        id: createId(),
        crewId: crewMembers[3].id,
        status: "busy",
        autoGenerated: true,
        startedAt: new Date(currentTime.getTime() - 45 * 60 * 1000),
      },
      {
        id: createId(),
        crewId: crewMembers[4].id,
        status: "available",
        autoGenerated: true,
        startedAt: new Date(currentTime.getTime() - 15 * 60 * 1000),
      },
    ];

    // Insert crew statuses
    for (const status of crewStatuses) {
      await db.insert(schema.crewStatus).values(status).onConflictDoNothing();
    }
    console.log("✅ Crew statuses created");

    console.log("🎉 Crew data seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding crew data:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCrewData()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
