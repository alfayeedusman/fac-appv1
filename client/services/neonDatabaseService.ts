// Client-side service to interact with Neon database via API
import { toast } from "@/hooks/use-toast";

// Types based on our database schema
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
  carUnit?: string;
  carPlateNumber?: string;
  carType?: string;
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
  paymentMethod?: "cash" | "online" | "gcash";
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

class NeonDatabaseClient {
  private baseUrl: string;
  private isConnected = false;
  private initializationPromise: Promise<boolean> | null = null;

  constructor() {
    // Ensure baseUrl is properly constructed
    const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
    this.baseUrl = `${apiBase}/neon`;
    console.log('🔗 NeonDatabaseClient baseUrl:', this.baseUrl);
  }

  // Initialize and test connection
  async initialize(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      this.isConnected = result.success;

      if (result.success) {
        toast({
          title: "Database Connected",
          description: "Neon database initialized successfully",
        });
      } else {
        console.error("Database initialization failed:", result.error);
      }

      return result.success;
    } catch (error) {
      console.error("Database initialization error:", error);
      this.isConnected = false;
      return false;
    }
  }

  async testConnection(): Promise<{
    connected: boolean;
    stats?: any;
    error?: string;
  }> {
    const tryFetch = async (url: string, timeoutMs = 8000) => {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), timeoutMs);
      try {
        const res = await fetch(url, { signal: ac.signal });
        clearTimeout(to);
        return res;
      } catch (e) {
        clearTimeout(to);
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
            console.log("✅ Database connection test successful");
          } else {
            console.warn("⚠️ Database connection test returned false");
          }
          return result;
        }
        console.error(`Connection test failed: HTTP ${response.status}`);
      } catch (err) {
        console.warn(
          "Primary connection test failed:",
          (err as any).message || err,
        );
      }

      // 2) Fallback to same-origin relative API
      const fallbackUrl = `/api/neon/test`;
      try {
        const response = await tryFetch(fallbackUrl, 8000);
        if (response.ok) {
          const result = await response.json();
          this.isConnected = result.connected || result.success || false;
          if (this.isConnected) {
            console.log("✅ Fallback connection test successful");
          } else {
            console.warn("⚠️ Fallback connection test returned false");
          }
          return result;
        }
        console.error(
          `Fallback connection test failed: HTTP ${response.status}`,
        );
      } catch (err) {
        console.warn(
          "Fallback connection test failed:",
          (err as any).message || err,
        );
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
      console.error("❌ Connection test failed:", error.message || error);
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
      console.log("🔄 Auto-initializing Neon database...");

      // First try test connection
      const testResult = await this.testConnection();
      if (testResult.connected) {
        return true;
      }

      // If test fails, try full initialization
      const initResult = await this.initialize();
      return initResult;
    } catch (error) {
      console.error("❌ Auto-initialization failed:", error);
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
      console.log("📝 Response status:", response.status, response.statusText);
      console.log("📝 Response URL:", response.url);
      console.log(
        "��� Content-Type:",
        response.headers.get("content-type") || "unknown",
      );
    } catch (_) {}

    // Read body ONCE as text to avoid bodyUsed/clone issues, then try JSON parse
    let text = "";
    try {
      text = await response.text();
    } catch (readErr: any) {
      console.error(
        "❌ Failed to read response body:",
        readErr?.message || readErr,
      );
      return {
        success: false,
        error: `Unable to read server response (HTTP ${response.status}).`,
      };
    }

    let json: any = null;
    try {
      if (text) json = JSON.parse(text);
    } catch (_) {}

    if (json && typeof json === "object") {
      if (!response.ok || !json?.success) {
        const errMsg = json?.error || `Login failed (HTTP ${response.status}).`;
        return { success: false, error: errMsg };
      }
      try {
        localStorage.setItem("userEmail", json.user.email);
        localStorage.setItem("userRole", json.user.role);
        localStorage.setItem("userId", json.user.id);
      } catch (e) {
        console.warn(
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

    const ct = response.headers.get("content-type") || "";
    const why = ct.includes("text/html")
      ? "HTML page returned instead of JSON."
      : "Invalid JSON response.";
    const preview = text ? text.substring(0, 200) : "";
    return {
      success: false,
      error:
        `${why} (HTTP ${response.status}). ${preview ? `Response: ${preview}` : ""}`.trim(),
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const connected = await this.ensureConnection();
    if (!connected) {
      console.error("❌ Unable to establish database connection for login");
      return {
        success: false,
        error:
          "Database connection failed. Please check your internet connection and try again.",
      };
    }

    try {
      const url = `${this.baseUrl}/auth/login`;
      console.log("🔎 Login request URL:", url);

      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 10000);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: ac.signal,
      });

      clearTimeout(to);
      const processed = await this.processLoginResponse(response);
      if (processed.success) return processed;

      if (
        processed.error?.toLowerCase().includes("cors") ||
        processed.error?.toLowerCase().includes("network")
      ) {
        console.log("🔄 Retrying login via same-origin fallback...");
        const ac2 = new AbortController();
        const to2 = setTimeout(() => ac2.abort(), 10000);
        try {
          const resp2 = await fetch(`/api/neon/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            signal: ac2.signal,
          });
          clearTimeout(to2);
          return await this.processLoginResponse(resp2);
        } catch (retryErr: any) {
          clearTimeout(to2);
          console.error(
            "❌ Retry login failed:",
            retryErr?.message || retryErr,
          );
          return {
            success: false,
            error: "Login failed after retry. Please try again.",
          };
        }
      }

      return processed;
    } catch (error: any) {
      console.error("Database login failed:", error);

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
        try {
          const health = await fetch("/api/health", {
            method: "GET",
            signal: AbortSignal.timeout(5000),
          });
          if (health.ok) {
            return {
              success: false,
              error: "Network looks fine, but login failed. Please try again.",
            };
          }
        } catch {}
        this.isConnected = false;
        const recon = await this.testConnection();
        if (recon.connected) {
          console.log("✅ Reconnected, retrying login once...");
          try {
            const resp3 = await fetch(`/api/neon/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
              signal: AbortSignal.timeout(10000),
            });
            return await this.processLoginResponse(resp3);
          } catch (e3: any) {
            console.error("❌ Retry login also failed:", e3?.message || e3);
          }
        }
        return {
          success: false,
          error:
            "Network connection error. Please check your internet and try again.",
        };
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
    if (!this.isConnected) {
      return {
        success: false,
        error: "Database not connected. Please connect to Neon database first.",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Database registration failed:", error);
      return {
        success: false,
        error: "Registration failed. Please check your connection.",
      };
    }
  }

  // === BOOKINGS ===

  async createBooking(
    bookingData: Omit<
      Booking,
      "id" | "createdAt" | "updatedAt" | "confirmationCode"
    >,
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    if (!this.isConnected) {
      return {
        success: false,
        error: "Database not connected. Please connect to Neon database first.",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Database booking creation failed:", error);
      return {
        success: false,
        error: "Failed to create booking. Please check your connection.",
      };
    }
  }

  async getBookings(params?: {
    userId?: string;
    status?: string;
  }): Promise<{ success: boolean; bookings?: Booking[] }> {
    if (!this.isConnected) {
      return { success: false, bookings: [] };
    }

    try {
      const queryParams = new URLSearchParams();
      if (params?.userId) queryParams.append("userId", params.userId);
      if (params?.status) queryParams.append("status", params.status);

      const response = await fetch(`${this.baseUrl}/bookings?${queryParams}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Database booking fetch failed:", error);
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
      const response = await fetch(`${this.baseUrl}/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Database booking update failed:", error);
      return { success: false };
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
      const response = await fetch(
        `${this.baseUrl}/notifications?userId=${userId}&userRole=${userRole}`,
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Database notification fetch failed:", error);
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
      const response = await fetch(
        `${this.baseUrl}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        },
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Database notification update failed:", error);
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
      const response = await fetch(`${this.baseUrl}/settings`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Database settings fetch failed:", error);
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
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, description, category }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Database setting update failed:", error);
      return { success: false };
    }
  }

  // === ADS ===

  async getAds(): Promise<{ success: boolean; ads?: Ad[] }> {
    if (!this.isConnected) {
      return { success: false, ads: [] };
    }

    try {
      const response = await fetch(`${this.baseUrl}/ads`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Database ads fetch failed:", error);
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
      const response = await fetch(`${this.baseUrl}/ads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Database ad creation failed:", error);
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
      const response = await fetch(`${this.baseUrl}/ads/${adId}/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Database ad dismissal failed:", error);
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
      console.log("📞 Making request to /api/neon/customers...");
      const response = await fetch("/api/neon/customers");
      console.log("📥 Response status:", response.status, response.statusText);

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
      console.log("✅ getCustomers result:", result);
      return result;
    } catch (error) {
      console.error("❌ Database customers fetch failed:", error);
      return { success: false, users: [] };
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
      console.log("📞 Making request to /api/neon/staff...");
      const response = await fetch("/api/neon/staff");
      console.log("📥 Response status:", response.status, response.statusText);

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
      const response = await fetch("/api/neon/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Database staff user creation failed:", error);
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
      console.log("📞 Making request to /api/neon/users...");
      const response = await fetch("/api/neon/users");
      console.log("📥 Response status:", response.status, response.statusText);

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
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
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
          console.log(`✅ JSON response received from ${url}`);
          return jsonResult;
        }

        const txt = await res.text();
        try {
          const parsedJson = JSON.parse(txt);
          console.log(`✅ Text parsed as JSON from ${url}`);
          return parsedJson;
        } catch (parseError) {
          console.error(`❌ Invalid JSON response from ${url}:`, txt.slice(0, 100));
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
      console.warn(`⚠️ Primary request failed for ${path}, trying fallback...`, e1);
      try {
        const result = await tryOnce(fallbackUrl);
        console.log(`✅ Fallback request succeeded for ${path}`);
        return result;
      } catch (e2) {
        console.error(`❌ Both requests failed for ${path}:`, { primary: e1, fallback: e2 });
        throw new Error(`All requests failed for ${path}. Primary: ${e1}. Fallback: ${e2}`);
      }
    }
  }

  // === REAL-TIME STATS ===

  async getRealtimeStats(): Promise<{ success: boolean; stats?: any }> {
    try {
      const connected = await this.ensureConnection();
      if (!connected) {
        console.warn('⚠️ getRealtimeStats: Database not connected');
        return { success: false, stats: null };
      }

      console.log('📊 Fetching realtime stats...');
      const result = await this.fetchJsonWithFallback("/realtime-stats");
      console.log('✅ Realtime stats received:', result);

      return result?.success !== undefined
        ? result
        : { success: true, stats: result?.stats ?? result };
    } catch (error) {
      console.error("❌ Database realtime stats fetch failed:", error);
      return {
        success: false,
        stats: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === STATS ===

  async getStats(): Promise<{ success: boolean; stats?: any }> {
    try {
      const connected = await this.ensureConnection();
      if (!connected) {
        console.warn('⚠️ getStats: Database not connected');
        return { success: false, stats: null };
      }

      console.log('📈 Fetching stats...');
      const result = await this.fetchJsonWithFallback("/stats");
      console.log('✅ Stats received:', result);

      return result?.success !== undefined
        ? result
        : { success: true, stats: result?.stats ?? result };
    } catch (error) {
      console.error("❌ Database stats fetch failed:", error);
      return {
        success: false,
        stats: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === INVENTORY MANAGEMENT ===

  // Inventory items
  async getInventoryItems(): Promise<{ success: boolean; items?: any[] }> {
    if (!this.isConnected) {
      return { success: false, items: [] };
    }

    try {
      const response = await fetch(`${this.baseUrl}/inventory/items`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Inventory items fetch failed:", error);
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
      const response = await fetch(`${this.baseUrl}/inventory/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Inventory item creation failed:", error);
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
      const response = await fetch(`${this.baseUrl}/inventory/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Inventory item update failed:", error);
      return { success: false };
    }
  }

  async deleteInventoryItem(id: string): Promise<{ success: boolean }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const response = await fetch(`${this.baseUrl}/inventory/items/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Inventory item deletion failed:", error);
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
        },
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Inventory stock update failed:", error);
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

      const response = await fetch(
        `${this.baseUrl}/inventory/movements?${params}`,
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Stock movements fetch failed:", error);
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
      const response = await fetch(`${this.baseUrl}/inventory/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...movementData,
          performedBy: localStorage.getItem("userEmail") || "unknown",
        }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Stock movement creation failed:", error);
      return { success: false };
    }
  }

  // Suppliers
  async getSuppliers(): Promise<{ success: boolean; suppliers?: any[] }> {
    if (!this.isConnected) {
      return { success: false, suppliers: [] };
    }

    try {
      const response = await fetch(`${this.baseUrl}/inventory/suppliers`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Suppliers fetch failed:", error);
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
      const response = await fetch(`${this.baseUrl}/inventory/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierData),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Supplier creation failed:", error);
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
      const response = await fetch(
        `${this.baseUrl}/inventory/suppliers/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        },
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Supplier update failed:", error);
      return { success: false };
    }
  }

  async deleteSupplier(id: string): Promise<{ success: boolean }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/inventory/suppliers/${id}`,
        {
          method: "DELETE",
        },
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Supplier deletion failed:", error);
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
      const response = await fetch(`${this.baseUrl}/inventory/analytics`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Inventory analytics fetch failed:", error);
      return { success: false };
    }
  }

  async getLowStockItems(): Promise<{ success: boolean; items?: any[] }> {
    if (!this.isConnected) {
      return { success: false, items: [] };
    }

    try {
      const response = await fetch(`${this.baseUrl}/inventory/low-stock`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Low stock items fetch failed:", error);
      return { success: false, items: [] };
    }
  }
}

// Export singleton instance
export const neonDbClient = new NeonDatabaseClient();
export default neonDbClient;
