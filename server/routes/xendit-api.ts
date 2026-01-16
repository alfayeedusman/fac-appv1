import express, { RequestHandler } from "express";
import { getDatabase } from "../database/connection.js";
import * as schema from "../database/schema.js";
import { eq } from "drizzle-orm";
import { triggerPusherEvent } from "../services/pusherService.js";

const router = express.Router();

// Helper to emit events (fire and forget)
const emitPusher = async (channel: string | string[], eventName: string, payload: any) => {
  try {
    const res = await triggerPusherEvent(channel, eventName, payload);
    if (!res.success) console.warn('Pusher emit failed:', res.error);
  } catch (e) {
    console.warn('Pusher emit error:', e);
  }
};




























































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































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

    // If client provided a preferred payment method, attach it to metadata for tracking
    if (req.body.preferred_payment_method) {
      payload.metadata = payload.metadata || {};
      payload.metadata.preferred_payment_method = req.body.preferred_payment_method;
    }

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

    console.log("🔔 Xendit webhook received:", event);

    // Skip token verification in development (can be enabled in production)
    // const callbackToken = req.headers["x-callback-token"];
    // if (!callbackToken || callbackToken !== XENDIT_WEBHOOK_TOKEN) {
    //   console.error("Invalid webhook token");
    //   return res.status(401).json({
    //     success: false,
    //     error: "Unauthorized webhook request",
    //   });
    // }

    const db = getDb();
    const externalId = event.external_id;

    // Handle booking payments
    if (externalId?.startsWith("BOOKING_")) {
      const bookingId = externalId.replace("BOOKING_", "");

      if (event.status === "PAID" || event.status === "SETTLED") {
        console.log(`✅ Payment successful for booking ${bookingId}`);

        // Update booking payment status
        const [updatedBooking] = await db
          .update(schema.bookings)
          .set({
            paymentStatus: "completed",
            updatedAt: new Date(),
          })
          .where(eq(schema.bookings.id, bookingId))
          .returning();

        console.log(`📝 Booking ${bookingId} updated:`, updatedBooking);

        // Emit Pusher event for booking update
        (async () => {
          try {
            await emitPusher([`user-customer-${updatedBooking.userId}`, 'public-realtime'], 'booking.updated', {
              bookingId,
              paymentStatus: updatedBooking.paymentStatus,
              booking: updatedBooking,
            });
          } catch (err) {
            console.warn('Failed to emit booking pusher event:', err);
          }
        })();
      } else if (event.status === "EXPIRED" || event.status === "FAILED") {
        console.log(`❌ Payment failed/expired for booking ${bookingId}`);

        // Update booking payment status
        const [updatedBooking] = await db
          .update(schema.bookings)
          .set({
            paymentStatus: "failed",
            updatedAt: new Date(),
          })
          .where(eq(schema.bookings.id, bookingId))
          .returning();

        console.log(`📝 Booking ${bookingId} marked as failed:`, updatedBooking);

        (async () => {
          try {
            await emitPusher([`user-customer-${updatedBooking.userId}`, 'public-realtime'], 'booking.updated', {
              bookingId,
              paymentStatus: updatedBooking.paymentStatus,
              booking: updatedBooking,
            });
          } catch (err) {
            console.warn('Failed to emit booking pusher event:', err);
          }
        })();
      }
    }

    // Handle subscription payments
    if (externalId?.startsWith("SUBSCRIPTION_")) {
      const subscriptionId = externalId.replace("SUBSCRIPTION_", "");

      if (event.status === "PAID" || event.status === "SETTLED") {
        console.log(`✅ Subscription payment successful for ${subscriptionId}`);

        // Update subscription status to active and increment cycle count
        const [subscription] = await db
          .select()
          .from(schema.packageSubscriptions)
          .where(eq(schema.packageSubscriptions.id, subscriptionId));

        if (subscription) {
          const newRenewalDate = new Date(subscription.renewal_date);
          newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);

          const [updated] = await db
            .update(schema.packageSubscriptions)
            .set({
              status: "active",
              renewal_date: newRenewalDate,
              usage_count: (subscription.usage_count || 1) + 1,
              updated_at: new Date(),
            })
            .where(eq(schema.packageSubscriptions.id, subscriptionId))
            .returning();

          console.log(
            `📝 Subscription ${subscriptionId} renewed:`,
            updated,
          );

          // Emit Pusher event for subscription update
          (async () => {
            try {
              await emitPusher([`user-customer-${updated.user_id || updated.userId}`, 'public-realtime'], 'subscription.renewed', {
                subscriptionId,
                subscription: updated,
              });
            } catch (err) {
              console.warn('Failed to emit subscription pusher event:', err);
            }
          })();
        }
      } else if (event.status === "EXPIRED" || event.status === "FAILED") {
        console.log(`❌ Subscription payment failed for ${subscriptionId}`);

        // Mark subscription as paused
        const [updated] = await db
          .update(schema.packageSubscriptions)
          .set({
            status: "paused",
            auto_renew: false,
            updated_at: new Date(),
          })
          .where(eq(schema.packageSubscriptions.id, subscriptionId))
          .returning();

        console.log(`📝 Subscription ${subscriptionId} paused:`, updated);

        (async () => {
          try {
            await emitPusher([`user-customer-${updated.user_id || updated.userId}`, 'public-realtime'], 'subscription.failed', {
              subscriptionId,
              subscription: updated,
            });
          } catch (err) {
            console.warn('Failed to emit subscription pusher event:', err);
          }
        })();
      }
    }

    // Always return success to Xendit
    res.json({ success: true });
  } catch (error: any) {
    console.error("❌ Webhook handler error:", error);
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

// Check booking payment status
export const checkBookingPaymentStatus: RequestHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ success: false, error: "bookingId required" });
    }

    const db = getDb();
    const [booking] = await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, bookingId));

    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    res.json({
      success: true,
      bookingId: booking.id,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice,
      status: booking.status,
    });
  } catch (error: any) {
    console.error("Check booking payment error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check subscription payment status
export const checkSubscriptionPaymentStatus: RequestHandler = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    if (!subscriptionId) {
      return res
        .status(400)
        .json({ success: false, error: "subscriptionId required" });
    }

    const db = getDb();
    const [subscription] = await db
      .select()
      .from(schema.packageSubscriptions)
      .where(eq(schema.packageSubscriptions.id, subscriptionId));

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, error: "Subscription not found" });
    }

    res.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      autoRenew: subscription.auto_renew,
      renewalDate: subscription.renewal_date,
      cycleCount: subscription.usage_count || 1,
    });
  } catch (error: any) {
    console.error("Check subscription payment error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create subscription recurring invoice for renewal
export const createSubscriptionInvoice: RequestHandler = async (req, res) => {
  try {
    const {
      subscriptionId,
      amount,
      customerEmail,
      customerName,
      description,
      success_redirect_url,
      failure_redirect_url,
    } = req.body;

    if (!subscriptionId || !amount || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: "subscriptionId, amount, and customerEmail are required",
      });
    }

    if (!XENDIT_SECRET_KEY || XENDIT_SECRET_KEY.includes("YOUR_SECRET_KEY")) {
      return res.status(500).json({
        success: false,
        error: "Xendit API key not configured",
      });
    }

    const payload = {
      external_id: `SUBSCRIPTION_${subscriptionId}`,
      amount,
      payer_email: customerEmail,
      description: description || `Subscription Renewal - ${customerName || "Customer"}`,
      customer: {
        given_names: customerName || "Customer",
        email: customerEmail,
      },
      success_redirect_url,
      failure_redirect_url,
      currency: "PHP",
      invoice_duration: 86400 * 7, // 7 days for subscription payments
      items: [
        {
          name: description || "Subscription Renewal",
          quantity: 1,
          price: amount,
        },
      ],
    };

    console.log("📤 Creating subscription invoice...");
    const response = await fetch(`${XENDIT_API_URL}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Xendit API error:", errorText);
      return res.status(response.status).json({
        success: false,
        error: "Failed to create subscription invoice",
      });
    }

    const data = await response.json();
    console.log("✅ Subscription invoice created:", data.id);

    res.json({
      success: true,
      invoice_id: data.id,
      invoice_url: data.invoice_url,
      expiry_date: data.expiry_date,
    });
  } catch (error: any) {
    console.error("❌ Create subscription invoice error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

export default router;
