/**
 * Utility to completely reset the application state
 * Clears all localStorage data, sessionStorage, and reloads the page
 */
export const resetAppState = () => {
  // Clear all localStorage
  localStorage.clear();

  // Clear all sessionStorage
  sessionStorage.clear();

  // Clear any remaining cookies (if any)
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substr(0, eqPos) : c;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });

  // Reload the page to ensure complete reset
  window.location.href = "/";
};

/**
 * Reset user session data specifically
 */
export const resetUserSession = () => {
  const keysToRemove = [
    "isAuthenticated",
    "userEmail",
    "userRole",
    "registeredUsers",
    "signUpData",
    "justLoggedIn",
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Remove any subscription data
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("subscription_") || key.startsWith("washLogs_")) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Initialize clean app state
 */
export const initializeCleanState = () => {
  resetAppState();
};
