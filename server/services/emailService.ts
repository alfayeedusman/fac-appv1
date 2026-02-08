import nodemailer from "nodemailer";

// Create transporter from environment variables
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // SMTP configuration from environment variables
  const smtpConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  // Validate that required environment variables are set
  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    console.warn(
      "⚠️ Email service not configured. Set SMTP_USER and SMTP_PASSWORD environment variables."
    );
    return null;
  }

  transporter = nodemailer.createTransport(smtpConfig);
  return transporter;
}

interface SendPasswordResetEmailParams {
  email: string;
  resetLink: string;
  userName?: string;
}

export async function sendPasswordResetEmail({
  email,
  resetLink,
  userName,
}: SendPasswordResetEmailParams): Promise<boolean> {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.error("❌ Email transporter not configured");
      return false;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "noreply@example.com",
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello${userName ? ` ${userName}` : ""},</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p>
          <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetLink}</p>
        <p><strong>This link will expire in 24 hours.</strong></p>
        <p>If you didn't request this, you can ignore this email. Your password will remain unchanged.</p>
        <br />
        <p>Best regards,<br />The Support Team</p>
      `,
      text: `
Password Reset Request

Hello${userName ? ` ${userName}` : ""},

We received a request to reset your password. Visit this link to reset it:
${resetLink}

This link will expire in 24 hours.

If you didn't request this, you can ignore this email. Your password will remain unchanged.

Best regards,
The Support Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent:", info.response);
    return true;
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    return false;
  }
}

// Test connection to SMTP server
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      return false;
    }

    await transporter.verify();
    console.log("✅ SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed:", error);
    return false;
  }
}
