import { eq, and, desc, count, sql } from 'drizzle-orm';
import { getDatabase } from '../database/connection';
import * as schema from '../database/schema';
import bcrypt from 'bcryptjs';
import { createId } from '@paralleldrive/cuid2';

// Types based on our schema
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Booking = typeof schema.bookings.$inferSelect;
export type NewBooking = typeof schema.bookings.$inferInsert;
export type SystemNotification = typeof schema.systemNotifications.$inferSelect;
export type NewSystemNotification = typeof schema.systemNotifications.$inferInsert;
export type AdminSetting = typeof schema.adminSettings.$inferSelect;
export type NewAdminSetting = typeof schema.adminSettings.$inferInsert;
export type Ad = typeof schema.ads.$inferSelect;
export type NewAd = typeof schema.ads.$inferInsert;

class NeonDatabaseService {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  // === USER MANAGEMENT ===
  
  async createUser(userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (!this.db) throw new Error('Database not connected');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [user] = await this.db
      .insert(schema.users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not connected');
    
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not connected');
    
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    
    return user || null;
  }

  async updateUser(id: string, updates: Partial<NewUser>): Promise<User> {
    if (!this.db) throw new Error('Database not connected');
    
    const [user] = await this.db
      .update(schema.users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    
    return user;
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) return false;
    
    return bcrypt.compare(password, user.password);
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.db) throw new Error('Database not connected');
    
    return await this.db
      .select()
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt));
  }

  // === BOOKING MANAGEMENT ===

  async createBooking(bookingData: Omit<NewBooking, 'id' | 'createdAt' | 'updatedAt' | 'confirmationCode'>): Promise<Booking> {
    if (!this.db) throw new Error('Database not connected');
    
    const confirmationCode = `FAC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(-3).toUpperCase()}`;
    
    const [booking] = await this.db
      .insert(schema.bookings)
      .values({
        ...bookingData,
        confirmationCode,
      })
      .returning();
    
    return booking;
  }

  async getBookingById(id: string): Promise<Booking | null> {
    if (!this.db) throw new Error('Database not connected');
    
    const [booking] = await this.db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, id))
      .limit(1);
    
    return booking || null;
  }

  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    if (!this.db) throw new Error('Database not connected');
    
    return await this.db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.userId, userId))
      .orderBy(desc(schema.bookings.createdAt));
  }

  async getAllBookings(): Promise<Booking[]> {
    if (!this.db) throw new Error('Database not connected');
    
    return await this.db
      .select()
      .from(schema.bookings)
      .orderBy(desc(schema.bookings.createdAt));
  }

  async updateBooking(id: string, updates: Partial<NewBooking>): Promise<Booking> {
    if (!this.db) throw new Error('Database not connected');
    
    const [booking] = await this.db
      .update(schema.bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.bookings.id, id))
      .returning();
    
    return booking;
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    if (!this.db) throw new Error('Database not connected');
    
    return await this.db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.status, status))
      .orderBy(desc(schema.bookings.createdAt));
  }

  // === NOTIFICATIONS ===

  async createSystemNotification(notificationData: Omit<NewSystemNotification, 'id' | 'createdAt'>): Promise<SystemNotification> {
    if (!this.db) throw new Error('Database not connected');
    
    const [notification] = await this.db
      .insert(schema.systemNotifications)
      .values(notificationData)
      .returning();
    
    return notification;
  }

  async getNotificationsForUser(userId: string, userRole: string): Promise<SystemNotification[]> {
    if (!this.db) throw new Error('Database not connected');
    
    return await this.db
      .select()
      .from(schema.systemNotifications)
      .where(
        sql`${schema.systemNotifications.targetRoles} @> ${JSON.stringify([userRole])} OR ${schema.systemNotifications.targetUsers} @> ${JSON.stringify([userId])}`
      )
      .orderBy(desc(schema.systemNotifications.createdAt));
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    
    const [notification] = await this.db
      .select()
      .from(schema.systemNotifications)
      .where(eq(schema.systemNotifications.id, notificationId))
      .limit(1);
    
    if (notification) {
      const readBy = notification.readBy || [];
      const existingRead = readBy.find((r: any) => r.userId === userId);
      
      if (!existingRead) {
        readBy.push({ userId, readAt: new Date().toISOString() });
        
        await this.db
          .update(schema.systemNotifications)
          .set({ readBy })
          .where(eq(schema.systemNotifications.id, notificationId));
      }
    }
  }

  // === ADMIN SETTINGS ===

  async getSetting(key: string): Promise<AdminSetting | null> {
    if (!this.db) throw new Error('Database not connected');
    
    const [setting] = await this.db
      .select()
      .from(schema.adminSettings)
      .where(eq(schema.adminSettings.key, key))
      .limit(1);
    
    return setting || null;
  }

  async setSetting(key: string, value: any, description?: string, category?: string): Promise<AdminSetting> {
    if (!this.db) throw new Error('Database not connected');
    
    const existing = await this.getSetting(key);
    
    if (existing) {
      const [setting] = await this.db
        .update(schema.adminSettings)
        .set({ value, description, category, updatedAt: new Date() })
        .where(eq(schema.adminSettings.key, key))
        .returning();
      return setting;
    } else {
      const [setting] = await this.db
        .insert(schema.adminSettings)
        .values({ key, value, description, category })
        .returning();
      return setting;
    }
  }

  async getAllSettings(): Promise<AdminSetting[]> {
    if (!this.db) throw new Error('Database not connected');
    
    return await this.db
      .select()
      .from(schema.adminSettings)
      .orderBy(schema.adminSettings.category, schema.adminSettings.key);
  }

  // === ADS MANAGEMENT ===

  async createAd(adData: Omit<NewAd, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ad> {
    if (!this.db) throw new Error('Database not connected');
    
    const [ad] = await this.db
      .insert(schema.ads)
      .values(adData)
      .returning();
    
    return ad;
  }

  async getActiveAds(): Promise<Ad[]> {
    if (!this.db) throw new Error('Database not connected');
    
    return await this.db
      .select()
      .from(schema.ads)
      .where(eq(schema.ads.isActive, true))
      .orderBy(desc(schema.ads.createdAt));
  }

  async updateAd(id: string, updates: Partial<NewAd>): Promise<Ad> {
    if (!this.db) throw new Error('Database not connected');
    
    const [ad] = await this.db
      .update(schema.ads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.ads.id, id))
      .returning();
    
    return ad;
  }

  async deleteAd(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not connected');
    
    const result = await this.db
      .delete(schema.ads)
      .where(eq(schema.ads.id, id));
    
    return result.rowCount > 0;
  }

  async dismissAd(adId: string, userEmail: string): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    
    await this.db
      .insert(schema.adDismissals)
      .values({ adId, userEmail });
  }

  async isAdDismissed(adId: string, userEmail: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not connected');
    
    const [dismissal] = await this.db
      .select()
      .from(schema.adDismissals)
      .where(
        and(
          eq(schema.adDismissals.adId, adId),
          eq(schema.adDismissals.userEmail, userEmail)
        )
      )
      .limit(1);
    
    return !!dismissal;
  }

  // === UTILITY METHODS ===

  async getStats(): Promise<{
    totalUsers: number;
    totalBookings: number;
    activeAds: number;
    pendingBookings: number;
  }> {
    if (!this.db) throw new Error('Database not connected');
    
    const [userCount] = await this.db
      .select({ count: count() })
      .from(schema.users);
    
    const [bookingCount] = await this.db
      .select({ count: count() })
      .from(schema.bookings);
    
    const [adCount] = await this.db
      .select({ count: count() })
      .from(schema.ads)
      .where(eq(schema.ads.isActive, true));
    
    const [pendingCount] = await this.db
      .select({ count: count() })
      .from(schema.bookings)
      .where(eq(schema.bookings.status, 'pending'));
    
    return {
      totalUsers: userCount.count,
      totalBookings: bookingCount.count,
      activeAds: adCount.count,
      pendingBookings: pendingCount.count,
    };
  }
}

// Export singleton instance
export const neonDbService = new NeonDatabaseService();
export default neonDbService;
