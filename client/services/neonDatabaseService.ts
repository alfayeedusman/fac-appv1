// Client-side service to interact with Neon database via API
import { toast } from "@/hooks/use-toast";
import { FallbackService } from "@/services/fallbackService";
import { log, info, warn, error as logError } from "@/utils/logger";

// Types based on our database schema
export interface UserVehicle {
  id: string;
  unitType: "car" | "motorcycle";
  unitSize: string; // sedan, suv, pickup, etc.
  plateNumber: string;
  vehicleModel: string; // e.g., "Toyota Hilux 2024"
  isDefault: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role:
    | "user"
    | "admin"
    | "superadmin"
    | "cashier"
    | "inventory_manager"
    | "manager"
    | "crew";
  contactNumber?: string;
  address?: string;
  defaultAddress?: string; // For home service bookings
  vehicles?: UserVehicle[]; // Multiple vehicles support
  carUnit?: string; // Legacy field - kept for backward compatibility
  carPlateNumber?: string; // Legacy field - kept for backward compatibility
  carType?: string; // Legacy field - kept for backward compatibility
  branchLocation: string;
  profileImage?: string;
  isActive: boolean;
  emailVerified: boolean;
  loyaltyPoints: number;
  subscriptionStatus: "free" | "basic" | "premium" | "vip";
  subscriptionExpiry?: string;
  crewSkills?: string[];
  crewStatus?: "available" | "busy" | "offline";
  currentAssignment?: string;
  crewRating?: number;
  crewExperience?: number;
  lastLoginAt?: string;
  canViewAllBranches?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId?: string;
  guestInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  type: "registered" | "guest";
  confirmationCode: string;
  category: "carwash" | "auto_detailing" | "graphene_coating";
  service: string;
  serviceType: "branch" | "home";
  unitType: "car" | "motorcycle";
  unitSize?: string;
  plateNumber?: string;
  vehicleModel?: string;
  date: string;
  timeSlot: string;
  branch: string;
  serviceLocation?: string;
  estimatedDuration?: number;
  basePrice: number;
  totalPrice: number;
  currency: string;
  paymentMethod?: "cash" | "online" | "gcash" | "onsite" | "branch";
  paymentStatus: string;
  receiptUrl?: string;
  status: string;
  notes?: string;
  specialRequests?: string;
  pointsEarned?: number;
  loyaltyRewardsApplied?: string[];
  assignedCrew?: string[];
  crewNotes?: string;
  completedAt?: string;
  customerRating?: number;
  customerFeedback?: string;
  voucherCode?: string;
  voucherDiscount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  targetRoles: string[];
  targetUsers?: string[];
  data?: any;
  scheduledFor?: string;
  sentAt?: string;
  readBy: Array<{ userId: string; readAt: string }>;
  actions?: Array<{
    label: string;
    action: string;
    variant?: "default" | "destructive" | "secondary";
  }>;
  playSound?: boolean;
  soundType?: string;
  createdAt: string;
}

export interface AdminSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  category?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ad {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  duration: "weekly" | "monthly" | "yearly";
  isActive: boolean;
  targetPages: string[];
  adminEmail: string;
  impressions?: number;
  clicks?: number;
  createdAt: string;
  updatedAt: string;
}

// Safe timeout handler to prevent issues with AbortController
const createSafeTimeoutAbort = (
  controller: AbortController,
  timeoutMs: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isAborted = false;

  timeoutId = setTimeout(() => {
    if (!isAborted) {
      try {
        controller.abort();
      } catch (e) {
        console.warn(`Error aborting request: ${e instanceof Error ? e.message : JSON.stringify(e)}`);
      }
    }
  }, timeoutMs);

  return {
    clearTimeout: () => {
      isAborted = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
};

class NeonDatabaseClient {
  private baseUrl: string;
  private isConnected = false;
  private initializationPromise: Promise<boolean> | null = null;

  // Cache with TTL to prevent excessive API calls
  private statsCache: { data: any; timestamp: number } | null = null;
  private realtimeStatsCache: { data: any; timestamp: number } | null = null;
  private cacheTTL = 5000; // 5 seconds cache

  constructor() {
    // Ensure baseUrl is properly constructed
    const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
    this.baseUrl = `${apiBase}/neon`;
    log("🔗 NeonDatabaseClient baseUrl:", this.baseUrl);
    // Auto-initialize on construction
    this.autoInitialize().catch((err) =>
      warn(`⚠️ Background initialization failed: ${err?.message || JSON.stringify(err)}`),
    );
  }

  // Initialize and test connection
  async initialize(): Promise<boolean> {
    // Try POST /init, then GET /test as fallback; degrade gracefully to offline
    try {
      const initUrl = `${this.baseUrl}/init`;
      log(`🔄 Initializing database connection to: ${initUrl}`);

      const controller = new AbortController();
      const timeoutHandler = createSafeTimeoutAbort(controller, 8000);

      try {
        const response = await fetch(initUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

        timeoutHandler.clearTimeout();

        if (response.ok) {
          const result = await response.json();
          this.isConnected = !!result.success;
          if (this.isConnected) {
            info("✅ Database initialized successfully");
            return true;
          }
        } else {
          warn(
            `⚠️ Init request failed: ${response.status} ${response.statusText}`,
          );
        }
      } catch (error) {
        timeoutHandler.clearTimeout();
        throw error;
      }
    } catch (error) {
      warn(
        "⚠️ Init request error, will try /test fallback:",
        error instanceof Error ? error.message : error,
      );
    }

    // Fallback: GET /test
    try {
      const testUrl = `${this.baseUrl}/test`;
      const ac = new AbortController();
      const timeoutHandler = createSafeTimeoutAbort(ac, 5000);
      try {
        const res = await fetch(testUrl, { method: "GET", signal: ac.signal });
        timeoutHandler.clearTimeout();
        if (res.ok) {
          const result = await res.json();
          this.isConnected = !!(result.connected || result.success);
          info(`🔗 Test connection result: ${this.isConnected}`);
          return this.isConnected;
        }
      } catch (e) {
        timeoutHandler.clearTimeout();
        throw e;
      }
    } catch (e) {
      warn("⚠️ Test request failed:", e instanceof Error ? e.message : e);
    }

    // Final: mark offline, allow UI to use fallbacks
    this.isConnected = false;
    info("📴 Running in offline/demo mode (database unreachable)");
    return false;
  }

  async testConnection(): Promise<{
    connected: boolean;
    stats?: any;
    error?: string;
  }> {
    const tryFetch = async (url: string, timeoutMs = 8000) => {
      const ac = new AbortController();
      const timeoutHandler = createSafeTimeoutAbort(ac, timeoutMs);

      try {
        const res = await fetch(url, { signal: ac.signal });
        timeoutHandler.clearTimeout();
        return res;
      } catch (e) {
        timeoutHandler.clearTimeout();
        // Handle abort errors gracefully (timeout is expected behavior)
        if (e instanceof Error && e.name === "AbortError") {
          throw new Error(`Request timeout after ${timeoutMs}ms`);
        }
        throw e;
      }
    };

    try {
      // 1) Try configured base URL
      const primaryUrl = `${this.baseUrl}/test`;
      try {
        const response = await tryFetch(primaryUrl, 8000);
        if (response.ok) {
          const result = await response.json();
          this.isConnected = result.connected || result.success || false;
          if (this.isConnected) {
            info("✅ Database connection test successful");
          } else {
            warn("⚠️ Database connection test returned false");
          }
          return result;
        }
        logError(`Connection test failed: HTTP ${response.status}`);
      } catch (err) {
        warn("Primary connection test failed:", (err as any).message || err);
      }

      // 2) Fallback to same-origin relative API
      const fallbackUrl = `/api/neon/test`;
      try {
        const response = await tryFetch(fallbackUrl, 8000);
        if (response.ok) {
          const result = await response.json();
          this.isConnected = result.connected || result.success || false;
          if (this.isConnected) {
            info("✅ Fallback connection test successful");
          } else {
            console.warn("⚠️ Fallback connection test returned false");
          }
          return result;
        }
        logError(`Fallback connection test failed: HTTP ${response.status}`);
      } catch (err) {
        warn("Fallback connection test failed:", (err as any).message || err);
      }

      // 3) Final: health check to distinguish server vs network
      try {
        const health = await tryFetch("/api/health", 5000);
        if (health.ok) {
          this.isConnected = false;
          return { connected: false, error: "API reachable, Neon test failed" };
        }
      } catch (e) {
        // ignore
      }

      this.isConnected = false;
      return { connected: false, error: "Network error" };
    } catch (error: any) {
      logError("❌ Connection test failed:", error.message || error);
      this.isConnected = false;
      if (error.name === "AbortError") {
        return { connected: false, error: "Connection timeout" };
      }
      return { connected: false, error: error.message };
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Debug function to test connectivity and diagnose issues
  async debugConnection(): Promise<{
    baseUrl: string;
    isConnected: boolean;
    testResults: any;
    initResults: any;
  }> {
    log("🔍 Starting database connection debug...");

    const debug = {
      baseUrl: this.baseUrl,
      isConnected: this.isConnected,
      testResults: null as any,
      initResults: null as any,
    };

    try {
      // Test basic connectivity
      log("🧪 Testing connection...");
      debug.testResults = await this.testConnection();
      log("✅ Test connection result:", debug.testResults);
    } catch (error) {
      logError("❌ Test connection failed:", error);
      debug.testResults = {
        error: error instanceof Error ? error.message : "Unknown test error",
      };
    }

    try {
      // Try initialization
      log("🚀 Testing initialization...");
      debug.initResults = await this.initialize();
      log("✅ Init result:", debug.initResults);
    } catch (error) {
      logError("❌ Initialization failed:", error);
      debug.initResults = {
        error: error instanceof Error ? error.message : "Unknown init error",
      };
    }

    log("🔍 Debug completed:", debug);
    return debug;
  }

  // Ensure connection with auto-initialization
  private async ensureConnection(): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    // If already initializing, wait for it
    if (this.initializationPromise) {
      return await this.initializationPromise;
    }

    // Start initialization
    this.initializationPromise = this.autoInitialize();
    const result = await this.initializationPromise;
    this.initializationPromise = null;
    return result;
  }

  // Auto-initialize without user interaction
  private async autoInitialize(): Promise<boolean> {
    try {
      log("🔄 Auto-initializing Neon database...");

      // First try test connection
      const testResult = await this.testConnection();
      if (testResult.connected) {
        return true;
      }

      // If test fails, try full initialization
      const initResult = await this.initialize();
      return initResult;
    } catch (error) {
      logError("❌ Auto-initialization failed:", error);
      return false;
    }
  }

  // Database-only mode - no localStorage fallback
  private throwDatabaseError(operation: string): never {
    throw new Error(
      `Database operation failed: ${operation}. Please ensure Neon database is connected.`,
    );
  }

  // === AUTHENTICATION ===

  private async processLoginResponse(
    response: Response,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!response) {
      return {
        success: false,
        error: "Network error: No response received from server",
      };
    }

    if (response.type === "opaque" || response.status === 0) {
      return {
        success: false,
        error:
          "Request blocked by CORS or network policy. Please use the same origin or enable CORS on the server.",
      };
    }

    try {
      log("📝 Response status:", response.status, response.statusText);
      log("📝 Response URL:", response.url);
      console.log(
        "��� Content-Type:",
        response.headers.get("content-type") || "unknown",
      );
    } catch (_) {}

    // Read body ONCE as text to avoid bodyUsed/clone issues, then try JSON parse
    let text = "";
    try {
      if (!response.bodyUsed) {
        text = await response.text();
      } else {
        // If already consumed (by an interceptor), we cannot read again safely
        warn("⚠️ Response body already consumed; skipping read");
      }
    } catch (readErr: any) {
      logError("❌ Failed to read response body:", readErr?.message || readErr);
      // Continue with empty text; we'll return a generic error below if needed
    }

    let json: any = null;
    try {
      if (text) json = JSON.parse(text);
    } catch (_) {}

    if (json && typeof json === "object") {
      if (!response.ok || !json?.success) {
        // Map status codes to friendly messages
        const status = response.status;
        let message = "Login failed. Please try again.";
        if (status === 401) message = "Incorrect email or password.";
        else if (status === 429)
          message = "Too many attempts. Please try again later.";
        else if (status === 503)
          message = "System under maintenance. Please try again later.";
        else if (status >= 500)
          message = "Server error. Please try again shortly.";
        else if (status === 0)
          message = "Network error. Please check your connection.";

        // Log detailed error info for debugging
        logError(
          `❌ Login failed with status ${status}`,
          `Server error: ${json.error}, Debug: ${JSON.stringify(json.debug)}`
        );

        // Prefer server-provided public message if available
        const serverMsg = typeof json.error === "string" ? json.error : "";
        const finalMsg =
          import.meta.env.MODE === "development" && serverMsg
            ? `${message} (${serverMsg})`
            : serverMsg && serverMsg.length < 120
              ? serverMsg
              : message;
        return { success: false, error: finalMsg };
      }
      try {
        localStorage.setItem("userEmail", json.user.email);
        localStorage.setItem("userRole", json.user.role);
        localStorage.setItem("userId", json.user.id);
      } catch (e) {
        warn(
          "⚠️ Storage unavailable, proceeding without persisting session:",
          (e as any)?.message || e,
        );
        try {
          sessionStorage.setItem("userEmail", json.user.email);
          sessionStorage.setItem("userRole", json.user.role);
          sessionStorage.setItem("userId", json.user.id);
        } catch (_) {}
      }
      return json;
    }

    // Non-JSON or unreadable body; return friendly error without developer details
    let friendly = "Login failed. Please try again.";
    if (response.status === 401) friendly = "Incorrect email or password.";
    else if (response.status === 503)
      friendly = "System under maintenance. Please try again later.";
    else if (response.status >= 500)
      friendly = "Server error. Please try again shortly.";
    else if (response.status === 0)
      friendly = "Network error. Please check your connection.";
    return {
      success: false,
      error: friendly,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    // Attempt background connection check but don't block login
    this.ensureConnection().catch((err) =>
      warn(`Background connection check failed: ${err?.message || JSON.stringify(err)}`),
    );

    try {
      const url = `${this.baseUrl}/auth/login`;
      log("🔎 Login request URL:", url);

      const ac = new AbortController();
      const timeoutHandler = createSafeTimeoutAbort(ac, 10000);

      try {
        log("🔎 Sending login request to:", url);
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          signal: ac.signal,
        });

        timeoutHandler.clearTimeout();
        log("📝 Login response received with status:", response.status);
        const processed = await this.processLoginResponse(response);

        // Update connection status on successful login
        if (processed.success) {
          this.isConnected = true;
          return processed;
        }

        if (
          processed.error?.toLowerCase().includes("cors") ||
          processed.error?.toLowerCase().includes("network")
        ) {
          logError(
            "🔄 CORS/Network error detected, retrying via same-origin fallback...",
          );
          const ac2 = new AbortController();
          const timeoutHandler2 = createSafeTimeoutAbort(ac2, 10000);
          try {
            const resp2 = await fetch(`/api/neon/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
              signal: ac2.signal,
            });
            timeoutHandler2.clearTimeout();
            log(
              "📝 Fallback login response received with status:",
              resp2.status,
            );
            const result = await this.processLoginResponse(resp2);
            if (result.success) {
              this.isConnected = true;
            }
            return result;
          } catch (retryErr: any) {
            timeoutHandler2.clearTimeout();
            logError(`❌ Retry login failed: ${retryErr?.message || JSON.stringify(retryErr)}`);
            return {
              success: false,
              error: "Login failed. Please try again.",
            };
          }
        }

        return processed;
      } catch (error: any) {
        timeoutHandler.clearTimeout();
        throw error;
      }
    } catch (error: any) {
      logError(`Database login failed: ${error?.message || JSON.stringify(error)}`);

      if (error?.name === "AbortError") {
        return {
          success: false,
          error: "Request timed out. Please try again.",
        };
      }

      if (
        error.message?.includes("NetworkError") ||
        error.message?.includes("Failed to fetch") ||
        error.name === "TypeError"
      ) {
        // Try fallback URL directly on network error
        try {
          log("🔄 Network error, trying fallback login...");
          const ac4 = new AbortController();
          const timeoutHandler4 = createSafeTimeoutAbort(ac4, 10000);
          try {
            const resp3 = await fetch(`/api/neon/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
              signal: ac4.signal,
            });
            timeoutHandler4.clearTimeout();
            const result = await this.processLoginResponse(resp3);
            if (result.success) {
              this.isConnected = true;
            }
            return result;
          } catch (err) {
            timeoutHandler4.clearTimeout();
            throw err;
          }
        } catch (e3: any) {
          logError(`❌ Fallback login also failed: ${e3?.message || JSON.stringify(e3)}`);
          return {
            success: false,
            error:
              "Unable to connect to server. Please check your internet connection.",
          };
        }
      }

      return {
        success: false,
        error: `Login failed: ${error.message || "Unknown error"}`,
      };
    }
  }

  async register(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    log("📝 Starting registration for:", userData.email);

    // Attempt background connection check but don't block registration
    this.ensureConnection().catch((err) =>
      warn(`Background connection check failed: ${err?.message || JSON.stringify(err)}`),
    );

    const tryRegister = async (
      url: string,
    ): Promise<{ success: boolean; user?: User; error?: string }> => {
      try {
        log("🔄 Attempting registration at:", url);
        const ac = new AbortController();
        const timeoutHandler = createSafeTimeoutAbort(ac, 15000);

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
            signal: ac.signal,
          });

          timeoutHandler.clearTimeout();
          log("📡 Registration response status:", response.status);

          const ct = response.headers.get("content-type") || "";
          let data: any = null;
          if (ct.includes("application/json")) {
            data = await response.json();
          } else {
            const txt = await response.text().catch(() => "");
            try {
              data = JSON.parse(txt);
            } catch {
              data = null;
            }
          }

          log("📦 Registration response data:", data);

          if (!response.ok || !data?.success) {
            const status = response.status;
            let msg = "Registration failed. Please try again.";
            if (status === 409) msg = "Account already exists.";
            else if (status === 400)
              msg = "Please check your details and try again.";
            else if (status === 503)
              msg = "System under maintenance. Try later.";
            else if (status >= 500)
              msg = "Server error. Please try again shortly.";
            return { success: false, error: msg };
          }

          log("✅ Registration successful!");
          // Update connection status on successful registration
          this.isConnected = true;
          return data;
        } catch (error) {
          timeoutHandler.clearTimeout();
          throw error;
        }
      } catch (error: any) {
        logError(`❌ Registration attempt failed: ${error?.message || JSON.stringify(error)}`);
        if (error?.name === "AbortError") {
          return {
            success: false,
            error: "Request timed out. Please try again.",
          };
        }
        throw error;
      }
    };

    // Try primary URL first
    try {
      const primaryUrl = `${this.baseUrl}/auth/register`;
      return await tryRegister(primaryUrl);
    } catch (primaryError) {
      warn("⚠️ Primary registration URL failed, trying fallback...");
      // Try fallback URL
      try {
        const fallbackUrl = `/api/neon/auth/register`;
        return await tryRegister(fallbackUrl);
      } catch (fallbackError) {
        logError("❌ Both registration attempts failed");
        return {
          success: false,
          error:
            "Unable to connect to server. Please check your connection and try again.",
        };
      }
    }
  }

  // === BOOKINGS ===

  async createBooking(
    bookingData: Omit<
      Booking,
      "id" | "createdAt" | "updatedAt" | "confirmationCode"
    >,
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    // Do not block on connection state; attempt request with fallback
    this.ensureConnection().catch(() => {});

    const tryCreate = async (url: string) => {
      const ac = new AbortController();
      const timeoutHandler = createSafeTimeoutAbort(ac, 15000);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
          signal: ac.signal,
        });
        timeoutHandler.clearTimeout();
        const ct = response.headers.get("content-type") || "";
        const data = ct.includes("application/json")
          ? await response.json()
          : await response
              .text()
              .then((t) => {
                try {
                  return JSON.parse(t);
                } catch {
                  return { success: false, error: t || "Unknown error" };
                }
              })
              .catch(() => ({ success: false, error: "Unknown error" }));
        if (!response.ok || !data?.success) {
          return {
            success: false,
            error:
              data?.error ||
              `HTTP ${response.status}: Failed to create booking`,
          };
        }
        this.isConnected = true;
        return data;
      } catch (e: any) {
        timeoutHandler.clearTimeout();
        if (e?.name === "AbortError") {
          return {
            success: false,
            error: "Request timed out. Please try again.",
          };
        }
        return { success: false, error: e?.message || "Network error" };
      }
    };

    // Primary
    const primary = await tryCreate(`${this.baseUrl}/bookings`);
    if (primary.success) return primary;

    // Fallback same-origin
    const fallback = await tryCreate(`/api/neon/bookings`);
    return fallback;
  }

  async getSlotAvailability(
    date: string,
    timeSlot: string,
    branch: string,
  ): Promise<{
    success: boolean;
    data?: {
      isAvailable: boolean;
      currentBookings: number;
      maxCapacity: number;
      availableBays: number[];
    };
    error?: string;
  }> {
    const params = new URLSearchParams({
      date,
      timeSlot,
      branch,
    });

    try {
      const response = await fetch(
        `${this.baseUrl}/bookings/availability?${params}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        return {
          success: false,
          error: data?.error || `HTTP ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      // Fallback to same-origin
      try {
        const response = await fetch(
          `/api/neon/bookings/availability?${params}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        const data = await response.json();
        return data;
      } catch (fallbackError) {
        console.error("Slot availability fetch failed:", fallbackError);
        return {
          success: false,
          error: "Unable to check availability. Please try again.",
        };
      }
    }
  }

  async getGarageSettings(): Promise<{
    success: boolean;
    data?: {
      currentTime: string;
      currentHour: number;
      currentMinute: number;
      currentDate: string;
      garageOpenTime: number;
      garageCloseTime: number;
      isGarageOpen: boolean;
      timezone: string;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/garage-settings`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        return {
          success: false,
          error: data?.error || `HTTP ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      // Fallback to same-origin
      try {
        const response = await fetch(`/api/neon/bookings/garage-settings`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        return data;
      } catch (fallbackError) {
        console.error("Garage settings fetch failed:", fallbackError);
        return {
          success: false,
          error: "Unable to fetch garage settings",
        };
      }
    }
  }

  async getBookings(params?: {
    userId?: string;
    status?: string;
    branch?: string;
    userEmail?: string;
    userRole?: string;
  }): Promise<{
    success: boolean;
    bookings?: Booking[];
    canViewAllBranches?: boolean;
    userBranch?: string | null;
  }> {
    if (!this.isConnected) {
      return { success: false, bookings: [] };
    }

    try {
      const queryParams = new URLSearchParams();
      if (params?.userId) queryParams.append("userId", params.userId);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.branch) queryParams.append("branch", params.branch);
      if (params?.userEmail) queryParams.append("userEmail", params.userEmail);
      if (params?.userRole) queryParams.append("userRole", params.userRole);

      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/bookings?${queryParams}`, {
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Database booking fetch failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Bookings fetch timed out");
      }
      return { success: false, bookings: [] };
    }
  }

  async updateBooking(
    id: string,
    updates: Partial<Booking>,
  ): Promise<{ success: boolean; booking?: Booking }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Database booking update failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Booking update timed out");
      }
      return { success: false };
    }
  }

  // === SUBSCRIPTIONS ===

  async getSubscriptions(params?: {
    status?: string;
    userId?: string;
  }): Promise<{
    success: boolean;
    subscriptions?: any[];
    error?: string;
  }> {
    if (!this.isConnected) {
      return { success: false, subscriptions: [] };
    }

    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.userId) queryParams.append("userId", params.userId);

      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const url = `${this.baseUrl}/subscriptions?${queryParams.toString()}`;
      console.log("📋 Fetching subscriptions from:", url);

      const response = await fetch(url, { signal: ac.signal });

      clearTimeout(to);

      // Check response status first
      if (!response.ok) {
        console.error(
          "❌ Subscription fetch failed with status:",
          response.status,
        );
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          try {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            return {
              success: false,
              subscriptions: [],
              error: errorData.error,
            };
          } catch (parseErr) {
            console.error("Failed to parse error response:", parseErr);
            return {
              success: false,
              subscriptions: [],
              error: `HTTP ${response.status}`,
            };
          }
        } else {
          const text = await response.text();
          console.error("Non-JSON error response:", text.substring(0, 200));
          return {
            success: false,
            subscriptions: [],
            error: "Invalid response format",
          };
        }
      }

      // Parse successful response
      try {
        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          console.error("❌ Response content-type is not JSON:", contentType);
          const text = await response.text();
          console.error("Response body:", text.substring(0, 200));
          return {
            success: false,
            subscriptions: [],
            error: "Invalid content type",
          };
        }

        const result = await response.json();
        console.log(
          "✅ Subscriptions fetched successfully:",
          result?.subscriptions?.length || 0,
        );
        return result;
      } catch (parseErr) {
        console.error("❌ Failed to parse subscription response:", parseErr);
        return {
          success: false,
          subscriptions: [],
          error: "Failed to parse response",
        };
      }
    } catch (error: any) {
      console.error("❌ Database subscription fetch failed:", error);
      if (error?.name === "AbortError") {
        console.warn("⚠️ Subscriptions fetch timed out");
      }
      return { success: false, subscriptions: [] };
    }
  }

  // === NOTIFICATIONS ===

  async getNotifications(
    userId: string,
    userRole: string,
  ): Promise<{ success: boolean; notifications?: SystemNotification[] }> {
    if (!this.isConnected) {
      return { success: false, notifications: [] };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(
        `${this.baseUrl}/notifications?userId=${userId}&userRole=${userRole}`,
        { signal: ac.signal },
      );

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Database notification fetch failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Notifications fetch timed out");
      }
      return { success: false, notifications: [] };
    }
  }

  async markNotificationAsRead(
    notificationId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 5000);

      const response = await fetch(
        `${this.baseUrl}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
          signal: ac.signal,
        },
      );

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Database notification update failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Notification update timed out");
      }
      return { success: false };
    }
  }

  // === ADMIN SETTINGS ===

  async getSettings(): Promise<{
    success: boolean;
    settings?: AdminSetting[];
  }> {
    if (!this.isConnected) {
      return { success: false, settings: [] };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/settings`, {
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Database settings fetch failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Settings fetch timed out");
      }
      return { success: false, settings: [] };
    }
  }

  async updateSetting(
    key: string,
    value: any,
    description?: string,
    category?: string,
  ): Promise<{ success: boolean; setting?: AdminSetting }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, description, category }),
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Database setting update failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Setting update timed out");
      }
      return { success: false };
    }
  }

  // === ADS ===

  async getAds(): Promise<{ success: boolean; ads?: Ad[] }> {
    if (!this.isConnected) {
      return { success: false, ads: [] };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/ads`, {
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Database ads fetch failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Ads fetch timed out");
      }
      return { success: false, ads: [] };
    }
  }

  async createAd(
    adData: Omit<Ad, "id" | "createdAt" | "updatedAt">,
  ): Promise<{ success: boolean; ad?: Ad }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 10000);

      const response = await fetch(`${this.baseUrl}/ads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adData),
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Database ad creation failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  async dismissAd(
    adId: string,
    userEmail: string,
  ): Promise<{ success: boolean }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/ads/${adId}/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail }),
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Database ad dismissal failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Ad dismissal timed out");
      }
      return { success: false };
    }
  }

  // === USERS ===

  async getCustomers(): Promise<{ success: boolean; users?: User[] }> {
    console.log("🔗 getCustomers called, connection status:", this.isConnected);
    if (!this.isConnected) {
      console.warn("⚠️ Database not connected for getCustomers");
      return { success: false, users: [] };
    }

    try {
      const url = `${this.baseUrl}/customers`;
      log("📞 Making request to", url);
      const response = await fetch(url);
      log("📥 Response status:", response.status, response.statusText);

      if (!response.ok) {
        console.error(
          "❌ Response not OK:",
          response.status,
          response.statusText,
        );
        const text = await response.text();
        console.error("Response body:", text);
        return { success: false, users: [] };
      }

      const result = await response.json();
      info("✅ getCustomers result:", result);
      return result;
    } catch (error) {
      console.error("❌ Database customers fetch failed:", error);
      return { success: false, users: [] };
    }
  }

  async getBranches(): Promise<{
    success: boolean;
    branches?: any[];
    error?: string;
  }> {
    // Simple timeout wrapper using Promise.race
    const fetchWithTimeout = (
      url: string,
      timeoutMs: number = 1500,
    ): Promise<any> => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs),
      );

      const fetchPromise = fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      });

      return Promise.race([fetchPromise, timeoutPromise]);
    };

    // Try to fetch from API with timeout
    try {
      const result = await fetchWithTimeout("/api/neon/branches", 1500);
      if (
        result?.success &&
        Array.isArray(result.branches) &&
        result.branches.length > 0
      ) {
        return result;
      }
    } catch {
      // Silently fail - expected behavior when offline/slow
    }

    // Always use fallback - no logging, just seamless fallback
    try {
      const branches = await FallbackService.getBranches();
      return { success: true, branches };
    } catch {
      return { success: true, branches: [] };
    }
  }

  async createBranch(data: {
    name: string;
    code: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    managerName?: string;
    managerPhone?: string;
    type?: string;
    timezone?: string;
  }): Promise<{ success: boolean; branch?: any; error?: string }> {
    if (!this.isConnected) {
      return { success: false, error: "Database not connected" };
    }
    try {
      const response = await fetch(`${this.baseUrl}/neon/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          code: data.code,
          address: data.address || null,
          city: data.city || "Zamboanga City",
          phone: data.phone || null,
          email: data.email || null,
          managerName: data.managerName || null,
          managerPhone: data.managerPhone || null,
          type: data.type || "full_service",
          timezone: data.timezone || "Asia/Manila",
        }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Create branch failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create branch",
      };
    }
  }

  async updateBranch(
    branchId: string,
    data: Partial<{
      name: string;
      address: string;
      city: string;
      phone: string;
      email: string;
      managerName: string;
      managerPhone: string;
    }>,
  ): Promise<{ success: boolean; branch?: any; error?: string }> {
    if (!this.isConnected) {
      return { success: false, error: "Database not connected" };
    }
    try {
      const response = await fetch(
        `${this.baseUrl}/neon/branches/${branchId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Update branch failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update branch",
      };
    }
  }

  async deleteBranch(
    branchId: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConnected) {
      return { success: false, error: "Database not connected" };
    }
    try {
      const response = await fetch(
        `${this.baseUrl}/neon/branches/${branchId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Delete branch failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete branch",
      };
    }
  }

  async getStaffUsers(): Promise<{ success: boolean; users?: User[] }> {
    console.log(
      "🔗 getStaffUsers called, connection status:",
      this.isConnected,
    );
    if (!this.isConnected) {
      console.warn("⚠️ Database not connected for getStaffUsers");
      return { success: false, users: [] };
    }

    try {
      const url = `${this.baseUrl}/staff`;
      log("📞 Making request to", url);
      const response = await fetch(url);
      log("📥 Response status:", response.status, response.statusText);

      if (!response.ok) {
        console.error(
          "�� Response not OK:",
          response.status,
          response.statusText,
        );
        const text = await response.text();
        console.error("Response body:", text);
        return { success: false, users: [] };
      }

      const result = await response.json();
      console.log("✅ getStaffUsers result:", result);
      return result;
    } catch (error) {
      console.error("❌ Database staff users fetch failed:", error);
      return { success: false, users: [] };
    }
  }

  async createStaffUser(userData: {
    fullName: string;
    email: string;
    role: string;
    permissions: string[];
    contactNumber?: string;
    branchLocation: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.isConnected) {
      return { success: false, error: "Database not connected" };
    }

    try {
      const response = await fetch(`${this.baseUrl}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("��� Database staff user creation failed:", error);
      return { success: false, error: "Failed to create staff user" };
    }
  }

  // Backward compatibility - now fetches all users (customers + staff)
  async getUsers(): Promise<{ success: boolean; users?: User[] }> {
    console.log("🔗 getUsers called, connection status:", this.isConnected);
    if (!this.isConnected) {
      console.warn("���️ Database not connected for getUsers");
      return { success: false, users: [] };
    }

    try {
      const url = `${this.baseUrl}/users`;
      log("📞 Making request to", url);
      const response = await fetch(url);
      log("📥 Response status:", response.status, response.statusText);

      if (!response.ok) {
        console.error(
          "❌ Response not OK:",
          response.status,
          response.statusText,
        );
        const text = await response.text();
        console.error("Response body:", text);
        return { success: false, users: [] };
      }

      const result = await response.json();
      console.log("✅ getUsers result:", result);
      return result;
    } catch (error) {
      console.error("❌ Database users fetch failed:", error);
      return { success: false, users: [] };
    }
  }

  // === USER VEHICLES & ADDRESS ===

  async getUserVehicles(
    userId: string,
  ): Promise<{ success: boolean; vehicles?: UserVehicle[] }> {
    if (!this.isConnected) {
      return { success: false, vehicles: [] };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/users/${userId}/vehicles`, {
        signal: ac.signal,
      });

      clearTimeout(to);

      // Check if response is ok before parsing
      if (!response.ok) {
        console.warn(`Get user vehicles failed: HTTP ${response.status}`);
        return { success: false, vehicles: [] };
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Get user vehicles: Response is not JSON");
        return { success: false, vehicles: [] };
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Get user vehicles failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Get vehicles timed out");
      }
      return { success: false, vehicles: [] };
    }
  }

  async addUserVehicle(
    userId: string,
    vehicle: Omit<UserVehicle, "id" | "createdAt">,
  ): Promise<{ success: boolean; vehicle?: UserVehicle }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 10000);

      const response = await fetch(`${this.baseUrl}/users/${userId}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicle),
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Add user vehicle failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  async updateUserVehicle(
    userId: string,
    vehicleId: string,
    updates: Partial<UserVehicle>,
  ): Promise<{ success: boolean; vehicle?: UserVehicle }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(
        `${this.baseUrl}/users/${userId}/vehicles/${vehicleId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
          signal: ac.signal,
        },
      );

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Update user vehicle failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  async deleteUserVehicle(
    userId: string,
    vehicleId: string,
  ): Promise<{ success: boolean }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(
        `${this.baseUrl}/users/${userId}/vehicles/${vehicleId}`,
        {
          method: "DELETE",
          signal: ac.signal,
        },
      );

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Delete user vehicle failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  // Admin utility to fix bookings with email in userId field
  async fixBookingUserIds(): Promise<{
    success: boolean;
    fixed?: number;
    total?: number;
    errors?: string[];
  }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/admin/fix-booking-userids`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Fix booking userIds failed:", error);
      return { success: false };
    }
  }

  async updateUserAddress(
    userId: string,
    defaultAddress: string,
  ): Promise<{ success: boolean; user?: User }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/users/${userId}/address`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultAddress }),
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Update user address failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  // Helper: fetch JSON with timeout and same-origin fallback
  private async fetchJsonWithFallback(
    path: string,
    timeoutMs = 8000,
  ): Promise<any> {
    const makeUrl = (base: string) => {
      const cleanBase = base.replace(/\/$/, "");
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      return `${cleanBase}${cleanPath}`;
    };

    const tryOnce = async (url: string) => {
      console.log(`🔄 Attempting fetch to: ${url}`);
      const ac = new AbortController();
      const to = setTimeout(() => {
        console.warn(`⏰ Request timeout (${timeoutMs}ms) for: ${url}`);
        ac.abort();
      }, timeoutMs);

      try {
        const res = await fetch(url, {
          signal: ac.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        clearTimeout(to);

        console.log(`📡 Response status: ${res.status} for ${url}`);

        if (!res.ok) {
          const text = await res.text().catch(() => "No response body");
          const errorMsg = `HTTP ${res.status}: ${text?.slice(0, 200)}`;
          console.error(`❌ Request failed: ${errorMsg}`);
          throw new Error(errorMsg);
        }

        const ct = res.headers.get("content-type") || "";
        console.log(`📋 Content-Type: ${ct}`);

        if (ct.includes("application/json")) {
          const jsonResult = await res.json();
          console.log(`�� JSON response received from ${url}`);
          return jsonResult;
        }

        const txt = await res.text();
        try {
          const parsedJson = JSON.parse(txt);
          console.log(`✅ Text parsed as JSON from ${url}`);
          return parsedJson;
        } catch (parseError) {
          console.error(
            `❌ Invalid JSON response from ${url}:`,
            txt.slice(0, 100),
          );
          throw new Error(`Invalid JSON response: ${txt.slice(0, 100)}`);
        }
      } catch (e) {
        clearTimeout(to);
        console.error(`❌ Fetch error for ${url}:`, e);
        throw e;
      }
    };

    const primaryUrl = makeUrl(this.baseUrl);
    const fallbackUrl = makeUrl("/api/neon");

    console.log(`🔍 Attempting fetchJsonWithFallback for path: ${path}`);
    console.log(`🎯 Primary URL: ${primaryUrl}`);
    console.log(`🔄 Fallback URL: ${fallbackUrl}`);

    try {
      const result = await tryOnce(primaryUrl);
      console.log(`✅ Primary request succeeded for ${path}`);
      return result;
    } catch (e1) {
      console.warn(
        `⚠️ Primary request failed for ${path}, trying fallback...`,
        e1,
      );
      try {
        const result = await tryOnce(fallbackUrl);
        console.log(`✅ Fallback request succeeded for ${path}`);
        return result;
      } catch (e2) {
        console.error(`❌ Both requests failed for ${path}:`, {
          primary: e1,
          fallback: e2,
        });
        throw new Error(
          `All requests failed for ${path}. Primary: ${e1}. Fallback: ${e2}`,
        );
      }
    }
  }

  // === REAL-TIME STATS ===

  async getRealtimeStats(): Promise<{ success: boolean; stats?: any }> {
    try {
      // Check cache first
      if (
        this.realtimeStatsCache &&
        Date.now() - this.realtimeStatsCache.timestamp < this.cacheTTL
      ) {
        return this.realtimeStatsCache.data;
      }

      const connected = await this.ensureConnection();
      if (!connected) {
        console.warn("⚠️ getRealtimeStats: Database not connected");
        return { success: false, stats: null };
      }

      const result = await this.fetchJsonWithFallback("/realtime-stats");

      // Cache the result
      const processedResult =
        result?.success !== undefined
          ? result
          : { success: true, stats: result?.stats ?? result };

      this.realtimeStatsCache = {
        data: processedResult,
        timestamp: Date.now(),
      };
      return processedResult;
    } catch (error) {
      console.error("❌ Database realtime stats fetch failed:", error);
      return {
        success: false,
        stats: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // === STATS ===

  async getStats(
    period: string = "monthly",
  ): Promise<{ success: boolean; stats?: any }> {
    try {
      // Check cache first
      if (
        this.statsCache &&
        Date.now() - this.statsCache.timestamp < this.cacheTTL
      ) {
        return this.statsCache.data;
      }

      const connected = await this.ensureConnection();
      if (!connected) {
        console.warn("⚠️ getStats: Database not connected");
        return { success: false, stats: null };
      }

      const result = await this.fetchJsonWithFallback(
        `/stats?period=${period}`,
      );

      // Cache the result
      const processedResult =
        result?.success !== undefined
          ? result
          : { success: true, stats: result?.stats ?? result };

      this.statsCache = { data: processedResult, timestamp: Date.now() };
      return processedResult;
    } catch (error) {
      console.error("❌ Database stats fetch failed:", error);
      return {
        success: false,
        stats: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // === VOUCHERS ===
  async getVouchers(params?: {
    audience?: "all" | "registered";
    status?: "active";
  }): Promise<{ success: boolean; vouchers?: any[]; error?: string }> {
    await this.ensureConnection();
    const queryParams = new URLSearchParams();
    if (params?.audience) queryParams.append("audience", params.audience);
    if (params?.status) queryParams.append("status", params.status);

    const url = `${this.baseUrl}/vouchers${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 8000);
    try {
      const res = await fetch(url, { signal: ac.signal });
      clearTimeout(to);
      const json = await res.json();
      return json;
    } catch (e: any) {
      clearTimeout(to);
      return {
        success: false,
        error: e?.message || "Network error",
        vouchers: [],
      };
    }
  }

  async validateVoucher(params: {
    code: string;
    bookingAmount: number;
    userEmail?: string;
    bookingType?: "guest" | "registered";
  }): Promise<{
    success: boolean;
    data?: {
      code: string;
      title: string;
      discountType: "percentage" | "fixed_amount";
      discountValue: number;
      discountAmount: number;
      finalAmount: number;
      audience: "all" | "registered";
    };
    error?: string;
  }> {
    await this.ensureConnection();
    const url = `${this.baseUrl}/vouchers/validate`;
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 8000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        signal: ac.signal,
      });
      clearTimeout(to);
      const json = await res.json();
      return json;
    } catch (e: any) {
      clearTimeout(to);
      return { success: false, error: e?.message || "Network error" };
    }
  }

  async redeemVoucher(params: {
    code: string;
    userEmail?: string;
    bookingId: string;
    discountAmount: number;
  }): Promise<{
    success: boolean;
    id?: string;
    error?: string;
    message?: string;
  }> {
    await this.ensureConnection();
    const url = `${this.baseUrl}/vouchers/redeem`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || "Network error" };
    }
  }

  // === INVENTORY MANAGEMENT ===

  // Inventory items
  async getInventoryItems(): Promise<{ success: boolean; items?: any[] }> {
    if (!this.isConnected) {
      return { success: false, items: [] };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/inventory/items`, {
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Inventory items fetch failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Inventory fetch timed out");
      }
      return { success: false, items: [] };
    }
  }

  async createInventoryItem(itemData: {
    name: string;
    category: string;
    description?: string;
    currentStock: number;
    minStockLevel: number;
    maxStockLevel: number;
    unitPrice?: number;
    supplier?: string;
    barcode?: string;
  }): Promise<{ success: boolean; item?: any }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 10000);

      const response = await fetch(`${this.baseUrl}/inventory/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Inventory item creation failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  async updateInventoryItem(
    id: string,
    updates: any,
  ): Promise<{ success: boolean; item?: any }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/inventory/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Inventory item update failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  async deleteInventoryItem(id: string): Promise<{ success: boolean }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/inventory/items/${id}`, {
        method: "DELETE",
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Inventory item deletion failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  async updateInventoryStock(
    id: string,
    newStock: number,
    reason: string,
    notes?: string,
  ): Promise<{ success: boolean }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(
        `${this.baseUrl}/inventory/items/${id}/stock`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newStock,
            reason,
            notes,
            performedBy: localStorage.getItem("userEmail") || "unknown",
          }),
          signal: ac.signal,
        },
      );

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Inventory stock update failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  // Stock movements
  async getStockMovements(
    itemId?: string,
    limit?: number,
  ): Promise<{ success: boolean; movements?: any[] }> {
    if (!this.isConnected) {
      return { success: false, movements: [] };
    }

    try {
      const params = new URLSearchParams();
      if (itemId) params.append("itemId", itemId);
      if (limit) params.append("limit", limit.toString());

      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(
        `${this.baseUrl}/inventory/movements?${params}`,
        { signal: ac.signal },
      );

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Stock movements fetch failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Stock movements fetch timed out");
      }
      return { success: false, movements: [] };
    }
  }

  async createStockMovement(movementData: {
    itemId: string;
    type: "in" | "out" | "adjustment";
    quantity: number;
    reason: string;
    reference?: string;
    notes?: string;
  }): Promise<{ success: boolean; movement?: any }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 10000);

      const response = await fetch(`${this.baseUrl}/inventory/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...movementData,
          performedBy: localStorage.getItem("userEmail") || "unknown",
        }),
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Stock movement creation failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  // Suppliers
  async getSuppliers(): Promise<{ success: boolean; suppliers?: any[] }> {
    if (!this.isConnected) {
      return { success: false, suppliers: [] };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/inventory/suppliers`, {
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Suppliers fetch failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Suppliers fetch timed out");
      }
      return { success: false, suppliers: [] };
    }
  }

  async createSupplier(supplierData: {
    name: string;
    contactPerson: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    paymentTerms?: string;
    notes?: string;
  }): Promise<{ success: boolean; supplier?: any }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 10000);

      const response = await fetch(`${this.baseUrl}/inventory/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierData),
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Supplier creation failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  async updateSupplier(
    id: string,
    updates: any,
  ): Promise<{ success: boolean; supplier?: any }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(
        `${this.baseUrl}/inventory/suppliers/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
          signal: ac.signal,
        },
      );

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Supplier update failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  async deleteSupplier(id: string): Promise<{ success: boolean }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(
        `${this.baseUrl}/inventory/suppliers/${id}`,
        {
          method: "DELETE",
          signal: ac.signal,
        },
      );

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Supplier deletion failed:", error);
      if (error?.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false };
    }
  }

  // Analytics
  async getInventoryAnalytics(): Promise<{
    success: boolean;
    analytics?: any;
  }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/inventory/analytics`, {
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Inventory analytics fetch failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Analytics fetch timed out");
      }
      return { success: false };
    }
  }

  async getLowStockItems(): Promise<{ success: boolean; items?: any[] }> {
    if (!this.isConnected) {
      return { success: false, items: [] };
    }

    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/inventory/low-stock`, {
        signal: ac.signal,
      });

      clearTimeout(to);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Low stock items fetch failed:", error);
      if (error?.name === "AbortError") {
        console.warn("Low stock items fetch timed out");
      }
      return { success: false, items: [] };
    }
  }
}

// Export singleton instance
export const neonDbClient = new NeonDatabaseClient();
export default neonDbClient;
