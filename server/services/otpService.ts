import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

// MySQL connection configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "fayeed_user",
  password: process.env.MYSQL_PASSWORD || "fayeed_pass_2024",
  database: process.env.MYSQL_DATABASE || "fayeed_auto_care",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(mysqlConfig);

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your preferred email service
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

  // Store OTP in database
  static async storeOTP(email: string, otp: string, type: 'signup' | 'forgot_password' | 'login'): Promise<boolean> {
    try {
      const hashedOTP = await bcrypt.hash(otp, 10);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      
      const connection = await pool.getConnection();
      
      // Delete any existing OTPs for this email and type
      await connection.execute(
        'DELETE FROM email_otps WHERE email = ? AND type = ?',
        [email, type]
      );
      
      // Store new OTP
      await connection.execute(
        `INSERT INTO email_otps (email, otp_hash, type, expires_at, attempts) 
         VALUES (?, ?, ?, ?, 0)`,
        [email, hashedOTP, type, expiresAt]
      );
      
      connection.release();
      return true;
    } catch (error) {
      console.error('Error storing OTP:', error);
      return false;
    }
  }

  // Verify OTP
  static async verifyOTP(email: string, otp: string, type: 'signup' | 'forgot_password' | 'login'): Promise<{ valid: boolean; message: string }> {
    try {
      const connection = await pool.getConnection();
      
      // Get OTP record
      const [rows] = await connection.execute(
        `SELECT otp_hash, expires_at, attempts, is_verified 
         FROM email_otps 
         WHERE email = ? AND type = ? AND is_verified = false
         ORDER BY created_at DESC LIMIT 1`,
        [email, type]
      );
      
      if (!Array.isArray(rows) || rows.length === 0) {
        connection.release();
        return { valid: false, message: 'No valid OTP found. Please request a new one.' };
      }
      
      const otpRecord = rows[0] as any;
      
      // Check if OTP has expired
      if (new Date() > new Date(otpRecord.expires_at)) {
        connection.release();
        return { valid: false, message: 'OTP has expired. Please request a new one.' };
      }
      
      // Check attempts limit
      if (otpRecord.attempts >= 3) {
        connection.release();
        return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
      }
      
      // Verify OTP
      const isValid = await bcrypt.compare(otp, otpRecord.otp_hash);
      
      if (isValid) {
        // Mark OTP as verified
        await connection.execute(
          'UPDATE email_otps SET is_verified = true, verified_at = NOW() WHERE email = ? AND type = ?',
          [email, type]
        );
        
        // Update user email verification status if this is a signup OTP
        if (type === 'signup') {
          await connection.execute(
            'UPDATE users SET email_verified = true WHERE email = ?',
            [email]
          );
        }
        
        connection.release();
        return { valid: true, message: 'OTP verified successfully.' };
      } else {
        // Increment attempt count
        await connection.execute(
          'UPDATE email_otps SET attempts = attempts + 1 WHERE email = ? AND type = ?',
          [email, type]
        );
        
        connection.release();
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
        subject: subject,
        html: htmlContent
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

  // Clean up expired OTPs (should be called periodically)
  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      const connection = await pool.getConnection();
      await connection.execute(
        'DELETE FROM email_otps WHERE expires_at < NOW()'
      );
      connection.release();
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}
