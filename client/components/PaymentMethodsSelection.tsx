import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  CreditCard,
  Smartphone,
  Building2,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { log, warn } from "@/utils/logger";

const PAYMENT_METHOD_ICONS: Record<
  string,
  { icon: string; bg: string; title: string }
> = {
  card: {
    icon: "💳",
    bg: "from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-950/50",
    title: "Credit/Debit Card",
  },
  gcash: {
    icon: "📱",
    bg: "from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-950/50",
    title: "GCash",
  },
  paymaya: {
    icon: "💳",
    bg: "from-red-100 to-red-50 dark:from-red-900/50 dark:to-red-950/50",
    title: "PayMaya",
  },
  bank_transfer: {
    icon: "🏦",
    bg: "from-purple-100 to-purple-50 dark:from-purple-900/50 dark:to-purple-950/50",
    title: "Bank Transfer",
  },
  offline: {
    icon: "💰",
    bg: "from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-950/50",
    title: "Cash Payment",
  },
};

export default function PaymentMethodsSelection({
  bookingData,
  updateBookingData,
}: any) {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(
    bookingData.paymentMethodDetail || null,
  );

  useEffect(() => {
    const cacheKey = "xendit_methods_cache_v1";
    const cacheTtlMs = 1000 * 60 * 5;

    const load = async () => {
      setLoading(true);
      try {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (
              parsed?.ts &&
              Date.now() - parsed.ts < cacheTtlMs &&
              Array.isArray(parsed.methods)
            ) {
              setMethods(parsed.methods);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          log("xendit cache parse error", e);
        }

        const resp = await fetch(`/api/supabase/payment/xendit/methods`);
        const json = await resp.json();
        if (resp.ok && json.success) {
          setMethods(json.methods || []);
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ ts: Date.now(), methods: json.methods || [] }),
            );
          } catch (e) {
            log("Failed to cache xendit methods", e);
          }
        } else {
          warn("Failed to load payment methods", json);
          setMethods([
            { id: "card", label: "Credit / Debit Card" },
            { id: "gcash", label: "GCash" },
            { id: "paymaya", label: "PayMaya" },
            { id: "bank_transfer", label: "Bank Transfer" },
          ]);
        }
      } catch (err) {
        warn("Error fetching payment methods", err);
        setMethods([
          { id: "card", label: "Credit / Debit Card" },
          { id: "gcash", label: "GCash" },
          { id: "paymaya", label: "PayMaya" },
          { id: "bank_transfer", label: "Bank Transfer" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const choose = async (methodId: string) => {
    setSelected(methodId);
    updateBookingData("paymentMethodDetail", methodId);
  };

  const getMethodConfig = (methodId: string) => {
    return (
      PAYMENT_METHOD_ICONS[methodId] || {
        icon: "💳",
        bg: "from-gray-100 to-gray-50 dark:from-gray-900/50 dark:to-gray-950/50",
        title: methodId.charAt(0).toUpperCase() + methodId.slice(1),
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 text-fac-orange-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-600">
          Loading payment methods...
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Select Payment Method
        </label>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Choose how you'd like to pay
        </p>
      </div>

      {/* Payment methods grid - Professional card layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {methods.map((method) => {
          const isSelected = selected === method.id;
          const config = getMethodConfig(method.id);

          return (
            <button
              key={method.id}
              onClick={() => choose(method.id)}
              className={`relative group p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "border-fac-orange-500 shadow-lg ring-2 ring-fac-orange-200 dark:ring-fac-orange-700"
                  : "border-gray-200 dark:border-gray-700 hover:border-fac-orange-300 hover:shadow-md dark:hover:border-fac-orange-600"
              }`}
              style={{
                background: isSelected
                  ? "linear-gradient(135deg, rgba(249, 115, 22, 0.05), rgba(249, 115, 22, 0.02))"
                  : "white",
              }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-fac-orange-500 rounded-full p-1 shadow-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Icon */}
              <div
                className={`text-3xl mb-2 inline-block rounded-lg p-2 bg-gradient-to-br ${config.bg}`}
              >
                {config.icon}
              </div>

              {/* Method name */}
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-left leading-tight">
                {method.label || config.title}
              </p>
            </button>
          );
        })}
      </div>

      {methods.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No payment methods available</p>
        </div>
      )}
    </div>
  );
}
