// Xendit Payment Service
// Documentation: https://developers.xendit.co/api-reference/

declare global {
  interface Window {
    Xendit: any;
  }
}

const XENDIT_PUBLIC_KEY =
  "xnd_public_development_0GsLabVLX_CfyXBlEErMSO7jjhbNI7ZcUhYKhS6zhwBugx8ZnYV6UGD9yCP1sg";

export interface XenditPaymentParams {
  amount: number;
  externalId: string;
  customerName: string;
  customerEmail: string;
  description: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  preferredPaymentMethod?: string; // e.g., 'gcash', 'paymaya', 'card', 'bank_transfer'
}

export interface XenditTokenResponse {
  id: string;
  status: string;
  authentication_id?: string;
  card_info?: {
    bank: string;
    country: string;
    type: string;
    brand: string;
  };
}

class XenditService {
  private xendit: any;
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== "undefined" && window.Xendit) {
      this.xendit = window.Xendit;
      this.xendit.setPublishableKey(XENDIT_PUBLIC_KEY);
      this.initialized = true;
      console.log("✅ Xendit SDK initialized");
    } else {
      console.warn(
        "⚠️ Xendit SDK not loaded - card tokenization features will not be available",
      );
      // Still allow invoice creation via backend
      this.initialized = false;
    }
  }

  public createInvoice = async (params: XenditPaymentParams): Promise<any> => {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 15000); // 15s timeout for payment

    try {
      console.log("💳 Creating Xendit invoice...", params);

      // Create invoice via backend API
      const response = await fetch("/api/neon/payment/xendit/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          external_id: params.externalId,
          amount: params.amount,
          payer_email: params.customerEmail,
          description: params.description,
          customer: {
            given_names: params.customerName,
            email: params.customerEmail,
          },
          success_redirect_url:
            params.successRedirectUrl ||
            window.location.origin + "/booking-success",
          failure_redirect_url:
            params.failureRedirectUrl ||
            window.location.origin + "/booking-failed",
          preferred_payment_method: params.preferredPaymentMethod || undefined,
        }),
        signal: ac.signal,
      });

      clearTimeout(timeout);
      console.log("📡 Xendit API response status:", response.status);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to parse error response" }));
        console.error("❌ Xendit API error:", errorData);
        throw new Error(errorData.error || "Failed to create invoice");
      }

      const data = await response.json();
      console.log("✅ Xendit invoice created:", data);
      return data;
    } catch (error: any) {
      clearTimeout(timeout);

      if (error?.name === "AbortError") {
        const timeoutError = new Error(
          "Payment request timed out. Please check your internet connection and try again.",
        );
        console.error("❌ Xendit request timeout");
        throw timeoutError;
      }

      console.error("❌ Xendit invoice creation error:", error);
      throw error;
    }
  };

  public createToken = async (cardData: {
    card_number: string;
    card_exp_month: string;
    card_exp_year: string;
    card_cvn: string;
    is_multiple_use?: boolean;
    should_authenticate?: boolean;
  }): Promise<XenditTokenResponse> => {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(new Error("Xendit not initialized"));
        return;
      }

      this.xendit.card.createToken(
        {
          amount: 0, // For tokenization only
          card_number: cardData.card_number,
          card_exp_month: cardData.card_exp_month,
          card_exp_year: cardData.card_exp_year,
          card_cvn: cardData.card_cvn,
          is_multiple_use: cardData.is_multiple_use || false,
          should_authenticate: cardData.should_authenticate || false,
        },
        (err: any, token: XenditTokenResponse) => {
          if (err) {
            console.error("Xendit tokenization error:", err);
            reject(err);
          } else {
            resolve(token);
          }
        },
      );
    });
  };

  public create3DSAuthentication = async (params: {
    amount: number;
    token_id: string;
  }): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(new Error("Xendit not initialized"));
        return;
      }

      this.xendit.card.createAuthentication(
        {
          amount: params.amount,
          token_id: params.token_id,
        },
        (err: any, authentication: any) => {
          if (err) {
            console.error("Xendit 3DS authentication error:", err);
            reject(err);
          } else {
            resolve(authentication);
          }
        },
      );
    });
  };

  public chargeCard = async (params: {
    token_id: string;
    authentication_id?: string;
    amount: number;
    external_id: string;
    description: string;
  }): Promise<any> => {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 15000); // 15s timeout for payment

    try {
      // Charge card via backend API
      const response = await fetch("/api/neon/payment/xendit/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
        signal: ac.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error("Failed to charge card");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      clearTimeout(timeout);

      if (error?.name === "AbortError") {
        throw new Error(
          "Payment request timed out. Please check your internet connection and try again.",
        );
      }

      console.error("Xendit charge error:", error);
      throw error;
    }
  };

  public openInvoice = (invoiceUrl: string) => {
    // Redirect to Xendit invoice in the same window
    window.location.href = invoiceUrl;
  };

  public createSubscriptionPlan = async (params: {
    reference_id: string;
    customer_email: string;
    description: string;
    amount: number;
    interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    interval_count: number;
    payment_method: "CARD" | "EWALLET";
    notification_url?: string;
  }): Promise<any> => {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 15000);

    try {
      console.log("📅 Creating recurring billing plan...", params);

      const response = await fetch(
        "/api/neon/payment/xendit/create-subscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
          signal: ac.signal,
        },
      );

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error("Failed to create subscription plan");
      }

      const data = await response.json();
      console.log("✅ Subscription plan created:", data);
      return data;
    } catch (error: any) {
      clearTimeout(timeout);

      if (error?.name === "AbortError") {
        throw new Error("Request timed out");
      }

      console.error("Xendit subscription error:", error);
      throw error;
    }
  };

  public renewSubscription = async (params: {
    subscription_id: string;
    amount: number;
    description: string;
    payment_method: "CARD" | "EWALLET";
  }): Promise<any> => {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 15000);

    try {
      console.log("💳 Processing subscription renewal...", params);

      const response = await fetch(
        "/api/neon/payment/xendit/renew-subscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
          signal: ac.signal,
        },
      );

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error("Failed to process renewal");
      }

      const data = await response.json();
      console.log("✅ Renewal processed:", data);
      return data;
    } catch (error: any) {
      clearTimeout(timeout);

      if (error?.name === "AbortError") {
        throw new Error("Request timed out");
      }

      console.error("Xendit renewal error:", error);
      throw error;
    }
  };

  public isInitialized(): boolean {
    return this.initialized;
  }
}

export const xenditService = new XenditService();
