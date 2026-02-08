# Supabase Authentication Setup Guide

This guide explains how to set up and use the comprehensive Supabase authentication system that has been integrated into your application.

## Features Implemented

✅ **Email & Password Registration** - New users can create accounts
✅ **Email Verification** - OTP verification sent to user's email
✅ **Email Login** - Secure login with email and password
✅ **Forgot Password** - Password reset flow via email
✅ **Password Reset** - Complete password reset with verification token
✅ **Session Management** - Persistent user sessions
✅ **Account Protection** - Role-based access control ready

## Files Created

### Services
- `client/services/supabaseAuthService.ts` - Core authentication service with all auth methods

### Components
- `client/components/AuthRegister.tsx` - Registration form with validation
- `client/components/AuthEmailVerification.tsx` - OTP verification component
- `client/components/AuthForgotPassword.tsx` - Forgot password request form
- `client/components/AuthResetPassword.tsx` - Password reset form

### Pages
- `client/pages/AuthPage.tsx` - Comprehensive auth page handling all flows

### Updated Files
- `client/main.tsx` - Added auth routes

## Setup Steps

### 1. Configure Supabase in Your Application

Your app is already configured with Supabase environment variables:
```
VITE_SUPABASE_URL=https://xysosxgrxhcnobtnhfgh.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_8vdYT06TeH8_TSS2nRQaRw_g-g4PXfJ
```

### 2. Enable Email Authentication in Supabase Console

Go to your Supabase Dashboard:

1. Navigate to **Authentication → Providers**
2. Ensure **Email** is enabled (should be by default)
3. Go to **Authentication → Email Templates** and configure:
   - **Confirm signup**: Customize the email template (includes OTP)
   - **Reset password**: Customize the password reset email
   - **Magic Link**: (Optional) For magic link authentication

### 3. Configure Email Settings

1. Go to **Authentication → Email Templates**
2. For **Confirm signup**:
   - Subject: `"Verify your email address"`
   - The template should include `{{ .ConfirmationURL }}` or OTP code
   - Example OTP will be sent automatically

3. For **Reset password**:
   - Subject: `"Reset your password"`
   - Include `{{ .ConfirmationURL }}` in the template

### 4. Set Redirect URLs (Important!)

1. Go to **Authentication → URL Configuration**
2. Add your application URLs to **Redirect URLs**:
   - Development: `http://localhost:5173/auth/verify-email`
   - Development: `http://localhost:5173/auth/reset-password`
   - Production: `https://yourdomain.com/auth/verify-email`
   - Production: `https://yourdomain.com/auth/reset-password`

3. Add **Site URL**:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

## Usage

### Accessing Authentication Pages

- **Login/Register**: Navigate to `/auth`
- **Email Verification**: Automatic after registration or via `/auth/verify-email?type=email&token=...`
- **Password Reset**: Via email link or `/auth/reset-password?type=recovery&token=...`
- **Forgot Password**: Click "Forgot Password?" on login page

### Registration Flow

```
User clicks "Create Account"
↓
Fills in registration form (email, password, name, etc.)
↓
Clicks "Create Account"
↓
Account created in Supabase
↓
Verification email sent
↓
User clicks "Verify Email" or enters OTP
↓
Email verified
↓
User can now login
```

### Password Reset Flow

```
User clicks "Forgot Password?"
↓
Enters email address
↓
Clicks "Send Reset Link"
↓
Email sent with reset link
↓
User clicks link in email
↓
Enters new password
↓
Password updated
↓
User can login with new password
```

## API Reference

### SupabaseAuthService Methods

```typescript
// Sign up with email and password
await supabaseAuthService.signUp({
  email: string;
  password: string;
  fullName: string;
  contactNumber?: string;
  address?: string;
  branchLocation: string;
  role?: string;
});

// Verify email with OTP
await supabaseAuthService.verifyEmail(email, token);

// Sign in with email and password
await supabaseAuthService.signIn({
  email: string;
  password: string;
});

// Request password reset
await supabaseAuthService.requestPasswordReset(email);

// Reset password with token
await supabaseAuthService.resetPassword(token, newPassword);

// Resend verification email
await supabaseAuthService.resendVerificationEmail(email);

// Sign out
await supabaseAuthService.signOut();

// Get current user
await supabaseAuthService.getCurrentUser();

// Check if email is verified
await supabaseAuthService.isEmailVerified(email);

// Update user profile
await supabaseAuthService.updateProfile(updates);
```

## Integration with Existing System

The new auth system works alongside your existing authentication:

1. **Session Storage**: User sessions are stored in localStorage
2. **User Info**: Email, userId, and session token are saved
3. **Protected Routes**: Use existing `<ProtectedRoute>` component
4. **Dashboard Access**: Users are redirected to "/" after login

### Storing Additional User Data

After email verification, you can store additional user data in your `users` table:

```typescript
// In your user creation endpoint, after Supabase auth user is created:
const { data, error } = await db.insert(users).values({
  id: authUser.id,
  email: authUser.email,
  fullName: signUpData.fullName,
  contactNumber: signUpData.contactNumber,
  address: signUpData.address,
  branchLocation: signUpData.branchLocation,
  role: signUpData.role || 'user',
  isActive: true,
  emailVerified: false, // Set to true after email verification
  createdAt: new Date(),
});
```

## Email Template Customization

### Confirm Signup Email

```html
<h2>Welcome!</h2>
<p>Please verify your email by clicking the link below:</p>
<a href="{{ .ConfirmationURL }}">Verify Email</a>

<!-- OR use OTP -->
<p>Your verification code is: {{ .ConfirmationURL }}</p>
```

### Reset Password Email

```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<a href="{{ .ConfirmationURL }}">Reset Password</a>
<p>This link expires in 24 hours.</p>
```

## Security Best Practices

✅ **Passwords**: Hashed and managed by Supabase Auth
✅ **Tokens**: OTP and reset tokens auto-expire
✅ **HTTPS Only**: All auth requests go through HTTPS
✅ **RLS Policies**: Row Level Security enabled on users table
✅ **Session Timeout**: Sessions expire after 24 hours (configurable)
✅ **Email Verification**: Required before first login

## Troubleshooting

### Email Not Received

1. Check spam/junk folder
2. Verify email template is configured correctly
3. Check Supabase email logs in dashboard
4. Ensure SMTP is configured in Supabase

### OTP Invalid or Expired

- OTP tokens expire after 24 hours by default
- User can click "Resend Code" to get a new one
- Configure expiration in Supabase → Authentication → Policies

### Password Reset Link Not Working

1. Ensure redirect URL is configured in Supabase
2. Check that the URL is not expired (24 hours)
3. Verify the token is being passed correctly

### User Can't Log In After Verification

1. Check that `email_confirmed_at` is set in auth.users
2. Verify RLS policies allow user access
3. Check localStorage for session token

## Testing

### Test Registration
1. Go to `/auth`
2. Click "Create Account"
3. Fill in form with test data
4. Check email for verification code
5. Enter code to verify

### Test Login
1. Go to `/auth`
2. Enter credentials from registered account
3. Should redirect to dashboard

### Test Forgot Password
1. Go to `/auth`
2. Click "Forgot Password?"
3. Enter email address
4. Check email for reset link
5. Click link and reset password
6. Login with new password

## Advanced Configuration

### Custom Email Templates

To customize emails beyond the default:

1. Go to Supabase Dashboard
2. Authentication → Email Templates
3. Enable "Custom HTML"
4. Paste your custom HTML template
5. Use template variables like `{{ .ConfirmationURL }}`

### Multi-Factor Authentication (Future)

To add MFA:
1. Uncomment MFA setup in supabaseAuthService
2. Configure authenticator apps or SMS
3. Add MFA component to auth flow

### Social Login (Future)

To add Google, GitHub, etc.:
1. Configure OAuth provider in Supabase
2. Add social login buttons to AuthPage
3. Use `supabaseAuthService.getClient().auth.signInWithOAuth()`

## Support

For issues with:
- **Supabase Auth**: Check [Supabase Docs](https://supabase.com/docs/guides/auth)
- **Email Configuration**: See Supabase Email Settings
- **Application Code**: Check service implementations

## Next Steps

1. ✅ Configure email templates in Supabase Console
2. ✅ Set redirect URLs for your domain
3. ✅ Test registration → verification → login flow
4. ✅ Integrate with user database to store profile data
5. ✅ Add role-based access control
6. ✅ (Optional) Add social login providers
7. ✅ (Optional) Add multi-factor authentication

---

**Version**: 1.0.0
**Created**: 2024
**Last Updated**: 2024
