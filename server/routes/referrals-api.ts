import express, { RequestHandler } from "express";
import { getSqlClient } from "../database/connection";

const router = express.Router();

async function getSql() {
  return await getSqlClient();
}

// Helper function to generate unique referral code
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============= PUBLIC ENDPOINTS =============

// Get user's referral code
export const getMyCode: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const sql = await getSql();

    const code = await sql`
      SELECT * FROM referral_codes WHERE user_id = ${userId} AND (expires_at IS NULL OR expires_at > NOW())
    `;

    if (code[0]) {
      return res.json({
        success: true,
        code: code[0].code,
        createdAt: code[0].created_at,
      });
    }

    res.json({
      success: true,
      code: null,
      message: "No referral code found",
    });
  } catch (error: any) {
    console.error("Get referral code error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch referral code",
    });
  }
};

// Generate new referral code
export const generateCode: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const sql = await getSql();

    // Check if user already has an active code
    const existing = await sql`
      SELECT * FROM referral_codes 
      WHERE user_id = ${userId} AND (expires_at IS NULL OR expires_at > NOW())
    `;

    if (existing[0]) {
      return res.json({
        success: true,
        code: existing[0].code,
        message: "You already have an active referral code",
      });
    }

    // Generate unique code
    let code = generateReferralCode();
    let isUnique = false;

    while (!isUnique) {
      const existing = await sql`SELECT * FROM referral_codes WHERE code = ${code}`;
      if (!existing[0]) {
        isUnique = true;
      } else {
        code = generateReferralCode();
      }
    }

    const codeId = `refcode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await sql`
      INSERT INTO referral_codes (id, user_id, code, created_at)
      VALUES (${codeId}, ${userId}, ${code}, NOW())
      RETURNING *
    `;

    res.json({
      success: true,
      code: result[0].code,
      message: "Referral code generated successfully",
    });
  } catch (error: any) {
    console.error("Generate referral code error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate referral code",
    });
  }
};

// Get referral statistics
export const getStats: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const sql = await getSql();

    // Total referrals
    const total = await sql`
      SELECT COUNT(*) as count FROM referrals WHERE referrer_id = ${userId}
    `;

    // Completed referrals
    const completed = await sql`
      SELECT COUNT(*) as count FROM referrals 
      WHERE referrer_id = ${userId} AND status = 'completed'
    `;

    // Pending referrals
    const pending = await sql`
      SELECT COUNT(*) as count FROM referrals 
      WHERE referrer_id = ${userId} AND status = 'pending'
    `;

    // Total rewards
    const rewards = await sql`
      SELECT COALESCE(SUM(reward_value), 0) as total FROM referrals 
      WHERE referrer_id = ${userId} AND status = 'completed'
    `;

    res.json({
      success: true,
      stats: {
        totalReferrals: total[0]?.count || 0,
        completedReferrals: completed[0]?.count || 0,
        pendingReferrals: pending[0]?.count || 0,
        rewardsEarned: rewards[0]?.total || 0,
      },
    });
  } catch (error: any) {
    console.error("Get referral stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch referral stats",
    });
  }
};

// Get referral history
export const getHistory: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string);

    const sql = await getSql();

    const referrals = await sql`
      SELECT * FROM referrals 
      WHERE referrer_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit as string)} OFFSET ${offset}
    `;

    const total = await sql`
      SELECT COUNT(*) as count FROM referrals WHERE referrer_id = ${userId}
    `;

    res.json({
      success: true,
      referrals: referrals || [],
      total: total[0]?.count || 0,
      hasMore: offset + parseInt(limit as string) < (total[0]?.count || 0),
    });
  } catch (error: any) {
    console.error("Get referral history error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch referral history",
    });
  }
};

// Validate referral code
export const validateCode: RequestHandler = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Code is required",
      });
    }

    const sql = await getSql();

    const refCode = await sql`
      SELECT * FROM referral_codes WHERE code = ${code.toUpperCase()}
      AND (expires_at IS NULL OR expires_at > NOW())
    `;

    if (!refCode[0]) {
      return res.json({
        success: false,
        valid: false,
        reason: "Invalid or expired referral code",
      });
    }

    res.json({
      success: true,
      valid: true,
      referrerId: refCode[0].user_id,
    });
  } catch (error: any) {
    console.error("Validate referral code error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate referral code",
    });
  }
};

// Apply referral code (during signup)
export const applyCode: RequestHandler = async (req, res) => {
  try {
    const { code } = req.body;
    const newUserId = req.headers["x-user-id"] as string;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Code is required",
      });
    }

    const sql = await getSql();

    const refCode = await sql`
      SELECT * FROM referral_codes WHERE code = ${code.toUpperCase()}
      AND (expires_at IS NULL OR expires_at > NOW())
    `;

    if (!refCode[0]) {
      return res.json({
        success: false,
        error: "Invalid or expired referral code",
      });
    }

    // Prevent self-referral
    if (refCode[0].user_id === newUserId) {
      return res.json({
        success: false,
        error: "You cannot use your own referral code",
      });
    }

    // Create referral record
    const referralId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await sql`
      INSERT INTO referrals (id, referrer_id, referred_user_id, code, status, created_at)
      VALUES (${referralId}, ${refCode[0].user_id}, ${newUserId}, ${code}, 'pending', NOW())
    `;

    res.json({
      success: true,
      message: "Referral code applied successfully",
      referralId,
    });
  } catch (error: any) {
    console.error("Apply referral code error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to apply referral code",
    });
  }
};

// Complete referral (admin endpoint - called after user completes first booking)
export const completeReferral: RequestHandler = async (req, res) => {
  try {
    const { referralId, rewardType, rewardValue } = req.body;
    const sql = await getSql();

    const referral = await sql`
      UPDATE referrals 
      SET status = 'completed', reward_type = ${rewardType}, reward_value = ${rewardValue}, completed_at = NOW()
      WHERE id = ${referralId}
      RETURNING *
    `;

    if (!referral[0]) {
      return res.status(404).json({
        success: false,
        error: "Referral not found",
      });
    }

    res.json({
      success: true,
      referral: referral[0],
      message: "Referral completed successfully",
    });
  } catch (error: any) {
    console.error("Complete referral error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete referral",
    });
  }
};

export default router;
