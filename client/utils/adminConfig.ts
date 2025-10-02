// Admin Configuration Management System
// This provides a centralized way to manage pricing, scheduling, and other business settings

export interface PricingMatrix {
  car: {
    sedan: number;
    suv: number;
    pickup: number;
    van_small: number;
    van_big: number;
  };
  motorcycle: {
    regular: number;
    medium: number;
    big_bike: number;
  };
}

export interface CarwashService {
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface CarwashPricing {
  classic: CarwashService;
  regular: CarwashService;
  vip_pro: CarwashService;
  vip_pro_max: CarwashService;
  premium: CarwashService;
  fac: CarwashService;
}

export interface SchedulingConfig {
  workingHours: {
    [key: string]: { // day of week: "monday", "tuesday", etc.
      enabled: boolean;
      startTime: string;
      endTime: string;
      slotDuration: number; // in minutes
    };
  };
  capacityPerSlot: number;
  bufferTime: number; // minutes between bookings
  leadTime: number; // minimum hours in advance to book
  blackoutDates: string[]; // array of dates in YYYY-MM-DD format
  timezone: string;
}

export interface AdminConfig {
  pricing: {
    carwash: CarwashPricing;
    autoDetailing: PricingMatrix;
    grapheneCoating: PricingMatrix;
  };
  scheduling: SchedulingConfig;
  homeService: {
    enabled: boolean;
    availableServices: {
      carwash: string[]; // Array of carwash service keys for cars
      motorcycleCarwash: string[]; // Array of carwash service keys for motorcycles
      autoDetailing: boolean;
      grapheneCoating: boolean;
    };
    priceMultiplier: number; // Additional fee for home service (1.0 = no extra charge)
    coverage: {
      areas: string[]; // List of covered areas
      maxDistance: number; // Max distance in km
    };
    leadTime: number; // Minimum hours in advance for home service
  };
  terms: {
    cancellationPolicy: string;
    termsAndConditions: string;
    noShowPolicy: string;
  };
  branches: Array<{
    id: string;
    name: string;
    address: string;
    features: string[];
    enabled: boolean;
  }>;
  paymentMethods: {
    branch: {
      enabled: boolean;
      name: string;
      description: string;
    };
    online: {
      enabled: boolean;
      name: string;
      description: string;
      instructions: {
        bankTransfer?: {
          accountNumber: string;
          accountName: string;
          bankName: string;
        };
        gcash?: {
          number: string;
          accountName: string;
        };
      };
    };
    onsite?: {
      enabled: boolean;
      name: string;
      description: string;
    };
  };
}

// Default configuration
const DEFAULT_CONFIG: AdminConfig = {
  pricing: {
    carwash: {
      classic: {
        name: "Classic Wash",
        price: 200,
        duration: "30 mins",
        description: "Smart exterior cleaning with quality optimization",
        features: [
          "Professional wash system",
          "Exterior cleaning",
          "Tire shine",
          "Basic protection",
        ],
      },
      regular: {
        name: "Regular Wash",
        price: 300,
        duration: "45 mins",
        description: "Standard wash with interior wipe",
        features: [
          "Professional wash system",
          "Exterior cleaning",
          "Interior wipe down",
          "Tire shine",
          "Basic protection",
        ],
      },
      vip_pro: {
        name: "VIP Pro Wash",
        price: 400,
        duration: "60 mins",
        description: "Premium wash with advanced care systems",
        features: [
          "Premium wash",
          "Interior deep clean",
          "Paint protection",
          "Wax application",
          "Dashboard treatment",
        ],
        popular: true,
      },
      vip_pro_max: {
        name: "VIP Pro Max",
        price: 800,
        duration: "75 mins",
        description: "Complete wash with detailing",
        features: [
          "Premium wash",
          "Interior deep clean",
          "Paint protection",
          "Wax application",
          "Dashboard treatment",
          "Wheel detailing",
        ],
      },
      premium: {
        name: "Premium Wash",
        price: 1500,
        duration: "90 mins",
        description: "Full premium service",
        features: [
          "Complete exterior detail",
          "Full interior restoration",
          "Paint correction",
          "Premium wax application",
          "Leather conditioning",
          "Engine bay clean",
        ],
      },
      fac: {
        name: "FAC Wash",
        price: 2500,
        duration: "120 mins",
        description: "Ultimate luxury experience",
        features: [
          "Complete exterior detail",
          "Full interior restoration",
          "Paint correction",
          "Ceramic coating application",
          "Leather conditioning",
          "Engine bay clean",
          "VIP treatment",
        ],
      },
    },
    autoDetailing: {
      car: {
        sedan: 3500,
        suv: 4500,
        pickup: 5000,
        van_small: 5500,
        van_big: 6500,
      },
      motorcycle: {
        regular: 1200,
        medium: 1500,
        big_bike: 1800,
      },
    },
    grapheneCoating: {
      car: {
        sedan: 15000,
        suv: 18000,
        pickup: 20000,
        van_small: 22000,
        van_big: 25000,
      },
      motorcycle: {
        regular: 5000,
        medium: 6500,
        big_bike: 8000,
      },
    },
  },
  scheduling: {
    workingHours: {
      monday: { enabled: true, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
      tuesday: { enabled: true, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
      wednesday: { enabled: true, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
      thursday: { enabled: true, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
      friday: { enabled: true, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
      saturday: { enabled: true, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
      sunday: { enabled: false, startTime: "08:00", endTime: "18:00", slotDuration: 60 },
    },
    capacityPerSlot: 2,
    bufferTime: 15,
    leadTime: 2,
    blackoutDates: [],
    timezone: "Asia/Manila",
  },
  homeService: {
    enabled: true,
    availableServices: {
      carwash: ["vip_pro_max", "premium", "fac"], // VIP PROMAX, PREMIUM WASH, FASWASH (FAC)
      motorcycleCarwash: ["fac"], // Only FAC wash special for motorcycles
      autoDetailing: true,
      grapheneCoating: true,
    },
    priceMultiplier: 1.2, // 20% additional charge for home service
    coverage: {
      areas: ["Tumaga", "Boalan", "Zamboanga City", "Downtown", "Rio Hondo", "Tetuan"],
      maxDistance: 15, // 15km radius
    },
    leadTime: 4, // 4 hours minimum advance booking for home service
  },
  terms: {
    cancellationPolicy: "Free cancellation up to 2 hours before appointment time. No-show or late cancellation may result in charges.",
    termsAndConditions: "By booking this service, you agree to our terms and conditions. Payment terms and service policies apply.",
    noShowPolicy: "No-show appointments may be charged 50% of the service fee.",
  },
  branches: [
    {
      id: "tumaga",
      name: "Tumaga Hub",
      address: "Main Street, Tumaga District",
      features: ["Premium Wash Bay", "VIP Lounge", "Express Service"],
      enabled: true,
    },
    {
      id: "boalan",
      name: "Boalan Hub", 
      address: "Commercial Center, Boalan",
      features: ["Premium Bay", "Customer Lounge", "Full Service"],
      enabled: true,
    },
  ],
  paymentMethods: {
    branch: {
      enabled: true,
      name: "Pay at Branch",
      description: "Pay when you arrive for your appointment",
    },
    online: {
      enabled: true,
      name: "Online Payment",
      description: "Bank transfer or GCash",
      instructions: {
        bankTransfer: {
          accountNumber: "1234-5678-90",
          accountName: "Fayeed Auto Care",
          bankName: "BPI",
        },
        gcash: {
          number: "09123456789",
          accountName: "Fayeed Auto Care",
        },
      },
    },
  },
};

// Configuration management functions
export class AdminConfigManager {
  private static CONFIG_KEY = "admin_config";

  static getConfig(): AdminConfig {
    try {
      const saved = localStorage.getItem(this.CONFIG_KEY);
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        // Merge with defaults to ensure all keys exist
        return this.mergeWithDefaults(parsedConfig);
      }
    } catch (error) {
      console.error("Error loading admin config:", error);
    }
    return DEFAULT_CONFIG;
  }

  static saveConfig(config: AdminConfig): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Error saving admin config:", error);
    }
  }

  static resetToDefaults(): AdminConfig {
    localStorage.removeItem(this.CONFIG_KEY);
    return DEFAULT_CONFIG;
  }

  static updatePricing(category: keyof AdminConfig["pricing"], pricing: any): void {
    const config = this.getConfig();
    config.pricing[category] = pricing;
    this.saveConfig(config);
  }

  static updateScheduling(scheduling: Partial<SchedulingConfig>): void {
    const config = this.getConfig();
    config.scheduling = { ...config.scheduling, ...scheduling };
    this.saveConfig(config);
  }

  static updateTerms(terms: Partial<AdminConfig["terms"]>): void {
    const config = this.getConfig();
    config.terms = { ...config.terms, ...terms };
    this.saveConfig(config);
  }

  static addBranch(branch: AdminConfig["branches"][0]): void {
    const config = this.getConfig();
    config.branches.push(branch);
    this.saveConfig(config);
  }

  static updateBranch(branchId: string, updates: Partial<AdminConfig["branches"][0]>): void {
    const config = this.getConfig();
    const branchIndex = config.branches.findIndex(b => b.id === branchId);
    if (branchIndex >= 0) {
      config.branches[branchIndex] = { ...config.branches[branchIndex], ...updates };
      this.saveConfig(config);
    }
  }

  static removeBranch(branchId: string): void {
    const config = this.getConfig();
    config.branches = config.branches.filter(b => b.id !== branchId);
    this.saveConfig(config);
  }

  static addBlackoutDate(date: string): void {
    const config = this.getConfig();
    if (!config.scheduling.blackoutDates.includes(date)) {
      config.scheduling.blackoutDates.push(date);
      this.saveConfig(config);
    }
  }

  static removeBlackoutDate(date: string): void {
    const config = this.getConfig();
    config.scheduling.blackoutDates = config.scheduling.blackoutDates.filter(d => d !== date);
    this.saveConfig(config);
  }

  // Utility functions
  static generateTimeSlots(dayOfWeek: string): string[] {
    const config = this.getConfig();
    const dayConfig = config.scheduling.workingHours[dayOfWeek.toLowerCase()];
    
    if (!dayConfig || !dayConfig.enabled) {
      return [];
    }

    const slots: string[] = [];
    const [startHour, startMinute] = dayConfig.startTime.split(':').map(Number);
    const [endHour, endMinute] = dayConfig.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    for (let time = startTime; time < endTime; time += dayConfig.slotDuration) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
    
    return slots;
  }

  static isSlotAvailable(date: string, timeSlot: string, branch: string): boolean {
    const config = this.getConfig();
    
    // Check blackout dates
    if (config.scheduling.blackoutDates.includes(date)) {
      return false;
    }
    
    // Check lead time
    const now = new Date();
    const appointmentTime = new Date(`${date}T${timeSlot}:00`);
    const leadTimeMs = config.scheduling.leadTime * 60 * 60 * 1000;
    
    if (appointmentTime.getTime() - now.getTime() < leadTimeMs) {
      return false;
    }
    
    // Check existing bookings capacity
    const existingBookings = this.getBookingsForSlot(date, timeSlot, branch);
    return existingBookings.length < config.scheduling.capacityPerSlot;
  }

  static getBookingsForSlot(date: string, timeSlot: string, branch: string): any[] {
    // Get bookings from storage
    const userBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
    const guestBookings = JSON.parse(localStorage.getItem("guestBookings") || "[]");
    const allBookings = [...userBookings, ...guestBookings];
    
    return allBookings.filter(booking => 
      booking.date === date && 
      booking.timeSlot === timeSlot && 
      booking.branch === branch &&
      booking.status !== "cancelled"
    );
  }

  private static mergeWithDefaults(config: any): AdminConfig {
    // Deep merge logic to ensure all default keys exist
    return {
      ...DEFAULT_CONFIG,
      ...config,
      pricing: {
        ...DEFAULT_CONFIG.pricing,
        ...config.pricing,
        carwash: {
          ...DEFAULT_CONFIG.pricing.carwash,
          ...config.pricing?.carwash,
        },
        autoDetailing: {
          ...DEFAULT_CONFIG.pricing.autoDetailing,
          ...config.pricing?.autoDetailing,
        },
        grapheneCoating: {
          ...DEFAULT_CONFIG.pricing.grapheneCoating,
          ...config.pricing?.grapheneCoating,
        },
      },
      scheduling: {
        ...DEFAULT_CONFIG.scheduling,
        ...config.scheduling,
        workingHours: {
          ...DEFAULT_CONFIG.scheduling.workingHours,
          ...config.scheduling?.workingHours,
        },
      },
      homeService: {
        ...DEFAULT_CONFIG.homeService,
        ...config.homeService,
      },
      terms: {
        ...DEFAULT_CONFIG.terms,
        ...config.terms,
      },
      branches: config.branches || DEFAULT_CONFIG.branches,
      paymentMethods: {
        ...DEFAULT_CONFIG.paymentMethods,
        ...config.paymentMethods,
      },
    };
  }
}

// Export convenience functions
export const getAdminConfig = () => AdminConfigManager.getConfig();
export const saveAdminConfig = (config: AdminConfig) => AdminConfigManager.saveConfig(config);
export const updatePricing = (category: keyof AdminConfig["pricing"], pricing: any) => 
  AdminConfigManager.updatePricing(category, pricing);
export const updateScheduling = (scheduling: Partial<SchedulingConfig>) => 
  AdminConfigManager.updateScheduling(scheduling);
export const generateTimeSlots = (dayOfWeek: string) => 
  AdminConfigManager.generateTimeSlots(dayOfWeek);
export const isSlotAvailable = (date: string, timeSlot: string, branch: string) =>
  AdminConfigManager.isSlotAvailable(date, timeSlot, branch);

export default AdminConfigManager;
