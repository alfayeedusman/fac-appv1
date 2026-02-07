import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import "@/styles/pos-animations.css";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  Search,
  Package,
  X,
  Users,
  Star,
  Clock,
  Filter,
  Grid3x3,
  ShoppingBag,
  Sparkles,
  User,
  ChevronDown,
  Heart,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts, Product } from "@/utils/inventoryData";
import {
  POSItem,
  createPOSTransaction,
  getPOSCategories,
} from "@/utils/posData";
import { notificationManager } from "@/components/NotificationModal";
import { SimplePaymentModal } from "@/components/SimplePaymentModal";
import {
  getCarWashServices,
  vehicleTypes,
  motorcycleSubtypes,
  calculateServicePrice,
  CarWashService,
} from "@/utils/carWashServices";
import { Droplet, TrendingUp, AlertCircle } from "lucide-react";
import {
  saveTransaction as saveTransactionAPI,
  saveExpense as saveExpenseAPI,
  deleteExpense as deleteExpenseAPI,
  getDailySalesReport as getDailyReportAPI,
  getCurrentPOSSession,
} from "@/utils/posApiService";
import { receiptPrintService } from "@/services/receiptPrintService";
import POSOpeningModal from "@/components/POSOpeningModal";
import POSClosingModal from "@/components/POSClosingModal";
import { CustomerSearchModal } from "@/components/CustomerSearchModal";
import { Customer } from "@/utils/customerService";
import realtimeService from "@/services/realtimeService";

// Create a proper cart item interface that matches what we need
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
}

export default function POSKiosk() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<{uniqueId: string; name: string}>({
    uniqueId: "",
    name: "",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    method: "cash" as const,
    amountPaid: "",
    referenceNumber: "",
  });
  const [showCarWashModal, setShowCarWashModal] = useState(false);
  const [carWashServices, setCarWashServices] = useState<CarWashService[]>([]);
  const [selectedWashService, setSelectedWashService] = useState<CarWashService | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("");
  const [selectedMotorcycleSubtype, setSelectedMotorcycleSubtype] = useState<string>("");
  const [calculatedWashPrice, setCalculatedWashPrice] = useState<number>(0);
  const [todaysSales, setTodaysSales] = useState(0);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "supplies",
    description: "",
    amount: "",
    paymentMethod: "cash",
    notes: "",
  });
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const categories = getPOSCategories();
  const cashierName = localStorage.getItem("userEmail") || "Cashier";
  const cashierId = localStorage.getItem("userEmail") || "unknown";
  const branchId = "default";

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Check for existing POS session
        const session = await getCurrentPOSSession(cashierId);
        if (session && session.status === "open") {
          setCurrentSessionId(session.id);
          setOpeningBalance(parseFloat(session.openingBalance?.toString() || "0"));
          setSessionLoaded(true);
        } else {
          // No active session, show opening modal
          setShowOpeningModal(true);
        }

        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        const productsData = await getProducts();
        setProducts(productsData || []);
        const washServices = getCarWashServices().filter((s) => s.isActive);
        setCarWashServices(washServices);
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts([]);
        setShowOpeningModal(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Load today's sales and expenses
  const loadTodaysSalesAndExpenses = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      console.log(`📊 Fetching sales report for ${today}...`);
      const report = await getDailyReportAPI(today);
      console.log(`✅ Sales report loaded:`, report);
      console.log(`   Total Sales: ₱${report.totalSales}`);
      console.log(`   Total Expenses: ₱${report.totalExpenses}`);
      console.log(`   Net Income: ₱${report.totalSales - report.totalExpenses}`);
      console.log(`   Transaction Count: ${report.transactionCount}`);

      setTodaysSales(report.totalSales || 0);
      setTodayExpenses(report.totalExpenses || 0);

      // Log the state update
      console.log(`📈 Sales state updated:`, {
        todaysSales: report.totalSales || 0,
        todayExpenses: report.totalExpenses || 0
      });
    } catch (error) {
      console.error("Error loading sales data:", error);
      // Keep existing values on error
    }
  };

  useEffect(() => {
    // Load initial sales data
    loadTodaysSalesAndExpenses();

    // Set up Pusher real-time subscriptions for live updates
    console.log("🔌 Setting up Pusher subscriptions for POS Kiosk...");

    // Subscribe to POS transaction events (real-time sales)
    const unsubscribePOSTransaction = realtimeService.subscribe("pos.transaction.created", (data: any) => {
      console.log("📈 New POS transaction via Pusher:", data);
      console.log(`   Transaction #${data.transactionNumber}, Amount: ₱${data.totalAmount}`);
      // Refresh sales data when new transaction is created
      console.log("🔄 Refreshing sales data...");
      loadTodaysSalesAndExpenses();
    });

    // Subscribe to booking creation events (also tracked as sales)
    const unsubscribeBooking = realtimeService.subscribe("booking.created", (data: any) => {
      console.log("📅 New booking via Pusher:", data);
      // Refresh sales data when new booking is created
      loadTodaysSalesAndExpenses();
    });

    // Subscribe to expense creation events (real-time expenses)
    const unsubscribeExpense = realtimeService.subscribe("pos.expense.created", (data: any) => {
      console.log("💸 New POS expense via Pusher:", data);
      // Refresh sales and expense data when new expense is created
      loadTodaysSalesAndExpenses();
    });

    // Subscribe to inventory updates
    const unsubscribeInventory = realtimeService.subscribe("inventory.updated", (data: any) => {
      console.log("📦 Inventory updated via Pusher:", data);
    });

    return () => {
      // Unsubscribe from all Pusher events when component unmounts
      unsubscribePOSTransaction();
      unsubscribeBooking();
      unsubscribeExpense();
      unsubscribeInventory();
    };
  }, []);

  useEffect(() => {
    try {
      let filtered = products || [];

      if (selectedCategory !== "all") {
        filtered = filtered.filter((product) => product?.category === selectedCategory);
      }

      if (searchQuery) {
        filtered = filtered.filter(
          (product) =>
            product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product?.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredProducts(filtered);
    } catch (error) {
      console.error("Error filtering products:", error);
      setFilteredProducts([]);
    }
  }, [products, selectedCategory, searchQuery]);

  const handleSelectWashService = (service: CarWashService) => {
    setSelectedWashService(service);
    setSelectedVehicleType("");
    setSelectedMotorcycleSubtype("");
    setCalculatedWashPrice(0);
  };

  const handleVehicleTypeSelect = (vehicleTypeId: string) => {
    setSelectedVehicleType(vehicleTypeId);
    const isMotorcycle = vehicleTypeId === "motorcycle";
    if (!isMotorcycle) {
      setSelectedMotorcycleSubtype("");
    }
    if (selectedWashService) {
      const price = calculateServicePrice(
        selectedWashService.basePrice,
        vehicleTypeId,
        isMotorcycle ? selectedMotorcycleSubtype : undefined
      );
      setCalculatedWashPrice(price);
    }
  };

  const handleMotorcycleSubtypeSelect = (subtypeId: string) => {
    setSelectedMotorcycleSubtype(subtypeId);
    if (selectedWashService && selectedVehicleType) {
      const price = calculateServicePrice(
        selectedWashService.basePrice,
        selectedVehicleType,
        subtypeId
      );
      setCalculatedWashPrice(price);
    }
  };

  const handleAddWashServiceToCart = () => {
    if (!selectedWashService || !selectedVehicleType) {
      notificationManager.error(
        "Incomplete Selection",
        "Please select a wash service and vehicle type"
      );
      return;
    }

    const vehicleType = vehicleTypes.find((vt) => vt.id === selectedVehicleType);
    const vehicleName = vehicleType?.name || "Vehicle";
    const subtypeName =
      selectedVehicleType === "motorcycle"
        ? ` - ${motorcycleSubtypes.find((st) => st.id === selectedMotorcycleSubtype)?.name}`
        : "";

    const cartItem = {
      id: `wash_${selectedWashService.id}_${selectedVehicleType}_${selectedMotorcycleSubtype || "standard"}`,
      name: `${selectedWashService.name} (${vehicleName}${subtypeName})`,
      price: calculatedWashPrice,
      quantity: 1,
      sku: `WASH-${selectedWashService.id}-${selectedVehicleType}`,
    };

    const existingItem = cartItems.find((item) => item.id === cartItem.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, cartItem]);
    }

    notificationManager.success(
      "Added to Cart",
      `${selectedWashService.name} for ${vehicleName} added to cart`
    );

    setShowCarWashModal(false);
    setSelectedWashService(null);
    setSelectedVehicleType("");
    setSelectedMotorcycleSubtype("");
    setCalculatedWashPrice(0);
  };

  const addToCart = async (product: Product) => {
    try {
      // Check if POS session is opened
      if (!currentSessionId) {
        notificationManager.error(
          "POS Not Opened",
          "You must open POS first before adding items to cart. The opening modal should appear automatically."
        );
        setShowOpeningModal(true);
        return;
      }

      if (!product || !product.id) {
        console.error("Invalid product:", product);
        return;
      }

      setAddingToCart(product.id);
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const existingItem = cartItems.find((item) => item.id === product.id);
      if (existingItem) {
        setCartItems(
          cartItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setCartItems([
          ...cartItems,
          {
            id: product.id,
            name: product.name || "",
            price: product.unitPrice || 0,
            quantity: 1,
            sku: product.sku || "",
          },
        ]);
      }
      // Silent notification - no popup to slow down workflow
      console.log(`✅ ${product.name} added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      notificationManager.error(
        "Error",
        "Failed to add item to cart"
      );
    } finally {
      setAddingToCart(null);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    try {
      if (newQuantity === 0) {
        removeFromCart(id);
        return;
      }
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeFromCart = (id: string) => {
    try {
      setCartItems(cartItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const clearCart = () => {
    try {
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  const change = paymentInfo.method === "cash"
    ? Math.max(0, parseFloat(paymentInfo.amountPaid || "0") - total)
    : 0;

  const handleCustomerSelected = (customer: Customer) => {
    console.log(`👤 Customer selected:`, customer);
    setCustomerInfo({
      uniqueId: customer.id,
      name: customer.name,
    });
    setShowCustomerSearch(false);
  };

  const handlePayment = async () => {
    try {
      // Check if POS session is opened
      if (!currentSessionId) {
        notificationManager.error(
          "POS Not Opened",
          "You must open POS before processing payments. Please open POS first."
        );
        setShowOpeningModal(true);
        return;
      }

      setIsProcessingPayment(true);

      if (cartItems.length === 0) {
        notificationManager.error(
          "Empty Cart",
          "Cart is empty"
        );
        return;
      }

      if (!customerInfo.uniqueId.trim()) {
        notificationManager.error(
          "Missing Info",
          "Customer ID is required"
        );
        return;
      }

      if (paymentInfo.method === "cash") {
        const amountPaid = parseFloat(paymentInfo.amountPaid);
        if (isNaN(amountPaid) || amountPaid < total) {
          notificationManager.error(
            "Insufficient Payment",
            `Amount paid must be at least ₱${total.toFixed(2)}`
          );
          return;
        }
      }

      if ((paymentInfo.method === "gcash" || paymentInfo.method === "card") &&
          !paymentInfo.referenceNumber.trim()) {
        notificationManager.error(
          "Missing Info",
          "Reference number is required"
        );
        return;
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Convert cart items to POS items
      const posItems: POSItem[] = cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        sku: item.sku,
        unitPrice: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        discount: 0
      }));

      const transaction = createPOSTransaction(
        "cashier_001", // cashier ID
        cashierName,
        posItems,
        {
          name: customerInfo.name,
          phone: customerInfo.uniqueId
        },
        {
          method: paymentInfo.method,
          amountPaid: paymentInfo.method === "cash" ? parseFloat(paymentInfo.amountPaid) : total * 1.12,
          referenceNumber: paymentInfo.referenceNumber
        }
      );

      // Save transaction to database
      const transactionNumber = `TXN-${Date.now()}`;
      console.log(`💾 Saving transaction to database...`);
      console.log(`   Transaction #${transactionNumber}`);
      console.log(`   Amount: ₱${total.toFixed(2)}`);
      console.log(`   Items: ${cartItems.length}`);

      const transactionResult = await saveTransactionAPI({
        transactionNumber,
        customerInfo: {
          id: customerInfo.uniqueId,
          name: customerInfo.name,
        },
        items: cartItems,
        subtotal: total,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: total,
        paymentMethod: paymentInfo.method,
        paymentReference: paymentInfo.referenceNumber,
        amountPaid: paymentInfo.method === "cash" ? parseFloat(paymentInfo.amountPaid) : total,
        changeAmount: change,
        cashierInfo: {
          id: cashierId,
          name: cashierName,
        },
        branchId,
        posSessionId: currentSessionId, // Link transaction to the current POS session
      });

      console.log(`✅ Transaction saved successfully:`, transactionResult);

      // Immediately refresh sales data to show the transaction right away
      console.log("📊 Immediately refreshing sales data after transaction...");
      await loadTodaysSalesAndExpenses();

      // Handle receipt printing based on settings
      try {
        const receiptData = {
          transactionNumber,
          date: new Date(),
          items: cartItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
          subtotal: total,
          taxAmount: 0,
          discountAmount: 0,
          totalAmount: total,
          paymentMethod: paymentInfo.method,
          amountPaid: paymentInfo.method === "cash" ? parseFloat(paymentInfo.amountPaid) : total,
          changeAmount: change,
          customerName: customerInfo.name,
          cashierName: cashierName,
        };

        // Get printing settings from service
        const printSettings = receiptPrintService.getSettings();

        // Print receipt based on mode
        if (printSettings.printingMode === "auto") {
          // Auto-print directly without dialog
          await receiptPrintService.printReceipt(receiptData, printSettings);
          console.log("✓ Receipt auto-printed successfully");
        } else {
          // Manual print mode - notify user to print
          console.log("Receipt ready - user can print manually if desired");
          // Optionally store receipt for manual printing later
        }
      } catch (printError) {
        console.warn("Receipt printing issue (transaction still successful):", printError);
        // Don't stop the transaction if printing fails
      }

      notificationManager.success(
        "Success",
        "Payment processed successfully! Receipt printing..."
      );

      // Reset form
      clearCart();
      setCustomerInfo({ uniqueId: "", name: "" });
      setPaymentInfo({
        method: "cash",
        amountPaid: "",
        referenceNumber: "",
      });
      setShowPaymentModal(false);

      // Sales data will be updated automatically via Pusher for real-time updates
      console.log("✅ Payment processed - Pusher will update sales data automatically");
    } catch (error) {
      console.error("Payment error:", error);
      notificationManager.error(
        "Payment Failed",
        "Payment failed. Please try again."
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 font-display">
      {/* POS Status Banner */}
      {!currentSessionId && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 animate-pulse" />
              <div>
                <h3 className="font-bold text-red-900">POS Not Opened</h3>
                <p className="text-sm text-red-700">You must open a POS session before using this kiosk. Opening balance is required (zero is acceptable).</p>
              </div>
            </div>
            <Button
              onClick={() => setShowOpeningModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap"
            >
              Open POS Now
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="glass rounded-2xl shadow-xl border border-white/50 p-6 mb-8 hover-lift">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl shadow-lg">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-slate-800 to-gray-700 bg-clip-text text-transparent text-shadow-sm animate-gradient">
                  POS Kiosk
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">{cashierName}</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-600 font-medium">Online</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 px-4 py-2 rounded-xl">
                <div className="hidden sm:flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-orange-600 animate-pulse-gentle" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Sales: ₱{todaysSales.toFixed(2)}</span>
                </div>
                {todayExpenses > 0 && (
                  <>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="hidden sm:flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-600">Expenses: ₱{todayExpenses.toFixed(2)}</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="hidden sm:flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">Net: ₱{(todaysSales - todayExpenses).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
              <Button
                onClick={() => setShowExpenseModal(true)}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all duration-200 px-6"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
              <Button
                onClick={() => {
                  if (!currentSessionId) {
                    notificationManager.error(
                      "POS Not Opened",
                      "You must open POS first before adding car wash services"
                    );
                    setShowOpeningModal(true);
                    return;
                  }
                  setShowCarWashModal(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 px-6"
              >
                <Droplet className="h-4 w-4 mr-2" />
                Car Wash
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (!currentSessionId) {
                    notificationManager.error(
                      "Error",
                      "No active POS session. Please open a session first."
                    );
                    return;
                  }
                  setShowClosingModal(true);
                }}
                disabled={!currentSessionId}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!currentSessionId ? "No active POS session" : "Close the current POS session"}
              >
                <X className="h-4 w-4 mr-2" />
                Close & Exit
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Products Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl glass hover-lift">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl font-bold text-shadow-sm">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg mr-3">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    Products
                    <Badge variant="secondary" className="ml-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 font-semibold">
                      {filteredProducts.length} items
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      <Grid3x3 className="h-4 w-4 mr-1" />
                      Grid
                    </Button>
                  </div>
                </div>

                {/* Enhanced Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search products, SKU, or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-3 border-0 bg-gray-50 focus:bg-white transition-colors duration-200 rounded-xl text-base"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="pl-10 pr-8 py-3 border-0 bg-gray-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 appearance-none cursor-pointer min-w-48"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className={`pt-2 transition-opacity duration-300 ${!currentSessionId ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
                        <div className="w-full h-32 bg-gray-200 rounded-xl mb-4"></div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          <div className="flex justify-between items-center pt-2">
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                            <div className="h-8 bg-gray-200 rounded-xl w-16"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="group bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden"
                        onClick={() => addToCart(product)}
                      >
                        {/* Product Image Placeholder */}
                        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                          <Package className="h-12 w-12 text-gray-400" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {/* Stock indicator */}
                          <div className="absolute top-2 right-2">
                            <div className={`w-3 h-3 rounded-full ${product.currentStock > product.minStockLevel ? 'bg-green-500' : product.currentStock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-orange-600 transition-colors duration-200">
                              {product.name || "Unnamed Product"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {product.description || "No description available"}
                            </p>
                          </div>

                          {/* SKU and Stock */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-mono">
                              {product.sku}
                            </span>
                            <span className={`font-medium ${product.currentStock > product.minStockLevel ? 'text-green-600' : product.currentStock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {product.currentStock} in stock
                            </span>
                          </div>

                          {/* Price and Action */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold text-orange-600">
                                ₱{(product.unitPrice || 0).toFixed(2)}
                              </span>
                              {product.costPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₱{product.costPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              disabled={addingToCart === product.id || product.currentStock === 0}
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {addingToCart === product.id ? (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                  Adding...
                                </div>
                              ) : product.currentStock === 0 ? (
                                <span className="text-xs">Out of Stock</span>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">No products found</h3>
                      <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                    </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Cart Section */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl glass sticky top-4 hover-lift">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg mr-3">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-shadow-sm">Shopping Cart</span>
                  </div>
                  <Badge variant="secondary" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-100 px-3 py-1 font-semibold">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className={`space-y-6 transition-opacity duration-300 ${!currentSessionId ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative">
                      <ShoppingCart className="h-20 w-20 text-gray-200 mx-auto mb-4" />
                      <div className="absolute -top-2 -right-8">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2 text-shadow-sm">Your cart is empty</h3>
                    <p className="text-gray-400 text-sm">{!currentSessionId ? 'Open POS first before adding products' : 'Add some products to get started'}</p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {cartItems.map((item, index) => (
                        <div key={item.id} className="group bg-gradient-to-r from-white to-gray-50/50 border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start space-x-3">
                            {/* Item Image Placeholder */}
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">{item.name}</h4>
                              <p className="text-orange-600 font-bold text-lg mt-1">₱{(item.price || 0).toFixed(2)}</p>
                              <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                            </div>

                            {/* Remove Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 p-0 rounded-lg border-gray-200 hover:bg-gray-50"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <div className="w-12 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-semibold">{item.quantity}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 p-0 rounded-lg border-gray-200 hover:bg-gray-50"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">
                                ₱{((item.price || 0) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-6" />

                    {/* Cart Summary */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-gray-50 via-blue-50/30 to-indigo-50/20 border border-gray-100 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                          <span className="font-semibold">₱{total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Tax (12%)</span>
                          <span className="font-semibold">₱{(total * 0.12).toFixed(2)}</span>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-black text-gray-900 text-shadow-sm">Total:</span>
                          <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent text-shadow animate-gradient">₱{(total * 1.12).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 rounded-xl py-3"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Cart
                      </Button>

                      {!customerInfo.uniqueId && (
                        <Button
                          variant="outline"
                          onClick={() => setShowCustomerSearch(true)}
                          className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-xl py-3"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Select Customer
                        </Button>
                      )}

                      <Button
                        onClick={() => setShowPaymentModal(true)}
                        disabled={isProcessingPayment}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl text-lg disabled:opacity-50"
                        size="lg"
                      >
                        {isProcessingPayment ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5 mr-2" />
                            Process Payment
                            <div className="ml-auto bg-white/20 px-2 py-1 rounded-lg text-sm">
                              ₱{(total * 1.12).toFixed(2)}
                            </div>
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <SimplePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        customerInfo={customerInfo}
        setCustomerInfo={setCustomerInfo}
        paymentInfo={paymentInfo}
        setPaymentInfo={setPaymentInfo}
        total={total}
        change={change}
        onPayment={handlePayment}
        isProcessing={isProcessingPayment}
        onOpenCustomerSearch={() => {
          setShowPaymentModal(false);
          setShowCustomerSearch(true);
        }}
      />

      {/* Customer Search Modal */}
      <CustomerSearchModal
        isOpen={showCustomerSearch}
        onClose={() => setShowCustomerSearch(false)}
        onSelectCustomer={handleCustomerSelected}
      />

      {/* Car Wash Service Modal */}
      {showCarWashModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 w-full max-w-3xl my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
                  <Droplet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Car Wash Services</h2>
                  <p className="text-sm text-gray-600 mt-1">Choose a service and vehicle type</p>
                </div>
              </div>
              <button
                onClick={() => setShowCarWashModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <Separator className="mb-6" />

            {!selectedWashService ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <p className="text-sm font-medium text-gray-600 mb-4">Select a wash service:</p>
                {carWashServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleSelectWashService(service)}
                    className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{service.duration}</span>
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{service.category}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <span key={idx} className="text-xs text-gray-600">• {feature}</span>
                          ))}</div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-orange-600">₱{service.basePrice}</p>
                        <p className="text-xs text-gray-600 mt-1">Base price</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedWashService.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{selectedWashService.description}</p>
                    </div>
                    <button
                      onClick={() => handleSelectWashService(selectedWashService)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-3">Select Vehicle Type:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {vehicleTypes.map((vt) => {
                      const isSelected = selectedVehicleType === vt.id;
                      return (
                        <button
                          key={vt.id}
                          onClick={() => handleVehicleTypeSelect(vt.id)}
                          className={isSelected ? "p-3 rounded-xl border-2 border-blue-500 bg-blue-50 text-blue-700 transition-all duration-200 font-medium text-sm" : "p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-gray-700 transition-all duration-200 font-medium text-sm"}
                        >
                          {vt.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedVehicleType === "motorcycle" && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-3">Select Motorcycle Type:</p>
                    <div className="space-y-2">
                      {motorcycleSubtypes.map((st) => {
                        const isSelected = selectedMotorcycleSubtype === st.id;
                        return (
                          <button
                            key={st.id}
                            onClick={() => handleMotorcycleSubtypeSelect(st.id)}
                            className={isSelected ? "w-full p-3 rounded-xl border-2 border-blue-500 bg-blue-50 text-blue-700 transition-all duration-200 font-medium text-left text-sm" : "w-full p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-gray-700 transition-all duration-200 font-medium text-left text-sm"}
                          >
                            {st.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedVehicleType && (!selectedVehicleType.includes("motorcycle") || selectedMotorcycleSubtype) && (
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Final Price</p>
                        <p className="text-sm font-medium text-gray-700 mt-1">
                          {vehicleTypes.find((vt) => vt.id === selectedVehicleType)?.name}
                          {selectedVehicleType === "motorcycle" && selectedMotorcycleSubtype ? ` - ${motorcycleSubtypes.find((st) => st.id === selectedMotorcycleSubtype)?.name}` : ""}
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-orange-600">₱{calculatedWashPrice.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setSelectedWashService(null);
                      setSelectedVehicleType("");
                      setSelectedMotorcycleSubtype("");
                      setCalculatedWashPrice(0);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAddWashServiceToCart}
                    disabled={!selectedVehicleType || (selectedVehicleType === "motorcycle" && !selectedMotorcycleSubtype)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2 inline" />
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
                  <p className="text-sm text-gray-600 mt-1">Record a business expense</p>
                </div>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="supplies">Supplies</option>
                  <option value="utilities">Utilities</option>
                  <option value="rent">Rent</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="fuel">Fuel</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Input
                  placeholder="e.g., Car wash detergent, Oil change..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₱)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={expenseForm.paymentMethod}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit Card</option>
                  <option value="gcash">GCash</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <Input
                  placeholder="Additional notes..."
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!expenseForm.description.trim() || !expenseForm.amount) {
                      notificationManager.error(
                        "Missing Info",
                        "Please fill in all required fields"
                      );
                      return;
                    }

                    (async () => {
                      try {
                        await saveExpenseAPI({
                          posSessionId: currentSessionId || "temp",
                          category: expenseForm.category,
                          description: expenseForm.description,
                          amount: parseFloat(expenseForm.amount),
                          paymentMethod: expenseForm.paymentMethod,
                          notes: expenseForm.notes,
                          recordedByInfo: {
                            id: cashierId,
                            name: cashierName,
                          },
                        });

                        notificationManager.success(
                          "Success",
                          `Expense of ₱${parseFloat(expenseForm.amount).toFixed(2)} recorded`
                        );

                        // Reset form
                        setExpenseForm({
                          category: "supplies",
                          description: "",
                          amount: "",
                          paymentMethod: "cash",
                          notes: "",
                        });
                        setShowExpenseModal(false);

                        // Sales data will be updated automatically via Pusher
                        console.log("✅ Expense saved - Pusher will update sales data automatically");
                      } catch (error) {
                        console.error("Error saving expense:", error);
                        notificationManager.error(
                          "Error",
                          "Failed to save expense. Please try again."
                        );
                      }
                    })();
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 font-medium transition-all duration-200"
                >
                  <AlertCircle className="h-4 w-4 mr-2 inline" />
                  Save Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POS Opening Modal */}
      <POSOpeningModal
        isOpen={showOpeningModal}
        onClose={() => setShowOpeningModal(false)}
        onSessionOpened={(sessionId) => {
          setCurrentSessionId(sessionId);
          setSessionLoaded(true);
          setShowOpeningModal(false);
          // Refresh sales data after opening session
          loadTodaysSalesAndExpenses();
        }}
        cashierInfo={{ id: cashierId, name: cashierName }}
        branchId={branchId}
      />

      {/* POS Closing Modal */}
      <POSClosingModal
        isOpen={showClosingModal}
        onClose={() => setShowClosingModal(false)}
        onSessionClosed={() => {
          // Refresh sales data before navigating
          loadTodaysSalesAndExpenses().then(() => {
            setCurrentSessionId(null);
            setSessionLoaded(false);
            // Delay navigation slightly to ensure data is updated
            setTimeout(() => {
              navigate("/admin-dashboard");
            }, 500);
          });
        }}
        sessionId={currentSessionId || ""}
        openingBalance={openingBalance}
      />
    </div>
  );
}
