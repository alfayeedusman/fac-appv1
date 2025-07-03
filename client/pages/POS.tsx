import { useState, useEffect } from "react";
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
  Phone,
  Calculator,
  Receipt,
  Scan,
} from "lucide-react";
import StickyHeader from "@/components/StickyHeader";
import { getProducts, Product } from "@/utils/inventoryData";
import {
  POSItem,
  createPOSTransaction,
  getPOSCategories,
} from "@/utils/posData";
import { notificationManager } from "@/components/NotificationModal";

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<POSItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    method: "cash" as const,
    amountPaid: "",
    referenceNumber: "",
  });

  const categories = getPOSCategories();
  const cashierName = localStorage.getItem("userName") || "Cashier";
  const cashierId = localStorage.getItem("userEmail") || "cashier@fac.com";

  useEffect(() => {
    const allProducts = getProducts().filter((p) => p.status === "active");
    setProducts(allProducts);
    setFilteredProducts(allProducts);
  }, []);

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
        customerInfo.name || customerInfo.phone
          ? {
              name: customerInfo.name,
              phone: customerInfo.phone,
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
        }`,
        { autoClose: 6000 },
      );

      // Reset form
      clearCart();
      setCustomerInfo({ name: "", phone: "" });
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
    <div className="min-h-screen bg-background">
      <StickyHeader showBack={true} title="Point of Sale" />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Products Section */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, SKU, or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Scan className="h-4 w-4" />
              </Button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className="whitespace-nowrap"
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
                  className="whitespace-nowrap"
                >
                  {category.icon} {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {product.sku}
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-fac-orange-600">
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
                      {product.currentStock} in stock
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={product.currentStock === 0}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="w-96 border-l bg-muted/20 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart ({cartItems.length})
            </h2>
            {cartItems.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCart}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto mb-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <Card key={item.productId}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {item.productName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {item.sku}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
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
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
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
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            ₱{item.unitPrice.toFixed(2)} each
                          </p>
                          <p className="font-semibold">
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
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{getCartTotal().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT (12%):</span>
                  <span>₱{getCartTotal().tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-fac-orange-600">
                    ₱{getCartTotal().total.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => setShowPaymentModal(true)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Process Payment
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Process Payment
            </DialogTitle>
            <DialogDescription>
              Complete the transaction details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                Customer Information (Optional)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="customerName">Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Customer name"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    placeholder="Phone number"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h4 className="font-medium">Payment Method</h4>
              <Select
                value={paymentInfo.method}
                onValueChange={(value: any) =>
                  setPaymentInfo({ ...paymentInfo, method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>

              {paymentInfo.method === "cash" && (
                <div>
                  <Label htmlFor="amountPaid">Amount Paid</Label>
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
                  />
                  {paymentInfo.amountPaid && (
                    <p className="text-sm text-muted-foreground mt-1">
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
                  <Label htmlFor="referenceNumber">Reference Number</Label>
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
                  />
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Amount:</span>
                <span className="text-fac-orange-600">
                  ₱{getCartTotal().total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePayment}>
              <DollarSign className="h-4 w-4 mr-2" />
              Complete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
