import { neonDbClient } from './neonDatabaseService';
import { toast } from '@/hooks/use-toast';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  contactNumber: string;
  address: string;
  branchLocation: string;
  role?: 'user' | 'admin' | 'superadmin' | 'cashier' | 'inventory_manager' | 'manager' | 'crew';
  carUnit?: string;
  carPlateNumber?: string;
  carType?: string;
}

class AuthService {
  private isLoggedIn = false;
  private currentUser: any = null;

  constructor() {
    // Check if user is logged in on initialization
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    
    if (userEmail && userRole && userId) {
      this.isLoggedIn = true;
      this.currentUser = {
        id: userId,
        email: userEmail,
        role: userRole
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const result = await neonDbClient.login(credentials.email, credentials.password);

      if (result.success && result.user) {
        this.isLoggedIn = true;
        this.currentUser = result.user;

        // Store session in localStorage for persistence
        localStorage.setItem('userEmail', result.user.email);
        localStorage.setItem('userRole', result.user.role);
        localStorage.setItem('userId', result.user.id);
        localStorage.setItem('userFullName', result.user.fullName || '');
        localStorage.setItem('userLoggedInAt', new Date().toISOString());

        // Store complete user object for easy access
        localStorage.setItem('currentUser', JSON.stringify(result.user));

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${result.user.fullName}!`,
        });
      } else {
        // Clear any existing session on failed login
        this.clearSession();

        toast({
          title: 'Login Failed',
          description: result.error || 'Invalid credentials',
          variant: 'destructive',
        });
      }

      return result;
    } catch (error) {
      // Clear session on error
      this.clearSession();

      const errorMessage = 'Login failed. Please ensure you are connected to the database.';
      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  }

  async register(userData: RegisterData): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const registrationData = {
        ...userData,
        role: userData.role || 'user',
        isActive: true,
        emailVerified: false,
        loyaltyPoints: 0,
        subscriptionStatus: 'free' as const,
      };

      const result = await neonDbClient.register(registrationData);
      
      if (result.success) {
        toast({
          title: 'Registration Successful',
          description: 'Your account has been created successfully!',
        });
      } else {
        toast({
          title: 'Registration Failed',
          description: result.error || 'Registration failed',
          variant: 'destructive',
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = 'Registration failed. Please ensure you are connected to the database.';
      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.currentUser = null;
    
    // Clear local storage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUser?.role);
  }

  async checkDatabaseConnection(): Promise<boolean> {
    try {
      const result = await neonDbClient.testConnection();
      return result.connected;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
