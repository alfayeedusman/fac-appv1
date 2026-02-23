import express, { RequestHandler } from "express";
import { getSqlClient } from "../database/connection";

const router = express.Router();

async function getSql() {
  return await getSqlClient();
}

// ============= PAYMENT METHODS ENDPOINTS =============

// List user's payment methods
export const listMethods: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const sql = await getSql();

    const methods = await sql`
      SELECT id, type, provider, last4, expiry_month, expiry_year, holder_name, is_default, created_at
      FROM payment_methods
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY is_default DESC, created_at DESC
    `;

    res.json({
      success: true,
      methods: methods || [],
    });
  } catch (error: any) {
    console.error("List payment methods error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment methods",
    });
  }
};

// Add new payment method
export const addMethod: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const {
      type,
      provider,
      last4,
      expiryMonth,
      expiryYear,
      holderName,
      token,
      isDefault,
    } = req.body;

    if (!type || !provider || !last4 || !expiryMonth || !expiryYear) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const sql = await getSql();
    const methodId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // If setting as default, unset other defaults
    if (isDefault) {
      await sql`
        UPDATE payment_methods SET is_default = false
        WHERE user_id = ${userId}
      `;
    }

    const method = await sql`
      INSERT INTO payment_methods (
        id, user_id, type, provider, last4, expiry_month, expiry_year,
        holder_name, token, is_default, created_at
      ) VALUES (
        ${methodId}, ${userId}, ${type}, ${provider}, ${last4},
        ${expiryMonth}, ${expiryYear}, ${holderName}, ${token || null},
        ${isDefault || false}, NOW()
      ) RETURNING id, type, provider, last4, expiry_month, expiry_year, holder_name, is_default
    `;

    res.status(201).json({
      success: true,
      method: method[0],
      message: "Payment method added successfully",
    });
  } catch (error: any) {
    console.error("Add payment method error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add payment method",
    });
  }
};

// Set default payment method
export const setDefault: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const { methodId } = req.body;

    const sql = await getSql();

    // Unset current default
    await sql`
      UPDATE payment_methods SET is_default = false
      WHERE user_id = ${userId}
    `;

    // Set new default
    const method = await sql`
      UPDATE payment_methods SET is_default = true
      WHERE id = ${methodId} AND user_id = ${userId}
      RETURNING id, type, provider, last4, expiry_month, expiry_year, holder_name, is_default
    `;

    if (!method[0]) {
      return res.status(404).json({
        success: false,
        error: "Payment method not found",
      });
    }

    res.json({
      success: true,
      method: method[0],
      message: "Default payment method updated",
    });
  } catch (error: any) {
    console.error("Set default payment method error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to set default payment method",
    });
  }
};

// Delete payment method
export const deleteMethod: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const { methodId } = req.body;

    const sql = await getSql();

    // Check if it's the only method and it's default
    const method = await sql`
      SELECT * FROM payment_methods WHERE id = ${methodId} AND user_id = ${userId}
    `;

    if (!method[0]) {
      return res.status(404).json({
        success: false,
        error: "Payment method not found",
      });
    }

    const count = await sql`
      SELECT COUNT(*) as total FROM payment_methods
      WHERE user_id = ${userId} AND is_active = true
    `;

    if (count[0].total === 1 && method[0].is_default) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete the only default payment method",
      });
    }

    // Soft delete
    await sql`
      UPDATE payment_methods SET is_active = false, updated_at = NOW()
      WHERE id = ${methodId}
    `;

    res.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete payment method error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete payment method",
    });
  }
};

// ============= PAYMENT PROCESSING ENDPOINTS =============

// Process payment
export const processPayment: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const { methodId, amount, currency = "USD", description } = req.body;

    if (!methodId || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const sql = await getSql();

    // Validate payment method exists
    const method = await sql`
      SELECT * FROM payment_methods
      WHERE id = ${methodId} AND user_id = ${userId} AND is_active = true
    `;

    if (!method[0]) {
      return res.status(404).json({
        success: false,
        error: "Payment method not found",
      });
    }

    // In production, integrate with payment gateway (Stripe, PayPal, etc.)
    // For now, we'll simulate a successful payment

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      transaction: {
        id: transactionId,
        userId,
        methodId,
        amount,
        currency,
        description,
        status: "completed",
        timestamp: new Date().toISOString(),
      },
      message: "Payment processed successfully",
    });
  } catch (error: any) {
    console.error("Process payment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process payment",
    });
  }
};

// Get payment history
export const getPaymentHistory: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const { page = 1, limit = 20 } = req.query;

    const sql = await getSql();

    // Note: This would query a transactions table in production
    res.json({
      success: true,
      transactions: [],
      total: 0,
      message: "Payment history retrieved",
    });
  } catch (error: any) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment history",
    });
  }
};

export default router;
