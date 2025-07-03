import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  Search,
  Package,
  User,
  Calculator,
  Receipt,
  Scan,
  X,
  Maximize,
  Users,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts, Product } from "@/utils/inventoryData";
import {
  POSItem,
  createPOSTransaction,
  getPOSCategories,
} from "@/utils/posData";
import { notificationManager } from "@/components/NotificationModal";

export default function POSKiosk() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<POSItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    uniqueId: "",
    name: "",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    method: "cash" as const,
    amountPaid: "",
    referenceNumber: "",
  });

  const categories = getPOSCategories();
  const cashierName = localStorage.getItem("userName") || "Cashier";
  const cashierId = localStorage.getItem("userEmail") || "cashier@fac.com";

  // Keyboard shortcut to exit kiosk mode
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey && event.shiftKey && event.key === "Q") {
      setShowExitModal(true);
    }
  }, []);

  useEffect(() => {
    // Enter fullscreen mode
    document.documentElement.requestFullscreen?.();

    // Add keyboard event listener
    document.addEventListener("keydown", handleKeyPress);

    // Load products
    const allProducts = getProducts().filter((p) => p.status === "active");
    setProducts(allProducts);
    setFilteredProducts(allProducts);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      // Exit fullscreen when component unmounts
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    };
  }, [handleKeyPress]);

  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode?.includes(searchQuery),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const exitKioskMode = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
    navigate("/admin-dashboard");
  };

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(
      (item) => item.productId === product.id,
    );

    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        notificationManager.error(
          "Insufficient Stock",
          `Only ${product.currentStock} units available`,
        );
        return;
      }
      updateCartItemQuantity(product.id, existingItem.quantity + 1);
    } else {
      if (product.currentStock === 0) {
        notificationManager.error(
          "Out of Stock",
          "This product is unavailable",
        );
        return;
      }

      const newItem: POSItem = {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity: 1,
        subtotal: product.unitPrice,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQuantity > product.currentStock) {
      notificationManager.error(
        "Insufficient Stock",
        `Only ${product.currentStock} units available`,
      );
      return;
    }

    setCartItems((items) =>
      items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: item.unitPrice * newQuantity,
            }
          : item,
      ),
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((items) =>
      items.filter((item) => item.productId !== productId),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.12; // 12% VAT
    return {
      subtotal,
      tax,
      total: subtotal + tax,
    };
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      notificationManager.error("Empty Cart", "Please add items to cart");
      return;
    }

    if (paymentInfo.method === "cash" && !paymentInfo.amountPaid) {
      notificationManager.error(
        "Amount Required",
        "Please enter amount paid for cash payment",
      );
      return;
    }

    const amountPaid = parseFloat(paymentInfo.amountPaid);
    const total = getCartTotal().total;

    if (paymentInfo.method === "cash" && amountPaid < total) {
      notificationManager.error(
        "Insufficient Payment",
        "Amount paid is less than total",
      );
      return;
    }

    try {
      const transaction = createPOSTransaction(
        cashierId,
        cashierName,
        cartItems,
        customerInfo.uniqueId || customerInfo.name
          ? {
              name: customerInfo.name,
              phone: customerInfo.uniqueId, // Using uniqueId in phone field for tracking
            }
          : undefined,
        {
          method: paymentInfo.method,
          amountPaid: paymentInfo.method === "cash" ? amountPaid : undefined,
          referenceNumber: paymentInfo.referenceNumber || undefined,
        },
      );

      notificationManager.success(
        "Transaction Completed! 🎉",
        `Transaction ${transaction.transactionNumber} completed successfully.\n\nTotal: ₱${total.toFixed(2)}\n${
          paymentInfo.method === "cash"
            ? `Amount Paid: ₱${amountPaid.toFixed(2)}\nChange: ₱${(amountPaid - total).toFixed(2)}`
            : `Payment Method: ${paymentInfo.method.toUpperCase()}`
        }${customerInfo.uniqueId ? `\nCustomer ID: ${customerInfo.uniqueId}` : ""}`,
        { autoClose: 6000 },
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
    } catch (error) {
      notificationManager.error("Transaction Failed", "Please try again");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">FAC KIOSK POS</h1>
              <p className="text-orange-300 font-medium">
                Cashier: {cashierName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-gray-300">
                Press Ctrl+Shift+Q to exit
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExitModal(true)}
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Exit Kiosk
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Products Section */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search products by name, SKU, or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Scan className="h-5 w-5" />
              </Button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-3 overflow-x-auto">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className={`whitespace-nowrap h-12 ${
                  selectedCategory === "all"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "border-white/20 text-white hover:bg-white/10"
                }`}
              >
                All Products
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap h-12 ${
                    selectedCategory === category.id
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  {category.icon} {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-md"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-white/20 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="h-12 w-12 text-orange-300" />
                  </div>
                  <h3 className="font-bold text-white mb-1 line-clamp-2 text-sm">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-300 mb-2">{product.sku}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-black text-orange-400 text-lg">
                      ₱{product.unitPrice.toFixed(2)}
                    </span>
                    <Badge
                      variant={
                        product.currentStock <= product.minStockLevel
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {product.currentStock}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={product.currentStock === 0}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <Package className="h-20 w-20 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">No products found</p>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="w-96 border-l border-white/20 bg-black/20 backdrop-blur-md p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center text-white">
              <ShoppingCart className="h-6 w-6 mr-2" />
              Cart ({cartItems.length})
            </h2>
            {cartItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto mb-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <Card
                    key={item.productId}
                    className="bg-white/10 border-white/20"
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm line-clamp-2">
                            {item.productName}
                          </h4>
                          <p className="text-xs text-gray-300">{item.sku}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.productId,
                                item.quantity - 1,
                              )
                            }
                            className="h-8 w-8 p-0 border-white/20 text-white hover:bg-white/10"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-white font-bold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.productId,
                                item.quantity + 1,
                              )
                            }
                            className="h-8 w-8 p-0 border-white/20 text-white hover:bg-white/10"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-300">
                            ₱{item.unitPrice.toFixed(2)} each
                          </p>
                          <p className="font-bold text-orange-400">
                            ₱{item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {cartItems.length > 0 && (
            <div className="space-y-4">
              <Separator className="bg-white/20" />
              <div className="space-y-2">
                <div className="flex justify-between text-white">
                  <span>Subtotal:</span>
                  <span>₱{getCartTotal().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>VAT (12%):</span>
                  <span>₱{getCartTotal().tax.toFixed(2)}</span>
                </div>
                <Separator className="bg-white/20" />
                <div className="flex justify-between font-bold text-xl">
                  <span className="text-white">Total:</span>
                  <span className="text-orange-400">
                    ₱{getCartTotal().total.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                onClick={() => setShowPaymentModal(true)}
              >
                <CreditCard className="h-6 w-6 mr-3" />
                PROCESS PAYMENT
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Receipt className="h-6 w-6 mr-2 text-orange-500" />
              Process Payment
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Complete the transaction details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center text-white">
                <Users className="h-5 w-5 mr-2 text-orange-500" />
                Customer Information (Optional)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="customerId" className="text-white">
                    Unique Customer ID
                  </Label>
                  <Input
                    id="customerId"
                    placeholder="C001234"
                    value={customerInfo.uniqueId}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        uniqueId: e.target.value,
                      })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="customerName" className="text-white">
                    Customer Name
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="John Doe"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              {customerInfo.uniqueId && (
                <div className="flex items-center text-sm text-orange-300">
                  <Star className="h-4 w-4 mr-1" />
                  Points will be tracked for this customer
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h4 className="font-medium text-white">Payment Method</h4>
              <Select
                value={paymentInfo.method}
                onValueChange={(value: any) =>
                  setPaymentInfo({ ...paymentInfo, method: value })
                }
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>

              {paymentInfo.method === "cash" && (
                <div>
                  <Label htmlFor="amountPaid" className="text-white">
                    Amount Paid
                  </Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    placeholder="0.00"
                    value={paymentInfo.amountPaid}
                    onChange={(e) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        amountPaid: e.target.value,
                      })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  {paymentInfo.amountPaid && (
                    <p className="text-sm text-orange-300 mt-1">
                      Change: ₱
                      {Math.max(
                        0,
                        parseFloat(paymentInfo.amountPaid) -
                          getCartTotal().total,
                      ).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {paymentInfo.method !== "cash" && (
                <div>
                  <Label htmlFor="referenceNumber" className="text-white">
                    Reference Number
                  </Label>
                  <Input
                    id="referenceNumber"
                    placeholder="Transaction reference"
                    value={paymentInfo.referenceNumber}
                    onChange={(e) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        referenceNumber: e.target.value,
                      })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-orange-500/20 p-4 rounded-lg border border-orange-500/30">
              <div className="flex justify-between items-center font-bold text-2xl">
                <span className="text-white">Total Amount:</span>
                <span className="text-orange-400">
                  ₱{getCartTotal().total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Complete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation Modal */}
      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-400">
              Exit Kiosk Mode?
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to exit kiosk mode? Any pending transactions
              will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExitModal(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={exitKioskMode}
              className="bg-red-500 hover:bg-red-600"
            >
              Exit Kiosk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
