// Database Schema for Advanced Booking System
// This defines the structure for tracking all bookings and user interactions

export interface User {
  id: string;
  email: string;
  fullName: string;
  password: string; // In production, this should be hashed
  role: 'user' | 'admin' | 'superadmin' | 'cashier' | 'inventory_manager';
  contactNumber: string;
  address: string;
  carUnit?: string;
  carPlateNumber?: string;
  carType?: string;
  branchLocation: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  loyaltyPoints: number;
  subscriptionStatus: 'free' | 'basic' | 'premium' | 'vip';
  subscriptionExpiry?: string;
}

export interface Booking {
  id: string;
  userId?: string; // null for guest bookings
  guestInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  type: 'registered' | 'guest';
  
  // Service Details
  category: 'carwash' | 'auto_detailing' | 'graphene_coating';
  service: string;
  
  // Vehicle Details
  unitType: 'car' | 'motorcycle';
  unitSize: string;
  plateNumber?: string;
  
  // Schedule Details
  date: string;
  timeSlot: string;
  branch: string;
  estimatedDuration: number; // in minutes
  
  // Pricing
  basePrice: number;
  discountAmount?: number;
  totalPrice: number;
  currency: string;
  
  // Payment Details
  paymentMethod: 'branch' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentReference?: string;
  receiptUrl?: string;
  
  // Booking Status
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  confirmationCode: string;
  
  // Tracking
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  
  // Additional Info
  notes?: string;
  specialRequests?: string;
  assignedStaff?: string[];
  qualityRating?: number; // 1-5 stars
  customerFeedback?: string;
  
  // Loyalty & Gamification
  pointsEarned?: number;
  loyaltyRewardsApplied?: string[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  workingHours: {
    [key: string]: {
      enabled: boolean;
      startTime: string;
      endTime: string;
      breaks?: { start: string; end: string }[];
    };
  };
  services: string[];
  capacity: number; // max concurrent bookings
  facilities: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  category: 'carwash' | 'auto_detailing' | 'graphene_coating';
  name: string;
  description: string;
  duration: number; // in minutes
  pricing: {
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
  };
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  requiredStaff: number;
  equipmentNeeded: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BookingAnalytics {
  id: string;
  date: string;
  branch: string;
  
  // Daily Metrics
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  
  // Revenue Metrics
  totalRevenue: number;
  averageBookingValue: number;
  onlinePayments: number;
  branchPayments: number;
  
  // Service Metrics
  serviceBreakdown: {
    [serviceName: string]: {
      count: number;
      revenue: number;
    };
  };
  
  // Customer Metrics
  newCustomers: number;
  returningCustomers: number;
  guestBookings: number;
  
  // Efficiency Metrics
  averageServiceTime: number;
  capacityUtilization: number;
  staffUtilization: number;
  
  // Quality Metrics
  averageRating: number;
  totalRatings: number;
  
  createdAt: string;
}

export interface Notification {
  id: string;
  userId?: string; // null for system-wide notifications
  type: 'booking_confirmation' | 'booking_reminder' | 'payment_reminder' | 'service_complete' | 'promotion' | 'system';
  title: string;
  message: string;
  data?: any; // additional data for the notification
  isRead: boolean;
  createdAt: string;
  scheduledFor?: string; // for scheduled notifications
  sentAt?: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: 'discount' | 'free_service' | 'upgrade' | 'merchandise';
  rewardValue: number | string;
  isActive: boolean;
  validUntil?: string;
  usageLimit?: number; // max times this reward can be claimed
  createdAt: string;
  updatedAt: string;
}

export interface CustomerReward {
  id: string;
  userId: string;
  rewardId: string;
  bookingId?: string; // booking where reward was used
  status: 'available' | 'used' | 'expired';
  claimedAt: string;
  usedAt?: string;
  expiresAt?: string;
}

// Database Management Class
export class BookingDatabase {
  private static instance: BookingDatabase;
  
  public static getInstance(): BookingDatabase {
    if (!BookingDatabase.instance) {
      BookingDatabase.instance = new BookingDatabase();
    }
    return BookingDatabase.instance;
  }

  // Booking Operations
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'confirmationCode'>): Promise<Booking> {
    const booking: Booking = {
      ...bookingData,
      id: this.generateId('BOOK'),
      confirmationCode: this.generateConfirmationCode(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save to localStorage (in production, this would be a real database)
    const bookings = this.getAllBookings();
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Create analytics entry
    this.updateAnalytics(booking);
    
    // Send notification
    this.createNotification({
      userId: booking.userId,
      type: 'booking_confirmation',
      title: 'Booking Confirmed',
      message: `Your booking for ${booking.service} on ${booking.date} has been confirmed.`,
      data: { bookingId: booking.id }
    });
    
    return booking;
  }

  getAllBookings(): Booking[] {
    const bookings = localStorage.getItem('bookings');
    return bookings ? JSON.parse(bookings) : [];
  }

  getBookingById(id: string): Booking | undefined {
    const bookings = this.getAllBookings();
    return bookings.find(booking => booking.id === id);
  }

  getUserBookings(userId: string): Booking[] {
    const bookings = this.getAllBookings();
    return bookings.filter(booking => booking.userId === userId);
  }

  getBookingsByDateRange(startDate: string, endDate: string): Booking[] {
    const bookings = this.getAllBookings();
    return bookings.filter(booking => 
      booking.date >= startDate && booking.date <= endDate
    );
  }

  getBranchBookings(branch: string, date?: string): Booking[] {
    const bookings = this.getAllBookings();
    return bookings.filter(booking => {
      const matchesBranch = booking.branch === branch;
      const matchesDate = date ? booking.date === date : true;
      return matchesBranch && matchesDate;
    });
  }

  updateBookingStatus(bookingId: string, status: Booking['status'], reason?: string): boolean {
    const bookings = this.getAllBookings();
    const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);
    
    if (bookingIndex === -1) return false;
    
    const booking = bookings[bookingIndex];
    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    
    if (status === 'cancelled') {
      booking.cancelledAt = new Date().toISOString();
      booking.cancellationReason = reason;
    } else if (status === 'confirmed') {
      booking.confirmedAt = new Date().toISOString();
    } else if (status === 'in_progress') {
      booking.startedAt = new Date().toISOString();
    } else if (status === 'completed') {
      booking.completedAt = new Date().toISOString();
    }
    
    bookings[bookingIndex] = booking;
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Send notification
    this.createNotification({
      userId: booking.userId,
      type: 'booking_confirmation',
      title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your booking status has been updated to ${status}.`,
      data: { bookingId: booking.id, status }
    });
    
    return true;
  }

  // Analytics Operations
  updateAnalytics(booking: Booking): void {
    const today = new Date().toISOString().split('T')[0];
    const analytics = this.getAnalytics(today, booking.branch) || this.createEmptyAnalytics(today, booking.branch);
    
    analytics.totalBookings++;
    analytics.totalRevenue += booking.totalPrice;
    analytics.averageBookingValue = analytics.totalRevenue / analytics.totalBookings;
    
    if (booking.paymentMethod === 'online') {
      analytics.onlinePayments++;
    } else {
      analytics.branchPayments++;
    }
    
    if (!analytics.serviceBreakdown[booking.service]) {
      analytics.serviceBreakdown[booking.service] = { count: 0, revenue: 0 };
    }
    analytics.serviceBreakdown[booking.service].count++;
    analytics.serviceBreakdown[booking.service].revenue += booking.totalPrice;
    
    if (booking.type === 'guest') {
      analytics.guestBookings++;
    }
    
    this.saveAnalytics(analytics);
  }

  private getAnalytics(date: string, branch: string): BookingAnalytics | null {
    const analyticsData = localStorage.getItem('bookingAnalytics');
    if (!analyticsData) return null;
    
    const analytics: BookingAnalytics[] = JSON.parse(analyticsData);
    return analytics.find(a => a.date === date && a.branch === branch) || null;
  }

  private createEmptyAnalytics(date: string, branch: string): BookingAnalytics {
    return {
      id: this.generateId('ANALYTICS'),
      date,
      branch,
      totalBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      noShowBookings: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      onlinePayments: 0,
      branchPayments: 0,
      serviceBreakdown: {},
      newCustomers: 0,
      returningCustomers: 0,
      guestBookings: 0,
      averageServiceTime: 0,
      capacityUtilization: 0,
      staffUtilization: 0,
      averageRating: 0,
      totalRatings: 0,
      createdAt: new Date().toISOString(),
    };
  }

  private saveAnalytics(analytics: BookingAnalytics): void {
    const allAnalytics = JSON.parse(localStorage.getItem('bookingAnalytics') || '[]');
    const existingIndex = allAnalytics.findIndex((a: BookingAnalytics) => 
      a.date === analytics.date && a.branch === analytics.branch
    );
    
    if (existingIndex >= 0) {
      allAnalytics[existingIndex] = analytics;
    } else {
      allAnalytics.push(analytics);
    }
    
    localStorage.setItem('bookingAnalytics', JSON.stringify(allAnalytics));
  }

  // Notification Operations
  createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
    const notification: Notification = {
      ...notificationData,
      id: this.generateId('NOTIF'),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    return notification;
  }

  getUserNotifications(userId: string): Notification[] {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    return notifications.filter((n: Notification) => n.userId === userId || !n.userId);
  }

  markNotificationAsRead(notificationId: string): boolean {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notificationIndex = notifications.findIndex((n: Notification) => n.id === notificationId);
    
    if (notificationIndex === -1) return false;
    
    notifications[notificationIndex].isRead = true;
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    return true;
  }

  // Utility Methods
  private generateId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  private generateConfirmationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Dashboard Analytics
  getDashboardStats(dateRange?: { start: string; end: string }): {
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    topServices: Array<{ name: string; count: number; revenue: number }>;
    recentBookings: Booking[];
    dailyStats: Array<{ date: string; bookings: number; revenue: number }>;
  } {
    const bookings = dateRange 
      ? this.getBookingsByDateRange(dateRange.start, dateRange.end)
      : this.getAllBookings();
    
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const ratingsSum = bookings
      .filter(b => b.qualityRating)
      .reduce((sum, b) => sum + (b.qualityRating || 0), 0);
    const ratingsCount = bookings.filter(b => b.qualityRating).length;
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;
    
    // Top services
    const serviceStats: { [key: string]: { count: number; revenue: number } } = {};
    bookings.forEach(booking => {
      if (!serviceStats[booking.service]) {
        serviceStats[booking.service] = { count: 0, revenue: 0 };
      }
      serviceStats[booking.service].count++;
      serviceStats[booking.service].revenue += booking.totalPrice;
    });
    
    const topServices = Object.entries(serviceStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Recent bookings
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    // Daily stats
    const dailyStats: { [date: string]: { bookings: number; revenue: number } } = {};
    bookings.forEach(booking => {
      const date = booking.date;
      if (!dailyStats[date]) {
        dailyStats[date] = { bookings: 0, revenue: 0 };
      }
      dailyStats[date].bookings++;
      dailyStats[date].revenue += booking.totalPrice;
    });
    
    const dailyStatsArray = Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      totalBookings,
      totalRevenue,
      averageRating,
      topServices,
      recentBookings,
      dailyStats: dailyStatsArray,
    };
  }

  // Capacity Management
  getSlotAvailability(date: string, timeSlot: string, branch: string): {
    isAvailable: boolean;
    currentBookings: number;
    maxCapacity: number;
  } {
    const bookings = this.getBranchBookings(branch, date);
    const currentBookings = bookings.filter(booking => 
      booking.timeSlot === timeSlot && 
      ['pending', 'confirmed', 'in_progress'].includes(booking.status)
    ).length;
    
    // This would come from branch configuration in a real system
    const maxCapacity = 2; // Default capacity per slot
    
    return {
      isAvailable: currentBookings < maxCapacity,
      currentBookings,
      maxCapacity,
    };
  }
}

// Export singleton instance
export const bookingDB = BookingDatabase.getInstance();

// Helper functions for easy access
export const createBooking = (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'confirmationCode'>) => 
  bookingDB.createBooking(data);

export const getAllBookings = () => bookingDB.getAllBookings();
export const getUserBookings = (userId: string) => bookingDB.getUserBookings(userId);
export const updateBookingStatus = (bookingId: string, status: Booking['status'], reason?: string) => 
  bookingDB.updateBookingStatus(bookingId, status, reason);

export const getDashboardStats = (dateRange?: { start: string; end: string }) => 
  bookingDB.getDashboardStats(dateRange);

export const getSlotAvailability = (date: string, timeSlot: string, branch: string) =>
  bookingDB.getSlotAvailability(date, timeSlot, branch);
