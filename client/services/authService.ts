import { toast } from "@/hooks/use-toast";
import { initializeDatabase } from "./dbInitService";
import { supabaseDbClient } from "@/services/supabaseDatabaseService";
import LocalStorageSyncService from "@/services/localStorageSyncService";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  contactNumber: string;
  address: string;
  branchLocation: string;
  role?:
    | "user"
    | "admin"
    | "superadmin"
    | "cashier"
    | "inventory_manager"
    | "manager"
    | "dispatcher"
    | "crew";
  carUnit?: string;
  carPlateNumber?: string;
  carType?: string;
  subscriptionPackage?: string;
}

class AuthService {
  private isLoggedIn = false;
  private currentUser: any = null;

  constructor() {
    // Check if user is logged in on initialization
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    try {
      const userEmail = localStorage.getItem("userEmail");
      const userRole = localStorage.getItem("userRole");
      const userId = localStorage.getItem("userId");
      const currentUserStr = localStorage.getItem("currentUser");
      const userLoggedInAt = localStorage.getItem("userLoggedInAt");

      if (userEmail && userRole && userId && currentUserStr) {
        // Check if session is not too old (24 hours)
        if (userLoggedInAt) {
          const loginTime = new Date(userLoggedInAt);
          const now = new Date();
          const hoursSinceLogin =
            (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

          if (hoursSinceLogin > 24) {
            console.log("Session expired (>24 hours), clearing session");
            this.clearSession();
            return;
          }
        }

        // Restore full user object
        this.currentUser = JSON.parse(currentUserStr);
        this.isLoggedIn = true;

        console.log("Session restored:", {
          email: userEmail,
          role: userRole,
          loginTime: userLoggedInAt,
        });
      } else {
        // Clear incomplete session data
        this.clearSession();
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      this.clearSession();
    }
  }

  private clearSession() {
    this.isLoggedIn = false;
    this.currentUser = null;

    // Clear all session-related localStorage items
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("userLoggedInAt");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("sessionExpiresAt");
  }

  async login(
    credentials: LoginCredentials,
  ): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // OPTIMIZED: Skip all non-essential checks before login
      // Just proceed directly to authentication
      const result = await supabaseDbClient.login(
        credentials.email,
        credentials.password,
      );

      if (result.success && result.user) {
        this.isLoggedIn = true;
        this.currentUser = result.user;

        // OPTIMIZED: Batch localStorage operations for speed
        // Use a single object instead of multiple setItem calls
        const sessionData = {
          userEmail: result.user.email,
          userRole: result.user.role,
          userId: result.user.id,
          userFullName: result.user.fullName || "",
          userLoggedInAt: new Date().toISOString(),
          currentUser: JSON.stringify(result.user),
        };

        // Set all items at once (still fast, but grouped)
        Object.entries(sessionData).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });

        // Store tokens if provided (non-blocking)
        if ((result as any).sessionToken) {
          localStorage.setItem("sessionToken", (result as any).sessionToken);
        }

        // OPTIMIZED: No background sync, no database init
        // These happen after page navigation completes
        // Dispatch initialization in the absolute background
        setTimeout(() => {
          // Initialize DB only if first login
          if (!localStorage.getItem("_db_init_done")) {
            initializeDatabase().catch(() => {
              // Silent fail - non-critical
            });
            localStorage.setItem("_db_init_done", "true");
          }

          // Sync data after a delay (completely non-blocking)
          LocalStorageSyncService.syncAllData().catch(() => {
            // Silent fail - non-critical
          });
        }, 1000);

        // OPTIMIZED: Non-blocking toast
        toast({
          title: "Welcome back!",
          description: "Logging you in...",
        });
      } else {
        this.clearSession();
        // Only show error toast on failure
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      this.clearSession();
      toast({
        title: "Connection Error",
        description: "Please try again",
        variant: "destructive",
      });
      return { success: false, error: "Login failed" };
    }
  }

  async register(
    userData: RegisterData,
  ): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // Ensure database is initialized before attempting registration
      console.log("📝 Registration initiated - ensuring database is ready...");
      await initializeDatabase();
      console.log("✅ Database ready, proceeding with registration");

      const registrationData = {
        ...userData,
        role: userData.role || "user",
        isActive: true,
        emailVerified: false,
        loyaltyPoints: 0,
        subscriptionStatus: "free" as const,
      };

      const result = await supabaseDbClient.register(registrationData);

      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully!",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Registration failed",
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      const errorMessage =
        "Registration failed. Please ensure you are connected to the database.";
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  }

  logout() {
    // Call server to invalidate session token if present
    const sessionToken = localStorage.getItem("sessionToken");
    if (sessionToken) {
      fetch("/api/supabase/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      }).catch((err) => console.warn("Server logout failed:", err));
    }

    this.clearSession();

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUser?.role);
  }

  async checkDatabaseConnection(): Promise<boolean> {
    try {
      const result = await supabaseDbClient.testConnection();
      return result.connected;
    } catch (error) {
      console.error("Database connection check failed:", error);
      return false;
    }
  }

  // Session validation methods
  validateSession(): boolean {
    const userLoggedInAt = localStorage.getItem("userLoggedInAt");

    if (!this.isLoggedIn || !this.currentUser || !userLoggedInAt) {
      return false;
    }

    // Check if session is not too old (24 hours)
    const loginTime = new Date(userLoggedInAt);
    const now = new Date();
    const hoursSinceLogin =
      (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLogin > 24) {
      console.log("Session validation failed: session expired");
      this.clearSession();
      return false;
    }

    return true;
  }

  refreshSession(): void {
    if (this.isLoggedIn && this.currentUser) {
      localStorage.setItem("userLoggedInAt", new Date().toISOString());
    }
  }

  getSessionInfo(): {
    loginTime?: string;
    isValid: boolean;
    hoursRemaining?: number;
  } {
    const userLoggedInAt = localStorage.getItem("userLoggedInAt");

    if (!userLoggedInAt || !this.isLoggedIn) {
      return { isValid: false };
    }

    const loginTime = new Date(userLoggedInAt);
    const now = new Date();
    const hoursSinceLogin =
      (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, 24 - hoursSinceLogin);

    return {
      loginTime: userLoggedInAt,
      isValid: hoursSinceLogin <= 24,
      hoursRemaining,
    };
  }

  // Force session validation (useful for admin routes)
  requireValidSession(): boolean {
    if (!this.validateSession()) {
      toast({
        title: "Session Invalid",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
