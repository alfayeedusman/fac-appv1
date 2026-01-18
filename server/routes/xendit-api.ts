import express, { RequestHandler } from "express";
import { getDatabase } from "../database/connection";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { triggerPusherEvent } from "../services/pusherService";

const router = express.Router();

// Helper to emit events (fire and forget)
const emitPusher = async (
  channel: string | string[],
  eventName: string,
  payload: any,
) => {
  try {
    const res = await triggerPusherEvent(channel, eventName, payload);
    if (!res.success) console.warn("Pusher emit failed:", res.error);
  } catch (e) {
    console.warn("Pusher emit error:", e);
  }
};

// Xendit Secret Key (use environment variable in production)
const XENDIT_SECRET_KEY =
  process.env.XENDIT_SECRET_KEY || "xnd_production_YOUR_SECRET_KEY_HERE";
const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN || "";
const XENDIT_API_URL = "https://api.xendit.co/v2";

// Helper function to get database
const getDb = () => getDatabase();

// Cache for available payment methods to speed up responses
const PAYMENT_METHODS_CACHE_TTL = Number(
  process.env.XENDIT_METHODS_CACHE_TTL_SECONDS || 300,
); // default 5 minutes
let paymentMethodsCache: { methods: any[]; expiresAt: number } | null = null;
let paymentMethodsRefreshInProgress = false;

// Background refresher: periodically refresh the cached payment methods to ensure
// the first user sees a warmed cache and requests are fast.
async function refreshPaymentMethodsCache() {
  if (paymentMethodsRefreshInProgress) return;
  paymentMethodsRefreshInProgress = true;

  try {
    if (!XENDIT_SECRET_KEY || XENDIT_SECRET_KEY.includes("YOUR_SECRET_KEY")) {
      // Nothing to refresh from Xendit; set fallback and return
      const fallback = [
        { id: "card", label: "Credit / Debit Card" },
        { id: "gcash", label: "GCash (e-wallet)" },
        { id: "paymaya", label: "PayMaya (e-wallet)" },
        { id: "bank_transfer", label: "Bank Transfer" },
        { id: "offline", label: "Pay at Counter (Cash)" },
      ];
      paymentMethodsCache = {
        methods: fallback,
        expiresAt: Date.now() + PAYMENT_METHODS_CACHE_TTL * 1000,
      };
      return;
    }

    const url = `${XENDIT_API_URL}/invoices/available_payment_methods`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      console.warn(
        "Background refresh: Xendit returned non-ok status",
        resp.status,
        text,
      );
      return;
    }

    const data = await resp.json().catch(() => null);
    if (!data) {
      console.warn("Background refresh: invalid JSON from Xendit");
      return;
    }

    const list = Array.isArray(data)
      ? data
      : data.available_payment_methods || data.payment_methods || [];
    const methods = (list || []).map((m: any) => {
      const id = (m.code || m.id || m.payment_method || m.type || m.name || "")
        .toString()
        .toLowerCase();
      const label =
        m.name || m.display_name || m.label || m.payment_method || m.id || id;
      return { id, label };
    });

    const finalMethods =
      methods && methods.length > 0
        ? methods
        : [
            { id: "card", label: "Credit / Debit Card" },
            { id: "gcash", label: "GCash (e-wallet)" },
            { id: "paymaya", label: "PayMaya (e-wallet)" },
            { id: "bank_transfer", label: "Bank Transfer" },
            { id: "offline", label: "Pay at Counter (Cash)" },
          ];

    paymentMethodsCache = {
      methods: finalMethods,
      expiresAt: Date.now() + PAYMENT_METHODS_CACHE_TTL * 1000,
    };
    console.log(
      "✅ Payment methods cache refreshed (background) -",
      finalMethods.map((m) => m.id).join(", "),
    );
  } catch (err) {
    console.warn("⚠️ Background refresh error:", err);
  } finally {
    paymentMethodsRefreshInProgress = false;
  }
}

// Start background refresh interval (if TTL > 0)
// NOTE: Disabled because Xendit API endpoint /invoices/available_payment_methods
// appears to be invalid or changed. The listPaymentMethods endpoint has fallback hardcoded methods.
// try {
//   if (PAYMENT_METHODS_CACHE_TTL > 0) {
//     // Trigger an initial refresh without blocking startup
//     setTimeout(() => {
//       refreshPaymentMethodsCache().catch((e) => console.warn('Initial payment methods refresh failed:', e));
//     }, 0);

//     // Schedule periodic refresh
//     setInterval(() => {
//       refreshPaymentMethodsCache().catch((e) => console.warn('Periodic payment methods refresh failed:', e));
//     }, Math.max(1000, PAYMENT_METHODS_CACHE_TTL * 1000));
//   }
// } catch (e) {
//   console.warn('Failed to start payment methods background refresher:', e);
// }

// List payment methods supported by Xendit (frontend helper - dynamic with caching)
export const listPaymentMethods: RequestHandler = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const forceRefresh = req.query.refresh === "true";

    // Return cached if valid and not forced
    const now = Date.now();
    if (
      !forceRefresh &&
      paymentMethodsCache &&
      paymentMethodsCache.expiresAt > now
    ) {
      return res.json({
        success: true,
        methods: paymentMethodsCache.methods,
        source: "cache",
      });
    }

    // If Xendit key is not configured, return a reasonable fallback (and cache it briefly)
    if (!XENDIT_SECRET_KEY || XENDIT_SECRET_KEY.includes("YOUR_SECRET_KEY")) {
      const fallback = [
        { id: "card", label: "Credit / Debit Card" },
        { id: "gcash", label: "GCash (e-wallet)" },
        { id: "paymaya", label: "PayMaya (e-wallet)" },
        { id: "bank_transfer", label: "Bank Transfer" },
        { id: "pay_at_counter", label: "Pay at Counter (Cash)" },
      ];
      paymentMethodsCache = {
        methods: fallback,
        expiresAt: now + PAYMENT_METHODS_CACHE_TTL * 1000,
      };
      return res.json({ success: true, methods: fallback, source: "fallback" });
    }

    // Always return a success response with available methods (fallback if needed)
    const fallback = [
      { id: "card", label: "Credit / Debit Card" },
      { id: "gcash", label: "GCash (e-wallet)" },
      { id: "paymaya", label: "PayMaya (e-wallet)" },
      { id: "bank_transfer", label: "Bank Transfer" },
      { id: "pay_at_counter", label: "Pay at Counter (Cash)" },
    ];

    // Try to fetch from Xendit, but always return fallback on any error
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data) {
          const list = Array.isArray(data)
            ? data
            : data.available_payment_methods || data.payment_methods || [];

          const methods = (list || []).map((m: any) => {
            const id = (m.code || m.id || m.payment_method || m.type || m.name || "")
              .toString()
              .toLowerCase();
            const label =
              m.name || m.display_name || m.label || m.payment_method || m.id || id;
            return { id, label };
          });

          if (methods.length > 0) {
            paymentMethodsCache = {
              methods,
              expiresAt: Date.now() + PAYMENT_METHODS_CACHE_TTL * 1000,
            };
            return res.json({ success: true, methods, source: "xendit" });
          }
        }
      }
    } catch (xenditErr) {
      console.warn("⚠️ Xendit API call failed, using fallback:", xenditErr);
    }

    // Fallback: always return success with default methods
    paymentMethodsCache = {
      methods: fallback,
      expiresAt: Date.now() + PAYMENT_METHODS_CACHE_TTL * 1000,
    };
    return res.json({ success: true, methods: fallback, source: "fallback" });
  } catch (error: any) {
    console.error("❌ List payment methods error:", error?.message || error);
    const fallback = [
      { id: "card", label: "Credit / Debit Card" },
      { id: "gcash", label: "GCash (e-wallet)" },
      { id: "paymaya", label: "PayMaya (e-wallet)" },
      { id: "bank_transfer", label: "Bank Transfer" },
      { id: "pay_at_counter", label: "Pay at Counter (Cash)" },
    ];
    res.status(200).json({ success: true, methods: fallback, source: "fallback_error" });
  }
};

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
      payload.metadata.preferred_payment_method =
        req.body.preferred_payment_method;
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
      available_payment_methods: data.available_payment_methods || null,
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
  const startTime = Date.now();
  let dbResult: any = {};
  let isNewEvent = false;

  try {
    const event = req.body;

    // If webhook token is configured, require clients to present it.
    try {
      const headerToken = (req.headers["x-callback-token"] ||
        req.headers["x-callback-token".toLowerCase()]) as string | undefined;
      if (XENDIT_WEBHOOK_TOKEN) {
        if (!headerToken || headerToken !== XENDIT_WEBHOOK_TOKEN) {
          console.warn("Unauthorized Xendit webhook - invalid token");
          return res
            .status(401)
            .json({ success: false, error: "Unauthorized webhook request" });
        }
      }
    } catch (verifyErr) {
      console.warn("Webhook verification failed:", verifyErr);
      return res
        .status(401)
        .json({ success: false, error: "Webhook verification failed" });
    }

    // Log event type only (avoid dumping entire payload)
    console.log(
      "🔔 Xendit webhook received (type):",
      event?.type || event?.event || "unknown",
    );

    const db = getDb();
    const externalId = event.external_id;
    const eventId = event.id || event.reference_id || `xendit-${Date.now()}`; // Use webhook event ID or fallback

    // ========== IDEMPOTENCY CHECK ==========
    // Check if we've already processed this webhook
    const existingLog = await db
      .select()
      .from(schema.webhookEventLogs)
      .where(eq(schema.webhookEventLogs.eventId, eventId))
      .limit(1);

    if (existingLog && existingLog.length > 0) {
      // Already processed - return success without re-processing
      console.log(`⚠️ Webhook already processed (idempotency): ${eventId}`);
      return res.json({ success: true, duplicateEvent: true });
    }

    isNewEvent = true;

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

        // Create persistent system notification for admin
        try {
          await db.insert(schema.systemNotifications).values({
            id: `notification-${bookingId}-paid-${Date.now()}`,
            type: "payment_received",
            title: "Payment Received",
            message: `Payment received for booking ${updatedBooking.confirmationCode || bookingId}. Amount: ₱${updatedBooking.totalPrice}`,
            priority: "high",
            targetRoles: ["admin", "superadmin", "manager", "cashier"],
            targetUsers: [],
            data: {
              bookingId,
              amount: updatedBooking.totalPrice,
              paymentMethod: "xendit",
              invoiceId: event.id,
            },
            createdAt: new Date(),
            readBy: [],
          });
          console.log(
            `✅ System notification created for payment on booking ${bookingId}`,
          );
        } catch (notifErr) {
          console.warn(
            `⚠️ Failed to create notification for booking ${bookingId}:`,
            notifErr,
          );
        }

        // Create POS transaction for sales tracking
        try {
          const posTransaction = {
            id: `pos-${bookingId}-${Date.now()}`,
            transactionNumber: `TXN-${updatedBooking.confirmationCode || bookingId}`,
            branchId: updatedBooking.branch || "default",
            cashierId: null, // Xendit payment - no cashier
            totalAmount: updatedBooking.totalPrice,
            totalDiscount: 0,
            totalTax: 0,
            paymentMethod: "card", // Xendit online payment
            paymentReference: event.id, // Xendit invoice ID
            status: "completed",
            notes: `Booking payment - ${updatedBooking.confirmationCode || bookingId} (${updatedBooking.type})`,
            sessionId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              bookingId,
              bookingType: updatedBooking.type,
              bookingConfirmation: updatedBooking.confirmationCode,
              service: updatedBooking.service,
              guestInfo:
                updatedBooking.type === "guest"
                  ? updatedBooking.guestInfo
                  : null,
            },
          };

          await db.insert(schema.posTransactions).values(posTransaction);
          console.log(
            `✅ POS transaction created for booking ${bookingId} payment`,
          );

          // Create POS transaction item for the booking service
          await db.insert(schema.posTransactionItems).values({
            id: `pos-item-${bookingId}-${Date.now()}`,
            transactionId: posTransaction.id,
            productId: `booking-${updatedBooking.service}`,
            productName: updatedBooking.service,
            quantity: 1,
            unitPrice: updatedBooking.basePrice || updatedBooking.totalPrice,
            discount:
              updatedBooking.basePrice && updatedBooking.totalPrice
                ? updatedBooking.basePrice - updatedBooking.totalPrice
                : 0,
            subtotal: updatedBooking.totalPrice,
            createdAt: new Date(),
          });

          // Emit POS transaction event for dashboard updates
          (async () => {
            try {
              await emitPusher(
                ["public-realtime", "admin-dashboard"],
                "pos.transaction.created",
                {
                  transactionId: posTransaction.id,
                  totalAmount: posTransaction.totalAmount,
                  bookingId,
                },
              );
            } catch (err) {
              console.warn("Failed to emit POS transaction pusher event:", err);
            }
          })();
        } catch (posErr) {
          console.warn(
            `⚠️ Failed to create POS transaction for booking ${bookingId}:`,
            posErr,
          );
        }

        // Emit Pusher event for booking update
        (async () => {
          try {
            const channels = ["public-realtime", "admin-dashboard"];
            if (updatedBooking.userId) {
              channels.push(`user-customer-${updatedBooking.userId}`);
            }
            await emitPusher(channels, "booking.updated", {
              bookingId,
              paymentStatus: updatedBooking.paymentStatus,
              booking: updatedBooking,
            });
          } catch (err) {
            console.warn("Failed to emit booking pusher event:", err);
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

        console.log(
          `📝 Booking ${bookingId} marked as failed:`,
          updatedBooking,
        );

        (async () => {
          try {
            await emitPusher(
              [`user-customer-${updatedBooking.userId}`, "public-realtime"],
              "booking.updated",
              {
                bookingId,
                paymentStatus: updatedBooking.paymentStatus,
                booking: updatedBooking,
              },
            );
          } catch (err) {
            console.warn("Failed to emit booking pusher event:", err);
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

          console.log(`📝 Subscription ${subscriptionId} renewed:`, updated);

          // Emit Pusher event for subscription update
          (async () => {
            try {
              await emitPusher(
                [
                  `user-customer-${updated.user_id || updated.userId}`,
                  "public-realtime",
                ],
                "subscription.renewed",
                {
                  subscriptionId,
                  subscription: updated,
                },
              );
            } catch (err) {
              console.warn("Failed to emit subscription pusher event:", err);
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
            await emitPusher(
              [
                `user-customer-${updated.user_id || updated.userId}`,
                "public-realtime",
              ],
              "subscription.failed",
              {
                subscriptionId,
                subscription: updated,
              },
            );
          } catch (err) {
            console.warn("Failed to emit subscription pusher event:", err);
          }
        })();
      }
    }

    // ========== LOG WEBHOOK EVENT FOR IDEMPOTENCY ==========
    if (isNewEvent) {
      const processingTimeMs = Date.now() - startTime;
      try {
        await db.insert(schema.webhookEventLogs).values({
          provider: "xendit",
          eventId: eventId,
          externalId: externalId || null,
          eventType: event.status || event.type || null,
          eventStatus: "success",
          payload: event,
          processingTimeMs: processingTimeMs,
          result: dbResult,
          ipAddress:
            (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
            req.socket.remoteAddress ||
            null,
          userAgent: req.headers["user-agent"] || null,
        });
        console.log(
          `📋 Webhook event logged for idempotency: ${eventId} (${processingTimeMs}ms)`,
        );
      } catch (logErr) {
        console.warn("Failed to log webhook event:", logErr);
        // Don't fail the entire webhook if logging fails
      }
    }

    // Always return success to Xendit
    res.json({ success: true });
  } catch (error: any) {
    // ========== LOG FAILED WEBHOOK PROCESSING ==========
    const processingTimeMs = Date.now() - startTime;
    try {
      if (isNewEvent) {
        const eventId =
          req.body?.id || req.body?.reference_id || `xendit-${Date.now()}`;
        await db.insert(schema.webhookEventLogs).values({
          provider: "xendit",
          eventId: eventId,
          externalId: req.body?.external_id || null,
          eventType: req.body?.status || req.body?.type || null,
          eventStatus: "failure",
          payload: req.body,
          processingTimeMs: processingTimeMs,
          errorMessage: error.message || "Unknown error",
          ipAddress:
            (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
            req.socket.remoteAddress ||
            null,
          userAgent: req.headers["user-agent"] || null,
        });
      }
    } catch (logErr) {
      console.warn("Failed to log failed webhook event:", logErr);
    }

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
      return res
        .status(400)
        .json({ success: false, error: "bookingId required" });
    }

    const db = getDb();
    const [booking] = await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, bookingId));

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
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
export const checkSubscriptionPaymentStatus: RequestHandler = async (
  req,
  res,
) => {
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
      description:
        description || `Subscription Renewal - ${customerName || "Customer"}`,
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
