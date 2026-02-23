import express, { RequestHandler } from "express";
import { getSqlClient } from "../database/connection";

const router = express.Router();

async function getSql() {
  return await getSqlClient();
}

// ============= HELPER FUNCTIONS =============

async function checkVoucherEligibility(
  userId: string,
  voucherId: string
): Promise<{ eligible: boolean; reason?: string }> {
  try {
    const sql = await getSql();
    
    // Check if user has already used this voucher
    const used = await sql`
      SELECT COUNT(*) as count FROM user_vouchers 
      WHERE user_id = ${userId} AND voucher_id = ${voucherId} AND used_at IS NOT NULL
    `;

    if (used[0]?.count > 0) {
      return { eligible: false, reason: "You have already used this voucher" };
    }

    // Check voucher validity
    const voucher = await sql`
      SELECT * FROM vouchers WHERE id = ${voucherId}
    `;

    if (!voucher[0]) {
      return { eligible: false, reason: "Voucher not found" };
    }

    if (!voucher[0].is_active) {
      return { eligible: false, reason: "This voucher is no longer active" };
    }

    const now = new Date();
    if (voucher[0].valid_until && new Date(voucher[0].valid_until) < now) {
      return { eligible: false, reason: "This voucher has expired" };
    }

    if (voucher[0].usage_limit && voucher[0].used_count >= voucher[0].usage_limit) {
      return { eligible: false, reason: "This voucher has reached its usage limit" };
    }

    return { eligible: true };
  } catch (error) {
    console.error("Error checking voucher eligibility:", error);
    return { eligible: false, reason: "Error checking eligibility" };
  }
}

// ============= PUBLIC ENDPOINTS =============

// List all active vouchers
export const listVouchers: RequestHandler = async (req, res) => {
  try {
    const { category, discountType } = req.query;
    const sql = await getSql();

    let query = `
      SELECT * FROM vouchers 
      WHERE is_active = true 
      AND (valid_until IS NULL OR valid_until > NOW())
    `;

    if (category) {
      query += ` AND category = '${category}'`;
    }
    if (discountType) {
      query += ` AND discount_type = '${discountType}'`;
    }

    query += ` ORDER BY created_at DESC`;

    const vouchers = await sql.unsafe(query);

    res.json({
      success: true,
      vouchers: vouchers || [],
    });
  } catch (error: any) {
    console.error("List vouchers error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch vouchers",
    });
  }
};

// Get voucher by ID
export const getVoucherById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = await getSql();

    const voucher = await sql`
      SELECT * FROM vouchers WHERE id = ${id}
    `;

    if (!voucher[0]) {
      return res.status(404).json({
        success: false,
        error: "Voucher not found",
      });
    }

    res.json({
      success: true,
      voucher: voucher[0],
    });
  } catch (error: any) {
    console.error("Get voucher error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch voucher",
    });
  }
};

// Validate voucher code
export const validateVoucher: RequestHandler = async (req, res) => {
  try {
    const { code, bookingAmount } = req.body;
    const userId = req.headers["x-user-id"] as string;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Voucher code is required",
      });
    }

    const sql = await getSql();

    const voucher = await sql`
      SELECT * FROM vouchers WHERE code = ${code.toUpperCase()}
    `;

    if (!voucher[0]) {
      return res.json({
        success: false,
        valid: false,
        reason: "Invalid voucher code",
      });
    }

    const eligibility = await checkVoucherEligibility(userId, voucher[0].id);

    if (!eligibility.eligible) {
      return res.json({
        success: false,
        valid: false,
        reason: eligibility.reason,
      });
    }

    // Check minimum purchase requirement
    if (voucher[0].min_purchase && bookingAmount < voucher[0].min_purchase) {
      return res.json({
        success: false,
        valid: false,
        reason: `Minimum purchase amount of ${voucher[0].min_purchase} is required`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (voucher[0].discount_type === "percentage") {
      discount = (bookingAmount * voucher[0].discount_value) / 100;
    } else {
      discount = voucher[0].discount_value;
    }

    // Apply max discount cap if set
    if (voucher[0].max_discount && discount > voucher[0].max_discount) {
      discount = voucher[0].max_discount;
    }

    res.json({
      success: true,
      valid: true,
      voucher: {
        id: voucher[0].id,
        code: voucher[0].code,
        title: voucher[0].title,
        discountType: voucher[0].discount_type,
        discountValue: voucher[0].discount_value,
        calculatedDiscount: Math.round(discount * 100) / 100,
      },
    });
  } catch (error: any) {
    console.error("Validate voucher error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate voucher",
    });
  }
};

// Apply voucher to booking
export const applyVoucher: RequestHandler = async (req, res) => {
  try {
    const { voucherId, bookingId, discountAmount } = req.body;
    const userId = req.headers["x-user-id"] as string;

    const sql = await getSql();

    // Check eligibility
    const eligibility = await checkVoucherEligibility(userId, voucherId);
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        error: eligibility.reason,
      });
    }

    // Record usage
    const userVoucherId = `uv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await sql`
      INSERT INTO user_vouchers (id, user_id, voucher_id, booking_id, used_at)
      VALUES (${userVoucherId}, ${userId}, ${voucherId}, ${bookingId}, NOW())
    `;

    // Update voucher usage count
    await sql`
      UPDATE vouchers SET used_count = used_count + 1 WHERE id = ${voucherId}
    `;

    res.json({
      success: true,
      message: "Voucher applied successfully",
      userVoucherId,
    });
  } catch (error: any) {
    console.error("Apply voucher error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to apply voucher",
    });
  }
};

// Get user's vouchers
export const getUserVouchers: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const { status } = req.query;

    const sql = await getSql();

    let query = `
      SELECT v.*, uv.assigned_at, uv.used_at, uv.booking_id
      FROM vouchers v
      LEFT JOIN user_vouchers uv ON v.id = uv.voucher_id AND uv.user_id = '${userId}'
      WHERE v.is_active = true AND (v.valid_until IS NULL OR v.valid_until > NOW())
    `;

    if (status === "used") {
      query += ` AND uv.used_at IS NOT NULL`;
    } else if (status === "unused") {
      query += ` AND (uv.used_at IS NULL OR uv.id IS NULL)`;
    }

    query += ` ORDER BY v.created_at DESC`;

    const vouchers = await sql.unsafe(query);

    res.json({
      success: true,
      vouchers: vouchers || [],
    });
  } catch (error: any) {
    console.error("Get user vouchers error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch vouchers",
    });
  }
};

// ============= ADMIN ENDPOINTS =============

// Create voucher
export const createVoucher: RequestHandler = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      category,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      isActive,
    } = req.body;

    if (!code || !title || !discountType || !discountValue) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const sql = await getSql();
    const voucherId = `voucher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const voucher = await sql`
      INSERT INTO vouchers (
        id, code, title, description, category, discount_type, discount_value,
        min_purchase, max_discount, valid_from, valid_until, usage_limit, is_active, created_at
      ) VALUES (
        ${voucherId}, ${code.toUpperCase()}, ${title}, ${description || null},
        ${category || null}, ${discountType}, ${discountValue},
        ${minPurchase || null}, ${maxDiscount || null}, ${validFrom || null},
        ${validUntil || null}, ${usageLimit || null}, ${isActive ?? true}, NOW()
      ) RETURNING *
    `;

    res.status(201).json({
      success: true,
      voucher: voucher[0],
      message: "Voucher created successfully",
    });
  } catch (error: any) {
    console.error("Create voucher error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create voucher",
    });
  }
};

// Update voucher
export const updateVoucher: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.code;

    const sql = await getSql();

    // Build update query dynamically
    const updateFields = Object.entries(updates)
      .map(([key, value]) => {
        const dbKey = key
          .replace(/([A-Z])/g, "_$1")
          .toLowerCase()
          .replace(/^_/, "");
        return `${dbKey} = ${typeof value === "string" ? `'${value}'` : value}`;
      })
      .join(", ");

    if (!updateFields) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    const voucher = await sql.unsafe(`
      UPDATE vouchers SET ${updateFields}, updated_at = NOW()
      WHERE id = '${id}'
      RETURNING *
    `);

    if (!voucher[0]) {
      return res.status(404).json({
        success: false,
        error: "Voucher not found",
      });
    }

    res.json({
      success: true,
      voucher: voucher[0],
      message: "Voucher updated successfully",
    });
  } catch (error: any) {
    console.error("Update voucher error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update voucher",
    });
  }
};

// Delete/Deactivate voucher
export const deleteVoucher: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = await getSql();

    const voucher = await sql`
      UPDATE vouchers SET is_active = false, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!voucher[0]) {
      return res.status(404).json({
        success: false,
        error: "Voucher not found",
      });
    }

    res.json({
      success: true,
      message: "Voucher deactivated successfully",
    });
  } catch (error: any) {
    console.error("Delete voucher error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete voucher",
    });
  }
};

export default router;
