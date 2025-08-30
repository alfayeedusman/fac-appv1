// Client-side service to interact with Neon database via API
import { toast } from '@/hooks/use-toast';

// Types based on our database schema
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin' | 'superadmin' | 'cashier' | 'inventory_manager' | 'manager' | 'crew';
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
  subscriptionStatus: 'free' | 'basic' | 'premium' | 'vip';
  subscriptionExpiry?: string;
  crewSkills?: string[];
  crewStatus?: 'available' | 'busy' | 'offline';
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
  type: 'registered' | 'guest';
  confirmationCode: string;
  category: 'carwash' | 'auto_detailing' | 'graphene_coating';
  service: string;
  unitType: 'car' | 'motorcycle';
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
  paymentMethod?: 'cash' | 'online' | 'gcash';
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
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetRoles: string[];
  targetUsers?: string[];
  data?: any;
  scheduledFor?: string;
  sentAt?: string;
  readBy: Array<{ userId: string; readAt: string }>;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'default' | 'destructive' | 'secondary';
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
  duration: 'weekly' | 'monthly' | 'yearly';
  isActive: boolean;
  targetPages: string[];
  adminEmail: string;
  impressions?: number;
  clicks?: number;
  createdAt: string;
  updatedAt: string;
}

class NeonDatabaseClient {
  private baseUrl = `${import.meta.env.VITE_API_BASE_URL || '/api'}/neon`;
  private isConnected = false;
  private initializationPromise: Promise<boolean> | null = null;

  // Initialize and test connection
  async initialize(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      this.isConnected = result.success;
      
      if (result.success) {
        toast({
          title: 'Database Connected',
          description: 'Neon database initialized successfully',
        });
      } else {
        console.error('Database initialization failed:', result.error);
      }
      
      return result.success;
    } catch (error) {
      console.error('Database initialization error:', error);
      this.isConnected = false;
      return false;
    }
  }

  async testConnection(): Promise<{ connected: boolean; stats?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/test`);

      if (!response.ok) {
        console.error(`Connection test failed: HTTP ${response.status}`);
        this.isConnected = false;
        return { connected: false };
      }

      const result = await response.json();
      this.isConnected = result.connected || result.success || false;

      if (this.isConnected) {
        console.log('✅ Database connection test successful');
      } else {
        console.warn('⚠️ Database connection test returned false');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Connection test failed:', error.message || error);
      this.isConnected = false;
      return { connected: false };
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
      console.log('🔄 Auto-initializing Neon database...');

      // First try test connection
      const testResult = await this.testConnection();
      if (testResult.connected) {
        return true;
      }

      // If test fails, try full initialization
      const initResult = await this.initialize();
      return initResult;
    } catch (error) {
      console.error('❌ Auto-initialization failed:', error);
      return false;
    }
  }

  // Database-only mode - no localStorage fallback
  private throwDatabaseError(operation: string): never {
    throw new Error(`Database operation failed: ${operation}. Please ensure Neon database is connected.`);
  }

  // === AUTHENTICATION ===
  
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Ensure connection before login attempt
    const connected = await this.ensureConnection();
    if (!connected) {
      console.error('❌ Unable to establish database connection for login');
      return { success: false, error: 'Database connection failed. Please check your internet connection and try again.' };
    }

    try {
      const url = `${this.baseUrl}/auth/login`;
      console.log('🔎 Login request URL:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!isJson) {
        const text = await response.text().catch(() => '');
        const statusInfo = `HTTP ${response.status} ${response.statusText}`;
        return { success: false, error: `Unexpected response from server (${statusInfo}). ${text ? 'Details: ' + text.slice(0,200) : ''}` };
      }

      const result = await response.json();
      if (!response.ok || !result.success) {
        return { success: false, error: result.error || `Login failed (HTTP ${response.status}).` };
      }

      // Store user session data
      localStorage.setItem('userEmail', result.user.email);
      localStorage.setItem('userRole', result.user.role);
      localStorage.setItem('userId', result.user.id);
      return result;
    } catch (error: any) {
      console.error('Database login failed:', error);

      // If it's a network error, try to reconnect
      if (error.message?.includes('fetch') || error.name === 'TypeError') {
        console.log('🔄 Network error detected, trying to reconnect...');
        this.isConnected = false;
        const reconnected = await this.testConnection();
        if (reconnected.connected) {
          console.log('✅ Reconnected, retrying login...');
          // Retry login once after reconnection
          try {
            const url = `${this.baseUrl}/auth/login`;
      console.log('🔎 Login request URL:', url);
      const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });

            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');
            if (!isJson) {
              const text = await response.text().catch(() => '');
              const statusInfo = `HTTP ${response.status} ${response.statusText}`;
              return { success: false, error: `Unexpected response from server (${statusInfo}). ${text ? 'Details: ' + text.slice(0,200) : ''}` };
            }

            const result = await response.json();
            if (!response.ok || !result.success) {
              return { success: false, error: result.error || `Login failed (HTTP ${response.status}).` };
            }

            localStorage.setItem('userEmail', result.user.email);
            localStorage.setItem('userRole', result.user.role);
            localStorage.setItem('userId', result.user.id);
            return result;
          } catch (retryError) {
            console.error('❌ Retry login also failed:', retryError);
          }
        }
      }

      return { success: false, error: `Login failed: ${error.message || 'Please check your connection.'}` };
    }
  }

  async register(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.isConnected) {
      return { success: false, error: 'Database not connected. Please connect to Neon database first.' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database registration failed:', error);
      return { success: false, error: 'Registration failed. Please check your connection.' };
    }
  }

  // === BOOKINGS ===

  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'confirmationCode'>): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    if (!this.isConnected) {
      return { success: false, error: 'Database not connected. Please connect to Neon database first.' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database booking creation failed:', error);
      return { success: false, error: 'Failed to create booking. Please check your connection.' };
    }
  }

  async getBookings(params?: { userId?: string; status?: string }): Promise<{ success: boolean; bookings?: Booking[] }> {
    if (!this.isConnected) {
      return { success: false, bookings: [] };
    }

    try {
      const queryParams = new URLSearchParams();
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.status) queryParams.append('status', params.status);

      const response = await fetch(`${this.baseUrl}/bookings?${queryParams}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database booking fetch failed:', error);
      return { success: false, bookings: [] };
    }
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<{ success: boolean; booking?: Booking }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const response = await fetch(`${this.baseUrl}/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database booking update failed:', error);
      return { success: false };
    }
  }

  // === NOTIFICATIONS ===

  async getNotifications(userId: string, userRole: string): Promise<{ success: boolean; notifications?: SystemNotification[] }> {
    if (!this.isConnected) {
      return { success: false, notifications: [] };
    }

    try {
      const response = await fetch(`${this.baseUrl}/notifications?userId=${userId}&userRole=${userRole}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database notification fetch failed:', error);
      return { success: false, notifications: [] };
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<{ success: boolean }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database notification update failed:', error);
      return { success: false };
    }
  }

  // === ADMIN SETTINGS ===

  async getSettings(): Promise<{ success: boolean; settings?: AdminSetting[] }> {
    if (!this.isConnected) {
      return { success: false, settings: [] };
    }

    try {
      const response = await fetch(`${this.baseUrl}/settings`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database settings fetch failed:', error);
      return { success: false, settings: [] };
    }
  }

  async updateSetting(key: string, value: any, description?: string, category?: string): Promise<{ success: boolean; setting?: AdminSetting }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, description, category }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database setting update failed:', error);
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
      console.error('Database ads fetch failed:', error);
      return { success: false, ads: [] };
    }
  }

  async createAd(adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; ad?: Ad }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const response = await fetch(`${this.baseUrl}/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database ad creation failed:', error);
      return { success: false };
    }
  }

  async dismissAd(adId: string, userEmail: string): Promise<{ success: boolean }> {
    if (!this.isConnected) {
      return { success: false };
    }

    try {
      const response = await fetch(`${this.baseUrl}/ads/${adId}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database ad dismissal failed:', error);
      return { success: false };
    }
  }

  // === STATS ===

  async getStats(): Promise<{ success: boolean; stats?: any }> {
    if (!this.isConnected) {
      return { success: false, stats: null };
    }

    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database stats fetch failed:', error);
      return { success: false, stats: null };
    }
  }
}

// Export singleton instance
export const neonDbClient = new NeonDatabaseClient();
export default neonDbClient;
