import express, { Router } from "express";
import * as neonApi from "./neon-api";

const router = Router();

// ============= API CATALOG & DIAGNOSTICS =============
router.get("/catalog", neonApi.getApiCatalog);
router.post("/init", neonApi.initializeSupabaseDB);
router.get("/test", neonApi.testSupabaseConnection);
router.get("/db-check", neonApi.dbCheck);
router.get("/diagnose", neonApi.diagnoseDatabase);

// ============= AUTH ENDPOINTS =============
router.post("/auth/login", neonApi.loginUser);
router.post("/auth/register", neonApi.registerUser);
router.post("/auth/logout", neonApi.logoutUser);
router.post("/auth/revoke-session", neonApi.revokeSession);
router.get("/auth/sessions", neonApi.getSessions);
router.post("/auth/forgot-password", neonApi.requestPasswordReset);

// ============= BOOKING ENDPOINTS =============
router.post("/bookings", neonApi.createBooking);
router.get("/bookings", neonApi.getBookings);
router.get("/bookings/availability", neonApi.getSlotAvailability);
router.get("/bookings/garage-settings", neonApi.getGarageSettings);
router.put("/bookings/:id", neonApi.updateBooking);

// ============= SUBSCRIPTION ENDPOINTS =============
router.get("/subscriptions", neonApi.getSubscriptions);
router.post("/subscriptions/upgrade", neonApi.createSubscriptionUpgrade);
router.put("/subscriptions/:subscriptionId/approve", neonApi.approveSubscriptionUpgrade);
router.post("/subscription/xendit/create-plan", neonApi.createXenditSubscriptionPlan);
router.post("/subscription/xendit/process-renewal", neonApi.processSubscriptionRenewal);
router.post("/subscriptions/:userId", neonApi.updateSubscription);
router.get("/subscriptions/:userId", neonApi.fetchUserSubscription);

// ============= NOTIFICATION ENDPOINTS =============
router.get("/notifications", neonApi.getNotifications);
router.put("/notifications/:notificationId/read", neonApi.markNotificationRead);

// ============= ADMIN SETTINGS ENDPOINTS =============
router.get("/settings", neonApi.getSettings);
router.put("/settings", neonApi.updateSetting);

// ============= DAILY INCOME ENDPOINTS =============
router.get("/daily-income", neonApi.getDailyIncome);
router.post("/daily-income", neonApi.createDailyIncome);

// ============= ADS ENDPOINTS =============
router.get("/ads", neonApi.getAds);
router.post("/ads", neonApi.createAd);
router.post("/ads/:adId/dismiss", neonApi.dismissAd);

// ============= VOUCHER ENDPOINTS =============
router.get("/vouchers", neonApi.getVouchers);
router.post("/vouchers/validate", neonApi.validateVoucher);
router.post("/vouchers/redeem", neonApi.redeemVoucher);

// ============= STATS & ANALYTICS ENDPOINTS =============
router.get("/stats", neonApi.getDatabaseStats);
router.get("/realtime-stats", neonApi.getRealtimeStats);
router.get("/fac-map-stats", neonApi.getFacMapStats);
router.get("/analytics", neonApi.getAnalyticsData);

// ============= DEBUG ENDPOINTS =============
router.post("/debug/password-verify", neonApi.debugPasswordVerification);
router.get("/debug/list-users", neonApi.debugListUsers);
router.post("/debug/hash-password", neonApi.debugHashPassword);
router.post("/debug/login", neonApi.debugLogin);
router.post("/admin/force-rehash-passwords", neonApi.adminForceRehashPasswords);

// ============= USER MANAGEMENT ENDPOINTS =============
router.get("/users", neonApi.getAllUsers);
router.get("/customers", neonApi.getCustomers);
router.get("/customers/search", neonApi.searchCustomers);
router.get("/staff", neonApi.getStaffUsers);
router.post("/staff", neonApi.createStaffUser);
router.put("/users/:userId/status", neonApi.updateUserStatus);
router.put("/users/:userId/address", neonApi.updateUserAddress);

// ============= BRANCHES ENDPOINTS =============
router.get("/branches", neonApi.getBranches);
router.post("/branches/seed", neonApi.seedBranchesEndpoint);

// ============= SERVICE PACKAGES ENDPOINTS =============
router.get("/packages", neonApi.getServicePackages);
router.post("/packages", neonApi.createServicePackage);
router.put("/packages/:id", neonApi.updateServicePackage);
router.delete("/packages/:id", neonApi.deleteServicePackage);

// ============= GAMIFICATION ENDPOINTS =============
router.get("/gamification/levels", neonApi.getCustomerLevels);

// ============= POS CATEGORIES ENDPOINTS =============
router.get("/pos/categories", neonApi.getPOSCategories);

// ============= INVENTORY ENDPOINTS =============
router.get("/inventory/items", neonApi.getInventoryItems);
router.post("/inventory/items", neonApi.createInventoryItem);
router.put("/inventory/items/:id", neonApi.updateInventoryItem);
router.delete("/inventory/items/:id", neonApi.deleteInventoryItem);

// ============= STOCK MOVEMENTS ENDPOINTS =============
router.get("/inventory/stock-movements", neonApi.getStockMovements);
router.post("/inventory/stock-movements", neonApi.createStockMovement);

// ============= SUPPLIERS ENDPOINTS =============
router.get("/inventory/suppliers", neonApi.getSuppliers);
router.post("/inventory/suppliers", neonApi.createSupplier);
router.put("/inventory/suppliers/:id", neonApi.updateSupplier);
router.delete("/inventory/suppliers/:id", neonApi.deleteSupplier);

// ============= INVENTORY ANALYTICS ENDPOINTS =============
router.get("/inventory/analytics", neonApi.getInventoryAnalytics);
router.get("/inventory/low-stock", neonApi.getLowStockItems);

// ============= USER VEHICLES & ADDRESS ENDPOINTS =============
router.get("/users/:userId/vehicles", neonApi.getUserVehicles);
router.post("/users/:userId/vehicles", neonApi.addUserVehicle);
router.put("/users/:userId/vehicles/:vehicleId", neonApi.updateUserVehicle);
router.delete("/users/:userId/vehicles/:vehicleId", neonApi.deleteUserVehicle);

// ============= ADMIN UTILITIES =============
router.post("/admin/fix-booking-userids", neonApi.fixBookingUserIds);

// ============= LOCALSTORAGE DATA MIGRATION & SYNC ENDPOINTS =============
router.post("/sync/user-preferences", neonApi.syncUserPreferences);
router.get("/sync/user-preferences", neonApi.getUserPreferences);
router.post("/sync/user-notifications", neonApi.syncUserNotifications);
router.get("/sync/user-notifications", neonApi.getUserNotifications);
router.post("/sync/printer-config", neonApi.syncPrinterConfig);
router.get("/sync/printer-config", neonApi.getPrinterConfigs);
router.post("/sync/gamification-progress", neonApi.syncGamificationProgress);
router.get("/sync/gamification-progress", neonApi.getGamificationProgress);

export default router;
