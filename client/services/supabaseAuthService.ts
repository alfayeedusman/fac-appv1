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

      console.log(`✅ Auth user created: ${authData.user?.id}`);

      // Now save user profile to database
      if (authData.user) {
        try {
          const profileResponse = await fetch("/api/supabase/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              fullName: credentials.fullName,
              contactNumber: credentials.contactNumber || "",
              address: credentials.address || "",
              branchLocation: credentials.branchLocation,
              role: credentials.role || "user",
            }),
          });

          const profileData = await profileResponse.json();

          if (!profileResponse.ok) {
            console.warn("⚠️ Failed to save profile to database:", profileData);
            // Don't fail the auth process if profile save fails
          } else {
            console.log("✅ User profile saved to database");
          }
        } catch (profileError) {
          console.warn("⚠️ Error saving profile to database:", profileError);
          // Continue - auth was successful, profile save is secondary
        }

        console.log(`📧 Verification email sent to ${credentials.email}`);

        // Store user info temporarily
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
   * Social Login - Google
   */
  async signInWithGoogle() {
    try {
      console.log("🔐 Signing in with Google...");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("✅ Google sign-in initiated");
      return {
        success: true,
        message: "Redirecting to Google...",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Google sign-in error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Social Login - GitHub
   */
  async signInWithGitHub() {
    try {
      console.log("🔐 Signing in with GitHub...");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("✅ GitHub sign-in initiated");
      return {
        success: true,
        message: "Redirecting to GitHub...",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("GitHub sign-in error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Social Login - Facebook
   */
  async signInWithFacebook() {
    try {
      console.log("🔐 Signing in with Facebook...");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("✅ Facebook sign-in initiated");
      return {
        success: true,
        message: "Redirecting to Facebook...",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Facebook sign-in error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Setup Multi-Factor Authentication (MFA) - Email OTP
   */
  async setupMFAEmail() {
    try {
      console.log("🔐 Setting up MFA with email...");

      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) {
        throw new Error(error.message);
      }

      // Check if email factor already exists
      const emailFactor = data.factors?.find((f) => f.factor_type === "email");

      if (emailFactor) {
        return {
          success: true,
          message: "Email MFA already enabled",
          factorId: emailFactor.id,
        };
      }

      // Enroll new email factor
      const { data: enrollData, error: enrollError } =
        await supabase.auth.mfa.enroll({
          factorType: "email",
        });

      if (enrollError) {
        throw new Error(enrollError.message);
      }

      console.log("✅ Email MFA setup initiated");

      return {
        success: true,
        message: "Email MFA setup started",
        factorId: enrollData?.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("MFA setup error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Setup Multi-Factor Authentication (MFA) - TOTP (Authenticator App)
   */
  async setupMFATOTP() {
    try {
      console.log("🔐 Setting up MFA with TOTP...");

      // Enroll TOTP factor
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("✅ TOTP MFA setup initiated");

      return {
        success: true,
        message: "TOTP MFA setup started",
        factorId: data?.id,
        qrCode: data?.totp?.qr_code,
        secret: data?.totp?.secret,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("TOTP MFA setup error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Verify MFA Factor
   */
  async verifyMFAFactor(factorId: string, code: string) {
    try {
      console.log(`🔐 Verifying MFA factor: ${factorId}`);

      const { data, error } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (error) {
        throw new Error(error.message);
      }

      const { data: verifyData, error: verifyError } =
        await supabase.auth.mfa.verify({
          factorId,
          challengeId: data.id,
          code,
        });

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      console.log("✅ MFA factor verified successfully");

      return {
        success: true,
        message: "MFA verified successfully",
        session: verifyData.session,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("MFA verification error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Get MFA Factors
   */
  async getMFAFactors() {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        factors: data.factors || [],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Get MFA factors error:", errorMessage);
      return {
        success: false,
        message: errorMessage,
        factors: [],
      };
    }
  }

  /**
   * Unenroll MFA Factor
   */
  async removeMFAFactor(factorId: string) {
    try {
      console.log(`🔐 Removing MFA factor: ${factorId}`);

      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("✅ MFA factor removed successfully");

      return {
        success: true,
        message: "MFA factor removed successfully",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Remove MFA factor error:", errorMessage);
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
