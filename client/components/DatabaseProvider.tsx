import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import DatabaseService from '@/services/databaseService';
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

  // Initialize database connection
  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      setIsLoading(true);

      // Try to connect to the backend with a shorter timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      );

      const health = await Promise.race([
        DatabaseService.healthCheck(),
        timeoutPromise
      ]);

      if (health && health.status === 'healthy') {
        setIsConnected(true);
        console.log('✅ Database connected successfully');

        // Auto-migrate localStorage data if user is logged in
        const userId = localStorage.getItem('currentUserId');
        if (userId) {
          await migrateUserData(userId);
        }
      } else if (health && health.status === 'offline') {
        setIsConnected(false);
        console.log('ℹ️ Running in offline/demo mode');
      } else {
        setIsConnected(false);
        console.warn('Database health check failed:', health);
      }
    } catch (error: any) {
      setIsConnected(false);
      console.log('ℹ️ Running in offline mode - backend not available');

      // Only show user-facing error for actual connection issues
      // Don't show error for development mode without backend
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (!isDevelopment) {
        // In production, show connection error
        toast({
          title: "Offline Mode",
          description: "Working offline. Some features may be limited.",
          variant: "default", // Changed from destructive to default for less alarming appearance
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const migrateUserData = async (userId: string) => {
    try {
      // Check if there's localStorage data to migrate
      const userBookings = localStorage.getItem("userBookings");
      const guestBookings = localStorage.getItem("guestBookings");
      
      if (userBookings || guestBookings) {
        console.log('Migrating localStorage data to database...');
        
        const result = await DatabaseService.migrateLocalStorageBookings(userId);
        
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
      const health = await DatabaseService.healthCheck();
      const healthy = health.status === 'healthy';
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
