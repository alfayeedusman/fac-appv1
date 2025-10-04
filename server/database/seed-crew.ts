import { createId } from "@paralleldrive/cuid2";
import * as schema from "./schema";
import { initializeDatabase } from "./connection";
import bcrypt from "bcryptjs";

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
        crewSkills: ["exterior_wash", "interior_detailing", "engine_cleaning"]
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
        crewSkills: ["premium_wash", "paint_protection", "ceramic_coating"]
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
        crewSkills: ["basic_wash", "tire_service", "window_cleaning"]
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
        crewSkills: ["detailing", "upholstery_cleaning", "leather_care"]
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
        crewSkills: ["basic_wash", "vacuum_service"]
      }
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
        leaderId: crewUsers[1].id, // Maria Garcia
        color: "blue",
        status: "active"
      },
      {
        id: createId(),
        name: "Beta Squad",
        description: "Quick service team",
        leaderId: crewUsers[0].id, // John Santos
        color: "green", 
        status: "active"
      },
      {
        id: createId(),
        name: "Gamma Unit",
        description: "Detailing experts",
        leaderId: crewUsers[3].id, // Ana Lopez
        color: "purple",
        status: "active"
      }
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
        crewGroupId: groups[1].id, // Beta Squad
        employeeId: "EMP001",
        position: "Senior Technician",
        hireDate: new Date("2021-03-15"),
        isActive: true
      },
      {
        id: createId(),
        userId: crewUsers[1].id,
        crewGroupId: groups[0].id, // Alpha Team
        employeeId: "EMP002", 
        position: "Team Lead",
        hireDate: new Date("2020-01-10"),
        isActive: true
      },
      {
        id: createId(),
        userId: crewUsers[2].id,
        crewGroupId: groups[1].id, // Beta Squad
        employeeId: "EMP003",
        position: "Technician",
        hireDate: new Date("2022-06-20"),
        isActive: true
      },
      {
        id: createId(),
        userId: crewUsers[3].id,
        crewGroupId: groups[2].id, // Gamma Unit
        employeeId: "EMP004",
        position: "Detailing Specialist", 
        hireDate: new Date("2021-08-12"),
        isActive: true
      },
      {
        id: createId(),
        userId: crewUsers[4].id,
        crewGroupId: groups[1].id, // Beta Squad
        employeeId: "EMP005",
        position: "Junior Technician",
        hireDate: new Date("2023-02-01"),
        isActive: true
      }
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
        startedAt: new Date(currentTime.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        location: "Makati Branch"
      },
      {
        id: createId(),
        crewId: crewMembers[1].id,
        status: "busy", 
        startedAt: new Date(currentTime.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        location: "BGC Branch",
        assignmentId: "ASSIGNMENT001"
      },
      {
        id: createId(),
        crewId: crewMembers[2].id,
        status: "online",
        startedAt: new Date(currentTime.getTime() - 30 * 60 * 1000), // 30 minutes ago
        location: "Makati Branch"
      },
      {
        id: createId(),
        crewId: crewMembers[3].id,
        status: "busy",
        startedAt: new Date(currentTime.getTime() - 45 * 60 * 1000), // 45 minutes ago
        location: "BGC Branch", 
        assignmentId: "ASSIGNMENT002"
      },
      {
        id: createId(),
        crewId: crewMembers[4].id,
        status: "available",
        startedAt: new Date(currentTime.getTime() - 15 * 60 * 1000), // 15 minutes ago
        location: "Makati Branch"
      }
    ];

    // Insert crew statuses
    for (const status of crewStatuses) {
      await db.insert(schema.crewStatus).values(status).onConflictDoNothing();
    }
    console.log("✅ Crew statuses created");

    // Create some sample bookings to show today's jobs
    const todayBookings = [
      {
        id: createId(),
        userId: null, // Guest booking
        guestInfo: { name: "Customer 1", email: "customer1@example.com", phone: "+639111111111" },
        serviceType: "Premium Wash",
        vehicleType: "Sedan",
        plateNumber: "ABC123",
        totalPrice: 1500,
        status: "completed",
        assignedCrew: [crewUsers[0].id, crewUsers[2].id],
        completedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: createId(),
        userId: null,
        guestInfo: { name: "Customer 2", email: "customer2@example.com", phone: "+639222222222" },
        serviceType: "Basic Wash", 
        vehicleType: "SUV",
        plateNumber: "XYZ789",
        totalPrice: 2000,
        status: "completed",
        assignedCrew: [crewUsers[1].id],
        completedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: createId(),
        userId: null,
        guestInfo: { name: "Customer 3", email: "customer3@example.com", phone: "+639333333333" },
        serviceType: "Detailing Service",
        vehicleType: "Motorcycle", 
        plateNumber: "MOT001",
        totalPrice: 800,
        status: "completed",
        assignedCrew: [crewUsers[3].id],
        completedAt: new Date(),
        createdAt: new Date()
      }
    ];

    // Insert sample bookings
    for (const booking of todayBookings) {
      await db.insert(schema.bookings).values(booking).onConflictDoNothing();
    }
    console.log("✅ Sample bookings created");

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
