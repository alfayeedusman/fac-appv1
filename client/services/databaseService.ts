// Database service to replace localStorage with proper MySQL backend
import { type Booking } from "@/utils/databaseSchema";

const API_BASE_URL = '/api';

interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export class DatabaseService {
  private static authToken: string | null = null;

  // Set authentication token
  static setAuthToken(token: string) {
    this.authToken = token;
  }

  // Get authentication headers
  private static getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  // Generic API request method
  private static async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options,
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;

        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If JSON parsing fails, use the status message
            errorMessage = `API error: ${response.status} ${response.statusText}`;
          }
        } else {
          // For non-JSON responses (like HTML error pages)
          const textResponse = await response.text();
          if (textResponse.includes('Cannot GET') || textResponse.includes('404')) {
            errorMessage = 'API endpoint not found. Backend server may not be running.';
          } else {
            errorMessage = `Server returned non-JSON response: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      if (!isJson) {
        throw new Error('Server returned non-JSON response. Expected JSON data.');
      }

      return response.json();
    } catch (error: any) {
      // Handle network errors (server not running, etc.)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  // ============= USER MANAGEMENT =============
  
  // Sync user with database
  static async syncUser(userData: {
    firebase_uid: string;
    email: string;
    full_name: string;
    phone_number?: string;
    address?: string;
    profile_image_url?: string;
  }): Promise<ApiResponse> {
    return this.apiRequest('/users/sync', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<any> {
    return this.apiRequest(`/users/${userId}/profile`);
  }

  // ============= VEHICLE MANAGEMENT =============
  
  // Get user vehicles
  static async getUserVehicles(userId: string): Promise<any[]> {
    return this.apiRequest(`/users/${userId}/vehicles`);
  }

  // Add vehicle
  static async addVehicle(userId: string, vehicleData: {
    vehicle_type: string;
    car_model: string;
    plate_number: string;
    color?: string;
    year?: number;
    is_default?: boolean;
  }): Promise<ApiResponse> {
    return this.apiRequest(`/users/${userId}/vehicles`, {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  // ============= BOOKING MANAGEMENT =============
  
  // Create booking
  static async createBooking(bookingData: {
    service_id: number;
    branch_id: number;
    vehicle_id?: number;
    scheduled_date: string;
    vehicle_type?: string;
    plate_number?: string;
    special_instructions?: string;
    payment_method: string;
    total_amount: number;
  }): Promise<{ booking_id: number }> {
    return this.apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  // Get user bookings
  static async getUserBookings(userId: string, limit: number = 50): Promise<any[]> {
    return this.apiRequest(`/users/${userId}/bookings?limit=${limit}`);
  }

  // ============= SERVICE MANAGEMENT =============
  
  // Get all services
  static async getServices(): Promise<any[]> {
    return this.apiRequest('/services');
  }

  // Get service price for vehicle type
  static async getServicePrice(serviceId: number, vehicleType: string): Promise<{ price: number }> {
    return this.apiRequest(`/services/${serviceId}/price?vehicle_type=${vehicleType}`);
  }

  // ============= BRANCH MANAGEMENT =============
  
  // Get all branches
  static async getBranches(): Promise<any[]> {
    return this.apiRequest('/branches');
  }

  // ============= QR CODE FUNCTIONALITY =============
  
  // QR Check-in
  static async qrCheckin(data: {
    user_id: string;
    branch_id: number;
    qr_code_data: string;
    timestamp: string;
  }): Promise<ApiResponse> {
    return this.apiRequest('/qr/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============= OTP FUNCTIONALITY =============
  
  // Send OTP
  static async sendOTP(email: string, type: 'signup' | 'forgot_password' | 'login'): Promise<ApiResponse> {
    return this.apiRequest('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    });
  }

  // Verify OTP
  static async verifyOTP(email: string, otp: string, type: 'signup' | 'forgot_password' | 'login'): Promise<ApiResponse & { firebaseUid?: string }> {
    return this.apiRequest('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp, type }),
    });
  }

  // Resend OTP
  static async resendOTP(email: string, type: 'signup' | 'forgot_password' | 'login'): Promise<ApiResponse> {
    return this.apiRequest('/otp/resend', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    });
  }

  // ============= MIGRATION UTILITIES =============
  
  // Migrate localStorage bookings to database
  static async migrateLocalStorageBookings(userId: string): Promise<{ migrated: number; errors: string[] }> {
    try {
      const userBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
      const guestBookings = JSON.parse(localStorage.getItem("guestBookings") || "[]");
      const allBookings = [...userBookings, ...guestBookings];
      
      let migrated = 0;
      const errors: string[] = [];
      
      for (const booking of allBookings) {
        try {
          // Map localStorage booking to database format
          const dbBooking = {
            service_id: this.mapServiceToId(booking.category, booking.service),
            branch_id: this.mapBranchToId(booking.branch),
            scheduled_date: `${booking.date} ${booking.timeSlot}:00`,
            vehicle_type: booking.unitType || 'sedan',
            plate_number: booking.plateNo || 'N/A',
            special_instructions: booking.notes || '',
            payment_method: booking.paymentMethod || 'cash',
            total_amount: booking.totalPrice || 0,
          };
          
          await this.createBooking(dbBooking);
          migrated++;
        } catch (error) {
          errors.push(`Failed to migrate booking: ${error}`);
        }
      }
      
      // Clear localStorage after successful migration
      if (migrated > 0) {
        localStorage.removeItem("userBookings");
        localStorage.removeItem("guestBookings");
      }
      
      return { migrated, errors };
    } catch (error) {
      return { migrated: 0, errors: [`Migration failed: ${error}`] };
    }
  }

  // Helper methods for mapping localStorage data to database IDs
  private static mapServiceToId(category: string, service: string): number {
    // Map your service categories to database service IDs
    const serviceMap: { [key: string]: number } = {
      'carwash_classic': 1,
      'carwash_regular': 2,
      'carwash_vip_pro': 2,
      'carwash_vip_pro_max': 3,
      'carwash_premium': 3,
      'carwash_fac': 4,
      'auto_detailing': 4,
      'graphene_coating': 4,
    };
    
    const key = `${category}_${service}`;
    return serviceMap[key] || 1; // Default to service ID 1
  }

  private static mapBranchToId(branchName: string): number {
    // Map branch names to database branch IDs
    const branchMap: { [key: string]: number } = {
      'Tumaga Hub': 1,
      'Boalan Hub': 2,
      'Home Service': 1, // Default to branch 1 for home service
    };
    
    return branchMap[branchName] || 1; // Default to branch ID 1
  }

  // ============= ADMIN CONFIGURATION =============
  
  // Get admin configuration (this replaces localStorage admin config)
  static async getAdminConfig(): Promise<any> {
    // For now, return the existing admin config
    // In the future, this could be stored in the database
    const { getAdminConfig } = await import('@/utils/adminConfig');
    return getAdminConfig();
  }

  // Save admin configuration
  static async saveAdminConfig(config: any): Promise<ApiResponse> {
    // For now, save to localStorage
    // In the future, this could be stored in the database
    const { saveAdminConfig } = await import('@/utils/adminConfig');
    saveAdminConfig(config);
    return { success: true, message: 'Admin configuration saved' };
  }

  // ============= HEALTH CHECK =============
  
  // Check database connection
  static async healthCheck(): Promise<any> {
    return this.apiRequest('/health');
  }
}

// Export for use in components
export default DatabaseService;
