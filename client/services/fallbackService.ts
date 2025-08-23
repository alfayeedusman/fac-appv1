// Fallback service when backend is not available
// Provides mock data and localStorage-based operations

export class FallbackService {
  // Mock health check
  static async healthCheck(): Promise<any> {
    return {
      status: "offline",
      message: "Running in offline mode",
      timestamp: new Date().toISOString()
    };
  }

  // Mock OTP operations (return success for demo purposes)
  static async sendOTP(email: string, type: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📧 [DEMO MODE] OTP would be sent to ${email} for ${type}`);
    
    return {
      success: true,
      message: "Demo OTP: 123456 (use this code for testing)"
    };
  }

  static async verifyOTP(email: string, otp: string, type: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Accept demo OTP or any 6-digit code for testing
    if (otp === "123456" || /^\d{6}$/.test(otp)) {
      console.log(`✅ [DEMO MODE] OTP verified for ${email}`);
      
      return {
        success: true,
        message: "OTP verified successfully",
        firebaseUid: `demo_${email.replace('@', '_').replace('.', '_')}_${Date.now()}`
      };
    } else {
      return {
        success: false,
        error: "Invalid OTP. Use 123456 for demo mode."
      };
    }
  }

  static async resendOTP(email: string, type: string): Promise<any> {
    return this.sendOTP(email, type);
  }

  // Mock user sync
  static async syncUser(userData: any): Promise<any> {
    const userKey = `demo_user_${userData.email}`;
    localStorage.setItem(userKey, JSON.stringify(userData));
    
    return {
      success: true,
      message: "User data saved locally (demo mode)"
    };
  }

  // Mock services
  static async getServices(): Promise<any[]> {
    return [
      {
        id: 1,
        name: "Quick Wash",
        description: "Basic exterior wash and dry",
        category: "basic",
        base_price: 250.00,
        duration_minutes: 20,
        is_active: true
      },
      {
        id: 2,
        name: "Classic Wash",
        description: "Complete wash with interior cleaning",
        category: "standard",
        base_price: 450.00,
        duration_minutes: 45,
        is_active: true
      },
      {
        id: 3,
        name: "Premium Wash",
        description: "Full service with detailing",
        category: "premium",
        base_price: 850.00,
        duration_minutes: 90,
        is_active: true
      },
      {
        id: 4,
        name: "VIP Pro Max",
        description: "Ultimate luxury experience",
        category: "luxury",
        base_price: 2500.00,
        duration_minutes: 120,
        is_active: true
      }
    ];
  }

  // Mock branches
  static async getBranches(): Promise<any[]> {
    return [
      {
        id: 1,
        name: "Tumaga Hub",
        address: "Main Street, Tumaga District",
        is_active: true
      },
      {
        id: 2,
        name: "Boalan Hub", 
        address: "Commercial Center, Boalan",
        is_active: true
      }
    ];
  }

  // Mock booking creation
  static async createBooking(bookingData: any): Promise<any> {
    const bookings = JSON.parse(localStorage.getItem("demo_bookings") || "[]");
    const newBooking = {
      ...bookingData,
      id: Date.now(),
      booking_id: Date.now(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    
    bookings.push(newBooking);
    localStorage.setItem("demo_bookings", JSON.stringify(bookings));
    
    console.log('📝 [DEMO MODE] Booking created:', newBooking);
    
    return { booking_id: newBooking.id };
  }

  // Mock get user bookings
  static async getUserBookings(userId: string): Promise<any[]> {
    const bookings = JSON.parse(localStorage.getItem("demo_bookings") || "[]");
    return bookings.filter((booking: any) => booking.user_id === userId);
  }

  // Mock service price
  static async getServicePrice(serviceId: number, vehicleType: string): Promise<any> {
    const services = await this.getServices();
    const service = services.find(s => s.id === serviceId);
    
    if (!service) {
      throw new Error("Service not found");
    }
    
    // Apply vehicle type multiplier
    const multipliers: { [key: string]: number } = {
      'motorcycle': 0.5,
      'sedan': 1.0,
      'hatchback': 1.0,
      'suv': 1.2,
      'pickup': 1.2,
      'van': 1.3
    };
    
    const multiplier = multipliers[vehicleType] || 1.0;
    return { price: service.base_price * multiplier };
  }

  // Mock user vehicles
  static async getUserVehicles(userId: string): Promise<any[]> {
    const vehicles = JSON.parse(localStorage.getItem(`demo_vehicles_${userId}`) || "[]");
    return vehicles;
  }

  // Mock add vehicle
  static async addVehicle(userId: string, vehicleData: any): Promise<any> {
    const vehicles = JSON.parse(localStorage.getItem(`demo_vehicles_${userId}`) || "[]");
    const newVehicle = {
      ...vehicleData,
      id: Date.now(),
      user_id: userId,
      created_at: new Date().toISOString()
    };
    
    vehicles.push(newVehicle);
    localStorage.setItem(`demo_vehicles_${userId}`, JSON.stringify(vehicles));
    
    return { vehicle_id: newVehicle.id };
  }

  // Mock user profile
  static async getUserProfile(userId: string): Promise<any> {
    const profile = localStorage.getItem(`demo_user_profile_${userId}`);
    if (profile) {
      return JSON.parse(profile);
    }
    
    return {
      id: userId,
      email: "demo@example.com",
      full_name: "Demo User",
      phone_number: "+639123456789",
      loyalty_points: 100,
      total_bookings: 3,
      total_spent: 1500.00,
      membership_name: "Regular Member"
    };
  }
}

export default FallbackService;
