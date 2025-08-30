// Comprehensive data clearing utility that preserves admin credentials

export const clearAllDataExceptAdmins = () => {
  console.log('�� Starting comprehensive data cleanup...');
  
  // 1. Clear bookings and related data
  localStorage.removeItem('fac_bookings');
  localStorage.removeItem('bookings');
  localStorage.removeItem('crew_assignments');
  localStorage.removeItem('booking_status_updates');
  
  // 2. Clear POS transactions and inventory changes
  localStorage.removeItem('fac_pos_transactions');
  localStorage.removeItem('pos_transactions');
  
  // 3. Clear subscription requests
  localStorage.removeItem('fac_subscription_requests');
  
  // 4. Clear customer statuses
  localStorage.removeItem('fac_customer_statuses');
  
  // 5. Clear gamification data
  localStorage.removeItem('fac_gamification_levels');
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    const userId = `user_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    localStorage.removeItem(`fac_user_progress_${userId}`);
  }
  
  // 6. Clear notifications for all users
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('notifications_')) {
      localStorage.removeItem(key);
    }
    if (key.startsWith('subscription_')) {
      localStorage.removeItem(key);
    }
    if (key.startsWith('washLogs_')) {
      localStorage.removeItem(key);
    }
  });
  
  // 7. Clear system notifications but preserve system structure
  localStorage.removeItem('system_notifications');
  
  // 8. Remove sample users while preserving admin accounts
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const preservedUsers = existingUsers.filter((user: any) => {
    // Preserve admin accounts and non-sample users
    return !user.id.startsWith('user_sample_') && 
           !user.id.startsWith('crew_') &&
           !user.id.startsWith('customer_sample_');
  });
  localStorage.setItem('registeredUsers', JSON.stringify(preservedUsers));
  
  // 9. Clear cache and temporary data
  localStorage.removeItem('cached_products');
  localStorage.removeItem('cached_services');
  
  // 10. Reset inventory to default state (remove any sample stock changes)
  localStorage.removeItem('inventory_updates');
  
  console.log(`✅ Data cleanup completed. Preserved ${preservedUsers.length} admin/real user accounts.`);
  console.log('🔄 Refreshing application...');
  
  // Initialize fresh empty data structures
  localStorage.setItem('fac_bookings', JSON.stringify([]));
  localStorage.setItem('fac_subscription_requests', JSON.stringify([]));
  localStorage.setItem('fac_customer_statuses', JSON.stringify([]));
  localStorage.setItem('fac_pos_transactions', JSON.stringify([]));
  
  // Add fresh system notifications
  if (userEmail) {
    localStorage.setItem(`notifications_${userEmail}`, JSON.stringify([]));
  }
  
  // Reload to ensure clean state
  window.location.reload();
};

// Quick function to just clear sample data (lighter version)
export const clearSampleDataOnly = () => {
  console.log('🧹 Clearing sample data only...');
  
  localStorage.removeItem('fac_bookings');
  localStorage.removeItem('fac_subscription_requests');
  localStorage.removeItem('fac_customer_statuses');
  localStorage.removeItem('fac_pos_transactions');
  
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    localStorage.removeItem(`notifications_${userEmail}`);
    localStorage.removeItem(`subscription_${userEmail}`);
  }
  
  console.log('✅ Sample data cleared!');
  window.location.reload();
};

// Function to show current data state
export const showDataState = () => {
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const bookings = JSON.parse(localStorage.getItem('fac_bookings') || '[]');
  const transactions = JSON.parse(localStorage.getItem('fac_pos_transactions') || '[]');
  
  console.log('📊 Current Data State:');
  console.log(`Users: ${users.length}`);
  console.log(`Bookings: ${bookings.length}`);
  console.log(`POS Transactions: ${transactions.length}`);
  
  return {
    users: users.length,
    bookings: bookings.length,
    transactions: transactions.length
  };
};
