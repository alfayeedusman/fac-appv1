import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

// In-memory OTP store to avoid any local DB dependency
// Key format: `${email}:${type}`
const otpStore = new Map<string, {
  otpHash: string;
  expiresAt: number; // epoch ms
  attempts: number;
  isVerified: boolean;
}>();

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password'
    }
  });
};

export class OTPService {
  private static transporter = createEmailTransporter();

  // Generate 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP in memory (10 min expiry)
  static async storeOTP(email: string, otp: string, type: 'signup' | 'forgot_password' | 'login'): Promise<boolean> {
    try {
      const otpHash = await bcrypt.hash(otp, 10);
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      const key = `${email}:${type}`;

      otpStore.set(key, {
        otpHash,
        expiresAt,
        attempts: 0,
        isVerified: false,
      });

      return true;
    } catch (error) {
      console.error('Error storing OTP:', error);
      return false;
    }
  }

  // Verify OTP
  static async verifyOTP(email: string, otp: string, type: 'signup' | 'forgot_password' | 'login'): Promise<{ valid: boolean; message: string }> {
    try {
      const key = `${email}:${type}`;
      const record = otpStore.get(key);

      if (!record || record.isVerified) {
        return { valid: false, message: 'No valid OTP found. Please request a new one.' };
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(key);
        return { valid: false, message: 'OTP has expired. Please request a new one.' };
      }

      if (record.attempts >= 3) {
        return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
      }

      const isValid = await bcrypt.compare(otp, record.otpHash);

      if (isValid) {
        record.isVerified = true;
        otpStore.set(key, record);
        return { valid: true, message: 'OTP verified successfully.' };
      } else {
        record.attempts += 1;
        otpStore.set(key, record);
        return { valid: false, message: 'Invalid OTP. Please try again.' };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { valid: false, message: 'Error verifying OTP. Please try again.' };
    }
  }

  // Send OTP email
  static async sendOTPEmail(email: string, otp: string, type: 'signup' | 'forgot_password' | 'login'): Promise<boolean> {
    try {
      let subject = '';
      let htmlContent = '';

      switch (type) {
        case 'signup':
          subject = 'Welcome to Fayeed Auto Care - Verify Your Email';
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #ff7a35 0%, #ff9a56 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Fayeed Auto Care</h1>
                <p style="color: white; margin: 5px 0;">Premium Car Care Services</p>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Welcome! Please verify your email</h2>
                <p style="color: #666; line-height: 1.6;">Thank you for joining Fayeed Auto Care. To complete your registration, please use the verification code below:</p>
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <h1 style="color: #ff7a35; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.</p>
              </div>
              <div style="background: #333; padding: 20px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">© 2025 Fayeed Auto Care. All rights reserved.</p>
              </div>
            </div>
          `;
          break;
        case 'forgot_password':
          subject = 'Fayeed Auto Care - Password Reset Code';
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #ff7a35 0%, #ff9a56 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Fayeed Auto Care</h1>
                <p style="color: white; margin: 5px 0;">Password Reset Request</p>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Reset Your Password</h2>
                <p style="color: #666; line-height: 1.6;">We received a request to reset your password. Use the code below to reset your password:</p>
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <h1 style="color: #ff7a35; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email.</p>
              </div>
              <div style="background: #333; padding: 20px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">© 2025 Fayeed Auto Care. All rights reserved.</p>
              </div>
            </div>
          `;
          break;
        case 'login':
          subject = 'Fayeed Auto Care - Login Verification Code';
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #ff7a35 0%, #ff9a56 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Fayeed Auto Care</h1>
                <p style="color: white; margin: 5px 0;">Secure Login</p>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Your Login Verification Code</h2>
                <p style="color: #666; line-height: 1.6;">Someone is trying to sign in to your account. If this is you, use the code below:</p>
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <h1 style="color: #ff7a35; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you didn't try to sign in, please secure your account immediately.</p>
              </div>
              <div style="background: #333; padding: 20px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">© 2025 Fayeed Auto Care. All rights reserved.</p>
              </div>
            </div>
          `;
          break;
      }

      const mailOptions = {
        from: `"Fayeed Auto Care" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return false;
    }
  }

  // Complete OTP flow: generate, store, and send
  static async sendOTP(email: string, type: 'signup' | 'forgot_password' | 'login'): Promise<{ success: boolean; message: string }> {
    try {
      const otp = this.generateOTP();

      const stored = await this.storeOTP(email, otp, type);
      if (!stored) {
        return { success: false, message: 'Failed to generate OTP. Please try again.' };
      }

      const sent = await this.sendOTPEmail(email, otp, type);
      if (!sent) {
        return { success: false, message: 'Failed to send OTP email. Please try again.' };
      }

      return { success: true, message: 'OTP sent successfully to your email.' };
    } catch (error) {
      console.error('Error in OTP flow:', error);
      return { success: false, message: 'Error sending OTP. Please try again.' };
    }
  }

  // Clean up expired OTPs (noop for in-memory, optional manual cleanup)
  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      const now = Date.now();
      for (const [key, record] of otpStore.entries()) {
        if (record.expiresAt < now || record.isVerified) {
          otpStore.delete(key);
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}
