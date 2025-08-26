import React, { useState, useEffect } from "react";
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
  Star,
  Car,
  Bike,
  X,
  Maximize,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts, Product } from "@/utils/inventoryData";
import {
  POSItem,
  createPOSTransaction,
  getPOSCategories,
} from "@/utils/posData";
import {
  getCarWashServices,
  vehicleTypes,
  motorcycleSubtypes,
  calculateServicePrice,
  CarWashService,
} from "@/utils/carWashServices";
import { notificationManager } from "@/components/NotificationModal";
import { getPrintingService, ReceiptData } from "@/utils/printingService";

export default function POSKiosk() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [carWashServices, setCarWashServices] = useState<CarWashService[]>([]);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState({
    type: "",
    motorcycleSubtype: "",
  });
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
  const cashierName = localStorage.getItem("userEmail") || "Cashier";

  useEffect(() => {
    const loadData = async () => {
      const productsData = await getProducts();
      const servicesData = await getCarWashServices();
      setProducts(productsData);
      setCarWashServices(servicesData);
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = products.filter((product) => product.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  // Exit kiosk keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'Q') {
        event.preventDefault();
        setShowExitModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => item.productId === product.id);
    if (existingItem) {
      updateQuantity(existingItem.productId, existingItem.quantity + 1);
    } else {
      const newItem: POSItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        subtotal: product.price,
        category: product.category,
        sku: product.sku,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const addServiceToCart = (service: CarWashService) => {
    if (!selectedVehicle.type) {
      notificationManager.error("Please select a vehicle type first");
      return;
    }

    const price = calculateServicePrice(service, selectedVehicle);
    const serviceDisplayName = `${service.name} - ${
      vehicleTypes.find((v) => v.id === selectedVehicle.type)?.name || selectedVehicle.type
    }`;

    const newItem: POSItem = {
      productId: `service_${service.id}_${selectedVehicle.type}`,
      productName: serviceDisplayName,
      quantity: 1,
      unitPrice: price,
      subtotal: price,
      category: "car_wash_services",
      sku: `SVC-${service.id.toUpperCase()}`,
    };

    setCartItems([...cartItems, newItem]);
    setShowServiceSelector(false);
    setSelectedVehicle({ type: "", motorcycleSubtype: "" });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(
      cartItems.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: item.unitPrice * newQuantity,
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const amountPaid = parseFloat(paymentInfo.amountPaid) || 0;
  const change = paymentInfo.method === "cash" ? Math.max(0, amountPaid - total) : 0;

  const handlePayment = async () => {
    if (!customerInfo.uniqueId.trim()) {
      notificationManager.error("Customer ID is required");
      return;
    }

    if (paymentInfo.method === "cash" && amountPaid < total) {
      notificationManager.error("Insufficient payment amount");
      return;
    }

    if ((paymentInfo.method === "gcash" || paymentInfo.method === "card") && !paymentInfo.referenceNumber.trim()) {
      notificationManager.error("Reference number is required for this payment method");
      return;
    }

    try {
      const transaction = createPOSTransaction({
        items: cartItems,
        total,
        paymentMethod: paymentInfo.method,
        amountPaid: paymentInfo.method === "cash" ? amountPaid : total,
        changeGiven: change,
        customerId: customerInfo.uniqueId,
        customerName: customerInfo.name,
        cashierId: localStorage.getItem("userEmail") || "unknown",
        cashierName: cashierName,
        referenceNumber: paymentInfo.referenceNumber || undefined,
      });

      notificationManager.success(
        "Payment Processed",
        `Transaction #${transaction.transactionNumber} completed successfully`
      );

      // Print receipt (same as POS page)
      try {
        const receiptData: ReceiptData = {
          transactionNumber: transaction.transactionNumber,
          cashierName: cashierName,
          customerName: customerInfo.name || undefined,
          customerPhone: customerInfo.uniqueId || undefined,
          timestamp: transaction.timestamp,
          items: cartItems.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
          subtotal: total - total * 0.12,
          discountAmount: 0,
          taxAmount: total * 0.12,
          totalAmount: total,
          paymentMethod: paymentInfo.method,
          amountPaid: paymentInfo.method === "cash" ? amountPaid : undefined,
          changeGiven: paymentInfo.method === "cash" ? amountPaid - total : undefined,
          referenceNumber: paymentInfo.referenceNumber || undefined,
        };

        const printingService = getPrintingService();
        await printingService.printReceipt(receiptData);

        notificationManager.success(
          "Receipt Printed",
          "Receipt has been sent to printer",
          { autoClose: 3000 }
        );
      } catch (printError) {
        console.error("Print failed:", printError);
        notificationManager.error(
          "Print Failed",
          "Receipt could not be printed. Transaction was still completed successfully.",
          { autoClose: 5000 }
        );
      }

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

  const exitKiosk = () => {
    navigate("/admin-dashboard");
  };

  // Safety check - ensure required data is available
  if (!categories || !Array.isArray(filteredProducts)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading POS...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kiosk Header */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">FAC KIOSK POS</h1>
              <p className="text-orange-500 font-medium">Cashier: {cashierName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Press Ctrl+Shift+Q to exit</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExitModal(true)}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Exit Kiosk
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Products Section */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
          {/* Search and Filters */}
          <div className="mb-4 lg:mb-6 space-y-3 lg:space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm lg:text-base"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowServiceSelector(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm px-2 sm:px-4 lg:px-6"
                  size="sm"
                >
                  <Car className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Car Wash</span>
                  <span className="sm:hidden">Services</span>
                </Button>
                <Button variant="outline" size="sm" className="px-2 sm:px-3">
                  <Scan className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
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
              <Button
                variant={selectedCategory === "car_wash_services" ? "default" : "outline"}
                onClick={() => setSelectedCategory("car_wash_services")}
                className="whitespace-nowrap"
              >
                <Car className="h-4 w-4 mr-2" />
                Car Wash Services
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.icon} {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-3 lg:p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">
                        ₱{product.price.toFixed(2)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {product.stock}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-full lg:w-96 border-l border-border bg-muted/50 p-4 lg:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart ({cartItems.length})
              </h2>
              {cartItems.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Separator />

            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your cart is empty</p>
                <p className="text-sm">Add products to start</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <Card key={item.productId} className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {item.productName}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            ₱{item.unitPrice.toFixed(2)} each
                          </div>
                          <div className="font-bold text-orange-600">
                            ₱{item.subtotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {cartItems.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">₱{total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3"
                  size="lg"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Process Payment
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Complete the transaction details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-id">Customer ID/Phone *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customer-id"
                  placeholder="Enter customer ID or phone number"
                  value={customerInfo.uniqueId}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, uniqueId: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name (Optional)</Label>
              <Input
                id="customer-name"
                placeholder="Enter customer name"
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={paymentInfo.method}
                onValueChange={(value: "cash" | "gcash" | "card") =>
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
                </SelectContent>
              </Select>
            </div>

            {/* Amount Paid (for cash) */}
            {paymentInfo.method === "cash" && (
              <div className="space-y-2">
                <Label htmlFor="amount-paid">Amount Paid</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount-paid"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={paymentInfo.amountPaid}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, amountPaid: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
                {change > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    Change: ₱{change.toFixed(2)}
                  </div>
                )}
              </div>
            )}

            {/* Reference Number (for digital payments) */}
            {(paymentInfo.method === "gcash" || paymentInfo.method === "card") && (
              <div className="space-y-2">
                <Label htmlFor="reference-number">Reference Number *</Label>
                <Input
                  id="reference-number"
                  placeholder="Enter reference/confirmation number"
                  value={paymentInfo.referenceNumber}
                  onChange={(e) =>
                    setPaymentInfo({ ...paymentInfo, referenceNumber: e.target.value })
                  }
                />
              </div>
            )}

            {/* Total Display */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-orange-600">₱{total.toFixed(2)}</span>
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

      {/* Car Wash Service Selector Modal */}
      <Dialog open={showServiceSelector} onOpenChange={setShowServiceSelector}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Select Car Wash Service
            </DialogTitle>
            <DialogDescription>
              Choose a service and vehicle type for accurate pricing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Vehicle Type Selection */}
            <div className="space-y-4">
              <h4 className="font-medium">Select Vehicle Type</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vehicleTypes.map((vehicleType) => (
                  <Button
                    key={vehicleType.id}
                    variant={
                      selectedVehicle.type === vehicleType.id
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setSelectedVehicle({
                        ...selectedVehicle,
                        type: vehicleType.id,
                        motorcycleSubtype:
                          vehicleType.category === "motorcycle" ? "small" : "",
                      })
                    }
                    className={`h-12 ${
                      selectedVehicle.type === vehicleType.id
                        ? "bg-orange-500 hover:bg-orange-600"
                        : ""
                    }`}
                  >
                    {vehicleType.category === "car" ? (
                      <Car className="h-4 w-4 mr-2" />
                    ) : (
                      <Bike className="h-4 w-4 mr-2" />
                    )}
                    {vehicleType.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Motorcycle Subtype (if motorcycle selected) */}
            {selectedVehicle.type &&
              vehicleTypes.find((v) => v.id === selectedVehicle.type)?.category === "motorcycle" && (
                <div className="space-y-4">
                  <h4 className="font-medium">Select Motorcycle Size</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {motorcycleSubtypes.map((subtype) => (
                      <Button
                        key={subtype.id}
                        variant={
                          selectedVehicle.motorcycleSubtype === subtype.id
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setSelectedVehicle({
                            ...selectedVehicle,
                            motorcycleSubtype: subtype.id,
                          })
                        }
                        className={`h-12 ${
                          selectedVehicle.motorcycleSubtype === subtype.id
                            ? "bg-orange-500 hover:bg-orange-600"
                            : ""
                        }`}
                      >
                        {subtype.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

            {/* Services List */}
            {selectedVehicle.type && (
              <div className="space-y-4">
                <h4 className="font-medium">Available Services</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {carWashServices.map((service) => {
                    const price = calculateServicePrice(service, selectedVehicle);
                    return (
                      <Card
                        key={service.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-300"
                        onClick={() => addServiceToCart(service)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium">{service.name}</h5>
                              <Badge variant="secondary">
                                {service.estimatedTime} min
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {service.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-orange-600">
                                ₱{price.toFixed(2)}
                              </span>
                              <Button
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addServiceToCart(service);
                                }}
                              >
                                Add Service
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowServiceSelector(false);
                setSelectedVehicle({ type: "", motorcycleSubtype: "" });
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Kiosk Confirmation Modal */}
      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Kiosk Mode</DialogTitle>
            <DialogDescription>
              Are you sure you want to exit kiosk mode and return to the admin dashboard?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExitModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={exitKiosk} className="bg-red-500 hover:bg-red-600">
              <X className="h-4 w-4 mr-2" />
              Exit Kiosk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
