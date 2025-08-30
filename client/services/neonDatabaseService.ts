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
  private baseUrl = '/api/neon';
  private isConnected = false;

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
      const result = await response.json();
      this.isConnected = result.connected;
      return result;
    } catch (error) {
      console.error('Connection test failed:', error);
      return { connected: false };
    }
  }

  // Database-only mode - no localStorage fallback
  private throwDatabaseError(operation: string): never {
    throw new Error(`Database operation failed: ${operation}. Please ensure Neon database is connected.`);
  }

  // === AUTHENTICATION ===
  
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.isConnected) {
      return { success: false, error: 'Database not connected. Please connect to Neon database first.' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (result.success) {
        // Store user session data
        localStorage.setItem('userEmail', result.user.email);
        localStorage.setItem('userRole', result.user.role);
        localStorage.setItem('userId', result.user.id);
      }
      return result;
    } catch (error) {
      console.error('Database login failed:', error);
      return { success: false, error: 'Login failed. Please check your connection.' };
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
    // Try database first
    if (this.isConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Database booking creation failed, falling back to localStorage');
      }
    }

    // Fallback to localStorage
    const bookings = this.getFromLocalStorage('fac_bookings') || [];
    const newBooking = {
      ...bookingData,
      id: `FAC_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      confirmationCode: `FAC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(-3).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    this.setToLocalStorage('fac_bookings', bookings);
    return { success: true, booking: newBooking };
  }

  async getBookings(params?: { userId?: string; status?: string }): Promise<{ success: boolean; bookings?: Booking[] }> {
    // Try database first
    if (this.isConnected) {
      try {
        const queryParams = new URLSearchParams();
        if (params?.userId) queryParams.append('userId', params.userId);
        if (params?.status) queryParams.append('status', params.status);
        
        const response = await fetch(`${this.baseUrl}/bookings?${queryParams}`);
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Database booking fetch failed, falling back to localStorage');
      }
    }

    // Fallback to localStorage
    let bookings = this.getFromLocalStorage('fac_bookings') || [];
    
    if (params?.userId) {
      bookings = bookings.filter((b: Booking) => b.userId === params.userId);
    }
    if (params?.status) {
      bookings = bookings.filter((b: Booking) => b.status === params.status);
    }

    return { success: true, bookings };
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<{ success: boolean; booking?: Booking }> {
    // Try database first
    if (this.isConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/bookings/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Database booking update failed, falling back to localStorage');
      }
    }

    // Fallback to localStorage
    const bookings = this.getFromLocalStorage('fac_bookings') || [];
    const bookingIndex = bookings.findIndex((b: Booking) => b.id === id);
    
    if (bookingIndex === -1) {
      return { success: false };
    }

    bookings[bookingIndex] = { 
      ...bookings[bookingIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    
    this.setToLocalStorage('fac_bookings', bookings);
    return { success: true, booking: bookings[bookingIndex] };
  }

  // === NOTIFICATIONS ===

  async getNotifications(userId: string, userRole: string): Promise<{ success: boolean; notifications?: SystemNotification[] }> {
    // Try database first
    if (this.isConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/notifications?userId=${userId}&userRole=${userRole}`);
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Database notification fetch failed, falling back to localStorage');
      }
    }

    // Fallback to localStorage
    const notifications = this.getFromLocalStorage('system_notifications') || [];
    const userNotifications = notifications.filter((n: SystemNotification) => {
      return n.targetRoles.includes(userRole) || n.targetUsers?.includes(userId);
    });

    return { success: true, notifications: userNotifications };
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<{ success: boolean }> {
    // Try database first
    if (this.isConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Database notification update failed, falling back to localStorage');
      }
    }

    // Fallback to localStorage
    const notifications = this.getFromLocalStorage('system_notifications') || [];
    const notificationIndex = notifications.findIndex((n: SystemNotification) => n.id === notificationId);
    
    if (notificationIndex !== -1) {
      const notification = notifications[notificationIndex];
      const readBy = notification.readBy || [];
      
      if (!readBy.some((r: any) => r.userId === userId)) {
        readBy.push({ userId, readAt: new Date().toISOString() });
        notification.readBy = readBy;
        this.setToLocalStorage('system_notifications', notifications);
      }
    }

    return { success: true };
  }

  // === ADMIN SETTINGS ===

  async getSettings(): Promise<{ success: boolean; settings?: AdminSetting[] }> {
    // Try database first
    if (this.isConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/settings`);
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Database settings fetch failed, falling back to localStorage');
      }
    }

    // Fallback to localStorage
    const settings = this.getFromLocalStorage('admin_settings') || [];
    return { success: true, settings };
  }

  async updateSetting(key: string, value: any, description?: string, category?: string): Promise<{ success: boolean; setting?: AdminSetting }> {
    // Try database first
    if (this.isConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value, description, category }),
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Database setting update failed, falling back to localStorage');
      }
    }

    // Fallback to localStorage
    const settings = this.getFromLocalStorage('admin_settings') || [];
    const existingIndex = settings.findIndex((s: AdminSetting) => s.key === key);
    
    const setting = {
      id: existingIndex !== -1 ? settings[existingIndex].id : `setting_${Date.now()}`,
      key,
      value,
      description,
      category,
      createdAt: existingIndex !== -1 ? settings[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      settings[existingIndex] = setting;
    } else {
      settings.push(setting);
    }

    this.setToLocalStorage('admin_settings', settings);
    return { success: true, setting };
  }

  // === ADS ===

  async getAds(): Promise<{ success: boolean; ads?: Ad[] }> {
    // Try database first
    if (this.isConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/ads`);
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Database ads fetch failed, falling back to localStorage');
      }
    }

    // Fallback to localStorage
    const ads = this.getFromLocalStorage('fayeed_ads') || [];
    return { success: true, ads };
  }

  async createAd(adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; ad?: Ad }> {
    // Try database first
    if (this.isConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/ads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adData),
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Database ad creation failed, falling back to localStorage');
      }
    }

    // Fallback to localStorage
    const ads = this.getFromLocalStorage('fayeed_ads') || [];
    const newAd = {
      ...adData,
      id: `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    ads.push(newAd);
    this.setToLocalStorage('fayeed_ads', ads);
    return { success: true, ad: newAd };
  }

  async dismissAd(adId: string, userEmail: string): Promise<{ success: boolean }> {
    // Try database first
    if (this.isConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/ads/${adId}/dismiss`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail }),
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Database ad dismissal failed, falling back to localStorage');
      }
    }

    // Fallback to localStorage
    const dismissals = this.getFromLocalStorage('fayeed_ad_dismissals') || [];
    dismissals.push({
      adId,
      userEmail,
      dismissedAt: new Date().toISOString(),
    });
    this.setToLocalStorage('fayeed_ad_dismissals', dismissals);
    return { success: true };
  }

  // === STATS ===

  async getStats(): Promise<{ success: boolean; stats?: any }> {
    // Try database first
    if (this.isConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/stats`);
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Database stats fetch failed, falling back to localStorage');
      }
    }

    // Fallback to localStorage - calculate stats from local data
    const users = this.getFromLocalStorage('fac_users') || [];
    const bookings = this.getFromLocalStorage('fac_bookings') || [];
    const ads = this.getFromLocalStorage('fayeed_ads') || [];
    
    const stats = {
      totalUsers: users.length,
      totalBookings: bookings.length,
      activeAds: ads.filter((ad: Ad) => ad.isActive).length,
      pendingBookings: bookings.filter((booking: Booking) => booking.status === 'pending').length,
    };

    return { success: true, stats };
  }
}

// Export singleton instance
export const neonDbClient = new NeonDatabaseClient();
export default neonDbClient;
