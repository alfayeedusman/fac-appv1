import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  const [showExitModal, setShowExitModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{uniqueId: string; name: string}>({
    uniqueId: "",
    name: "",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    method: "cash" as const,
    amountPaid: "",
    referenceNumber: "",
  });

  const categories = getPOSCategories();
  const cashierName = localStorage.getItem("userEmail") || "Cashier";

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData || []);
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts([]);
      }
    };
    loadData();
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

  const addToCart = (product: Product) => {
    try {
      if (!product || !product.id) {
        console.error("Invalid product:", product);
        return;
      }

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
      notificationManager.showNotification(
        `${product.name} added to cart`,
        "success"
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      notificationManager.showNotification("Failed to add item to cart", "error");
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

  const handlePayment = async () => {
    try {
      if (cartItems.length === 0) {
        notificationManager.showNotification("Cart is empty", "error");
        return;
      }

      if (!customerInfo.uniqueId.trim()) {
        notificationManager.showNotification("Customer ID is required", "error");
        return;
      }

      if (paymentInfo.method === "cash") {
        const amountPaid = parseFloat(paymentInfo.amountPaid);
        if (isNaN(amountPaid) || amountPaid < total) {
          notificationManager.showNotification("Insufficient payment amount", "error");
          return;
        }
      }

      if ((paymentInfo.method === "gcash" || paymentInfo.method === "card") && 
          !paymentInfo.referenceNumber.trim()) {
        notificationManager.showNotification("Reference number is required", "error");
        return;
      }

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
          amountPaid: paymentInfo.method === "cash" ? parseFloat(paymentInfo.amountPaid) : total,
          referenceNumber: paymentInfo.referenceNumber
        }
      );

      notificationManager.showNotification("Payment successful!", "success");
      
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
      console.error("Payment error:", error);
      notificationManager.showNotification("Payment failed. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">POS Kiosk</h1>
              <p className="text-gray-600">Cashier: {cashierName}</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExitModal(true)}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Exit Kiosk
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Products
                </CardTitle>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <h3 className="font-medium text-gray-900">{product.name || "Unnamed Product"}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.description || "No description"}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-orange-600">
                            ₱{(product.unitPrice || 0).toFixed(2)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => addToCart(product)}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No products found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Cart
                  </div>
                  <Badge variant="secondary">{cartItems.length} items</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-orange-600 font-bold">₱{(item.price || 0).toFixed(2)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-orange-600">₱{total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="w-full text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Cart
                      </Button>
                      
                      <Button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3"
                        size="lg"
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        Process Payment
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
      />

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Exit POS Kiosk</h2>
              <p className="text-gray-600">Are you sure you want to exit the kiosk?</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate("/pos")}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
