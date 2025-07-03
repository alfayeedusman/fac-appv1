import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import SignUp from "./pages/SignUp";
import CredentialSetup from "./pages/CredentialSetup";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Booking from "./pages/Booking";
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
import AdminGamification from "./pages/AdminGamification";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { initializeAdminAccounts } from "./utils/initializeAdminAccounts";
import { initializeSampleAds } from "./utils/initializeSampleAds";

const queryClient = new QueryClient();

// Initialize admin accounts and sample ads on app startup
initializeAdminAccounts();
initializeSampleAds();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <BookingManagement />
                </ProtectedRoute>
              }
            />
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
                  <AdminCMS />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
