import { createClient } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

// Initialize Supabase client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase configuration");
}

const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "");

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName: string;
  contactNumber?: string;
  address?: string;
  branchLocation: string;
  role?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  role: string;
  createdAt: string;
}

class SupabaseAuthService {
  /**
   * Sign up with email and password
   * Automatically sends verification email
   */
  async signUp(credentials: SignUpCredentials) {
    try {
      console.log(`📝 Signing up user: ${credentials.email}`);

      // First, create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
          data: {
            full_name: credentials.fullName,
            role: credentials.role || "user",
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      console.log(`✅ User created: ${authData.user?.id}`);
      console.log(`📧 Verification email sent to ${credentials.email}`);

      // Store user info temporarily
      if (authData.user) {
        localStorage.setItem("pendingVerificationEmail", credentials.email);
        localStorage.setItem("pendingUserId", authData.user.id);
      }

      return {
        success: true,
        message: "Verification email sent! Please check your inbox.",
        user: authData.user,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Sign up error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Verify email with OTP token sent to email
   */
  async verifyEmail(email: string, token: string) {
    try {
      console.log(`🔐 Verifying email: ${email}`);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`✅ Email verified successfully!`);

      // Save user session
      if (data.user) {
        localStorage.setItem("userEmail", data.user.email || "");
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userLoggedInAt", new Date().toISOString());

        // Clear pending data
        localStorage.removeItem("pendingVerificationEmail");
        localStorage.removeItem("pendingUserId");
      }

      return {
        success: true,
        message: "Email verified successfully! You can now log in.",
        user: data.user,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Email verification error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: SignInCredentials) {
    try {
      console.log(`🔑 Signing in user: ${credentials.email}`);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Check email verification status
        if (!data.user.email_confirmed_at) {
          return {
            success: false,
            message: "Please verify your email before logging in",
            requiresEmailVerification: true,
          };
        }

        // Save session
        localStorage.setItem("userEmail", data.user.email || "");
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userLoggedInAt", new Date().toISOString());
        localStorage.setItem("sessionToken", data.session?.access_token || "");

        console.log(`✅ User signed in: ${data.user.email}`);

        return {
          success: true,
          message: "Signed in successfully",
          user: data.user,
          session: data.session,
        };
      }

      throw new Error("Sign in failed");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Sign in error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    try {
      console.log(`🔄 Requesting password reset for: ${email}`);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`✅ Password reset email sent to ${email}`);

      return {
        success: true,
        message: "Password reset email sent! Check your inbox.",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Password reset request error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      console.log("🔐 Resetting password...");

      // First verify the token
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "recovery",
      });

      if (verifyError) {
        throw new Error("Invalid or expired reset link");
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      console.log("✅ Password reset successfully");

      return {
        success: true,
        message: "Password reset successfully! You can now log in.",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Password reset error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    try {
      console.log(`📧 Resending verification email to: ${email}`);

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`✅ Verification email resent to ${email}`);

      return {
        success: true,
        message: "Verification email resent! Check your inbox.",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Resend verification email error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      console.log("🔓 Signing out user...");

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      // Clear session
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("userLoggedInAt");
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("currentUser");

      console.log("✅ User signed out");

      return {
        success: true,
        message: "Signed out successfully",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Sign out error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Get current user session
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        user: null,
      };
    }
  }

  /**
   * Check if email is verified
   */
  async isEmailVerified(email: string) {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return false;
      }

      return !!data.user?.email_confirmed_at;
    } catch {
      return false;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Record<string, any>) {
    try {
      console.log("📝 Updating user profile...");

      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("✅ Profile updated successfully");

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Profile update error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Get Supabase client for direct access if needed
   */
  getClient() {
    return supabase;
  }
}

// Export singleton instance
export const supabaseAuthService = new SupabaseAuthService();
export default supabaseAuthService;
