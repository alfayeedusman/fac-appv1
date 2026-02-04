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
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Plus,
  Search,
  Edit,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Eye,
  History,
  Users,
  Building,
  Car,
  Trash2,
  RefreshCw,
  ShoppingCart,
  Filter,
  Download,
  Upload,
  Boxes,
  DollarSign,
  Calendar,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import StickyHeader from "@/components/StickyHeader";
import { swalHelpers } from "@/utils/swalHelpers";
import { supabaseDbClient } from "@/services/supabaseDatabaseService";
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
  type: "in" | "out" | "adjustment";
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
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

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
    {
      value: "car_care",
      label: "Car Care Products",
      icon: "🧴",
      color: "bg-blue-500",
    },
    {
      value: "accessories",
      label: "Car Accessories",
      icon: "🔧",
      color: "bg-purple-500",
    },
    {
      value: "tools",
      label: "Tools & Equipment",
      icon: "🛠️",
      color: "bg-green-500",
    },
    {
      value: "chemicals",
      label: "Chemicals",
      icon: "⚗️",
      color: "bg-yellow-500",
    },
    { value: "parts", label: "Spare Parts", icon: "⚙️", color: "bg-red-500" },
    {
      value: "services",
      label: "Service Items",
      icon: "🚗",
      color: "bg-orange-500",
    },
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
      const [itemsRes, movementsRes, suppliersRes, analyticsRes, lowStockRes] =
        await Promise.all([
          supabaseDbClient.getInventoryItems(),
          supabaseDbClient.getStockMovements(),
          supabaseDbClient.getSuppliers(),
          supabaseDbClient.getInventoryAnalytics(),
          supabaseDbClient.getLowStockItems(),
        ]);

      if (itemsRes.success) setInventoryItems(itemsRes.items || []);
      if (movementsRes.success) setStockMovements(movementsRes.movements || []);
      if (suppliersRes.success) setSuppliers(suppliersRes.suppliers || []);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (lowStockRes.success) setLowStockItems(lowStockRes.items || []);
    } catch (error) {
      console.error("Error loading inventory data:", error);
      swalHelpers.showError("Load Failed", "Failed to load inventory data");
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
          item.supplier?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category) {
      swalHelpers.showError(
        "Missing Information",
        "Please fill in all required fields",
      );
      return;
    }

    try {
      swalHelpers.showLoading(
        "Adding Product",
        "Creating new inventory item...",
      );

      const result = await supabaseDbClient.createInventoryItem(newItem);

      swalHelpers.close();

      if (result.success) {
        swalHelpers.showSuccess(
          "Product Added",
          `${newItem.name} has been added to inventory`,
        );

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
        swalHelpers.showError(
          "Creation Failed",
          result.error || "Failed to create inventory item",
        );
      }
    } catch (error) {
      swalHelpers.close();
      console.error("Error adding item:", error);
      swalHelpers.showError("Error", "Failed to add inventory item");
    }
  };

  const handleEditItem = async (item: InventoryItem) => {
    const formData = await swalHelpers.showInventoryForm("Edit Product", [
      {
        id: "name",
        label: "Product Name",
        type: "text",
        value: item.name,
        required: true,
      },
      {
        id: "category",
        label: "Category",
        type: "select",
        value: item.category,
        options: categories.map((c) => ({ value: c.value, label: c.label })),
        required: true,
      },
      {
        id: "description",
        label: "Description",
        type: "textarea",
        value: item.description,
      },
      {
        id: "minStockLevel",
        label: "Minimum Stock Level",
        type: "number",
        value: item.minStockLevel,
        required: true,
      },
      {
        id: "maxStockLevel",
        label: "Maximum Stock Level",
        type: "number",
        value: item.maxStockLevel,
        required: true,
      },
      {
        id: "unitPrice",
        label: "Unit Price (₱)",
        type: "number",
        value: item.unitPrice,
      },
      { id: "supplier", label: "Supplier", type: "text", value: item.supplier },
      { id: "barcode", label: "Barcode", type: "text", value: item.barcode },
    ]);

    if (formData) {
      try {
        swalHelpers.showLoading("Updating Product", "Saving changes...");

        const result = await supabaseDbClient.updateInventoryItem(
          item.id,
          formData,
        );

        swalHelpers.close();

        if (result.success) {
          swalHelpers.showSuccess(
            "Product Updated",
            "Product information has been updated",
          );
          loadData();
        } else {
          swalHelpers.showError(
            "Update Failed",
            result.error || "Failed to update product",
          );
        }
      } catch (error) {
        swalHelpers.close();
        console.error("Error updating item:", error);
        swalHelpers.showError("Error", "Failed to update product");
      }
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    const confirmed = await swalHelpers.confirmDelete(item.name, "product");

    if (confirmed) {
      try {
        swalHelpers.showLoading(
          "Deleting Product",
          "Removing from inventory...",
        );

        const result = await supabaseDbClient.deleteInventoryItem(item.id);

        swalHelpers.close();

        if (result.success) {
          swalHelpers.showSuccess(
            "Product Deleted",
            `${item.name} has been removed from inventory`,
          );
          loadData();
        } else {
          swalHelpers.showError(
            "Deletion Failed",
            result.error || "Failed to delete product",
          );
        }
      } catch (error) {
        swalHelpers.close();
        console.error("Error deleting item:", error);
        swalHelpers.showError("Error", "Failed to delete product");
      }
    }
  };

  const handleStockAdjustment = async (item: InventoryItem) => {
    const formData = await swalHelpers.showInventoryForm("Adjust Stock", [
      {
        id: "newStock",
        label: "New Stock Level",
        type: "number",
        value: item.currentStock,
        required: true,
      },
      {
        id: "reason",
        label: "Reason",
        type: "select",
        required: true,
        options: [
          { value: "restock", label: "Restock/Purchase" },
          { value: "sale", label: "Sale/Usage" },
          { value: "damaged", label: "Damaged/Defective" },
          { value: "expired", label: "Expired" },
          { value: "theft", label: "Theft/Loss" },
          { value: "correction", label: "Inventory Correction" },
          { value: "other", label: "Other" },
        ],
      },
      { id: "notes", label: "Additional Notes", type: "textarea" },
    ]);

    if (formData) {
      try {
        swalHelpers.showLoading(
          "Updating Stock",
          "Adjusting inventory levels...",
        );

        const result = await supabaseDbClient.updateInventoryStock(
          item.id,
          formData.newStock,
          formData.reason,
          formData.notes,
        );

        swalHelpers.close();

        if (result.success) {
          swalHelpers.showSuccess(
            "Stock Updated",
            `${item.name} stock updated from ${item.currentStock} to ${formData.newStock} units`,
          );
          loadData();

          // Show stock warnings if needed
          if (formData.newStock <= item.minStockLevel) {
            setTimeout(() => {
              swalHelpers.showStockWarning(
                item.name,
                formData.newStock,
                item.minStockLevel,
              );
            }, 1000);
          }
        } else {
          swalHelpers.showError(
            "Update Failed",
            result.error || "Failed to update stock",
          );
        }
      } catch (error) {
        swalHelpers.close();
        console.error("Error updating stock:", error);
        swalHelpers.showError("Error", "Failed to update stock");
      }
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.contactPerson) {
      swalHelpers.showError(
        "Missing Information",
        "Please fill in all required fields",
      );
      return;
    }

    try {
      swalHelpers.showLoading("Adding Supplier", "Creating new supplier...");

      const result = await supabaseDbClient.createSupplier(newSupplier);

      swalHelpers.close();

      if (result.success) {
        swalHelpers.showSuccess(
          "Supplier Added",
          `${newSupplier.name} has been added to suppliers`,
        );

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
        swalHelpers.showError(
          "Creation Failed",
          result.error || "Failed to create supplier",
        );
      }
    } catch (error) {
      swalHelpers.close();
      console.error("Error adding supplier:", error);
      swalHelpers.showError("Error", "Failed to add supplier");
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
        return (
          <Badge variant="destructive" className="animate-pulse">
            Out of Stock
          </Badge>
        );
      case "low-stock":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            Low Stock
          </Badge>
        );
      default:
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-300"
          >
            In Stock
          </Badge>
        );
    }
  };

  const getStockProgress = (item: InventoryItem) => {
    const percentage = Math.min(
      (item.currentStock / item.maxStockLevel) * 100,
      100,
    );
    const status = getStockStatus(item);

    let colorClass = "bg-green-500";
    if (status === "low-stock") colorClass = "bg-yellow-500";
    if (status === "out-of-stock") colorClass = "bg-red-500";

    return { percentage, colorClass };
  };

  const formatCurrency = (amount: number) => `₱${amount.toLocaleString()}`;

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find((c) => c.value === categoryValue) || categories[0];
  };

  const renderProductCard = (item: InventoryItem) => {
    const categoryInfo = getCategoryInfo(item.category);
    const stockProgress = getStockProgress(item);

    return (
      <Card
        key={item.id}
        className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 h-full flex flex-col"
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start justify-between min-h-[60px]">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div
                className={`w-12 h-12 rounded-lg ${categoryInfo.color} flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0`}
              >
                {categoryInfo.icon}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                  {item.name}
                </CardTitle>
                <p className="text-sm text-gray-500 capitalize truncate">
                  {categoryInfo.label}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2">{getStockBadge(item)}</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col">
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2 flex-shrink-0">
              {item.description}
            </p>
          )}

          {/* Stock Progress */}
          <div className="space-y-2 flex-shrink-0">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Stock Level</span>
              <span className="font-medium">
                {item.currentStock} / {item.maxStockLevel}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${stockProgress.colorClass}`}
                style={{ width: `${stockProgress.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Min: {item.minStockLevel}</span>
              <span>Max: {item.maxStockLevel}</span>
            </div>
          </div>

          {/* Price and Supplier */}
          <div className="flex justify-between items-end pt-2 border-t mt-auto">
            <div className="flex-1 min-w-0">
              {item.unitPrice ? (
                <p className="text-lg font-bold text-green-600 truncate">
                  {formatCurrency(item.unitPrice)}
                </p>
              ) : (
                <p className="text-lg font-medium text-gray-400">No price</p>
              )}
              {item.supplier ? (
                <p className="text-xs text-gray-500 truncate">
                  by {item.supplier}
                </p>
              ) : (
                <p className="text-xs text-gray-400">No supplier</p>
              )}
            </div>
            <div className="flex space-x-1 flex-shrink-0 ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStockAdjustment(item)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                title="Adjust Stock"
              >
                <ShoppingCart className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditItem(item)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                title="Edit Product"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteItem(item)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 h-8 w-8 p-0"
                title="Delete Product"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
          else if (tab === "push-notifications")
            navigate("/admin-push-notifications");
          else if (tab === "gamification") navigate("/admin-gamification");
          else if (tab === "subscription-approval")
            navigate("/admin-subscription-approval");
          else if (tab === "pos") navigate("/pos");
          else if (tab === "user-management")
            navigate("/admin-user-management");
        }}
        userRole={localStorage.getItem("userRole") || "admin"}
        notificationCount={0}
      />

      <div className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 pt-20">
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
              <TabsTrigger
                value="products"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Package className="h-4 w-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <Car className="h-4 w-4 mr-2" />
                Services
              </TabsTrigger>
              <TabsTrigger
                value="movements"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <History className="h-4 w-4 mr-2" />
                Movements
              </TabsTrigger>
              <TabsTrigger
                value="suppliers"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                <Building className="h-4 w-4 mr-2" />
                Suppliers
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              {/* Enhanced Stats Cards with Gradients */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">
                          Total Products
                        </p>
                        <p className="text-3xl font-bold">
                          {inventoryItems.length}
                        </p>
                        <p className="text-blue-100 text-xs mt-1">
                          Active inventory items
                        </p>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-full p-3">
                        <Package className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-medium">
                          Low Stock
                        </p>
                        <p className="text-3xl font-bold">
                          {lowStockItems.length}
                        </p>
                        <p className="text-yellow-100 text-xs mt-1">
                          Needs attention
                        </p>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-full p-3">
                        <AlertTriangle className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-medium">
                          Out of Stock
                        </p>
                        <p className="text-3xl font-bold">
                          {
                            inventoryItems.filter(
                              (item) => item.currentStock === 0,
                            ).length
                          }
                        </p>
                        <p className="text-red-100 text-xs mt-1">
                          Urgent restock
                        </p>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-full p-3">
                        <TrendingDown className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">
                          Total Value
                        </p>
                        <p className="text-3xl font-bold">
                          {formatCurrency(
                            inventoryItems.reduce(
                              (sum, item) =>
                                sum + item.currentStock * (item.unitPrice || 0),
                              0,
                            ),
                          )}
                        </p>
                        <p className="text-green-100 text-xs mt-1">
                          Inventory worth
                        </p>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-full p-3">
                        <DollarSign className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Controls */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                      <div className="flex flex-col sm:flex-row gap-3 w-full lg:flex-1">
                        <div className="relative flex-1 min-w-0">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search products, categories, suppliers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger className="w-full sm:w-48 border-gray-300">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                <div className="flex items-center">
                                  <span className="mr-2">{category.icon}</span>
                                  {category.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                        <Button
                          variant="outline"
                          onClick={loadData}
                          disabled={loading}
                          size="sm"
                        >
                          <RefreshCw
                            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                          />
                          <span className="hidden sm:inline">Refresh</span>
                        </Button>

                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Export</span>
                        </Button>

                        <Button
                          onClick={() => setShowAddItemModal(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Add Product</span>
                          <span className="sm:hidden">Add</span>
                        </Button>
                      </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Showing {filteredItems.length} of{" "}
                        {inventoryItems.length} products
                      </div>
                      <div className="bg-gray-100 rounded-lg p-1">
                        <Button
                          variant={viewMode === "grid" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className="text-xs h-8"
                        >
                          <Boxes className="h-3 w-3 mr-1" />
                          Grid
                        </Button>
                        <Button
                          variant={viewMode === "table" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("table")}
                          className="text-xs h-8"
                        >
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Table
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products Display */}
              {viewMode === "grid" ? (
                // Grid View - Fixed alignment
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 auto-rows-fr">
                  {filteredItems.map(renderProductCard)}
                </div>
              ) : (
                // Enhanced Table View
                <Card className="border-0 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b px-4 sm:px-6">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Products Inventory
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">
                              Product
                            </TableHead>
                            <TableHead className="font-semibold">
                              Category
                            </TableHead>
                            <TableHead className="font-semibold">
                              Stock Level
                            </TableHead>
                            <TableHead className="font-semibold">
                              Price
                            </TableHead>
                            <TableHead className="font-semibold">
                              Supplier
                            </TableHead>
                            <TableHead className="font-semibold">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-center">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredItems.map((item) => {
                            const categoryInfo = getCategoryInfo(item.category);
                            const stockProgress = getStockProgress(item);

                            return (
                              <TableRow
                                key={item.id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <div
                                      className={`w-10 h-10 rounded-lg ${categoryInfo.color} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
                                    >
                                      {categoryInfo.icon}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {item.name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {item.description}
                                      </p>
                                      {item.barcode && (
                                        <p className="text-xs font-mono text-gray-400">
                                          {item.barcode}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="capitalize"
                                  >
                                    {categoryInfo.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="font-medium">
                                        {item.currentStock}
                                      </span>
                                      <span className="text-gray-500">
                                        / {item.maxStockLevel}
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className={`h-1.5 rounded-full transition-all duration-300 ${stockProgress.colorClass}`}
                                        style={{
                                          width: `${stockProgress.percentage}%`,
                                        }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Min: {item.minStockLevel}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {item.unitPrice ? (
                                    <span className="font-medium text-green-600">
                                      {formatCurrency(item.unitPrice)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">
                                    {item.supplier || "—"}
                                  </span>
                                </TableCell>
                                <TableCell>{getStockBadge(item)}</TableCell>
                                <TableCell>
                                  <div className="flex justify-center space-x-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleStockAdjustment(item)
                                      }
                                      title="Adjust Stock"
                                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <ShoppingCart className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditItem(item)}
                                      title="Edit Product"
                                      className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteItem(item)}
                                      title="Delete Product"
                                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Car Wash Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <CardTitle className="flex items-center">
                    <Car className="h-6 w-6 mr-3" />
                    Car Wash Services Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <CarWashServiceManager />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stock Movements Tab */}
            <TabsContent value="movements" className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  <CardTitle className="flex items-center">
                    <History className="h-6 w-6 mr-3" />
                    Recent Stock Movements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Item</TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">
                            Quantity
                          </TableHead>
                          <TableHead className="font-semibold">
                            Reason
                          </TableHead>
                          <TableHead className="font-semibold">
                            Performed By
                          </TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockMovements.slice(0, 20).map((movement) => {
                          const item = inventoryItems.find(
                            (i) => i.id === movement.itemId,
                          );
                          return (
                            <TableRow
                              key={movement.id}
                              className="hover:bg-gray-50"
                            >
                              <TableCell>
                                <div className="font-medium">
                                  {item ? item.name : movement.itemId}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    movement.type === "in"
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : movement.type === "out"
                                        ? "bg-red-100 text-red-800 border-red-300"
                                        : "bg-blue-100 text-blue-800 border-blue-300"
                                  }
                                >
                                  <div className="flex items-center">
                                    {movement.type === "in" && (
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                    )}
                                    {movement.type === "out" && (
                                      <TrendingDown className="h-3 w-3 mr-1" />
                                    )}
                                    {movement.type === "adjustment" && (
                                      <RefreshCw className="h-3 w-3 mr-1" />
                                    )}
                                    {movement.type.toUpperCase()}
                                  </div>
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {movement.quantity}
                              </TableCell>
                              <TableCell>{movement.reason}</TableCell>
                              <TableCell>{movement.performedBy}</TableCell>
                              <TableCell>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(
                                    movement.createdAt,
                                  ).toLocaleDateString()}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Suppliers Tab */}
            <TabsContent value="suppliers" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Suppliers Management
                  </h2>
                  <p className="text-gray-600">
                    Manage your supplier relationships and contacts
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddSupplierModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                  <Card
                    key={supplier.id}
                    className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-lg">
                            <Building className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {supplier.name}
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                              {supplier.contactPerson}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            supplier.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {supplier.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {supplier.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {supplier.email}
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {supplier.phone}
                        </div>
                      )}
                      {supplier.website && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 mr-2 text-gray-400" />
                          <a
                            href={supplier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {supplier.website}
                          </a>
                        </div>
                      )}
                      {supplier.address && (
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {supplier.address}
                          </span>
                        </div>
                      )}
                      {supplier.paymentTerms && (
                        <div className="pt-2 border-t">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">
                              Payment Terms:
                            </span>{" "}
                            {supplier.paymentTerms}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alert */}
                <Card className="border-l-4 border-l-yellow-500">
                  <CardHeader className="bg-yellow-50">
                    <CardTitle className="flex items-center text-yellow-800">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Low Stock Alert
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {lowStockItems.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                          <Package className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-gray-600 font-medium">
                          All products are well stocked!
                        </p>
                        <p className="text-gray-500 text-sm">
                          No items require immediate attention
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {lowStockItems.map((item) => {
                          const categoryInfo = getCategoryInfo(item.category);
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-8 h-8 rounded ${categoryInfo.color} flex items-center justify-center text-white text-xs`}
                                >
                                  {categoryInfo.icon}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {item.name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {categoryInfo.label}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className="bg-yellow-200 text-yellow-800"
                              >
                                {item.currentStock} left
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Out of Stock */}
                <Card className="border-l-4 border-l-red-500">
                  <CardHeader className="bg-red-50">
                    <CardTitle className="flex items-center text-red-800">
                      <TrendingDown className="h-5 w-5 mr-2" />
                      Out of Stock
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {inventoryItems.filter((item) => item.currentStock === 0)
                      .length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                          <Star className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-gray-600 font-medium">
                          No products out of stock
                        </p>
                        <p className="text-gray-500 text-sm">
                          Excellent inventory management!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inventoryItems
                          .filter((item) => item.currentStock === 0)
                          .map((item) => {
                            const categoryInfo = getCategoryInfo(item.category);
                            return (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-8 h-8 rounded ${categoryInfo.color} flex items-center justify-center text-white text-xs`}
                                  >
                                    {categoryInfo.icon}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {item.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {categoryInfo.label}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant="destructive"
                                  className="animate-pulse"
                                >
                                  Out of Stock
                                </Badge>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhanced Add Item Modal */}
        <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Add New Product
              </DialogTitle>
              <DialogDescription>
                Add a new product to your inventory with detailed information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="itemName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Product Name *
                  </Label>
                  <Input
                    id="itemName"
                    placeholder="Enter product name"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="category"
                    className="text-sm font-medium text-gray-700"
                  >
                    Category *
                  </Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) =>
                      setNewItem({ ...newItem, category: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center">
                            <span className="mr-2">{category.icon}</span>
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="currentStock"
                    className="text-sm font-medium text-gray-700"
                  >
                    Initial Stock
                  </Label>
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
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="minStock"
                    className="text-sm font-medium text-gray-700"
                  >
                    Min Stock Level
                  </Label>
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
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="maxStock"
                    className="text-sm font-medium text-gray-700"
                  >
                    Max Stock Level
                  </Label>
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
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="unitPrice"
                    className="text-sm font-medium text-gray-700"
                  >
                    Unit Price (₱)
                  </Label>
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
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="supplier"
                    className="text-sm font-medium text-gray-700"
                  >
                    Supplier
                  </Label>
                  <Input
                    id="supplier"
                    placeholder="Supplier name"
                    value={newItem.supplier}
                    onChange={(e) =>
                      setNewItem({ ...newItem, supplier: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="barcode"
                  className="text-sm font-medium text-gray-700"
                >
                  Barcode
                </Label>
                <Input
                  id="barcode"
                  placeholder="Product barcode"
                  value={newItem.barcode}
                  onChange={(e) =>
                    setNewItem({ ...newItem, barcode: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddItemModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddItem}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enhanced Add Supplier Modal */}
        <Dialog
          open={showAddSupplierModal}
          onOpenChange={setShowAddSupplierModal}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Add New Supplier
              </DialogTitle>
              <DialogDescription>
                Add a new supplier to your vendor database
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="supplierName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Supplier Name *
                  </Label>
                  <Input
                    id="supplierName"
                    placeholder="Company name"
                    value={newSupplier.name}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="contactPerson"
                    className="text-sm font-medium text-gray-700"
                  >
                    Contact Person *
                  </Label>
                  <Input
                    id="contactPerson"
                    placeholder="Primary contact name"
                    value={newSupplier.contactPerson}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        contactPerson: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="supplierEmail"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="supplierEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={newSupplier.email}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, email: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="supplierPhone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="supplierPhone"
                    placeholder="+63 xxx xxx xxxx"
                    value={newSupplier.phone}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, phone: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="supplierAddress"
                  className="text-sm font-medium text-gray-700"
                >
                  Address
                </Label>
                <Textarea
                  id="supplierAddress"
                  placeholder="Complete business address"
                  value={newSupplier.address}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, address: e.target.value })
                  }
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="website"
                    className="text-sm font-medium text-gray-700"
                  >
                    Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://example.com"
                    value={newSupplier.website}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        website: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="paymentTerms"
                    className="text-sm font-medium text-gray-700"
                  >
                    Payment Terms
                  </Label>
                  <Input
                    id="paymentTerms"
                    placeholder="Net 30"
                    value={newSupplier.paymentTerms}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        paymentTerms: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about this supplier"
                  value={newSupplier.notes}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, notes: e.target.value })
                  }
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddSupplierModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSupplier}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
