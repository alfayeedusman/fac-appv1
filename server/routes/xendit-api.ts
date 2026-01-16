import express, { RequestHandler } from "express";
import { getDatabase } from "../database/connection.js";
import * as schema from "../database/schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

// Xendit Secret Key (use environment variable in production)
const XENDIT_SECRET_KEY =
  process.env.XENDIT_SECRET_KEY || "xnd_production_YOUR_SECRET_KEY_HERE";
const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN || "";
const XENDIT_API_URL = "https://api.xendit.co/v2";

// Helper function to get database
const getDb = () => getDatabase();

// Create Invoice
export const createInvoice: RequestHandler = async (req, res) => {
  console.log("💳 Xendit create invoice request received");
  console.log("Request body:", req.body);

  try {
    const {
      external_id,
      amount,
      payer_email,
      description,
      customer,
      success_redirect_url,
      failure_redirect_url,
    } = req.body;

    // Validate required fields
    if (!external_id || !amount || !payer_email || !description) {
      console.error("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: external_id, amount, payer_email, description",
      });
    }

    // Check if API key is configured
    if (!XENDIT_SECRET_KEY || XENDIT_SECRET_KEY.includes("YOUR_SECRET_KEY")) {
      console.error("❌ Xendit API key not configured");
      return res.status(500).json({
        success: false,
        error:
          "Xendit API key not configured. Please set XENDIT_SECRET_KEY environment variable.",
      });
    }

    const payload = {
      external_id,
      amount,
      payer_email,
      description,
      customer,
      success_redirect_url,
      failure_redirect_url,
      currency: "PHP",
      invoice_duration: 86400, // 24 hours
      items: [
        {
          name: description,
          quantity: 1,
          price: amount,
        },
      ],
    };

    console.log("📤 Sending request to Xendit API...");
    console.log("API URL:", `${XENDIT_API_URL}/invoices`);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${XENDIT_API_URL}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("📥 Xendit API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Xendit API error response:", errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }

      return res.status(response.status).json({
        success: false,
        error:
          errorData.message ||
          errorData.error_code ||
          "Failed to create invoice",
        details: errorData,
      });
    }

    const data = await response.json();
    console.log("✅ Xendit invoice created successfully:", data.id);

    res.json({
      success: true,
      invoice_id: data.id,
      invoice_url: data.invoice_url,
      expiry_date: data.expiry_date,
    });
  } catch (error: any) {
    console.error("❌ Create invoice error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
      details: error.stack,
    });
  }
};

// Charge Card (for direct card charges)
export const chargeCard: RequestHandler = async (req, res) => {
  try {
    const { token_id, authentication_id, amount, external_id, description } =
      req.body;

    const response = await fetch(`${XENDIT_API_URL}/credit_card_charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`,
      },
      body: JSON.stringify({
        token_id,
        authentication_id,
        amount,
        external_id,
        description,
        currency: "PHP",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Xendit charge error:", error);
      return res.status(response.status).json({
        success: false,
        error: error.message || "Failed to charge card",
      });
    }

    const data = await response.json();
    res.json({
      success: true,
      charge_id: data.id,
      status: data.status,
      amount: data.amount,
    });
  } catch (error: any) {
    console.error("Charge card error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

// Webhook handler for Xendit callbacks
export const handleWebhook: RequestHandler = async (req, res) => {
  try {
    const event = req.body;

    console.log("Xendit webhook received:", event);

    // Verify webhook authenticity using callback token
    const callbackToken = req.headers["x-callback-token"];

    if (!callbackToken || callbackToken !== XENDIT_WEBHOOK_TOKEN) {
      console.error("Invalid webhook token");
      return res.status(401).json({
        success: false,
        error: "Unauthorized webhook request",
      });
    }

    // Handle different event types
    if (event.status === "PAID" || event.status === "SETTLED") {
      // Update booking payment status
      const externalId = event.external_id; // e.g., "BOOKING_123"
      const bookingId = externalId.replace("BOOKING_", "");

      // Update booking in database
      // await updateBookingPaymentStatus(bookingId, 'paid', event.id);

      console.log(`Payment successful for booking ${bookingId}`);
    } else if (event.status === "EXPIRED" || event.status === "FAILED") {
      const externalId = event.external_id;
      const bookingId = externalId.replace("BOOKING_", "");

      // Update booking payment status
      // await updateBookingPaymentStatus(bookingId, 'failed', event.id);

      console.log(`Payment failed/expired for booking ${bookingId}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

// Get invoice status by ID
export const getInvoiceStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    if (!id)
      return res.status(400).json({ success: false, error: "id is required" });

    if (!XENDIT_SECRET_KEY || XENDIT_SECRET_KEY.includes("YOUR_SECRET_KEY")) {
      return res
        .status(500)
        .json({ success: false, error: "Xendit API key not configured" });
    }

    const response = await fetch(`${XENDIT_API_URL}/invoices/${id}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ success: false, error: text });
    }

    const data = await response.json();
    res.json({ success: true, invoice: data, status: data.status });
  } catch (error: any) {
    console.error("Get invoice status error:", error);
    res
      .status(500)
      .json({ success: false, error: error.message || "Internal error" });
  }
};

export default router;
