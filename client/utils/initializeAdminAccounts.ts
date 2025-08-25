import type { User } from "./databaseSchema";

// Crew skills available in the system
export const CREW_SKILLS = [
  'exterior_wash',
  'interior_detail', 
  'tire_cleaning',
  'premium_detailing',
  'coating_application',
  'quality_inspection',
  'motorcycle_wash',
  'engine_cleaning'
] as const;

export type CrewSkill = typeof CREW_SKILLS[number];

// Initialize admin accounts on app startup
export function initializeAdminAccounts() {
  const existingUsers = JSON.parse(
    localStorage.getItem("registeredUsers") || "[]",
  );

  // Check if custom superadmin already exists
  const customSuperAdminExists = existingUsers.some(
    (user: any) => user.email === "fffayeed@gmail.com",
  );

  // Check if default superadmin already exists
  const superAdminExists = existingUsers.some(
    (user: any) => user.email === "superyeed@fayeedautocare.com",
  );

  // Check if admin already exists
  const adminExists = existingUsers.some(
    (user: any) => user.email === "adminyeed@fayeedautocare.com",
  );

  // Check if manager already exists
  const managerExists = existingUsers.some(
    (user: any) => user.email === "manager@fayeedautocare.com",
  );
  
  // Check if crew accounts exist
  const crewExists = existingUsers.some(
    (user: any) => user.role === "crew"
  );

  const newUsers = [];

  // Create custom superadmin account if it doesn't exist
  if (!customSuperAdminExists) {
    const customSuperAdminUser = {
      id: `superadmin_fayeed_${Date.now()}`,
      fullName: "Al-Fayeed Usman",
      address: "Fayeed Auto Care Owner, Zamboanga City",
      email: "fffayeed@gmail.com",
      password: "Fayeed22beats",
      contactNumber: "+63 917 123 4567",
      carUnit: "Toyota Land Cruiser",
      carPlateNumber: "FAC-BOSS",
      carType: "SUV",
      selectedPackage: "vip-gold",
      role: "superadmin",
      branchLocation: "Main Office",
      profileImage: "",
      isActive: true,
      emailVerified: true,
      loyaltyPoints: 0,
      subscriptionStatus: "vip" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newUsers.push(customSuperAdminUser);
    console.log("✅ Custom Superadmin account created: fffayeed@gmail.com");
  }

  // Create default superadmin account if it doesn't exist
  if (!superAdminExists) {
    const superAdminUser = {
      id: `superadmin_${Date.now()}`,
      fullName: "Super Yeed",
      address: "Fayeed Auto Care HQ, Zamboanga City",
      email: "superyeed@fayeedautocare.com",
      password: "123456789",
      contactNumber: "+63 999 888 7777",
      carUnit: "Toyota Fortuner",
      carPlateNumber: "FAC-001",
      carType: "SUV",
      selectedPackage: "vip-gold",
      role: "superadmin",
      branchLocation: "Main Office",
      profileImage: "",
      isActive: true,
      emailVerified: true,
      loyaltyPoints: 0,
      subscriptionStatus: "vip" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newUsers.push(superAdminUser);
    console.log("✅ Default Superadmin account created: superyeed@fayeedautocare.com");
  }

  // Create admin account if it doesn't exist
  if (!adminExists) {
    const adminUser = {
      id: `admin_${Date.now()}`,
      fullName: "Admin Yeed",
      address: "Fayeed Auto Care Branch, Zamboanga City",
      email: "adminyeed@fayeedautocare.com",
      password: "123456789",
      contactNumber: "+63 999 777 6666",
      carUnit: "Honda City",
      carPlateNumber: "FAC-002",
      carType: "Sedan",
      selectedPackage: "vip-silver",
      role: "admin",
      branchLocation: "Main Branch",
      profileImage: "",
      isActive: true,
      emailVerified: true,
      loyaltyPoints: 0,
      subscriptionStatus: "premium" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newUsers.push(adminUser);
    console.log("✅ Admin account created: adminyeed@fayeedautocare.com");
  }

  // Create manager account if it doesn't exist
  if (!managerExists) {
    const managerUser = {
      id: `manager_${Date.now()}`,
      fullName: "Booking Manager",
      address: "Fayeed Auto Care Operations, Zamboanga City",
      email: "manager@fayeedautocare.com",
      password: "manager123",
      contactNumber: "+63 999 555 4444",
      carUnit: "Toyota Vios",
      carPlateNumber: "FAC-MGR",
      carType: "Sedan",
      selectedPackage: "vip-silver",
      role: "manager",
      branchLocation: "Operations Center",
      profileImage: "",
      isActive: true,
      emailVerified: true,
      loyaltyPoints: 0,
      subscriptionStatus: "premium" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newUsers.push(managerUser);
    console.log("✅ Manager account created: manager@fayeedautocare.com");
  }
  
  // Create sample crew accounts if they don't exist
  if (!crewExists) {
    const crewMembers = [
      {
        id: `crew_john_${Date.now()}`,
        fullName: "John Santos",
        email: "john.santos@fayeedautocare.com",
        password: "crew123",
        role: "crew",
        contactNumber: "+63 918 111 2222",
        address: "Zamboanga City",
        branchLocation: "Tumaga Hub",
        profileImage: "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true,
        loyaltyPoints: 0,
        subscriptionStatus: "basic" as const,
        selectedPackage: "classic",
        carUnit: "Honda Click 150",
        carPlateNumber: "CREW-001",
        carType: "Motorcycle",
        crewSkills: ["exterior_wash", "interior_detail", "tire_cleaning"],
        crewStatus: "available" as const,
        crewRating: 4.8,
        crewExperience: 3,
      },
      {
        id: `crew_mike_${Date.now() + 1}`,
        fullName: "Mike Rodriguez",
        email: "mike.rodriguez@fayeedautocare.com",
        password: "crew123",
        role: "crew",
        contactNumber: "+63 918 333 4444",
        address: "Zamboanga City",
        branchLocation: "Boalan Hub",
        profileImage: "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true,
        loyaltyPoints: 0,
        subscriptionStatus: "basic" as const,
        selectedPackage: "classic",
        carUnit: "Yamaha Sniper",
        carPlateNumber: "CREW-002",
        carType: "Motorcycle",
        crewSkills: ["exterior_wash", "premium_detailing", "coating_application"],
        crewStatus: "available" as const,
        crewRating: 4.6,
        crewExperience: 2,
      },
      {
        id: `crew_sarah_${Date.now() + 2}`,
        fullName: "Sarah Delgado",
        email: "sarah.delgado@fayeedautocare.com",
        password: "crew123",
        role: "crew",
        contactNumber: "+63 918 555 6666",
        address: "Zamboanga City",
        branchLocation: "Tumaga Hub",
        profileImage: "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true,
        loyaltyPoints: 0,
        subscriptionStatus: "basic" as const,
        selectedPackage: "classic",
        carUnit: "Honda Beat",
        carPlateNumber: "CREW-003",
        carType: "Motorcycle",
        crewSkills: ["interior_detail", "premium_detailing", "quality_inspection"],
        crewStatus: "available" as const,
        crewRating: 4.9,
        crewExperience: 4,
      },
    ];
    
    newUsers.push(...crewMembers);
    console.log("✅ Sample crew accounts created (3 members)");
  }

  // Add new users to existing users array
  if (newUsers.length > 0) {
    const updatedUsers = [...existingUsers, ...newUsers];
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    // Create subscription data for admin accounts
    newUsers.forEach((user) => {
      const subscriptionData = getPackageData(user.selectedPackage);
      localStorage.setItem(
        `subscription_${user.email}`,
        JSON.stringify(subscriptionData),
      );

      // Create empty wash logs for admin accounts
      localStorage.setItem(`washLogs_${user.email}`, JSON.stringify([]));
    });

    console.log(
      `✅ ${newUsers.length} account(s) initialized successfully`,
    );
    
    console.log("\n🔑 Login Credentials Summary:");
    console.log("👑 Superadmin: fffayeed@gmail.com / Fayeed22beats");
    console.log("🔧 Admin: adminyeed@fayeedautocare.com / 123456789");
    console.log("👥 Manager: manager@fayeedautocare.com / manager123");
    console.log("🔨 Crew: juan.cruz@fayeedautocare.com / crew123");
    console.log("🔨 Crew: mike.rodriguez@fayeedautocare.com / crew123");
    console.log("🔨 Crew: sarah.delgado@fayeedautocare.com / crew123");
    console.log("\n🎯 Complete user ecosystem initialization completed!");
    console.log("📱 Roles available: Superadmin, Admin, Manager, Crew, User");
  }
}

console.log("📼 Booking ecosystem ready with all user roles!");

// Package data helper function
function getPackageData(packageId: string) {
  const packages = {
    "vip-gold": {
      package: "VIP Gold Ultimate",
      daysLeft: 30,
      currentCycleStart: new Date().toISOString().split("T")[0],
      currentCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      daysLeftInCycle: 30,
      autoRenewal: true,
      remainingWashes: {
        classic: 999, // Unlimited
        vipProMax: 5,
        premium: 1,
      },
      totalWashes: {
        classic: 999, // Unlimited
        vipProMax: 5,
        premium: 1,
      },
    },
    "vip-silver": {
      package: "VIP Silver Elite",
      daysLeft: 30,
      currentCycleStart: new Date().toISOString().split("T")[0],
      currentCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      daysLeftInCycle: 30,
      autoRenewal: true,
      remainingWashes: {
        classic: 8,
        vipProMax: 2,
        premium: 0,
      },
      totalWashes: {
        classic: 8,
        vipProMax: 2,
        premium: 0,
      },
    },
    "classic": {
      package: "Classic Pro",
      daysLeft: 7,
      currentCycleStart: new Date().toISOString().split("T")[0],
      currentCycleEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      daysLeftInCycle: 7,
      autoRenewal: false,
      remainingWashes: {
        classic: 2,
        vipProMax: 0,
        premium: 0,
      },
      totalWashes: {
        classic: 2,
        vipProMax: 0,
        premium: 0,
      },
    },
  };

  return packages[packageId as keyof typeof packages] || packages["classic"];
}
