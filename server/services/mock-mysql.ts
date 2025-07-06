// Mock MySQL service for development environment
export class MockMySQLService {
  private static mockData = {
    users: [
      {
        id: "user123",
        email: "john@example.com",
        full_name: "John Doe",
        phone_number: "+63 912 345 6789",
        address: "Tumaga, Zamboanga City",
        loyalty_points: 150,
        total_bookings: 5,
        total_spent: 2250.0,
        membership_type: "vip_silver",
      },
    ],
    services: [
      {
        id: 1,
        name: "Quick Wash",
        description: "Basic exterior wash and dry",
        category: "basic",
        base_price: 250.0,
        duration_minutes: 20,
        features: ["Exterior wash", "Basic drying", "Tire cleaning"],
      },
      {
        id: 2,
        name: "Classic Wash",
        description: "Complete wash with interior cleaning",
        category: "standard",
        base_price: 450.0,
        duration_minutes: 45,
        features: [
          "Exterior wash & wax",
          "Interior vacuum",
          "Window cleaning",
          "Dashboard care",
        ],
      },
      {
        id: 3,
        name: "Premium Wash",
        description: "Full service with detailing",
        category: "premium",
        base_price: 850.0,
        duration_minutes: 90,
        features: [
          "Complete exterior detail",
          "Interior deep clean",
          "Tire & rim care",
          "Engine bay clean",
        ],
      },
    ],
    branches: [
      {
        id: 1,
        name: "Fayeed Auto Care - Tumaga",
        address: "Tumaga, Zamboanga City",
        latitude: 6.9214,
        longitude: 122.079,
        phone_number: "+63 998 123 4567",
        operating_hours: "7:00 AM - 7:00 PM",
        current_wait_time: 15,
        rating: 4.8,
      },
      {
        id: 2,
        name: "Fayeed Auto Care - Boalan",
        address: "Boalan, Zamboanga City",
        latitude: 6.91,
        longitude: 122.073,
        phone_number: "+63 998 765 4321",
        operating_hours: "7:00 AM - 7:00 PM",
        current_wait_time: 25,
        rating: 4.7,
      },
    ],
    bookings: [
      {
        id: 1,
        user_id: "user123",
        service_id: 2,
        branch_id: 1,
        scheduled_date: new Date("2024-12-07T10:00:00"),
        vehicle_type: "sedan",
        plate_number: "ABC 123",
        status: "confirmed",
        total_amount: 450.0,
        service_name: "Classic Wash",
        branch_name: "Fayeed Auto Care - Tumaga",
        created_at: new Date("2024-12-06T15:30:00"),
      },
    ],
  };

  static async getServices() {
    return this.mockData.services;
  }

  static async getBranches() {
    return this.mockData.branches;
  }

  static async getUserProfile(userId: string) {
    return this.mockData.users.find((u) => u.id === userId);
  }

  static async getUserBookings(userId: string) {
    return this.mockData.bookings.filter((b) => b.user_id === userId);
  }

  static async createBooking(bookingData: any) {
    const newBooking = {
      id: this.mockData.bookings.length + 1,
      ...bookingData,
      created_at: new Date(),
      status: "pending",
    };
    this.mockData.bookings.push(newBooking);
    return newBooking.id;
  }

  static async checkIn(userId: string, branchId: number) {
    console.log(`User ${userId} checked in to branch ${branchId}`);
    return true;
  }

  static async getUserAnalytics(userId: string) {
    const user = this.mockData.users.find((u) => u.id === userId);
    return {
      totalBookings: user?.total_bookings || 0,
      totalSpent: user?.total_spent || 0,
      loyaltyPoints: user?.loyalty_points || 0,
      thisMonthBookings: 3,
      membershipType: user?.membership_type || "regular",
    };
  }
}
