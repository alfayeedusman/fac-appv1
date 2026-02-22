import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  CreditCard,
  Smartphone,
  Building,
  Receipt,
  CheckCircle,
  AlertTriangle,
  Loader2,
  DollarSign,
} from "lucide-react";
import { notificationManager } from "./NotificationModal";
import { supabaseDbClient } from "@/services/supabaseDatabaseService";

interface PaymentMethod {
  id: string;
  label: string;
}

interface SubscriptionSubmissionProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName?: string;
}

export default function SubscriptionSubmission({
  isOpen,
  onClose,
  userEmail,
  userName = "Customer",
}: SubscriptionSubmissionProps) {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    referenceNumber: "",
    accountName: "",
    amount: "",
    paymentDate: "",
  });
  const [userPhone, setUserPhone] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const receiptObjectUrlRef = useRef<string | null>(null);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (receiptObjectUrlRef.current) {
        URL.revokeObjectURL(receiptObjectUrlRef.current);
        receiptObjectUrlRef.current = null;
      }
    };
  }, []);

  // Fetch payment methods from backend
  useEffect(() => {
    if (!isOpen) return;

    const fetchPaymentMethods = async () => {
      setLoadingPaymentMethods(true);
      try {
        const cacheKey = "xendit_methods_cache_v1";
        const cacheTtlMs = 1000 * 60 * 5; // 5 minutes

        // Check cache first
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (
              parsed?.ts &&
              Date.now() - parsed.ts < cacheTtlMs &&
              Array.isArray(parsed.methods)
            ) {
              setPaymentMethods(parsed.methods);
              setLoadingPaymentMethods(false);
              return;
            }
          }
        } catch (e) {
          console.log("Payment methods cache parse error", e);
        }

        // Fetch from API
        const response = await fetch(
          "/api/supabase/payment/xendit/methods"
        );
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.methods)) {
          setPaymentMethods(data.methods);
          // Cache the methods
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ ts: Date.now(), methods: data.methods })
            );
          } catch (e) {
            console.log("Failed to cache payment methods", e);
          }
        } else {
          // Fallback methods if API fails
          const fallbackMethods: PaymentMethod[] = [
            { id: "card", label: "Credit / Debit Card" },
            { id: "gcash", label: "GCash (e-wallet)" },
            { id: "paymaya", label: "PayMaya (e-wallet)" },
            { id: "bank_transfer", label: "Bank Transfer" },
            { id: "pay_at_counter", label: "Pay at Counter (Cash)" },
          ];
          setPaymentMethods(fallbackMethods);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        // Fallback methods
        const fallbackMethods: PaymentMethod[] = [
          { id: "card", label: "Credit / Debit Card" },
          { id: "gcash", label: "GCash (e-wallet)" },
          { id: "paymaya", label: "PayMaya (e-wallet)" },
          { id: "bank_transfer", label: "Bank Transfer" },
          { id: "pay_at_counter", label: "Pay at Counter (Cash)" },
        ];
        setPaymentMethods(fallbackMethods);
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    fetchPaymentMethods();
  }, [isOpen]);

  const packages = [
    {
      id: "classic",
      name: "Classic Silver",
      price: "₱299",
      period: "month",
      features: [
        "2 Classic wash sessions per month",
        "Basic member benefits",
        "Online booking access",
        "Customer support",
      ],
    },
    {
      id: "vip",
      name: "VIP Gold Ultimate",
      price: "₱799",
      period: "month",
      features: [
        "4 Classic + 1 Premium wash sessions per month",
        "Priority booking",
        "Exclusive member benefits",
        "Free vehicle pickup service",
        "Customer priority support",
      ],
      popular: true,
    },
    {
      id: "premium",
      name: "Premium Platinum Elite",
      price: "₱1,299",
      period: "month",
      features: [
        "Unlimited Classic wash sessions",
        "2 Premium detail sessions per month",
        "Premium member exclusive perks",
        "Free monthly vehicle pickup",
        "Dedicated account manager",
        "Priority customer support",
      ],
    },
  ];

  // Helper function to get icon for payment method
  const getPaymentMethodIcon = (methodId: string) => {
    const iconMap: Record<string, { iconType: string; color: string }> = {
      card: { iconType: "card", color: "text-blue-600" },
      gcash: { iconType: "phone", color: "text-blue-500" },
      paymaya: { iconType: "phone", color: "text-red-500" },
      bank_transfer: { iconType: "building", color: "text-purple-600" },
      pay_at_counter: { iconType: "dollar", color: "text-orange-600" },
      offline: { iconType: "dollar", color: "text-orange-600" },
    };
    const config = iconMap[methodId] || { iconType: "card", color: "text-gray-600" };

    // Render appropriate icon based on type
    const iconMap_render = {
      card: <CreditCard className="h-5 w-5" />,
      phone: <Smartphone className="h-5 w-5" />,
      building: <Building className="h-5 w-5" />,
      dollar: <DollarSign className="h-5 w-5" />,
    };

    return {
      icon: iconMap_render[config.iconType as keyof typeof iconMap_render] || <CreditCard className="h-5 w-5" />,
      color: config.color,
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const handleSubmit = async () => {
    // Check required fields based on payment method
    const isOfflinePayment =
      paymentMethod === "pay_at_counter" || paymentMethod === "offline";

    if (!selectedPackage || !paymentMethod) {
      notificationManager.warning(
        "Missing Information",
        "Please select a package and payment method.",
      );
      return;
    }

    // Receipt/proof of payment is required for offline payments
    if (isOfflinePayment && !receiptFile) {
      notificationManager.warning(
        "Missing Information",
        "Please upload a payment receipt for offline payment methods.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedPkg = packages.find((p) => p.id === selectedPackage);
      if (!selectedPkg) return;

      // Extract price from string (e.g., "₱299" -> 299)
      const packagePrice = parseInt(selectedPkg.price.replace(/[^0-9]/g, ""));

      // Create subscription in backend
      const upgradeResult = await supabaseDbClient.createSubscriptionUpgrade({
        userId: `user_${userEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
        email: userEmail,
        packageId: selectedPackage,
        packageName: selectedPkg.name,
        finalPrice: packagePrice,
        paymentMethod: paymentMethod,
        paymentDetails: isOfflinePayment ? paymentDetails : undefined,
      });

      if (!upgradeResult.success) {
        notificationManager.error(
          "Submission Failed",
          upgradeResult.error || "Failed to submit subscription request",
        );
        setIsSubmitting(false);
        return;
      }

      notificationManager.success(
        "Request Submitted! 🎉",
        `Your subscription request has been submitted successfully!\n\nRequest ID: ${upgradeResult.subscription?.id}\nPackage: ${selectedPkg.name}\nAmount: ${selectedPkg.price}\nPayment Method: ${paymentMethods.find((m) => m.id === paymentMethod)?.label || paymentMethod}\n\nYour request is now under review. You'll be notified once it's processed.`,
        { autoClose: 6000 },
      );

      // Reset form and close
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error submitting request:", error);
      notificationManager.error(
        "Submission Failed",
        "Failed to submit subscription request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedPackage("");
    setPaymentMethod("");
    setPaymentDetails({
      referenceNumber: "",
      accountName: "",
      amount: "",
      paymentDate: "",
    });
    setUserPhone("");
    setReceiptFile(null);
  };

  const getSelectedPackage = () => {
    return packages.find((p) => p.id === selectedPackage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Subscribe to Premium Service</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  step >= stepNum
                    ? "bg-fac-orange-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNum}
              </div>
            ))}
          </div>

          {/* Step 1: Package Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Choose Your Package</h3>
              <div className="space-y-4">
                {packages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`cursor-pointer transition-all ${
                      selectedPackage === pkg.id
                        ? "border-fac-orange-500 bg-fac-orange-50 dark:bg-fac-orange-950/50"
                        : "border-border hover:border-fac-orange-300"
                    } ${pkg.popular ? "ring-2 ring-fac-orange-500/30" : ""}`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {pkg.popular && (
                      <div className="relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-fac-orange-500 text-white">
                            MOST POPULAR
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-fac-orange-500">
                            {pkg.price}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            per {pkg.period}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-2">
                        {pkg.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedPackage}
                className="w-full bg-fac-orange-500 hover:bg-fac-orange-600"
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Information</h3>

              {/* Selected Package Summary */}
              {getSelectedPackage() && (
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {getSelectedPackage()!.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Monthly subscription
                        </p>
                      </div>
                      <p className="text-xl font-bold text-fac-orange-500">
                        {getSelectedPackage()!.price}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+63 912 345 6789"
                  className="mt-1"
                />
              </div>

              {/* Payment Method Selection */}
              <div>
                <Label>Select Payment Method</Label>
                {loadingPaymentMethods ? (
                  <div className="flex items-center justify-center py-8 mt-2">
                    <Loader2 className="h-5 w-5 text-fac-orange-500 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Loading payment methods...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {paymentMethods.map((method) => {
                      const methodIcon = getPaymentMethodIcon(method.id);
                      return (
                        <Card
                          key={method.id}
                          className={`cursor-pointer transition-all ${
                            paymentMethod === method.id
                              ? "border-fac-orange-500 bg-fac-orange-50 dark:bg-fac-orange-950/50"
                              : "border-border hover:border-fac-orange-300"
                          }`}
                          onClick={() => setPaymentMethod(method.id)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className={`${methodIcon.color} mb-2 flex justify-center`}>
                              {methodIcon.icon}
                            </div>
                            <p className="text-sm font-medium">{method.label}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="refNumber">Reference Number</Label>
                  <Input
                    id="refNumber"
                    value={paymentDetails.referenceNumber}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        referenceNumber: e.target.value,
                      })
                    }
                    placeholder="Payment reference number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={paymentDetails.accountName}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        accountName: e.target.value,
                      })
                    }
                    placeholder="Name on payment account"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentDetails.paymentDate}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        paymentDate: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!paymentMethod}
                  className="flex-1 bg-fac-orange-500 hover:bg-fac-orange-600"
                >
                  Continue to Receipt
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Receipt Upload (for offline payments) or Confirmation (for online) */}
          {step === 3 && (
            <div className="space-y-4">
              {(paymentMethod === "pay_at_counter" ||
                paymentMethod === "offline") ? (
                <>
                  <h3 className="text-lg font-semibold">
                    Upload Payment Receipt
                  </h3>

                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">
                        Upload Payment Receipt
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a clear photo or screenshot of your payment
                        receipt
                      </p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <Label
                        htmlFor="receipt-upload"
                        className="cursor-pointer"
                      >
                        <Button variant="outline" type="button">
                          Choose File
                        </Button>
                      </Label>
                    </div>
                  </div>

                  {receiptFile && (
                    <Card className="bg-green-50 dark:bg-green-950/30">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">{receiptFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          Important Notice
                        </p>
                        <p className="text-blue-800 dark:text-blue-200">
                          Please ensure your receipt clearly shows the payment
                          amount, reference number, and date. This will help us
                          process your request faster.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">
                    Confirm Your Subscription
                  </h3>

                  {getSelectedPackage() && (
                    <Card className="bg-green-50 dark:bg-green-950/30">
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Package
                          </p>
                          <p className="font-semibold">
                            {getSelectedPackage()!.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Amount
                          </p>
                          <p className="text-xl font-bold text-fac-orange-500">
                            {getSelectedPackage()!.price}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Payment Method
                          </p>
                          <p className="font-semibold">
                            {paymentMethods.find((m) => m.id === paymentMethod)
                              ?.label || paymentMethod}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          Ready to Submit
                        </p>
                        <p className="text-blue-800 dark:text-blue-200">
                          Click submit to process your subscription upgrade
                          request.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    (paymentMethod === "pay_at_counter" ||
                      paymentMethod === "offline"
                      ? !receiptFile
                      : false) || isSubmitting
                  }
                  className="flex-1 bg-fac-orange-500 hover:bg-fac-orange-600"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
