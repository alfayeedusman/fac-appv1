// Superadmin Utility Functions
// Secure functions for superadmin validation

// Note: Credentials removed for security - use proper authentication

// Function removed for security - use proper authentication flow

// Function removed for security - superadmin data should come from authenticated session

export const isSuperadmin = () => {
  const userRole = localStorage.getItem("userRole");
  return userRole === "superadmin";
};

export const getSuperadminToken = () => {
  if (isSuperadmin()) {
    return `superadmin_token_${Date.now()}`;
  }
  return null;
};

// Bypass function removed for security

// Global debugging functions removed for security

export default {
  isSuperadmin,
  getSuperadminToken,
};
