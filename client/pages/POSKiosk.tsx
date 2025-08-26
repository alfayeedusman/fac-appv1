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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl shadow-lg">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
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
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Today's Sales: ₱{total.toFixed(2)}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowExitModal(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 px-6"
              >
                <X className="h-4 w-4 mr-2" />
                Exit Kiosk
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Products Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg mr-3">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    Products
                    <Badge variant="secondary" className="ml-3 bg-blue-50 text-blue-700">
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

              <CardContent className="pt-2">
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
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
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
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Cart Section */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg mr-3">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl">Shopping Cart</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 px-3 py-1">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
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
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Your cart is empty</h3>
                    <p className="text-gray-400 text-sm">Add some products to get started</p>
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
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4">
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
                          <span className="text-lg font-bold text-gray-900">Total:</span>
                          <span className="text-2xl font-bold text-orange-600">₱{(total * 1.12).toFixed(2)}</span>
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

                      <Button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl text-lg"
                        size="lg"
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        Process Payment
                        <div className="ml-auto bg-white/20 px-2 py-1 rounded-lg text-sm">
                          ₱{(total * 1.12).toFixed(2)}
                        </div>
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
