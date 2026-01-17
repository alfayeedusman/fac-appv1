import { Router } from "express";
import { OTPService } from "../services/otpService";
import admin from "firebase-admin";

const router = Router();

// Send OTP for email verification
router.post("/otp/send", async (req, res) => {
  try {
    const { email, type } = req.body;

    // Validate input
    if (!email || !type) {
      return res.status(400).json({
        error: "Email and type are required",
        success: false,
      });
    }

    if (!["signup", "forgot_password", "login"].includes(type)) {
      return res.status(400).json({
        error: "Invalid OTP type",
        success: false,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        success: false,
      });
    }

    // For signup, check if user already exists in Firebase
    if (type === "signup") {
      try {
        await admin.auth().getUserByEmail(email);
        return res.status(400).json({
          error: "User with this email already exists",
          success: false,
        });
      } catch (error: any) {
        // User doesn't exist, which is good for signup
        if (error.code !== "auth/user-not-found") {
          console.error("Error checking user existence:", error);
          return res.status(500).json({
            error: "Error checking user existence",
            success: false,
          });
        }
      }
    }

    // For forgot_password and login, check if user exists
    if (type === "forgot_password" || type === "login") {
      try {
        await admin.auth().getUserByEmail(email);
      } catch (error: any) {
        if (error.code === "auth/user-not-found") {
          return res.status(404).json({
            error: "No user found with this email address",
            success: false,
          });
        }
        console.error("Error checking user existence:", error);
        return res.status(500).json({
          error: "Error checking user existence",
          success: false,
        });
      }
    }

    const result = await OTPService.sendOTP(email, type);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  }
});

// Verify OTP
router.post("/otp/verify", async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    // Validate input
    if (!email || !otp || !type) {
      return res.status(400).json({
        error: "Email, OTP, and type are required",
        success: false,
      });
    }

    if (!["signup", "forgot_password", "login"].includes(type)) {
      return res.status(400).json({
        error: "Invalid OTP type",
        success: false,
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: "OTP must be 6 digits",
        success: false,
      });
    }

    const result = await OTPService.verifyOTP(email, otp, type);

    if (result.valid) {
      // For signup, create the user in Firebase if OTP is verified
      if (type === "signup") {
        try {
          const userRecord = await admin.auth().createUser({
            email: email,
            emailVerified: true,
          });

          res.status(200).json({
            success: true,
            message: result.message,
            firebaseUid: userRecord.uid,
          });
        } catch (error: any) {
          console.error("Error creating Firebase user:", error);
          res.status(500).json({
            success: false,
            error: "OTP verified but failed to create user account",
          });
        }
      } else {
        res.status(200).json({
          success: true,
          message: result.message,
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  }
});

// Resend OTP
router.post("/otp/resend", async (req, res) => {
  try {
    const { email, type } = req.body;

    // Validate input
    if (!email || !type) {
      return res.status(400).json({
        error: "Email and type are required",
        success: false,
      });
    }

    if (!["signup", "forgot_password", "login"].includes(type)) {
      return res.status(400).json({
        error: "Invalid OTP type",
        success: false,
      });
    }

    const result = await OTPService.sendOTP(email, type);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "New OTP sent successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  }
});

export default router;
