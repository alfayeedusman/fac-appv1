import { supabaseAuthService } from "./supabaseAuthService";
import { supabaseDbClient } from "./supabaseDatabaseService";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  contactNumber?: string;
  address?: string;
  branchLocation?: string;
  profileImage?: string;
  role: "user" | "admin" | "superadmin" | "cashier" | "manager" | "dispatcher" | "crew";
  emailVerified: boolean;
  isActive: boolean;
  loyaltyPoints: number;
  subscriptionStatus: "free" | "basic" | "premium" | "vip";
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdate {
  fullName?: string;
  contactNumber?: string;
  address?: string;
  branchLocation?: string;
  profileImage?: string;
  subscriptionStatus?: "free" | "basic" | "premium" | "vip";
}

class SupabaseUserProfileService {
  /**
   * Create user profile after authentication
   * Called after successful email verification or social login
   */
  async createUserProfile(
    authUserId: string,
    email: string,
    data: {
      fullName: string;
      contactNumber?: string;
      address?: string;
      branchLocation: string;
      role?: string;
      emailVerified?: boolean;
    }
  ) {
    try {
      console.log(`👤 Creating user profile for: ${email}`);

      // Create the user in the database
      const response = await fetch("/api/supabase/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: authUserId,
          email,
          fullName: data.fullName,
          contactNumber: data.contactNumber || "",
          address: data.address || "",
          branchLocation: data.branchLocation,
          role: data.role || "user",
          emailVerified: data.emailVerified || false,
          isActive: true,
          loyaltyPoints: 0,
          subscriptionStatus: "free",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user profile");
      }

      const profile = await response.json();
      console.log(`✅ User profile created: ${profile.id}`);

      // Store in localStorage
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userId", authUserId);
      localStorage.setItem("userRole", data.role || "user");
      localStorage.setItem("userFullName", data.fullName);

      return {
        success: true,
        profile,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create profile";
      console.error("Create profile error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Get user profile from database
   */
  async getUserProfile(userId: string) {
    try {
      console.log(`👤 Fetching user profile: ${userId}`);

      const response = await fetch(`/api/supabase/users/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const profile = await response.json();
      console.log(`✅ User profile fetched: ${profile.id}`);

      return {
        success: true,
        profile,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch profile";
      console.error("Get profile error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: UserProfileUpdate) {
    try {
      console.log(`👤 Updating user profile: ${userId}`);

      const response = await fetch(`/api/supabase/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const profile = await response.json();
      console.log(`✅ User profile updated: ${profile.id}`);

      // Update localStorage
      if (updates.fullName) {
        localStorage.setItem("userFullName", updates.fullName);
      }

      return {
        success: true,
        profile,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      console.error("Update profile error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Verify user email in database
   * Called after email verification is complete
   */
  async verifyUserEmail(userId: string) {
    try {
      console.log(`✉️ Verifying user email: ${userId}`);

      const response = await fetch(`/api/supabase/users/${userId}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to verify email");
      }

      const profile = await response.json();
      console.log(`✅ User email verified: ${userId}`);

      return {
        success: true,
        profile,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to verify email";
      console.error("Verify email error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Link social login account to existing profile
   */
  async linkSocialAccount(
    userId: string,
    provider: "google" | "github" | "facebook",
    providerData: Record<string, any>
  ) {
    try {
      console.log(`🔗 Linking ${provider} account to user: ${userId}`);

      const response = await fetch(`/api/supabase/users/${userId}/link-social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          providerData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to link social account");
      }

      const profile = await response.json();
      console.log(`✅ ${provider} account linked: ${userId}`);

      return {
        success: true,
        profile,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to link account";
      console.error("Link social account error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Update loyalty points
   */
  async updateLoyaltyPoints(userId: string, points: number) {
    try {
      console.log(`💰 Updating loyalty points for: ${userId}`);

      const response = await fetch(`/api/supabase/users/${userId}/loyalty-points`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update loyalty points");
      }

      const profile = await response.json();
      console.log(`✅ Loyalty points updated: ${userId}`);

      return {
        success: true,
        profile,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update points";
      console.error("Update loyalty points error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Change user role (admin only)
   */
  async changeUserRole(
    userId: string,
    newRole: "user" | "admin" | "superadmin" | "cashier" | "manager" | "dispatcher" | "crew"
  ) {
    try {
      console.log(`👤 Changing user role for: ${userId}`);

      const response = await fetch(`/api/supabase/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change user role");
      }

      const profile = await response.json();
      console.log(`✅ User role changed: ${userId}`);

      return {
        success: true,
        profile,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change role";
      console.error("Change user role error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUserAccount(userId: string) {
    try {
      console.log(`🔐 Deactivating user account: ${userId}`);

      const response = await fetch(`/api/supabase/users/${userId}/deactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to deactivate account");
      }

      console.log(`✅ User account deactivated: ${userId}`);

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to deactivate";
      console.error("Deactivate account error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}

// Export singleton instance
export const supabaseUserProfileService = new SupabaseUserProfileService();
export default supabaseUserProfileService;
