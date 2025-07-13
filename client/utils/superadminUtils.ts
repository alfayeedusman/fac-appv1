// Superadmin Utility Functions
// Direct access functions for bypassing normal authentication

export const SUPERADMIN_CREDENTIALS = {
  email: "superadmin@fac.com",
  password: "super123",
  role: "superadmin",
};

export const forceSuperadminLogin = (navigate: (path: string) => void) => {
  // Clear all existing data
  localStorage.clear();

  // Set superadmin session
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("userEmail", SUPERADMIN_CREDENTIALS.email);
  localStorage.setItem("userRole", SUPERADMIN_CREDENTIALS.role);
  localStorage.setItem("justLoggedIn", "true");

  // Initialize superadmin data
  initializeSuperadminData();

  // Navigate to admin dashboard
  navigate("/admin-dashboard");

  return true;
};

export const initializeSuperadminData = () => {
  // Initialize superadmin-specific data
  const superadminData = {
    fullName: "Supreme Administrator",
    phone: "+63999-SUPREME",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    permissions: ["all"],
    accessLevel: "supreme",
    canBypassAll: true,
    hasAllAccess: true,
  };

  // Set superadmin user data
  const registeredUsers = JSON.parse(
    localStorage.getItem("registeredUsers") || "[]",
  );
  const superadminUser = {
    email: SUPERADMIN_CREDENTIALS.email,
    password: SUPERADMIN_CREDENTIALS.password,
    role: SUPERADMIN_CREDENTIALS.role,
    fullName: superadminData.fullName,
    phone: superadminData.phone,
    ...superadminData,
  };

  // Ensure superadmin is in registered users
  const existingIndex = registeredUsers.findIndex(
    (user: any) => user.email === SUPERADMIN_CREDENTIALS.email,
  );

  if (existingIndex >= 0) {
    registeredUsers[existingIndex] = superadminUser;
  } else {
    registeredUsers.push(superadminUser);
  }

  localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

  // Set subscription data for superadmin (unlimited access)
  const superadminSubscription = {
    package: "Supreme Admin Package",
    currentCycleStart: new Date().toISOString().split("T")[0],
    currentCycleEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    daysLeft: 365,
    autoRenewal: true,
    remainingWashes: {
      classic: 9999,
      vipProMax: 9999,
      premium: 9999,
    },
    totalWashes: {
      classic: 9999,
      vipProMax: 9999,
      premium: 9999,
    },
  };

  localStorage.setItem(
    `subscription_${SUPERADMIN_CREDENTIALS.email}`,
    JSON.stringify(superadminSubscription),
  );

  // Initialize admin privileges
  localStorage.setItem("adminPrivileges", "true");
  localStorage.setItem("supremeAccess", "true");

  console.log("🔥 SUPERADMIN MODE ACTIVATED! 👑");
  console.log("Email:", SUPERADMIN_CREDENTIALS.email);
  console.log("Password:", SUPERADMIN_CREDENTIALS.password);
  console.log("Access Level: SUPREME 🚀");
};

export const isSuperadmin = () => {
  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail");
  return (
    userRole === "superadmin" && userEmail === SUPERADMIN_CREDENTIALS.email
  );
};

export const getSuperadminToken = () => {
  if (isSuperadmin()) {
    return `superadmin_token_${Date.now()}`;
  }
  return null;
};

// URL parameter bypass function
export const checkForSuperadminBypass = (navigate: (path: string) => void) => {
  const urlParams = new URLSearchParams(window.location.search);
  const bypass = urlParams.get("superadmin");
  const key = urlParams.get("key");

  // Secret bypass parameters
  if (bypass === "force" && key === "supreme123") {
    forceSuperadminLogin(navigate);
    return true;
  }

  return false;
};

// Console command for developers
declare global {
  interface Window {
    forceSuperadmin: () => void;
    superadminCredentials: typeof SUPERADMIN_CREDENTIALS;
  }
}

// Make functions available globally for debugging
if (typeof window !== "undefined") {
  window.forceSuperadmin = () => {
    console.log("🔥 FORCE SUPERADMIN LOGIN ACTIVATED! 👑");
    window.location.href = "/login?superadmin=force&key=supreme123";
  };
  window.superadminCredentials = SUPERADMIN_CREDENTIALS;
}

export default {
  SUPERADMIN_CREDENTIALS,
  forceSuperadminLogin,
  initializeSuperadminData,
  isSuperadmin,
  getSuperadminToken,
  checkForSuperadminBypass,
};
