import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";
import { log, warn } from "@/utils/logger";

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
    const cacheTtlMs = 1000 * 60 * 5; // 5 minutes

    const load = async () => {
      setLoading(true);
      try {
        // Try cache first
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
          // ignore cache parse errors
          log("xendit cache parse error", e);
        }

        const resp = await fetch(`/api/neon/payment/xendit/methods`);
        const json = await resp.json();
        if (resp.ok && json.success) {
          setMethods(json.methods || []);
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ ts: Date.now(), methods: json.methods || [] }),
            );
          } catch (e) {
            // ignore storage errors
            log("Failed to cache xendit methods", e);
          }
        } else {
          warn("Failed to load payment methods", json);
          toast({
            title: "Warning",
            description: "Could not load payment methods. Showing defaults.",
          });
          setMethods([
            { id: "card", label: "Credit / Debit Card" },
            { id: "gcash", label: "GCash (e-wallet)" },
            { id: "paymaya", label: "PayMaya (e-wallet)" },
            { id: "bank_transfer", label: "Bank Transfer" },
          ]);
        }
      } catch (err) {
        warn("Error fetching payment methods", err);
        toast({
          title: "Warning",
          description: "Could not fetch payment methods.",
        });
        setMethods([
          { id: "card", label: "Credit / Debit Card" },
          { id: "gcash", label: "GCash (e-wallet)" },
          { id: "paymaya", label: "PayMaya (e-wallet)" },
          { id: "bank_transfer", label: "Bank Transfer" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isOfflineMethod = (method: any) => {
    if (!method) return false;
    const offlineIds = [
      "offline",
      "bank_transfer",
      "cash",
      "pay_at_counter",
      "onsite",
    ];
    if (offlineIds.includes(method.id)) return true;
    const label = (method.label || "").toLowerCase();
    return /bank|cash|counter|on-?site/.test(label);
  };

  const choose = async (methodId: string) => {
    const method = methods.find((m) => m.id === methodId) || {
      id: methodId,
      label: methodId,
    };

    setSelected(methodId);
    updateBookingData("paymentMethodDetail", methodId);
  };

  return (
    <div className="mt-4">
      <p className="text-sm mb-2 font-semibold">Choose Payment Channel</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {loading && <div>Loading...</div>}
        {methods.map((m) => (
          <Button
            key={m.id}
            onClick={() => choose(m.id)}
            variant={selected === m.id ? "default" : "outline"}
            className="text-sm h-10"
            aria-pressed={selected === m.id}
          >
            <div className="flex items-center justify-center gap-2">
              {selected === m.id && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span>{m.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
