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
  Car,
  Trash2,
  RefreshCw,
  ShoppingCart
} from "lucide-react";
import StickyHeader from "@/components/StickyHeader";
import { swalHelpers } from "@/utils/swalHelpers";
import { neonDbClient } from "@/services/neonDatabaseService";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import CarWashServiceManager from "@/components/CarWashServiceManager";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice?: number;
  supplier?: string;
  barcode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  performedBy: string;
  notes?: string;
  createdAt: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  paymentTerms?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminInventory() {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form states
  const [newItem, setNewItem] = useState({
    name: "",
    category: "car_care",
    description: "",
    currentStock: 0,
    minStockLevel: 5,
    maxStockLevel: 100,
    unitPrice: 0,
    supplier: "",
    barcode: "",
  });

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    paymentTerms: "Net 30",
    notes: "",
  });

  const [stockAdjustment, setStockAdjustment] = useState({
    newStock: 0,
    reason: "",
    notes: "",
  });

  const categories = [
    { value: "car_care", label: "Car Care Products" },
    { value: "accessories", label: "Car Accessories" },
    { value: "tools", label: "Tools & Equipment" },
    { value: "chemicals", label: "Chemicals" },
    { value: "parts", label: "Spare Parts" },
    { value: "services", label: "Service Items" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, inventoryItems]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all data concurrently
      const [itemsRes, movementsRes, suppliersRes, analyticsRes, lowStockRes] = await Promise.all([
        neonDbClient.getInventoryItems(),
        neonDbClient.getStockMovements(),
        neonDbClient.getSuppliers(),
        neonDbClient.getInventoryAnalytics(),
        neonDbClient.getLowStockItems()
      ]);

      if (itemsRes.success) setInventoryItems(itemsRes.items || []);
      if (movementsRes.success) setStockMovements(movementsRes.movements || []);
      if (suppliersRes.success) setSuppliers(suppliersRes.suppliers || []);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (lowStockRes.success) setLowStockItems(lowStockRes.items || []);

    } catch (error) {
      console.error('Error loading inventory data:', error);
      swalHelpers.showError('Load Failed', 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = inventoryItems;

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.barcode?.includes(searchQuery) ||
          item.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category) {
      swalHelpers.showError('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      swalHelpers.showLoading('Adding Product', 'Creating new inventory item...');
      
      const result = await neonDbClient.createInventoryItem(newItem);
      
      swalHelpers.close();
      
      if (result.success) {
        swalHelpers.showSuccess('Product Added', `${newItem.name} has been added to inventory`);
        
        // Reset form and close modal
        setNewItem({
          name: "",
          category: "car_care",
          description: "",
          currentStock: 0,
          minStockLevel: 5,
          maxStockLevel: 100,
          unitPrice: 0,
          supplier: "",
          barcode: "",
        });
        setShowAddItemModal(false);
        
        // Reload data
        loadData();
      } else {
        swalHelpers.showError('Creation Failed', result.error || 'Failed to create inventory item');
      }
    } catch (error) {
      swalHelpers.close();
      console.error('Error adding item:', error);
      swalHelpers.showError('Error', 'Failed to add inventory item');
    }
  };

  const handleEditItem = async (item: InventoryItem) => {
    const formData = await swalHelpers.showInventoryForm('Edit Product', [
      { id: 'name', label: 'Product Name', type: 'text', value: item.name, required: true },
      { id: 'category', label: 'Category', type: 'select', value: item.category, options: categories, required: true },
      { id: 'description', label: 'Description', type: 'textarea', value: item.description },
      { id: 'minStockLevel', label: 'Minimum Stock Level', type: 'number', value: item.minStockLevel, required: true },
      { id: 'maxStockLevel', label: 'Maximum Stock Level', type: 'number', value: item.maxStockLevel, required: true },
      { id: 'unitPrice', label: 'Unit Price (₱)', type: 'number', value: item.unitPrice },
      { id: 'supplier', label: 'Supplier', type: 'text', value: item.supplier },
      { id: 'barcode', label: 'Barcode', type: 'text', value: item.barcode }
    ]);

    if (formData) {
      try {
        swalHelpers.showLoading('Updating Product', 'Saving changes...');
        
        const result = await neonDbClient.updateInventoryItem(item.id, formData);
        
        swalHelpers.close();
        
        if (result.success) {
          swalHelpers.showSuccess('Product Updated', 'Product information has been updated');
          loadData();
        } else {
          swalHelpers.showError('Update Failed', result.error || 'Failed to update product');
        }
      } catch (error) {
        swalHelpers.close();
        console.error('Error updating item:', error);
        swalHelpers.showError('Error', 'Failed to update product');
      }
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    const confirmed = await swalHelpers.confirmDelete(item.name, 'product');
    
    if (confirmed) {
      try {
        swalHelpers.showLoading('Deleting Product', 'Removing from inventory...');
        
        const result = await neonDbClient.deleteInventoryItem(item.id);
        
        swalHelpers.close();
        
        if (result.success) {
          swalHelpers.showSuccess('Product Deleted', `${item.name} has been removed from inventory`);
          loadData();
        } else {
          swalHelpers.showError('Deletion Failed', result.error || 'Failed to delete product');
        }
      } catch (error) {
        swalHelpers.close();
        console.error('Error deleting item:', error);
        swalHelpers.showError('Error', 'Failed to delete product');
      }
    }
  };

  const handleStockAdjustment = async (item: InventoryItem) => {
    const formData = await swalHelpers.showInventoryForm('Adjust Stock', [
      { id: 'newStock', label: 'New Stock Level', type: 'number', value: item.currentStock, required: true },
      { id: 'reason', label: 'Reason', type: 'select', required: true, options: [
        { value: 'restock', label: 'Restock/Purchase' },
        { value: 'sale', label: 'Sale/Usage' },
        { value: 'damaged', label: 'Damaged/Defective' },
        { value: 'expired', label: 'Expired' },
        { value: 'theft', label: 'Theft/Loss' },
        { value: 'correction', label: 'Inventory Correction' },
        { value: 'other', label: 'Other' }
      ]},
      { id: 'notes', label: 'Additional Notes', type: 'textarea' }
    ]);

    if (formData) {
      try {
        swalHelpers.showLoading('Updating Stock', 'Adjusting inventory levels...');
        
        const result = await neonDbClient.updateInventoryStock(
          item.id, 
          formData.newStock, 
          formData.reason, 
          formData.notes
        );
        
        swalHelpers.close();
        
        if (result.success) {
          swalHelpers.showSuccess(
            'Stock Updated', 
            `${item.name} stock updated from ${item.currentStock} to ${formData.newStock} units`
          );
          loadData();
          
          // Show stock warnings if needed
          if (formData.newStock <= item.minStockLevel) {
            setTimeout(() => {
              swalHelpers.showStockWarning(item.name, formData.newStock, item.minStockLevel);
            }, 1000);
          }
        } else {
          swalHelpers.showError('Update Failed', result.error || 'Failed to update stock');
        }
      } catch (error) {
        swalHelpers.close();
        console.error('Error updating stock:', error);
        swalHelpers.showError('Error', 'Failed to update stock');
      }
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.contactPerson) {
      swalHelpers.showError('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      swalHelpers.showLoading('Adding Supplier', 'Creating new supplier...');
      
      const result = await neonDbClient.createSupplier(newSupplier);
      
      swalHelpers.close();
      
      if (result.success) {
        swalHelpers.showSuccess('Supplier Added', `${newSupplier.name} has been added to suppliers`);
        
        // Reset form and close modal
        setNewSupplier({
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
          website: "",
          paymentTerms: "Net 30",
          notes: "",
        });
        setShowAddSupplierModal(false);
        
        // Reload data
        loadData();
      } else {
        swalHelpers.showError('Creation Failed', result.error || 'Failed to create supplier');
      }
    } catch (error) {
      swalHelpers.close();
      console.error('Error adding supplier:', error);
      swalHelpers.showError('Error', 'Failed to add supplier');
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return "out-of-stock";
    if (item.currentStock <= item.minStockLevel) return "low-stock";
    return "in-stock";
  };

  const getStockBadge = (item: InventoryItem) => {
    const status = getStockStatus(item);

    switch (status) {
      case "out-of-stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      case "low-stock":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      default:
        return <Badge variant="default" className="bg-green-100 text-green-800">In Stock</Badge>;
    }
  };

  const formatCurrency = (amount: number) => `₱${amount.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background flex">
      <StickyHeader
        showBack={true}
        title="Inventory Management"
        backTo="/admin-dashboard"
      />

      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab="inventory"
        onTabChange={(tab) => {
          if (tab === "overview") navigate("/admin-dashboard");
          else if (tab === "cms") navigate("/admin-cms");
          else if (tab === "push-notifications") navigate("/admin-push-notifications");
          else if (tab === "gamification") navigate("/admin-gamification");
          else if (tab === "subscription-approval") navigate("/admin-subscription-approval");
          else if (tab === "pos") navigate("/pos");
          else if (tab === "user-management") navigate("/admin-user-management");
        }}
        userRole={localStorage.getItem("userRole") || "admin"}
        notificationCount={0}
      />

      <div className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 mt-16">
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="services">Car Wash Services</TabsTrigger>
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
                        <p className="text-2xl font-bold">{inventoryItems.length}</p>
                        <p className="text-sm text-muted-foreground">Total Products</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-2xl font-bold">{lowStockItems.length}</p>
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
                          {inventoryItems.filter(item => item.currentStock === 0).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Out of Stock</p>
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
                          {formatCurrency(
                            inventoryItems.reduce((sum, item) => 
                              sum + (item.currentStock * (item.unitPrice || 0)), 0
                            )
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Value</p>
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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                <Button onClick={loadData} variant="outline" disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={() => setShowAddItemModal(true)}>
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
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                              {item.barcode && (
                                <p className="text-xs font-mono text-muted-foreground">
                                  {item.barcode}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {item.category.replace("_", " ")}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.currentStock}</p>
                              <p className="text-xs text-muted-foreground">
                                Min: {item.minStockLevel}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.unitPrice ? formatCurrency(item.unitPrice) : "—"}
                          </TableCell>
                          <TableCell>{item.supplier || "—"}</TableCell>
                          <TableCell>{getStockBadge(item)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStockAdjustment(item)}
                                title="Adjust Stock"
                              >
                                <ShoppingCart className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditItem(item)}
                                title="Edit Product"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteItem(item)}
                                title="Delete Product"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
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

            {/* Car Wash Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <CarWashServiceManager />
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
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Performed By</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockMovements.slice(0, 20).map((movement) => {
                        const item = inventoryItems.find(i => i.id === movement.itemId);
                        return (
                          <TableRow key={movement.id}>
                            <TableCell>
                              {item ? item.name : movement.itemId}
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
                                className={
                                  movement.type === "in"
                                    ? "bg-green-100 text-green-800"
                                    : movement.type === "out"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                                }
                              >
                                {movement.type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>{movement.quantity}</TableCell>
                            <TableCell>{movement.reason}</TableCell>
                            <TableCell>{movement.performedBy}</TableCell>
                            <TableCell>
                              {new Date(movement.createdAt).toLocaleDateString()}
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
                        <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
                          {supplier.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Contact:</strong> {supplier.contactPerson}
                        </p>
                        {supplier.email && (
                          <p className="text-sm">
                            <strong>Email:</strong> {supplier.email}
                          </p>
                        )}
                        {supplier.phone && (
                          <p className="text-sm">
                            <strong>Phone:</strong> {supplier.phone}
                          </p>
                        )}
                        {supplier.paymentTerms && (
                          <p className="text-sm">
                            <strong>Terms:</strong> {supplier.paymentTerms}
                          </p>
                        )}
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
                    {lowStockItems.length === 0 ? (
                      <p className="text-muted-foreground">
                        All products are well stocked
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {lowStockItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center p-2 bg-yellow-50 rounded"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Category: {item.category.replace("_", " ")}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {item.currentStock} left
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
                    {inventoryItems.filter(item => item.currentStock === 0).length === 0 ? (
                      <p className="text-muted-foreground">
                        No products out of stock
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {inventoryItems.filter(item => item.currentStock === 0).map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center p-2 bg-red-50 rounded"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Category: {item.category.replace("_", " ")}
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

        {/* Add Item Modal */}
        <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
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
                  <Label htmlFor="itemName">Product Name *</Label>
                  <Input
                    id="itemName"
                    placeholder="Product name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
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
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentStock">Initial Stock</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    placeholder="0"
                    value={newItem.currentStock}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
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
                    value={newItem.minStockLevel}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
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
                    value={newItem.maxStockLevel}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        maxStockLevel: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitPrice">Unit Price (₱)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItem.unitPrice}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        unitPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    placeholder="Supplier name"
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  placeholder="Product barcode"
                  value={newItem.barcode}
                  onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddItemModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem}>Add Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Supplier Modal */}
        <Dialog open={showAddSupplierModal} onOpenChange={setShowAddSupplierModal}>
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
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  placeholder="Contact person"
                  value={newSupplier.contactPerson}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, contactPerson: e.target.value })
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
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="supplierPhone">Phone</Label>
                  <Input
                    id="supplierPhone"
                    placeholder="+63 xxx xxx xxxx"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="supplierAddress">Address</Label>
                <Textarea
                  id="supplierAddress"
                  placeholder="Complete address"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://example.com"
                    value={newSupplier.website}
                    onChange={(e) => setNewSupplier({ ...newSupplier, website: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    placeholder="Net 30"
                    value={newSupplier.paymentTerms}
                    onChange={(e) => setNewSupplier({ ...newSupplier, paymentTerms: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes"
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddSupplierModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSupplier}>Add Supplier</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
