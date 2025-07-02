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
import SignUp from "./pages/SignUp";
import CredentialSetup from "./pages/CredentialSetup";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Booking from "./pages/Booking";
import ManageSubscription from "./pages/ManageSubscription";
import NotificationSettings from "./pages/NotificationSettings";
import Settings from "./pages/Settings";
import SecuritySettings from "./pages/SecuritySettings";
import History from "./pages/History";
import Voucher from "./pages/Voucher";
import AdminNotifications from "./pages/AdminNotifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            <Route path="/signup" element={<SignUp />} />
            <Route path="/credential-setup" element={<CredentialSetup />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/booking" element={<Booking />} />
            <Route
              path="/manage-subscription"
              element={<ManageSubscription />}
            />
            <Route
              path="/notification-settings"
              element={<NotificationSettings />}
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/security-settings" element={<SecuritySettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
