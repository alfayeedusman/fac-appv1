import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Check, CreditCard, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import StickyHeader from "@/components/StickyHeader";

interface PaymentMethod {
  id: string;
  type: "card" | "ewallet";
  provider: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
  createdAt: string;
}

export default function PaymentMethods() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments/methods", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch payment methods");

      const data = await response.json();
      setMethods(data.methods || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const response = await fetch("/api/payments/methods/set-default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ methodId }),
      });

      if (!response.ok) throw new Error("Failed to set default method");

      setMethods(
        methods.map((m) => ({
          ...m,
          isDefault: m.id === methodId,
        }))
      );

      toast({
        title: "Success",
        description: "Default payment method updated",
      });
    } catch (error) {
      console.error("Error setting default:", error);
      toast({
        title: "Error",
        description: "Failed to set default payment method",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (methodId: string) => {
    try {
      setDeleting(true);
      const response = await fetch("/api/payments/methods/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ methodId }),
      });

      if (!response.ok) throw new Error("Failed to delete payment method");

      setMethods(methods.filter((m) => m.id !== methodId));
      setDeleteConfirm(null);
      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting method:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const PaymentMethodCard = ({ method }: { method: PaymentMethod }) => {
    const isCard = method.type === "card";
    const Icon = isCard ? CreditCard : Wallet;

    return (
      <Card className={method.isDefault ? "border-primary/50 bg-primary/5" : ""}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">{method.provider}</h3>
                {method.isDefault && (
                  <Badge className="bg-green-500/20 text-green-700">Default</Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {method.holderName}
              </p>

              <div className="flex items-center justify-between text-sm">
                <p className="font-mono font-semibold">
                  {isCard ? "•••• " : ""}{method.last4}
                </p>
                {isCard && (
                  <p className="text-muted-foreground">
                    {String(method.expiryMonth).padStart(2, "0")}/{method.expiryYear}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              {!method.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetDefault(method.id)}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Set Default
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteConfirm(method.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <StickyHeader title="Payment Methods" />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Add Button */}
        <Button onClick={() => navigate("/payments/add")} className="w-full" size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Payment Methods List */}
        {!loading && methods.length > 0 && (
          <div className="space-y-4">
            {methods.map((method) => (
              <PaymentMethodCard key={method.id} method={method} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && methods.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add a payment method to make checkouts easier
              </p>
              <Button onClick={() => navigate("/payments/add")}>
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            disabled={deleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
