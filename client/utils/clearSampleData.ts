// Utility to clear all sample data and start fresh

export const clearAllSampleData = () => {
  // Clear subscription requests
  localStorage.removeItem("fac_subscription_requests");

  // Clear bookings
  localStorage.removeItem("fac_bookings");

  // Clear gamification data
  const userEmail = localStorage.getItem("userEmail");
  if (userEmail) {
    const userId = `user_${userEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
    localStorage.removeItem(`fac_user_progress_${userId}`);
  }

  // Clear customer statuses
  localStorage.removeItem("fac_customer_statuses");

  // Clear gamification levels (will be regenerated with defaults)
  localStorage.removeItem("fac_gamification_levels");

  // Clear user notifications
  if (userEmail) {
    localStorage.removeItem(`notifications_${userEmail}`);
  }

  // Clear subscription data for current user
  if (userEmail) {
    localStorage.removeItem(`subscription_${userEmail}`);
  }

  console.log("All sample data cleared. Starting fresh!");

  // Reload the page to reset everything
  window.location.reload();
};

export const initializeFreshSystem = () => {
  // Initialize empty data structures
  localStorage.setItem("fac_subscription_requests", JSON.stringify([]));
  localStorage.setItem("fac_bookings", JSON.stringify([]));
  localStorage.setItem("fac_customer_statuses", JSON.stringify([]));

  const userEmail = localStorage.getItem("userEmail");
  if (userEmail) {
    localStorage.setItem(`notifications_${userEmail}`, JSON.stringify([]));
  }

  console.log("Fresh system initialized!");
};
