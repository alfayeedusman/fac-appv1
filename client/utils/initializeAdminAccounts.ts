// Initialize admin accounts on app startup
export function initializeAdminAccounts() {
  const existingUsers = JSON.parse(
    localStorage.getItem("registeredUsers") || "[]",
  );

  // Check if superadmin already exists
  const superAdminExists = existingUsers.some(
    (user: any) => user.email === "superyeed@fayeedautocare.com",
  );

  // Check if admin already exists
  const adminExists = existingUsers.some(
    (user: any) => user.email === "adminyeed@fayeedautocare.com",
  );

  const newUsers = [];

  // Create superadmin account if it doesn't exist
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
      createdAt: new Date().toISOString(),
    };
    newUsers.push(superAdminUser);
    console.log("✅ Superadmin account created: superyeed@fayeedautocare.com");
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
      createdAt: new Date().toISOString(),
    };
    newUsers.push(adminUser);
    console.log("✅ Admin account created: adminyeed@fayeedautocare.com");
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
      `✅ ${newUsers.length} admin account(s) initialized successfully`,
    );
  }
}

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
  };

  return packages[packageId as keyof typeof packages] || packages["vip-silver"];
}
