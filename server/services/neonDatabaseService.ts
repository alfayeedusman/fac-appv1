import { eq, and, or, desc, count, sql, lte, asc, gte, ne } from "drizzle-orm";
import { getDatabase } from "../database/connection";
import * as schema from "../database/schema";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";

// Types based on our schema
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Booking = typeof schema.bookings.$inferSelect;
export type NewBooking = typeof schema.bookings.$inferInsert;
export type SystemNotification = typeof schema.systemNotifications.$inferSelect;
export type NewSystemNotification =
  typeof schema.systemNotifications.$inferInsert;
export type AdminSetting = typeof schema.adminSettings.$inferSelect;
export type NewAdminSetting = typeof schema.adminSettings.$inferInsert;
export type Ad = typeof schema.ads.$inferSelect;
export type NewAd = typeof schema.ads.$inferInsert;

class NeonDatabaseService {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  // Add method to refresh connection when needed
  private async ensureConnection() {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  // Handle connection errors
  private handleConnectionError(error: any) {
    if (
      error instanceof Error &&
      (error.message.includes("connection") ||
        error.message.includes("timeout") ||
        error.message.includes("ECONNREFUSED"))
    ) {
      console.log(
        "🔄 Detected connection error, resetting connection on next call",
      );
      this.db = null;
    }
  }

  // === USER MANAGEMENT ===

  async createUser(
    userData: Omit<NewUser, "id" | "createdAt" | "updatedAt">,
  ): Promise<User> {
    const db = await this.ensureConnection();
    if (!db) throw new Error("Database not connected");

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const [user] = await db
      .insert(schema.users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.ensureConnection();

    if (!db) {
      throw new Error(
        "Database not connected. Please check your NEON_DATABASE_URL environment variable.",
      );
    }

    try {
      // Try exact match first for performance
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (user) return user;

      // If no exact match, try case-insensitive search (fallback)
      const lowercaseEmail = email.toLowerCase();
      const result = await db.select().from(schema.users);

      const caseInsensitiveUser = result.find(
        (u) => u.email.toLowerCase() === lowercaseEmail,
      );

      return caseInsensitiveUser || null;
    } catch (error) {
      console.error("❌ Error fetching user from database", {
        email,
        error: error instanceof Error ? error.message : String(error),
      });

      // If it's a connection error, reset connection for next attempt
      this.handleConnectionError(error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    if (!this.db) throw new Error("Database not connected");

    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    return user || null;
  }

  async updateUser(id: string, updates: Partial<NewUser>): Promise<User> {
    if (!this.db) throw new Error("Database not connected");

    const [user] = await this.db
      .update(schema.users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();

    return user;
  }

  // === SESSION MANAGEMENT ===
  // Create a server-side session record for the user. Sessions are used
  // to authenticate private channel requests (Pusher auth) and API calls.
  async createUserSession(
    userId: string,
    sessionToken: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
  ) {
    if (!this.db) throw new Error("Database not connected");

    const [session] = await this.db
      .insert(schema.userSessions)
      .values({
        id: createId(),
        userId,
        sessionToken,
        expiresAt,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        isActive: true,
      })
      .returning();

    return session;
  }

  // Retrieve a session by its token. Returns null if not found.
  async getSessionByToken(sessionToken: string) {
    if (!this.db) throw new Error("Database not connected");

    const [session] = await this.db
      .select()
      .from(schema.userSessions)
      .where(eq(schema.userSessions.sessionToken, sessionToken))
      .limit(1);

    return session || null;
  }

  // Deactivate (invalidate) a session token
  async deactivateSession(sessionToken: string) {
    if (!this.db) throw new Error("Database not connected");

    await this.db
      .update(schema.userSessions)
      .set({ isActive: false })
      .where(eq(schema.userSessions.sessionToken, sessionToken));

    return true;
  }

  // Deactivate session by its database id
  async deactivateSessionById(sessionId: string) {
    if (!this.db) throw new Error("Database not connected");

    await this.db
      .update(schema.userSessions)
      .set({ isActive: false })
      .where(eq(schema.userSessions.id, sessionId));

    return true;
  }

  // Deactivate all sessions for a given user id
  async deactivateSessionsByUserId(userId: string) {
    if (!this.db) throw new Error("Database not connected");

    await this.db
      .update(schema.userSessions)
      .set({ isActive: false })
      .where(eq(schema.userSessions.userId, userId));

    return true;
  }

  // Get sessions with optional filters
  async getSessions(params?: {
    userId?: string;
    activeOnly?: boolean;
  }): Promise<any[]> {
    if (!this.db) throw new Error("Database not connected");

    let query = this.db.select().from(schema.userSessions);

    if (params?.userId) {
      query = query.where(eq(schema.userSessions.userId, params.userId));
    }

    if (params?.activeOnly) {
      query = query.where(eq(schema.userSessions.isActive, true));
    }

    const sessions = await query.orderBy(schema.userSessions.createdAt, "desc");

    return sessions.map((s: any) => ({
      id: s.id,
      userId: s.userId,
      sessionToken: s.sessionToken,
      expiresAt: s.expiresAt,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      isActive: s.isActive,
      createdAt: s.createdAt,
    }));
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        console.warn("verifyPassword: User not found", { email });
        return false;
      }

      if (!user.password) {
        console.warn("verifyPassword: User has no password", { email });
        return false;
      }

      if (!password) {
        console.warn("verifyPassword: No password provided");
        return false;
      }

      const result = await bcrypt.compare(password, user.password);
      if (!result) {
        console.log("verifyPassword: Password mismatch for", { email });
      }
      return result;
    } catch (error) {
      console.error("verifyPassword: Error comparing passwords", {
        error: error instanceof Error ? error.message : String(error),
        email,
      });
      return false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    const db = await this.ensureConnection();
    if (!db) throw new Error("Database not connected");

    return await db
      .select()
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt));
  }

  // === BOOKING MANAGEMENT ===

  async createBooking(
    bookingData: Omit<
      NewBooking,
      "id" | "createdAt" | "updatedAt" | "confirmationCode"
    >,
  ): Promise<Booking> {
    if (!this.db) throw new Error("Database not connected");

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
    if (!this.db) throw new Error("Database not connected");

    const [booking] = await this.db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, id))
      .limit(1);

    return booking || null;
  }

  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    if (!this.db) throw new Error("Database not connected");

    return await this.db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.userId, userId))
      .orderBy(desc(schema.bookings.createdAt));
  }

  async getAllBookings(): Promise<Booking[]> {
    if (!this.db) throw new Error("Database not connected");

    return await this.db
      .select()
      .from(schema.bookings)
      .orderBy(desc(schema.bookings.createdAt));
  }

  async updateBooking(
    id: string,
    updates: Partial<NewBooking>,
  ): Promise<Booking> {
    if (!this.db) throw new Error("Database not connected");

    const [booking] = await this.db
      .update(schema.bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.bookings.id, id))
      .returning();

    return booking;
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    if (!this.db) throw new Error("Database not connected");

    return await this.db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.status, status))
      .orderBy(desc(schema.bookings.createdAt));
  }

  async getBookingsByBranch(branch: string): Promise<Booking[]> {
    if (!this.db) throw new Error("Database not connected");

    return await this.db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.branch, branch))
      .orderBy(desc(schema.bookings.createdAt));
  }

  async getBookingsByBranchAndStatus(
    branch: string,
    status: string,
  ): Promise<Booking[]> {
    if (!this.db) throw new Error("Database not connected");

    return await this.db
      .select()
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.branch, branch),
          eq(schema.bookings.status, status),
        ),
      )
      .orderBy(desc(schema.bookings.createdAt));
  }

  // === CARWASH BAY MANAGEMENT ===

  async getSlotAvailability(
    date: string,
    timeSlot: string,
    branch: string,
  ): Promise<{
    isAvailable: boolean;
    currentBookings: number;
    maxCapacity: number;
    availableBays: number[];
  }> {
    if (!this.db) throw new Error("Database not connected");

    const MAX_BAYS_PER_SLOT = 5; // Maximum 5 bays per time slot

    // Get all bookings for this date, time slot, and branch that are in active statuses
    const bookings = await this.db
      .select()
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.date, date),
          eq(schema.bookings.timeSlot, timeSlot),
          eq(schema.bookings.branch, branch),
          // Only count bookings that are pending, confirmed, or in_progress
          or(
            eq(schema.bookings.status, "pending"),
            eq(schema.bookings.status, "confirmed"),
            eq(schema.bookings.status, "in_progress"),
          ),
        ),
      );

    const currentBookings = bookings.length;

    // Find which bays are already occupied
    const occupiedBays = new Set(
      bookings
        .filter(
          (b: Booking) => b.bayNumber !== null && b.bayNumber !== undefined,
        )
        .map((b: Booking) => b.bayNumber),
    );

    // Find available bays
    const availableBays: number[] = [];
    for (let bay = 1; bay <= MAX_BAYS_PER_SLOT; bay++) {
      if (!occupiedBays.has(bay)) {
        availableBays.push(bay);
      }
    }

    return {
      isAvailable: currentBookings < MAX_BAYS_PER_SLOT,
      currentBookings,
      maxCapacity: MAX_BAYS_PER_SLOT,
      availableBays,
    };
  }

  async assignRandomBay(
    date: string,
    timeSlot: string,
    branch: string,
  ): Promise<number | null> {
    const availability = await this.getSlotAvailability(date, timeSlot, branch);

    if (availability.availableBays.length === 0) {
      return null; // No available bays
    }

    // Randomly select from available bays
    const randomIndex = Math.floor(
      Math.random() * availability.availableBays.length,
    );
    return availability.availableBays[randomIndex];
  }

  // === SUBSCRIPTIONS ===

  async getSubscriptions(params?: {
    status?: string;
    userId?: string;
  }): Promise<any[]> {
    if (!this.db) {
      console.warn("⚠️ Database not connected");
      return [];
    }

    try {
      console.log("📋 Fetching subscriptions with params:", params);

      // Build the where conditions
      const conditions: any[] = [];
      if (params?.status) {
        conditions.push(eq(schema.packageSubscriptions.status, params.status));
      }
      if (params?.userId) {
        conditions.push(eq(schema.packageSubscriptions.userId, params.userId));
      }

      // Build query with optional where clause
      let query = this.db.select().from(schema.packageSubscriptions);

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Execute query with ordering
      const subscriptions = await query.orderBy(
        desc(schema.packageSubscriptions.startDate),
      );

      console.log(`✅ Found ${subscriptions?.length || 0} subscriptions`);

      // Map results to expected format, handling both snake_case and camelCase
      if (!subscriptions || subscriptions.length === 0) {
        return [];
      }

      return subscriptions
        .map((sub: any) => {
          try {
            return {
              id: sub.id,
              userId: sub.user_id || sub.userId,
              packageId: sub.package_id || sub.packageId,
              status: sub.status,
              startDate: sub.start_date || sub.startDate,
              endDate: sub.end_date || sub.endDate,
              renewalDate: sub.renewal_date || sub.renewalDate,
              finalPrice: parseFloat(sub.final_price || sub.finalPrice || "0"),
              autoRenew: sub.auto_renew !== false,
              cycleCount: sub.usage_count || sub.usageCount || 1,
              xenditPlanId: sub.xendit_plan_id || sub.xenditPlanId,
              paymentMethod: sub.payment_method || sub.paymentMethod || "card",
            };
          } catch (mapError) {
            console.warn("⚠️ Error mapping subscription:", sub, mapError);
            return null;
          }
        })
        .filter((sub) => sub !== null);
    } catch (error) {
      console.error("❌ Error fetching subscriptions:", error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  async createSubscription(subscriptionData: {
    userId: string;
    packageId: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    finalPrice: number;
    paymentMethod?: string;
    autoRenew?: boolean;
  }): Promise<any> {
    if (!this.db) throw new Error("Database not connected");

    try {
      const startDate = subscriptionData.startDate || new Date();

      // Calculate end date (30 days from start if not provided)
      const endDate =
        subscriptionData.endDate ||
        new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      const [subscription] = await this.db
        .insert(schema.packageSubscriptions)
        .values({
          id: createId(),
          userId: subscriptionData.userId,
          packageId: subscriptionData.packageId,
          status: subscriptionData.status || "pending",
          startDate,
          endDate,
          autoRenew: subscriptionData.autoRenew !== false,
          originalPrice: subscriptionData.finalPrice,
          discountApplied: 0,
          finalPrice: subscriptionData.finalPrice,
          usageCount: 0,
          paymentMethod: subscriptionData.paymentMethod || "registration",
          paymentStatus: "pending",
        })
        .returning();

      // Update user's subscription status to indicate they have a pending subscription
      console.log(
        "🔄 Updating user subscription status to pending for userId:",
        subscriptionData.userId,
      );
      await this.db
        .update(schema.users)
        .set({
          subscriptionStatus: "premium", // Set to premium/basic during pending
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, subscriptionData.userId))
        .catch((err) =>
          console.warn("⚠️ Could not update user subscription status:", err),
        );

      console.log("✅ Subscription created:", subscription.id);
      return subscription;
    } catch (error) {
      console.error("❌ Error creating subscription:", error);
      throw error;
    }
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: string,
  ): Promise<any> {
    if (!this.db) throw new Error("Database not connected");

    try {
      // First, get the subscription to find the userId
      const subscriptions = await this.db
        .select()
        .from(schema.packageSubscriptions)
        .where(eq(schema.packageSubscriptions.id, subscriptionId));

      if (!subscriptions || subscriptions.length === 0) {
        console.error("❌ Subscription not found:", subscriptionId);
        return null;
      }

      const subscription = subscriptions[0];
      const userId = subscription.user_id || subscription.userId;

      // Update subscription status
      const [updatedSubscription] = await this.db
        .update(schema.packageSubscriptions)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(schema.packageSubscriptions.id, subscriptionId))
        .returning();

      // If subscription is being activated, update user's subscriptionStatus
      if (status === "active" && userId) {
        // Map package names to subscription status
        const packageId = subscription.package_id || subscription.packageId;
        let userSubscriptionStatus = "premium"; // default

        if (
          packageId &&
          (packageId.includes("classic") || packageId.includes("silver"))
        ) {
          userSubscriptionStatus = "basic";
        } else if (
          packageId &&
          (packageId.includes("vip") || packageId.includes("gold"))
        ) {
          userSubscriptionStatus = "premium";
        }

        console.log(
          "🔄 Updating user subscription status to:",
          userSubscriptionStatus,
        );

        await this.db
          .update(schema.users)
          .set({
            subscriptionStatus: userSubscriptionStatus,
            subscriptionExpiry: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ), // 30 days from now
            updatedAt: new Date(),
          })
          .where(eq(schema.users.id, userId));

        console.log(
          "✅ User subscription status updated for userId:",
          userId,
          userSubscriptionStatus,
        );
      }

      console.log("✅ Subscription status updated:", subscriptionId, status);
      return updatedSubscription || null;
    } catch (error) {
      console.error("❌ Error updating subscription status:", error);
      throw error;
    }
  }

  // === NOTIFICATIONS ===

  async createSystemNotification(
    notificationData: Omit<NewSystemNotification, "id" | "createdAt">,
  ): Promise<SystemNotification> {
    if (!this.db) throw new Error("Database not connected");

    const [notification] = await this.db
      .insert(schema.systemNotifications)
      .values(notificationData)
      .returning();

    return notification;
  }

  async getNotificationsForUser(
    userId: string,
    userRole: string,
  ): Promise<SystemNotification[]> {
    if (!this.db) throw new Error("Database not connected");

    return await this.db
      .select()
      .from(schema.systemNotifications)
      .where(
        sql`${schema.systemNotifications.targetRoles} @> ${JSON.stringify([userRole])} OR ${schema.systemNotifications.targetUsers} @> ${JSON.stringify([userId])}`,
      )
      .orderBy(desc(schema.systemNotifications.createdAt));
  }

  async markNotificationAsRead(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not connected");

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
    if (!this.db) throw new Error("Database not connected");

    const [setting] = await this.db
      .select()
      .from(schema.adminSettings)
      .where(eq(schema.adminSettings.key, key))
      .limit(1);

    return setting || null;
  }

  async setSetting(
    key: string,
    value: any,
    description?: string,
    category?: string,
  ): Promise<AdminSetting> {
    if (!this.db) throw new Error("Database not connected");

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
    if (!this.db) throw new Error("Database not connected");

    return await this.db
      .select()
      .from(schema.adminSettings)
      .orderBy(schema.adminSettings.category, schema.adminSettings.key);
  }

  // === ADS MANAGEMENT ===

  async createAd(
    adData: Omit<NewAd, "id" | "createdAt" | "updatedAt">,
  ): Promise<Ad> {
    if (!this.db) throw new Error("Database not connected");

    const [ad] = await this.db.insert(schema.ads).values(adData).returning();

    return ad;
  }

  async getActiveAds(): Promise<Ad[]> {
    if (!this.db) throw new Error("Database not connected");

    return await this.db
      .select()
      .from(schema.ads)
      .where(eq(schema.ads.isActive, true))
      .orderBy(desc(schema.ads.createdAt));
  }

  async updateAd(id: string, updates: Partial<NewAd>): Promise<Ad> {
    if (!this.db) throw new Error("Database not connected");

    const [ad] = await this.db
      .update(schema.ads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.ads.id, id))
      .returning();

    return ad;
  }

  async deleteAd(id: string): Promise<boolean> {
    if (!this.db) throw new Error("Database not connected");

    const result = await this.db
      .delete(schema.ads)
      .where(eq(schema.ads.id, id));

    return result.rowCount > 0;
  }

  async dismissAd(adId: string, userEmail: string): Promise<void> {
    if (!this.db) throw new Error("Database not connected");

    await this.db.insert(schema.adDismissals).values({ adId, userEmail });
  }

  async isAdDismissed(adId: string, userEmail: string): Promise<boolean> {
    if (!this.db) throw new Error("Database not connected");

    const [dismissal] = await this.db
      .select()
      .from(schema.adDismissals)
      .where(
        and(
          eq(schema.adDismissals.adId, adId),
          eq(schema.adDismissals.userEmail, userEmail),
        ),
      )
      .limit(1);

    return !!dismissal;
  }

  // === BRANCH MANAGEMENT ===

  async getBranches(): Promise<any[]> {
    if (!this.db) throw new Error("Database not connected");

    try {
      const branches = await this.db
        .select()
        .from(schema.branches)
        .orderBy(schema.branches.name);

      // Calculate stats for each branch
      const branchesWithStats = await Promise.all(
        branches.map(async (branch: any) => {
          // Count customers in this branch
          const [customerCount] = await this.db
            .select({ count: count() })
            .from(schema.users)
            .where(
              and(
                eq(schema.users.branchLocation, branch.name),
                eq(schema.users.role, "user"),
              ),
            );

          // Count staff in this branch
          const [staffCount] = await this.db
            .select({ count: count() })
            .from(schema.users)
            .where(
              and(
                eq(schema.users.branchLocation, branch.name),
                sql`${schema.users.role} != 'user'`,
              ),
            );

          // Calculate revenue from bookings in this branch
          const [revenueResult] = await this.db
            .select({
              totalRevenue: sql<string>`SUM(${schema.bookings.totalPrice})`,
            })
            .from(schema.bookings)
            .where(
              and(
                eq(schema.bookings.branch, branch.name),
                eq(schema.bookings.status, "completed"),
              ),
            );

          // Count completed washes
          const [washCount] = await this.db
            .select({ count: count() })
            .from(schema.bookings)
            .where(
              and(
                eq(schema.bookings.branch, branch.name),
                eq(schema.bookings.status, "completed"),
              ),
            );

          return {
            ...branch,
            stats: {
              monthlyRevenue: parseFloat(revenueResult.totalRevenue || "0"),
              totalCustomers: customerCount.count,
              totalWashes: washCount.count,
              averageRating: 4.5, // TODO: Calculate from actual ratings
              staffCount: staffCount.count,
            },
          };
        }),
      );

      return branchesWithStats;
    } catch (error) {
      console.error("Error fetching branches:", error);
      return [];
    }
  }

  // === UTILITY METHODS ===

  async getStats(period: string = "monthly"): Promise<{
    totalUsers: number;
    totalBookings: number;
    totalOnlineBookings: number;
    activeAds: number;
    pendingBookings: number;
    totalRevenue: number;
    totalWashes: number;
    totalExpenses: number;
    netIncome: number;
    activeSubscriptions: number;
    totalSubscriptionRevenue: number;
    newSubscriptions: number;
    subscriptionUpgrades: number;
    monthlyGrowth: number;
  }> {
    const db = await this.ensureConnection();
    if (!db) throw new Error("Database not connected");

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "daily":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "monthly":
      default:
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    const [userCount] = await db
      .select({ count: count() })
      .from(schema.users);

    const [bookingCount] = await db
      .select({ count: count() })
      .from(schema.bookings)
      .where(gte(schema.bookings.createdAt, startDate));

    // Count online bookings (where userId IS NOT NULL - registered customers)
    const [onlineBookingCount] = await db
      .select({ count: count() })
      .from(schema.bookings)
      .where(
        and(
          ne(schema.bookings.userId, null),
          gte(schema.bookings.createdAt, startDate),
        ),
      );

    const [adCount] = await db
      .select({ count: count() })
      .from(schema.ads)
      .where(eq(schema.ads.isActive, true));

    const [pendingCount] = await db
      .select({ count: count() })
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.status, "pending"),
          gte(schema.bookings.createdAt, startDate),
        ),
      );

    // Calculate total revenue from completed bookings (within date range)
    const [bookingRevenueResult] = await db
      .select({ totalRevenue: sql<string>`SUM(${schema.bookings.totalPrice})` })
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.status, "completed"),
          gte(schema.bookings.createdAt, startDate),
        ),
      );

    // Calculate total revenue from POS transactions (within date range)
    const [posRevenueResult] = await db
      .select({
        totalRevenue: sql<string>`SUM(${schema.posTransactions.totalAmount})`,
      })
      .from(schema.posTransactions)
      .where(
        and(
          eq(schema.posTransactions.status, "completed"),
          gte(schema.posTransactions.createdAt, startDate),
        ),
      );

    // Combine both revenues
    const bookingRevenue = parseFloat(bookingRevenueResult.totalRevenue || "0");
    const posRevenue = parseFloat(posRevenueResult.totalRevenue || "0");
    const totalRevenue = bookingRevenue + posRevenue;

    // Count completed washes from bookings (within date range)
    const [bookingWashCount] = await db
      .select({ count: count() })
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.status, "completed"),
          gte(schema.bookings.createdAt, startDate),
        ),
      );

    // Count POS carwash transactions (items with "Wash" in name, within date range)
    const [posWashCount] = await db
      .select({ count: count() })
      .from(schema.posTransactionItems)
      .where(
        and(
          sql`${schema.posTransactionItems.itemName} LIKE '%wash%' OR ${schema.posTransactionItems.itemName} LIKE '%Wash%'`,
          gte(schema.posTransactionItems.createdAt, startDate),
        ),
      );

    const totalWashes = bookingWashCount.count + posWashCount.count;

    // Calculate total expenses from POS sessions (within date range)
    const [expenseResult] = await db
      .select({ totalExpenses: sql<string>`SUM(${schema.posExpenses.amount})` })
      .from(schema.posExpenses)
      .where(gte(schema.posExpenses.createdAt, startDate));

    const totalExpenses = parseFloat(expenseResult.totalExpenses || "0");
    const netIncome = totalRevenue - totalExpenses;

    // Count active subscriptions (users with non-free subscription status)
    const [subscriptionCount] = await db
      .select({ count: count() })
      .from(schema.users)
      .where(sql`${schema.users.subscriptionStatus} != 'free'`);

    // Calculate monthly growth (users created in last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [recentUsers] = await db
      .select({ count: count() })
      .from(schema.users)
      .where(sql`${schema.users.createdAt} >= ${thirtyDaysAgo}`);

    const [previousUsers] = await db
      .select({ count: count() })
      .from(schema.users)
      .where(
        sql`${schema.users.createdAt} >= ${sixtyDaysAgo} AND ${schema.users.createdAt} < ${thirtyDaysAgo}`,
      );

    // Calculate growth percentage
    const monthlyGrowth =
      previousUsers.count > 0
        ? ((recentUsers.count - previousUsers.count) / previousUsers.count) *
          100
        : recentUsers.count > 0
          ? 100
          : 0;

    // === SUBSCRIPTION METRICS ===

    // Calculate total subscription revenue from active/completed subscriptions (within date range)
    const [subscriptionRevenueResult] = await db
      .select({
        totalRevenue: sql<string>`SUM(${schema.packageSubscriptions.finalPrice})`,
      })
      .from(schema.packageSubscriptions)
      .where(
        and(
          ne(schema.packageSubscriptions.status, "cancelled"),
          ne(schema.packageSubscriptions.status, "expired"),
          gte(schema.packageSubscriptions.startDate, startDate),
        ),
      );

    const totalSubscriptionRevenue = parseFloat(
      subscriptionRevenueResult.totalRevenue || "0",
    );

    // Count new subscriptions (within date range)
    const [newSubscriptionCount] = await db
      .select({ count: count() })
      .from(schema.packageSubscriptions)
      .where(gte(schema.packageSubscriptions.startDate, startDate));

    // Count subscription upgrades (users with non-free subscription status created/updated in period)
    const [upgradeCount] = await db
      .select({ count: count() })
      .from(schema.users)
      .where(
        and(
          ne(schema.users.subscriptionStatus, "free"),
          gte(schema.users.updatedAt, startDate),
        ),
      );

    return {
      totalUsers: userCount.count,
      totalBookings: bookingCount.count,
      totalOnlineBookings: onlineBookingCount.count,
      activeAds: adCount.count,
      pendingBookings: pendingCount.count,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalWashes: totalWashes,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netIncome: Math.round(netIncome * 100) / 100,
      activeSubscriptions: subscriptionCount.count,
      totalSubscriptionRevenue:
        Math.round(totalSubscriptionRevenue * 100) / 100,
      newSubscriptions: newSubscriptionCount.count,
      subscriptionUpgrades: upgradeCount.count,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100, // Round to 2 decimal places
    };
  }

  // === REAL-TIME CREW AND CUSTOMER TRACKING ===

  async getRealtimeStats(): Promise<{
    onlineCrew: number;
    busyCrew: number;
    activeCustomers: number;
    activeGroups: number;
  }> {
    if (!this.db) throw new Error("Database not connected");

    try {
      // Count online crew (active status within last 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      const [onlineCrewResult] = await this.db
        .select({ count: count() })
        .from(schema.crewStatus)
        .where(
          and(
            eq(schema.crewStatus.status, "online"),
            sql`${schema.crewStatus.endedAt} IS NULL`,
            sql`${schema.crewStatus.startedAt} >= ${tenMinutesAgo}`,
          ),
        );

      // Count busy crew
      const [busyCrewResult] = await this.db
        .select({ count: count() })
        .from(schema.crewStatus)
        .where(
          and(
            eq(schema.crewStatus.status, "busy"),
            sql`${schema.crewStatus.endedAt} IS NULL`,
          ),
        );

      // Count active customers (sessions active within last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const [activeCustomersResult] = await this.db
        .select({ count: count() })
        .from(schema.customerSessions)
        .where(
          and(
            eq(schema.customerSessions.status, "active"),
            sql`${schema.customerSessions.lastActivity} >= ${thirtyMinutesAgo}`,
          ),
        );

      // Count active crew groups (groups with at least one online member)
      const [activeGroupsResult] = await this.db
        .select({ count: count() })
        .from(schema.crewGroups)
        .where(
          and(
            eq(schema.crewGroups.status, "active"),
            sql`EXISTS (
              SELECT 1 FROM ${schema.crewMembers} cm
              JOIN ${schema.crewStatus} cs ON cm.id = cs.crew_id
              WHERE cm.crew_group_id = ${schema.crewGroups.id}
              AND cs.status IN ('online', 'busy')
              AND cs.ended_at IS NULL
            )`,
          ),
        );

      return {
        onlineCrew: onlineCrewResult.count,
        busyCrew: busyCrewResult.count,
        activeCustomers: activeCustomersResult.count,
        activeGroups: activeGroupsResult.count,
      };
    } catch (error) {
      console.error("Error fetching realtime stats:", error);
      // Return default values if query fails
      return {
        onlineCrew: 0,
        busyCrew: 0,
        activeCustomers: 0,
        activeGroups: 0,
      };
    }
  }

  // === COMPREHENSIVE FAC MAP STATISTICS ===
  async getFacMapStats(): Promise<{
    crew: {
      total: number;
      online: number;
      busy: number;
      available: number;
      offline: number;
    };
    customers: {
      total: number;
      active: number;
      champions: number;
      vip: number;
      loyal: number;
      regular: number;
      new: number;
    };
    realtime: {
      timestamp: string;
      lastUpdate: string;
    };
  }> {
    if (!this.db) throw new Error("Database not connected");

    try {
      // === CREW STATISTICS ===

      // Total crew members
      const [totalCrewResult] = await this.db
        .select({ count: count() })
        .from(schema.crewMembers)
        .where(eq(schema.crewMembers.status, "active"));

      // Current crew status counts (active within last 15 minutes)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      const [onlineCrewResult] = await this.db
        .select({ count: count() })
        .from(schema.crewStatus)
        .where(
          and(
            eq(schema.crewStatus.status, "online"),
            sql`${schema.crewStatus.endedAt} IS NULL`,
            sql`${schema.crewStatus.startedAt} >= ${fifteenMinutesAgo}`,
          ),
        );

      const [busyCrewResult] = await this.db
        .select({ count: count() })
        .from(schema.crewStatus)
        .where(
          and(
            eq(schema.crewStatus.status, "busy"),
            sql`${schema.crewStatus.endedAt} IS NULL`,
          ),
        );

      const [availableCrewResult] = await this.db
        .select({ count: count() })
        .from(schema.crewStatus)
        .where(
          and(
            eq(schema.crewStatus.status, "available"),
            sql`${schema.crewStatus.endedAt} IS NULL`,
          ),
        );

      // === CUSTOMER STATISTICS ===

      // Total customers (users with role 'user')
      const [totalCustomersResult] = await this.db
        .select({ count: count() })
        .from(schema.users)
        .where(
          and(eq(schema.users.role, "user"), eq(schema.users.isActive, true)),
        );

      // Active customers (with sessions in last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [activeCustomersResult] = await this.db
        .select({ count: count() })
        .from(schema.customerSessions)
        .where(
          and(
            eq(schema.customerSessions.status, "active"),
            sql`${schema.customerSessions.lastActivity} >= ${twentyFourHoursAgo}`,
          ),
        );

      // Customer tiers based on loyalty points and subscription status
      const [championsResult] = await this.db
        .select({ count: count() })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.role, "user"),
            eq(schema.users.isActive, true),
            sql`${schema.users.loyaltyPoints} >= 10000`, // Champions: 10k+ points
          ),
        );

      const [vipResult] = await this.db
        .select({ count: count() })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.role, "user"),
            eq(schema.users.isActive, true),
            or(
              eq(schema.users.subscriptionStatus, "vip"),
              eq(schema.users.subscriptionStatus, "premium"),
            ),
          ),
        );

      const [loyalResult] = await this.db
        .select({ count: count() })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.role, "user"),
            eq(schema.users.isActive, true),
            sql`${schema.users.loyaltyPoints} >= 1000 AND ${schema.users.loyaltyPoints} < 10000`, // Loyal: 1k-10k points
          ),
        );

      const [regularResult] = await this.db
        .select({ count: count() })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.role, "user"),
            eq(schema.users.isActive, true),
            sql`${schema.users.loyaltyPoints} >= 100 AND ${schema.users.loyaltyPoints} < 1000`, // Regular: 100-1k points
          ),
        );

      // New customers (created in last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [newCustomersResult] = await this.db
        .select({ count: count() })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.role, "user"),
            eq(schema.users.isActive, true),
            sql`${schema.users.createdAt} >= ${thirtyDaysAgo}`,
          ),
        );

      // Calculate offline crew
      const totalCrew = totalCrewResult.count;
      const onlineCrew = onlineCrewResult.count;
      const busyCrew = busyCrewResult.count;
      const availableCrew = availableCrewResult.count;
      const offlineCrew = totalCrew - onlineCrew - busyCrew - availableCrew;

      return {
        crew: {
          total: totalCrew,
          online: onlineCrew,
          busy: busyCrew,
          available: availableCrew,
          offline: Math.max(0, offlineCrew), // Ensure no negative values
        },
        customers: {
          total: totalCustomersResult.count,
          active: activeCustomersResult.count,
          champions: championsResult.count,
          vip: vipResult.count,
          loyal: loyalResult.count,
          regular: regularResult.count,
          new: newCustomersResult.count,
        },
        realtime: {
          timestamp: new Date().toISOString(),
          lastUpdate: new Date().toLocaleString("en-US", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        },
      };
    } catch (error) {
      console.error("Error fetching FAC MAP stats:", error);

      // Return fallback data based on existing users if available
      try {
        const allUsers = await this.getAllUsers();
        const customers = allUsers.filter((user) => user.role === "user");

        return {
          crew: {
            total: 20,
            online: 18,
            busy: 12,
            available: Math.max(0, 20 - 18 - 12),
            offline: 2,
          },
          customers: {
            total: customers.length || 50,
            active: Math.floor((customers.length || 50) * 0.94), // 94% active
            champions: Math.floor((customers.length || 50) * 0.1), // 10% champions
            vip: Math.floor((customers.length || 50) * 0.24), // 24% VIP
            loyal: Math.floor((customers.length || 50) * 0.36), // 36% loyal
            regular: Math.floor((customers.length || 50) * 0.2), // 20% regular
            new: Math.floor((customers.length || 50) * 0.1), // 10% new
          },
          realtime: {
            timestamp: new Date().toISOString(),
            lastUpdate: new Date().toLocaleString("en-US", {
              timeZone: "Asia/Manila",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          },
        };
      } catch (fallbackError) {
        console.error("Error in fallback stats:", fallbackError);

        // Final fallback with realistic demo data
        return {
          crew: {
            total: 20,
            online: 18,
            busy: 12,
            available: 6,
            offline: 2,
          },
          customers: {
            total: 50,
            active: 47,
            champions: 5,
            vip: 12,
            loyal: 18,
            regular: 10,
            new: 5,
          },
          realtime: {
            timestamp: new Date().toISOString(),
            lastUpdate: new Date().toLocaleString("en-US", {
              timeZone: "Asia/Manila",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          },
        };
      }
    }
  }

  // ============= NEW FEATURES METHODS =============

  // Service packages methods
  async getServicePackages() {
    try {
      if (!this.db) {
        console.warn("Database not initialized, returning fallback packages");
        return [
          {
            id: "pkg_basic_carwash",
            name: "Basic Car Wash",
            description: "Essential car wash service",
            category: "carwash",
            base_price: 150,
            is_active: true,
            is_popular: true,
          },
        ];
      }

      // Use Drizzle ORM to fetch packages
      const packages = await this.db
        .select()
        .from(schema.servicePackages)
        .where(eq(schema.servicePackages.isActive, true))
        .orderBy(
          desc(schema.servicePackages.isFeatured),
          desc(schema.servicePackages.isPopular),
          asc(schema.servicePackages.name)
        );

      console.log(
        `✅ Service packages retrieved: ${packages.length} packages found`
      );
      return packages || [];
    } catch (error) {
      console.error("Get service packages error:", error);
      // Return mock data if table doesn't exist yet
      return [
        {
          id: "pkg_basic_carwash",
          name: "Basic Car Wash",
          description: "Essential car wash service",
          category: "carwash",
          base_price: 150,
          is_active: true,
          is_popular: true,
        },
      ];
    }
  }

  // Gamification methods
  async getCustomerLevels() {
    try {
      const sql = this.createSqlClient();
      const result =
        await sql`SELECT * FROM customer_levels WHERE is_active = true ORDER BY min_points ASC`;
      return result || [];
    } catch (error) {
      console.error("Get customer levels error:", error);
      // Return mock data if table doesn't exist yet
      return [
        {
          id: "level_bronze",
          name: "Bronze Member",
          min_points: 0,
          max_points: 999,
          discount_percentage: 0,
          is_active: true,
        },
        {
          id: "level_silver",
          name: "Silver Member",
          min_points: 1000,
          max_points: 4999,
          discount_percentage: 5,
          is_active: true,
        },
      ];
    }
  }

  // POS methods
  async getPOSCategories() {
    try {
      const sql = this.createSqlClient();
      const result =
        await sql`SELECT * FROM pos_categories WHERE is_active = true ORDER BY sort_order ASC, name ASC`;
      return result || [];
    } catch (error) {
      console.error("Get POS categories error:", error);
      // Return mock data if table doesn't exist yet
      return [
        {
          id: "cat_carwash",
          name: "Car Wash Services",
          description: "Professional car washing services",
          icon: "Car",
          color: "#3B82F6",
          is_active: true,
        },
      ];
    }
  }

  // === INVENTORY MANAGEMENT ===

  async getInventoryItems() {
    try {
      if (!this.db) {
        console.warn("Database not initialized");
        return [];
      }

      const items = await this.db
        .select()
        .from(schema.inventoryItems)
        .where(eq(schema.inventoryItems.isActive, true));
      console.log("✅ Inventory items retrieved:", items.length);
      return items;
    } catch (error) {
      console.error("❌ Error getting inventory items:", error);
      return [];
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
  }) {
    try {
      if (!this.db) throw new Error("Database not initialized");

      const [newItem] = await this.db
        .insert(schema.inventoryItems)
        .values({
          name: itemData.name,
          category: itemData.category,
          description: itemData.description,
          currentStock: itemData.currentStock,
          minStockLevel: itemData.minStockLevel,
          maxStockLevel: itemData.maxStockLevel,
          unitPrice: itemData.unitPrice,
          supplier: itemData.supplier,
          barcode: itemData.barcode,
          isActive: true,
        })
        .returning();

      // Create initial stock movement
      if (itemData.currentStock > 0) {
        await this.createStockMovement({
          itemId: newItem.id,
          type: "in",
          quantity: itemData.currentStock,
          reason: "Initial stock",
          performedBy: "system",
          notes: "Item created with initial stock",
        });
      }

      console.log("✅ Inventory item created:", newItem.id);
      return newItem;
    } catch (error) {
      console.error("❌ Error creating inventory item:", error);
      throw error;
    }
  }

  async updateInventoryItem(
    id: string,
    updates: Partial<{
      name: string;
      category: string;
      description: string;
      minStockLevel: number;
      maxStockLevel: number;
      unitPrice: number;
      supplier: string;
      barcode: string;
      isActive: boolean;
    }>,
  ) {
    try {
      if (!this.db) throw new Error("Database not initialized");

      const [updatedItem] = await this.db
        .update(schema.inventoryItems)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.inventoryItems.id, id))
        .returning();

      console.log("✅ Inventory item updated:", id);
      return updatedItem;
    } catch (error) {
      console.error("❌ Error updating inventory item:", error);
      throw error;
    }
  }

  async deleteInventoryItem(id: string) {
    try {
      if (!this.db) throw new Error("Database not initialized");

      // Soft delete by setting isActive to false
      await this.db
        .update(schema.inventoryItems)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(schema.inventoryItems.id, id));

      console.log("✅ Inventory item deleted (soft):", id);
    } catch (error) {
      console.error("❌ Error deleting inventory item:", error);
      throw error;
    }
  }

  async updateInventoryStock(
    id: string,
    newStock: number,
    reason: string,
    performedBy: string,
    notes?: string,
  ) {
    try {
      if (!this.db) throw new Error("Database not initialized");

      // Get current item
      const [currentItem] = await this.db
        .select()
        .from(schema.inventoryItems)
        .where(eq(schema.inventoryItems.id, id));
      if (!currentItem) throw new Error("Item not found");

      const oldStock = currentItem.currentStock;
      const stockDiff = newStock - oldStock;

      // Update stock
      await this.db
        .update(schema.inventoryItems)
        .set({ currentStock: newStock, updatedAt: new Date() })
        .where(eq(schema.inventoryItems.id, id));

      // Record stock movement
      await this.createStockMovement({
        itemId: id,
        type: stockDiff > 0 ? "in" : stockDiff < 0 ? "out" : "adjustment",
        quantity: Math.abs(stockDiff),
        reason,
        performedBy,
        notes,
      });

      console.log(
        "✅ Inventory stock updated:",
        id,
        `${oldStock} → ${newStock}`,
      );
      return { oldStock, newStock, difference: stockDiff };
    } catch (error) {
      console.error("❌ Error updating inventory stock:", error);
      throw error;
    }
  }

  async getStockMovements(itemId?: string, limit: number = 50) {
    try {
      if (!this.db) {
        console.warn("Database not initialized");
        return [];
      }

      let query = this.db.select().from(schema.stockMovements);

      if (itemId) {
        query = query.where(eq(schema.stockMovements.itemId, itemId));
      }

      const movements = await query
        .orderBy(desc(schema.stockMovements.createdAt))
        .limit(limit);

      console.log("✅ Stock movements retrieved:", movements.length);
      return movements;
    } catch (error) {
      console.error("❌ Error getting stock movements:", error);
      return [];
    }
  }

  async createStockMovement(movementData: {
    itemId: string;
    type: "in" | "out" | "adjustment";
    quantity: number;
    reason: string;
    reference?: string;
    performedBy: string;
    notes?: string;
  }) {
    try {
      if (!this.db) throw new Error("Database not initialized");

      const [movement] = await this.db
        .insert(schema.stockMovements)
        .values({
          itemId: movementData.itemId,
          type: movementData.type,
          quantity: movementData.quantity,
          reason: movementData.reason,
          reference: movementData.reference,
          performedBy: movementData.performedBy,
          notes: movementData.notes,
        })
        .returning();

      console.log("✅ Stock movement created:", movement.id);
      return movement;
    } catch (error) {
      console.error("❌ Error creating stock movement:", error);
      throw error;
    }
  }

  async getSuppliers() {
    try {
      if (!this.db) {
        console.warn("Database not initialized");
        return [];
      }

      const suppliersList = await this.db
        .select()
        .from(schema.suppliers)
        .where(eq(schema.suppliers.status, "active"));
      console.log("✅ Suppliers retrieved:", suppliersList.length);
      return suppliersList;
    } catch (error) {
      console.error("❌ Error getting suppliers:", error);
      return [];
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
  }) {
    try {
      if (!this.db) throw new Error("Database not initialized");

      const [newSupplier] = await this.db
        .insert(schema.suppliers)
        .values({
          name: supplierData.name,
          contactPerson: supplierData.contactPerson,
          email: supplierData.email,
          phone: supplierData.phone,
          address: supplierData.address,
          website: supplierData.website,
          paymentTerms: supplierData.paymentTerms || "Net 30",
          notes: supplierData.notes,
          status: "active",
        })
        .returning();

      console.log("✅ Supplier created:", newSupplier.id);
      return newSupplier;
    } catch (error) {
      console.error("❌ Error creating supplier:", error);
      throw error;
    }
  }

  async updateSupplier(
    id: string,
    updates: Partial<{
      name: string;
      contactPerson: string;
      email: string;
      phone: string;
      address: string;
      website: string;
      paymentTerms: string;
      notes: string;
      status: string;
    }>,
  ) {
    try {
      if (!this.db) throw new Error("Database not initialized");

      const [updatedSupplier] = await this.db
        .update(schema.suppliers)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.suppliers.id, id))
        .returning();

      console.log("✅ Supplier updated:", id);
      return updatedSupplier;
    } catch (error) {
      console.error("❌ Error updating supplier:", error);
      throw error;
    }
  }

  async deleteSupplier(id: string) {
    try {
      if (!this.db) throw new Error("Database not initialized");

      // Soft delete by setting status to inactive
      await this.db
        .update(schema.suppliers)
        .set({ status: "inactive", updatedAt: new Date() })
        .where(eq(schema.suppliers.id, id));

      console.log("✅ Supplier deleted (soft):", id);
    } catch (error) {
      console.error("❌ Error deleting supplier:", error);
      throw error;
    }
  }

  async getLowStockItems() {
    try {
      if (!this.db) {
        console.warn("Database not initialized");
        return [];
      }

      const lowStockItems = await this.db
        .select()
        .from(schema.inventoryItems)
        .where(
          and(
            eq(schema.inventoryItems.isActive, true),
            sql`${schema.inventoryItems.currentStock} <= ${schema.inventoryItems.minStockLevel}`,
          ),
        )
        .orderBy(schema.inventoryItems.currentStock);

      console.log("✅ Low stock items retrieved:", lowStockItems.length);
      return lowStockItems;
    } catch (error) {
      console.error("❌ Error getting low stock items:", error);
      return [];
    }
  }

  async getInventoryAnalytics() {
    try {
      if (!this.db) {
        console.warn("Database not initialized");
        return {
          totalItems: 0,
          totalValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          categoryBreakdown: [],
          recentMovements: [],
        };
      }

      // Get all active items
      const items = await this.db
        .select()
        .from(schema.inventoryItems)
        .where(eq(schema.inventoryItems.isActive, true));

      // Calculate metrics
      const totalItems = items.length;
      const totalValue = items.reduce(
        (sum: number, item: any) =>
          sum + item.currentStock * (item.unitPrice || 0),
        0,
      );
      const lowStockCount = items.filter(
        (item: any) =>
          item.currentStock <= item.minStockLevel && item.currentStock > 0,
      ).length;
      const outOfStockCount = items.filter(
        (item: any) => item.currentStock === 0,
      ).length;

      // Category breakdown
      const categoryBreakdown = items.reduce(
        (acc: Record<string, { count: number; value: number }>, item: any) => {
          const category = item.category;
          if (!acc[category]) {
            acc[category] = { count: 0, value: 0 };
          }
          acc[category].count++;
          acc[category].value += item.currentStock * (item.unitPrice || 0);
          return acc;
        },
        {},
      );

      // Recent movements
      const recentMovements = await this.db
        .select()
        .from(schema.stockMovements)
        .orderBy(desc(schema.stockMovements.createdAt))
        .limit(10);

      const analytics = {
        totalItems,
        totalValue,
        lowStockCount,
        outOfStockCount,
        categoryBreakdown: Object.entries(categoryBreakdown).map(
          ([name, data]) => ({ name, ...data }),
        ),
        recentMovements,
      };

      console.log("✅ Inventory analytics calculated");
      return analytics;
    } catch (error) {
      console.error("❌ Error calculating inventory analytics:", error);
      return {
        totalItems: 0,
        totalValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        categoryBreakdown: [],
        recentMovements: [],
      };
    }
  }

  // Helper method to create SQL client
  private createSqlClient() {
    const DATABASE_URL =
      process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "";
    if (!DATABASE_URL) {
      throw new Error("Database URL not configured");
    }
    const { neon } = require("@neondatabase/serverless");
    return neon(DATABASE_URL);
  }
}

// Export singleton instance
export const neonDbService = new NeonDatabaseService();
export default neonDbService;
