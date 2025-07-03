import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Plus,
  Search,
  Edit,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  Eye,
  History,
  Users,
  Building,
} from "lucide-react";
import StickyHeader from "@/components/StickyHeader";
import {
  getProducts,
  addProduct,
  updateProductStock,
  getStockMovements,
  getLowStockProducts,
  getOutOfStockProducts,
  getSuppliers,
  addSupplier,
  Product,
  StockMovement,
  Supplier,
} from "@/utils/inventoryData";
import { notificationManager } from "@/components/NotificationModal";

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "car_care" as Product["category"],
    description: "",
    sku: "",
    barcode: "",
    currentStock: 0,
    minStockLevel: 5,
    maxStockLevel: 100,
    unitPrice: 0,
    costPrice: 0,
    supplier: "",
    location: "",
  });

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    status: "active" as Supplier["status"],
  });

  const [stockAdjustment, setStockAdjustment] = useState({
    newStock: 0,
    reason: "",
    notes: "",
  });

  const categories = [
    { value: "car_care", label: "Car Care" },
    { value: "accessories", label: "Accessories" },
    { value: "tools", label: "Tools" },
    { value: "chemicals", label: "Chemicals" },
    { value: "parts", label: "Parts" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const loadData = () => {
    setProducts(getProducts());
    setStockMovements(getStockMovements());
    setSuppliers(getSuppliers());
  };

  const filterProducts = () => {
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
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sku) {
      notificationManager.error(
        "Missing Information",
        "Please fill required fields",
      );
      return;
    }

    try {
      addProduct({
        ...newProduct,
        status: "active",
      });

      notificationManager.success(
        "Product Added",
        `${newProduct.name} has been added to inventory`,
      );

      setNewProduct({
        name: "",
        category: "car_care",
        description: "",
        sku: "",
        barcode: "",
        currentStock: 0,
        minStockLevel: 5,
        maxStockLevel: 100,
        unitPrice: 0,
        costPrice: 0,
        supplier: "",
        location: "",
      });
      setShowAddProductModal(false);
      loadData();
    } catch (error) {
      notificationManager.error("Error", "Failed to add product");
    }
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.contactPerson) {
      notificationManager.error(
        "Missing Information",
        "Please fill required fields",
      );
      return;
    }

    try {
      addSupplier(newSupplier);

      notificationManager.success(
        "Supplier Added",
        `${newSupplier.name} has been added`,
      );

      setNewSupplier({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        status: "active",
      });
      setShowAddSupplierModal(false);
      loadData();
    } catch (error) {
      notificationManager.error("Error", "Failed to add supplier");
    }
  };

  const handleStockAdjustment = () => {
    if (!selectedProduct) return;

    try {
      updateProductStock(
        selectedProduct.id,
        stockAdjustment.newStock,
        stockAdjustment.reason || "Manual adjustment",
      );

      notificationManager.success(
        "Stock Updated",
        `${selectedProduct.name} stock updated to ${stockAdjustment.newStock} units`,
      );

      setStockAdjustment({ newStock: 0, reason: "", notes: "" });
      setSelectedProduct(null);
      setShowStockModal(false);
      loadData();
    } catch (error) {
      notificationManager.error("Error", "Failed to update stock");
    }
  };

  const openStockModal = (product: Product) => {
    setSelectedProduct(product);
    setStockAdjustment({
      newStock: product.currentStock,
      reason: "",
      notes: "",
    });
    setShowStockModal(true);
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) return "out-of-stock";
    if (product.currentStock <= product.minStockLevel) return "low-stock";
    return "in-stock";
  };

  const getStockBadge = (product: Product) => {
    const status = getStockStatus(product);

    switch (status) {
      case "out-of-stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      case "low-stock":
        return <Badge variant="secondary">Low Stock</Badge>;
      default:
        return <Badge variant="default">In Stock</Badge>;
    }
  };

  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = getOutOfStockProducts();

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader
        showBack={true}
        title="Inventory Management"
        backTo="/admin-dashboard"
      />

      <div className="p-6">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="movements">Stock Movements</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{products.length}</p>
                      <p className="text-sm text-muted-foreground">
                        Total Products
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {lowStockProducts.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Low Stock</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {outOfStockProducts.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Out of Stock
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        ₱
                        {products
                          .reduce(
                            (sum, p) => sum + p.currentStock * p.costPrice,
                            0,
                          )
                          .toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Value
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowAddProductModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Products Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {product.sku}
                        </TableCell>
                        <TableCell className="capitalize">
                          {product.category.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {product.currentStock}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Min: {product.minStockLevel}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>₱{product.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>{getStockBadge(product)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStockModal(product)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Movements Tab */}
          <TabsContent value="movements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Recent Stock Movements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovements.slice(0, 20).map((movement) => {
                      const product = products.find(
                        (p) => p.id === movement.productId,
                      );
                      return (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {product ? product.name : movement.productId}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                movement.type === "in"
                                  ? "default"
                                  : movement.type === "out"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {movement.type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{movement.quantity}</TableCell>
                          <TableCell>{movement.reason}</TableCell>
                          <TableCell>{movement.performedBy}</TableCell>
                          <TableCell>
                            {new Date(movement.timestamp).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Suppliers</h2>
              <Button onClick={() => setShowAddSupplierModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((supplier) => (
                <Card key={supplier.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        {supplier.name}
                      </span>
                      <Badge
                        variant={
                          supplier.status === "active" ? "default" : "secondary"
                        }
                      >
                        {supplier.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Contact:</strong> {supplier.contactPerson}
                      </p>
                      <p className="text-sm">
                        <strong>Email:</strong> {supplier.email}
                      </p>
                      <p className="text-sm">
                        <strong>Phone:</strong> {supplier.phone}
                      </p>
                      <p className="text-sm">
                        <strong>Address:</strong> {supplier.address}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Low Stock Alert */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Low Stock Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lowStockProducts.length === 0 ? (
                    <p className="text-muted-foreground">
                      All products are well stocked
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {lowStockProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex justify-between items-center p-2 bg-yellow-50 rounded"
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.sku}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {product.currentStock} left
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Out of Stock */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <TrendingDown className="h-5 w-5 mr-2" />
                    Out of Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {outOfStockProducts.length === 0 ? (
                    <p className="text-muted-foreground">
                      No products out of stock
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {outOfStockProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex justify-between items-center p-2 bg-red-50 rounded"
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.sku}
                            </p>
                          </div>
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Product Modal */}
      <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  placeholder="Product name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  placeholder="SKU"
                  value={newProduct.sku}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, sku: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Product description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(value: any) =>
                    setNewProduct({ ...newProduct, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Select
                  value={newProduct.supplier}
                  onValueChange={(value) =>
                    setNewProduct({ ...newProduct, supplier: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currentStock">Initial Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  placeholder="0"
                  value={newProduct.currentStock}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      currentStock: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="minStock">Min Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  placeholder="5"
                  value={newProduct.minStockLevel}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      minStockLevel: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="maxStock">Max Stock</Label>
                <Input
                  id="maxStock"
                  type="number"
                  placeholder="100"
                  value={newProduct.maxStockLevel}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      maxStockLevel: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newProduct.costPrice}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      costPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newProduct.unitPrice}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      unitPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddProductModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Supplier Modal */}
      <Dialog
        open={showAddSupplierModal}
        onOpenChange={setShowAddSupplierModal}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier to your database
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="supplierName">Supplier Name *</Label>
              <Input
                id="supplierName"
                placeholder="Supplier name"
                value={newSupplier.name}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                placeholder="Contact person"
                value={newSupplier.contactPerson}
                onChange={(e) =>
                  setNewSupplier({
                    ...newSupplier,
                    contactPerson: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplierEmail">Email</Label>
                <Input
                  id="supplierEmail"
                  type="email"
                  placeholder="email@example.com"
                  value={newSupplier.email}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="supplierPhone">Phone</Label>
                <Input
                  id="supplierPhone"
                  placeholder="+63 xxx xxx xxxx"
                  value={newSupplier.phone}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="supplierAddress">Address</Label>
              <Textarea
                id="supplierAddress"
                placeholder="Complete address"
                value={newSupplier.address}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, address: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddSupplierModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSupplier}>Add Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Update stock level for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">
                  Current Stock: {selectedProduct.currentStock}
                </p>
                <p className="text-sm text-muted-foreground">
                  Min: {selectedProduct.minStockLevel} | Max:{" "}
                  {selectedProduct.maxStockLevel}
                </p>
              </div>

              <div>
                <Label htmlFor="newStock">New Stock Level</Label>
                <Input
                  id="newStock"
                  type="number"
                  placeholder="0"
                  value={stockAdjustment.newStock}
                  onChange={(e) =>
                    setStockAdjustment({
                      ...stockAdjustment,
                      newStock: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Select
                  value={stockAdjustment.reason}
                  onValueChange={(value) =>
                    setStockAdjustment({ ...stockAdjustment, reason: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damaged">Damaged goods</SelectItem>
                    <SelectItem value="expired">Expired products</SelectItem>
                    <SelectItem value="recount">Physical recount</SelectItem>
                    <SelectItem value="theft">Theft/Loss</SelectItem>
                    <SelectItem value="correction">
                      System correction
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes"
                  value={stockAdjustment.notes}
                  onChange={(e) =>
                    setStockAdjustment({
                      ...stockAdjustment,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockAdjustment}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
