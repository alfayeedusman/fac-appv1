// Xendit payment service for client-side payment handling
import { toast } from "@/hooks/use-toast";
import { log, info, warn, error as logError } from '@/utils/logger';

export interface XenditInvoiceRequest {
  external_id: string;
  amount: number;
  payer_email: string;
  description: string;
  customer?: {
    given_names: string;
    email: string;
  };
  success_redirect_url?: string;
  failure_redirect_url?: string;
}

export interface XenditInvoiceResponse {
  success: boolean;
  invoice_id?: string;
  invoice_url?: string;
  expiry_date?: string;
  error?: string;
}

export interface BookingPaymentRequest {
  bookingId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  description: string;
}

export interface SubscriptionPaymentRequest {
  subscriptionId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  description: string;
}

class XenditPaymentService {
  private baseUrl: string;

  constructor() {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
    this.baseUrl = `${apiBase}/neon/payment/xendit`;
  }

  /**
   * Create a booking payment invoice
   */
  async createBookingInvoice(request: BookingPaymentRequest): Promise<XenditInvoiceResponse> {
    try {
      log("💳 Creating booking payment invoice...", request);

      const currentUrl = window.location.origin;
      const payload: XenditInvoiceRequest = {
        external_id: `BOOKING_${request.bookingId}`,
        amount: request.amount,
        payer_email: request.customerEmail,
        description: request.description,
        customer: {
          given_names: request.customerName,
          email: request.customerEmail,
        },
        success_redirect_url: `${currentUrl}/booking-success?bookingId=${request.bookingId}`,
        failure_redirect_url: `${currentUrl}/booking-failed?bookingId=${request.bookingId}`,
      };

      const response = await fetch(`${this.baseUrl}/create-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      log("📋 Invoice response:", result);

      if (!response.ok || !result.success) {
        logError("❌ Failed to create booking invoice:", result.error);
        return { success: false, error: result.error || "Failed to create invoice" };
      }

      return result;
    } catch (error: any) {
      logError("❌ Booking payment error:", error);
      return { success: false, error: error.message || "Network error" };
    }
  }

  /**
   * Create a subscription renewal invoice
   */
  async createSubscriptionInvoice(request: SubscriptionPaymentRequest): Promise<XenditInvoiceResponse> {
    try {
      log("💳 Creating subscription renewal invoice...", request);

      const currentUrl = window.location.origin;
      const payload = {
        subscriptionId: request.subscriptionId,
        amount: request.amount,
        customerEmail: request.customerEmail,
        customerName: request.customerName,
        description: request.description,
        success_redirect_url: `${currentUrl}/subscription-renewal-success?subscriptionId=${request.subscriptionId}`,
        failure_redirect_url: `${currentUrl}/subscription-renewal-failed?subscriptionId=${request.subscriptionId}`,
      };

      const response = await fetch(`${this.baseUrl}/create-subscription-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      log("📋 Subscription invoice response:", result);

      if (!response.ok || !result.success) {
        logError("❌ Failed to create subscription invoice:", result.error);
        return { success: false, error: result.error || "Failed to create invoice" };
      }

      return result;
    } catch (error: any) {
      logError("❌ Subscription payment error:", error);
      return { success: false, error: error.message || "Network error" };
    }
  }

  /**
   * Open payment popup for invoice
   */
  openPaymentPopup(invoiceUrl: string, onSuccess?: () => void, onFail?: () => void): Window | null {
    try {
      console.log("🔗 Opening payment popup...", invoiceUrl);

      const width = 800;
      const height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      const popup = window.open(
        invoiceUrl,
        "XenditPayment",
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      if (!popup) {
        console.error("❌ Popup blocked by browser");
        return null;
      }

      // Poll for popup closure
      const pollInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollInterval);
          console.log("📴 Payment popup closed");
          if (onFail) onFail();
        }
      }, 1000);

      return popup;
    } catch (error) {
      console.error("❌ Failed to open payment popup:", error);
      return null;
    }
  }

  /**
   * Check booking payment status
   */
  async checkBookingPaymentStatus(
    bookingId: string,
  ): Promise<{ success: boolean; paymentStatus?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/booking-status/${bookingId}`);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("❌ Failed to check booking status:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check subscription payment status
   */
  async checkSubscriptionPaymentStatus(
    subscriptionId: string,
  ): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription-status/${subscriptionId}`);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("❌ Failed to check subscription status:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Poll for payment status with timeout
   */
  async pollPaymentStatus(
    type: "booking" | "subscription",
    id: string,
    maxAttempts = 60, // 5 minutes with 5s intervals
  ): Promise<boolean> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const result =
          type === "booking"
            ? await this.checkBookingPaymentStatus(id)
            : await this.checkSubscriptionPaymentStatus(id);

        if (result.success) {
          const status = result.paymentStatus || result.status;
          console.log(`✅ ${type} status: ${status}`);

          if (status === "completed" || status === "active") {
            return true;
          }

          if (status === "failed" || status === "paused") {
            return false;
          }
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
    }

    console.warn(`⏱️ Payment status check timed out for ${type} ${id}`);
    return false;
  }
}

export const xenditPaymentService = new XenditPaymentService();
