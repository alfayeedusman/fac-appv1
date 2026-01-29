/**
 * LocalStorage Data Sync Service
 * Migrates all localStorage data to Neon database
 */

import { neonDbClient } from "./neonDatabaseService";

interface SyncProgress {
  totalItems: number;
  syncedItems: number;
  failedItems: number;
  status: "pending" | "syncing" | "complete" | "error";
  message: string;
}

export class LocalStorageSyncService {
  private static syncProgress: SyncProgress = {
    totalItems: 0,
    syncedItems: 0,
    failedItems: 0,
    status: "pending",
    message: "",
  };

  /**
   * Sync all localStorage data to database
   */
  static async syncAllData(): Promise<SyncProgress> {
    console.log("🔄 Starting localStorage to database sync...");
    this.syncProgress.status = "syncing";

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.warn("⚠️ No userId found in localStorage");
        return this.syncProgress;
      }

      // Sync preferences (theme, notifications, language, etc.)
      await this.syncPreferences(userId);

      // Sync notifications
      await this.syncNotifications(userId);

      // Sync printer configuration
      await this.syncPrinterConfig(userId);

      // Sync gamification progress
      await this.syncGamificationProgress(userId);

      // Sync user profile data
      await this.syncUserProfile(userId);

      this.syncProgress.status = "complete";
      this.syncProgress.message = `✅ Synced ${this.syncProgress.syncedItems} items`;
      console.log(this.syncProgress.message);

      return this.syncProgress;
    } catch (error) {
      console.error("❌ Sync failed:", error);
      this.syncProgress.status = "error";
      this.syncProgress.message =
        error instanceof Error ? error.message : "Unknown error";
      return this.syncProgress;
    }
  }

  /**
   * Sync user preferences (theme, notifications, language, timezone)
   */
  private static async syncPreferences(userId: string): Promise<void> {
    try {
      const theme = localStorage.getItem("theme") || "light";
      const notificationsEnabled =
        localStorage.getItem("notificationsEnabled") !== "false";
      const emailNotifications =
        localStorage.getItem("emailNotifications") !== "false";
      const pushNotifications =
        localStorage.getItem("pushNotifications") !== "false";
      const smsNotifications =
        localStorage.getItem("smsNotifications") === "true";
      const language = localStorage.getItem("language") || "en";
      const timezone = localStorage.getItem("timezone") || "UTC";

      const response = await fetch("/api/neon/sync/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          theme,
          notificationsEnabled,
          emailNotifications,
          pushNotifications,
          smsNotifications,
          language,
          timezone,
        }),
      });

      if (response.ok) {
        console.log("✅ Preferences synced");
        this.syncProgress.syncedItems++;
      } else {
        this.syncProgress.failedItems++;
      }
    } catch (error) {
      console.error("❌ Failed to sync preferences:", error);
      this.syncProgress.failedItems++;
    }
    this.syncProgress.totalItems++;
  }

  /**
   * Sync user notifications
   */
  private static async syncNotifications(userId: string): Promise<void> {
    try {
      // Get notifications from localStorage (per-user notifications)
      const notificationsKey = `notifications_${
        localStorage.getItem("userEmail") || userId
      }`;
      const notificationsData = localStorage.getItem(notificationsKey);

      if (!notificationsData) {
        this.syncProgress.totalItems++;
        return;
      }

      const notifications = JSON.parse(notificationsData);

      if (Array.isArray(notifications) && notifications.length > 0) {
        const response = await fetch("/api/neon/sync/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, notifications }),
        });

        if (response.ok) {
          console.log(
            `✅ ${notifications.length} notifications synced`,
          );
          this.syncProgress.syncedItems++;
        } else {
          this.syncProgress.failedItems++;
        }
      }
    } catch (error) {
      console.error("❌ Failed to sync notifications:", error);
      this.syncProgress.failedItems++;
    }
    this.syncProgress.totalItems++;
  }

  /**
   * Sync printer configuration
   */
  private static async syncPrinterConfig(userId: string): Promise<void> {
    try {
      const printerConfig = localStorage.getItem("fac_printer_config");
      if (!printerConfig) {
        this.syncProgress.totalItems++;
        return;
      }

      const config = JSON.parse(printerConfig);

      const response = await fetch("/api/neon/sync/printer-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          printerName: config.printerName || "Default Printer",
          printerType: config.printerType || "thermal",
          connectionType: config.connectionType || "usb",
          deviceId: config.deviceId,
          ipAddress: config.ipAddress,
          port: config.port,
          templateId: config.templateId,
          settings: config.settings,
          isDefault: config.isDefault || true,
        }),
      });

      if (response.ok) {
        console.log("✅ Printer config synced");
        this.syncProgress.syncedItems++;
      } else {
        this.syncProgress.failedItems++;
      }
    } catch (error) {
      console.error("❌ Failed to sync printer config:", error);
      this.syncProgress.failedItems++;
    }
    this.syncProgress.totalItems++;
  }

  /**
   * Sync gamification progress
   */
  private static async syncGamificationProgress(userId: string): Promise<void> {
    try {
      const progressKey = `fac_user_progress_${userId}`;
      const progressData = localStorage.getItem(progressKey);

      if (!progressData) {
        this.syncProgress.totalItems++;
        return;
      }

      const progress = JSON.parse(progressData);

      const response = await fetch("/api/neon/sync/gamification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          currentLevel: progress.currentLevel || 1,
          currentXP: progress.currentXP || 0,
          totalXP: progress.totalXP || 0,
          levelProgress: progress.levelProgress,
          unlockedAchievements: progress.unlockedAchievements || [],
          badges: progress.badges || [],
          streakDays: progress.streakDays || 0,
          totalBookingsCompleted: progress.totalBookingsCompleted || 0,
          totalWashesCompleted: progress.totalWashesCompleted || 0,
        }),
      });

      if (response.ok) {
        console.log("✅ Gamification progress synced");
        this.syncProgress.syncedItems++;
      } else {
        this.syncProgress.failedItems++;
      }
    } catch (error) {
      console.error("❌ Failed to sync gamification progress:", error);
      this.syncProgress.failedItems++;
    }
    this.syncProgress.totalItems++;
  }

  /**
   * Sync user profile data
   */
  private static async syncUserProfile(userId: string): Promise<void> {
    try {
      const profileData = localStorage.getItem("userProfile");
      if (!profileData) {
        this.syncProgress.totalItems++;
        return;
      }

      const profile = JSON.parse(profileData);

      // Update user in database with profile data
      const response = await fetch("/api/neon/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          fullName: profile.fullName,
          contactNumber: profile.phone,
          address: profile.address,
          profileImage: profile.profilePicture,
        }),
      });

      if (response.ok) {
        console.log("✅ User profile synced");
        this.syncProgress.syncedItems++;
      } else {
        this.syncProgress.failedItems++;
      }
    } catch (error) {
      console.error("❌ Failed to sync user profile:", error);
      this.syncProgress.failedItems++;
    }
    this.syncProgress.totalItems++;
  }

  /**
   * Fetch preferences from database or localStorage
   */
  static async getPreferences(userId: string) {
    try {
      const response = await fetch(
        `/api/neon/sync/preferences?userId=${encodeURIComponent(userId)}`,
      );
      if (response.ok) {
        const data = await response.json();
        return data.preferences;
      }
    } catch (error) {
      console.warn("⚠️ Failed to fetch preferences from database:", error);
    }

    // Fallback to localStorage
    return {
      theme: localStorage.getItem("theme") || "light",
      notificationsEnabled:
        localStorage.getItem("notificationsEnabled") !== "false",
      emailNotifications:
        localStorage.getItem("emailNotifications") !== "false",
      pushNotifications:
        localStorage.getItem("pushNotifications") !== "false",
      smsNotifications: localStorage.getItem("smsNotifications") === "true",
      language: localStorage.getItem("language") || "en",
      timezone: localStorage.getItem("timezone") || "UTC",
    };
  }

  /**
   * Fetch notifications from database
   */
  static async getNotifications(userId: string, unreadOnly: boolean = false) {
    try {
      const url = `/api/neon/sync/notifications?userId=${encodeURIComponent(
        userId,
      )}&unreadOnly=${unreadOnly}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return data.notifications || [];
      }
    } catch (error) {
      console.warn("⚠️ Failed to fetch notifications from database:", error);
    }

    // Fallback to localStorage
    const email = localStorage.getItem("userEmail");
    const notificationsKey = `notifications_${email || userId}`;
    const data = localStorage.getItem(notificationsKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Fetch gamification progress from database
   */
  static async getGamificationProgress(userId: string) {
    try {
      const response = await fetch(
        `/api/neon/sync/gamification?userId=${encodeURIComponent(userId)}`,
      );
      if (response.ok) {
        const data = await response.json();
        return data.progress;
      }
    } catch (error) {
      console.warn(
        "⚠️ Failed to fetch gamification progress from database:",
        error,
      );
    }

    // Fallback to localStorage
    const progressKey = `fac_user_progress_${userId}`;
    const data = localStorage.getItem(progressKey);
    return data
      ? JSON.parse(data)
      : {
          currentLevel: 1,
          currentXP: 0,
          totalXP: 0,
          streakDays: 0,
          totalBookingsCompleted: 0,
          totalWashesCompleted: 0,
        };
  }

  /**
   * Fetch printer configs from database
   */
  static async getPrinterConfigs(userId: string) {
    try {
      const response = await fetch(
        `/api/neon/sync/printer-configs?userId=${encodeURIComponent(userId)}`,
      );
      if (response.ok) {
        const data = await response.json();
        return data.printers || [];
      }
    } catch (error) {
      console.warn(
        "⚠️ Failed to fetch printer configs from database:",
        error,
      );
    }

    // Fallback to localStorage
    const data = localStorage.getItem("fac_printer_config");
    return data ? [JSON.parse(data)] : [];
  }

  /**
   * Get sync status
   */
  static getSyncProgress(): SyncProgress {
    return this.syncProgress;
  }

  /**
   * Reset sync progress
   */
  static resetSyncProgress(): void {
    this.syncProgress = {
      totalItems: 0,
      syncedItems: 0,
      failedItems: 0,
      status: "pending",
      message: "",
    };
  }
}

export default LocalStorageSyncService;
