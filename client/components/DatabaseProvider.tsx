import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { neonDbClient } from '@/services/neonDatabaseService';
import { toast } from '@/hooks/use-toast';

interface DatabaseContextType {
  isConnected: boolean;
  isLoading: boolean;
  migrate: () => Promise<void>;
  healthCheck: () => Promise<boolean>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabaseContext = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
};

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false);

  // Initialize database connection
  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      setIsLoading(true);

      // Retry logic with multiple attempts
      let attempts = 0;
      const maxAttempts = 2; // Reduce attempts to fail fast
      let connected = false;
      let lastError = null;

      while (attempts < maxAttempts && !connected) {
        try {
          // Try to connect with a reasonable timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
          );

          const health = await Promise.race([
            neonDbClient.testConnection(),
            timeoutPromise
          ]);

          if (health && health.connected) {
            connected = true;
            setIsConnected(true);
            console.log('✅ Database connected successfully');

            // Auto-migrate localStorage data if user is logged in
            const userId = localStorage.getItem('currentUserId');
            if (userId) {
              await migrateUserData(userId);
            }

            // Reset offline toast flag if we're now connected
            setHasShownOfflineToast(false);
            break;
          }
        } catch (error) {
          lastError = error;
          attempts++;
          console.log(`⚠️ Connection attempt ${attempts} failed:`, (error as Error).message);

          if (attempts < maxAttempts) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
      }

      // If all attempts failed, mark as offline
      if (!connected) {
        setIsConnected(false);
        console.log('ℹ️ Database connection unavailable. App will operate in offline/demo mode.');

        // Only show toast once and only if truly necessary
        // Don't show in development or if already shown
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (!isDevelopment && !hasShownOfflineToast) {
          // Only show if user is trying to access protected features
          const isProtectedRoute = window.location.pathname.includes('/admin') ||
                                   window.location.pathname.includes('/dashboard') ||
                                   window.location.pathname.includes('/booking');

          if (isProtectedRoute) {
            toast({
              title: "Connection Issue",
              description: "Some features may be limited. Please check your connection.",
              variant: "default",
            });
            setHasShownOfflineToast(true);
          }
        }
      }
    } catch (error: any) {
      setIsConnected(false);
      console.log('ℹ️ Running in offline mode - backend not available');
    } finally {
      setIsLoading(false);
    }
  };

  const syncServerNotifications = async () => {
    try {
      // Fetch persistent server notifications
      const notificationsResult = await neonDbClient.getNotifications();
      if (notificationsResult.success && notificationsResult.notifications) {
        // Sync server notifications to localStorage for offline access
        const currentSystemNotifications = localStorage.getItem('system_notifications');
        let existingNotifs = [];

        if (currentSystemNotifications) {
          try {
            existingNotifs = JSON.parse(currentSystemNotifications);
          } catch (e) {
            // Parse error, skip
          }
        }

        // Merge server notifications with existing (deduplicate by ID)
        const notifMap = new Map();

        // Add existing notifications
        existingNotifs.forEach((n: any) => notifMap.set(n.id, n));

        // Add/update with server notifications (server takes precedence)
        notificationsResult.notifications.forEach((n: any) => notifMap.set(n.id, n));

        const merged = Array.from(notifMap.values());
        localStorage.setItem('system_notifications', JSON.stringify(merged));

        console.log(`✅ Synced ${notificationsResult.notifications.length} server notifications to local storage`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to sync server notifications:', error);
      // Silent fail - app should continue even if notification sync fails
    }
  };

  const migrateUserData = async (userId: string) => {
    try {
      // Check if there's localStorage data to migrate
      const userBookings = localStorage.getItem("userBookings");
      const guestBookings = localStorage.getItem("guestBookings");

      if (userBookings || guestBookings) {
        console.log('Migrating localStorage data to database...');

        // Migration to Neon database - we'll skip localStorage migration
        // as Neon database is the primary storage now
        console.log('Neon database is primary storage - skipping localStorage migration');
        const result = { migrated: 0, errors: [] };

        if (result.migrated > 0) {
          toast({
            title: "Data Migrated",
            description: `Successfully migrated ${result.migrated} bookings to your account.`,
          });
        }

        if (result.errors.length > 0) {
          console.warn('Migration errors:', result.errors);
        }
      }

      // After migration, sync server notifications
      await syncServerNotifications();
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  const migrate = async () => {
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      await migrateUserData(userId);
    }
  };

  const healthCheck = async (): Promise<boolean> => {
    try {
      const health = await neonDbClient.testConnection();
      const healthy = health.connected;
      setIsConnected(healthy);
      return healthy;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  };

  const value: DatabaseContextType = {
    isConnected,
    isLoading,
    migrate,
    healthCheck,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

// Hook to check if database is available and fallback to localStorage
export const useStorageMethod = () => {
  const { isConnected } = useDatabaseContext();
  
  return {
    useDatabase: isConnected,
    useLocalStorage: !isConnected,
  };
};

// Enhanced database service with localStorage fallback
export class EnhancedDatabaseService {
  private static useDatabase(): boolean {
    // Check if we're in a component context with database connection
    try {
      return window.__DATABASE_CONNECTED__ || false;
    } catch {
      return false;
    }
  }

  // Create booking with fallback
  static async createBooking(bookingData: any): Promise<any> {
    if (this.useDatabase()) {
      try {
        return await DatabaseService.createBooking(bookingData);
      } catch (error) {
        console.warn('Database booking failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    const bookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
    const newBooking = {
      ...bookingData,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    bookings.push(newBooking);
    localStorage.setItem("userBookings", JSON.stringify(bookings));
    
    return { booking_id: newBooking.id };
  }

  // Get user bookings with fallback
  static async getUserBookings(userId: string): Promise<any[]> {
    if (this.useDatabase()) {
      try {
        return await DatabaseService.getUserBookings(userId);
      } catch (error) {
        console.warn('Database fetch failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    const userBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
    const guestBookings = JSON.parse(localStorage.getItem("guestBookings") || "[]");
    return [...userBookings, ...guestBookings];
  }

  // Sync user with fallback
  static async syncUser(userData: any): Promise<any> {
    if (this.useDatabase()) {
      try {
        return await DatabaseService.syncUser(userData);
      } catch (error) {
        console.warn('Database sync failed, storing locally:', error);
      }
    }
    
    // Fallback to localStorage
    localStorage.setItem("userProfile", JSON.stringify(userData));
    return { success: true, message: "User data stored locally" };
  }

  // OTP functions (always try database first as these require server)
  static async sendOTP(email: string, type: 'signup' | 'forgot_password' | 'login') {
    return DatabaseService.sendOTP(email, type);
  }

  static async verifyOTP(email: string, otp: string, type: 'signup' | 'forgot_password' | 'login') {
    return DatabaseService.verifyOTP(email, otp, type);
  }

  static async resendOTP(email: string, type: 'signup' | 'forgot_password' | 'login') {
    return DatabaseService.resendOTP(email, type);
  }
}

export default DatabaseProvider;
