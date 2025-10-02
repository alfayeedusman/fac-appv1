import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import GlobalNotificationProvider from "@/components/GlobalNotificationProvider";
import AdminNotificationListener from "@/components/AdminNotificationListener";
import DatabaseProvider from "@/components/DatabaseProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import SignUp from "./pages/SignUp";
import CredentialSetup from "./pages/CredentialSetup";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFACMap from "./pages/AdminFACMap";
import Profile from "./pages/Profile";
import Booking from "./pages/Booking";
import GuestBooking from "./pages/GuestBooking";
import BookingManagement from "./pages/BookingManagement";
import ManageSubscription from "./pages/ManageSubscription";
import NotificationSettings from "./pages/NotificationSettings";
import NotificationHistory from "./pages/NotificationHistory";
import Settings from "./pages/Settings";
import SecuritySettings from "./pages/SecuritySettings";
import History from "./pages/History";
import Voucher from "./pages/Voucher";
import AdminNotifications from "./pages/AdminNotifications";
import AdminAds from "./pages/AdminAds";
import AdminCMS from "./pages/AdminCMS";
import AdminPushNotifications from "./pages/AdminPushNotifications";
import AdminImageManager from "./pages/AdminImageManager";
import AdminGamification from "./pages/AdminGamification";
import AdminSubscriptionApproval from "./pages/AdminSubscriptionApproval";
import PaymentHistory from "./pages/PaymentHistory";
import POS from "./pages/POS";
import POSKiosk from "./pages/POSKiosk";
import InventoryManagement from "./pages/InventoryManagement";
import EnhancedInventoryManagement from "./pages/EnhancedInventoryManagement";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminReceiptDesigner from "./pages/AdminReceiptDesigner";
import AdminHomeService from "./pages/AdminHomeService";
import AdminBookingSettings from "./pages/AdminBookingSettings";
import AdminCrewManagement from "./pages/AdminCrewManagement";
import ManagerDashboard from "./pages/ManagerDashboard";
import EnhancedCrewDashboard from "./pages/EnhancedCrewDashboard";
import FlutterCustomerApp from "./pages/FlutterCustomerApp";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import DatabaseConnectionTest from "./components/DatabaseConnectionTest";
import QuickSuperAdminLogin from "./components/QuickSuperAdminLogin";
import AdminLoginTest from "./components/AdminLoginTest";
import ErrorBoundary from "./components/ErrorBoundary";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import { neonDbClient } from "./services/neonDatabaseService";

const queryClient = new QueryClient();

const AppComponent = () => {
  useEffect(() => {
    // Test Neon database connection on app startup (avoid triggering heavy migrations)
    const testNeonDB = async () => {
      try {
        const result = await neonDbClient.testConnection();
        if (result.connected) {
          console.log('✅ Neon database available');
        } else {
          console.warn('⚠️ Neon database not connected');
        }
      } catch (error) {
        console.error('❌ Error during Neon database test:', error);
      }
    };

    testNeonDB();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <DatabaseProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <GlobalNotificationProvider />
            <AdminNotificationListener />
            {/* Facebook Messenger Customer Chat */}
            <FacebookMessenger />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/credential-setup" element={<CredentialSetup />} />
                <Route
                  path="/welcome"
                  element={
                    <ProtectedRoute>
                      <Welcome />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-fac-map"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminFACMap />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking"
                  element={
                    <ProtectedRoute>
                      <Booking />
                    </ProtectedRoute>
                  }
                />
                <Route path="/guest-booking" element={<GuestBooking />} />
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <BookingManagement />
                    </ProtectedRoute>
                  }
                />
                <Route path="/customer" element={<FlutterCustomerApp />} />
                <Route path="/flutter-app" element={<FlutterCustomerApp />} />
                <Route
                  path="/manage-subscription"
                  element={
                    <ProtectedRoute>
                      <ManageSubscription />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notification-settings"
                  element={
                    <ProtectedRoute>
                      <NotificationSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/security-settings"
                  element={
                    <ProtectedRoute>
                      <SecuritySettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/voucher"
                  element={
                    <ProtectedRoute>
                      <Voucher />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-notifications"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminNotifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-ads"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminAds />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-cms"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ErrorBoundary>
                        <AdminCMS />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-push-notifications"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPushNotifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-gamification"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminGamification />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-subscription-approval"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminSubscriptionApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment-history"
                  element={
                    <ProtectedRoute>
                      <PaymentHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pos"
                  element={
                    <ProtectedRoute requiredRole="cashier">
                      <POS />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pos-kiosk"
                  element={
                    <ProtectedRoute requiredRole="cashier">
                      <POSKiosk />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory-management"
                  element={
                    <ProtectedRoute requiredRole="inventory_manager">
                      <EnhancedInventoryManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-user-management"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminUserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-receipt-designer"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminReceiptDesigner />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-home-service"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminHomeService />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-booking-settings"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminBookingSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-crew-management"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminCrewManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-image-manager"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminImageManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager-dashboard"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ManagerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/crew-dashboard"
                  element={
                    <ProtectedRoute requiredRole="crew">
                      <EnhancedCrewDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/database-test"
                  element={
                    <div className="min-h-screen bg-background p-4">
                      <DatabaseConnectionTest />
                    </div>
                  }
                />
                <Route
                  path="/quick-superadmin"
                  element={
                    <div className="min-h-screen bg-background flex items-center justify-center p-4">
                      <QuickSuperAdminLogin />
                    </div>
                  }
                />
                <Route
                  path="/admin-login-test"
                  element={
                    <div className="min-h-screen bg-background p-4">
                      <AdminLoginTest />
                    </div>
                  }
                />
                <Route
                  path="/diagnostics"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ErrorBoundary>
                        <DiagnosticsPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DatabaseProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AppComponent />
  </ErrorBoundary>
);
