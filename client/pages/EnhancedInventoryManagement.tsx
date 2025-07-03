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
  Bike,
  Settings,
  Trash2,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StickyHeader from "@/components/StickyHeader";
import AdminSidebar from "@/components/AdminSidebar";
import CarWashServiceManager from "@/components/CarWashServiceManager";
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
import {
  getCarWashServices,
  vehicleTypes,
  motorcycleSubtypes,
  calculateServicePrice,
  CarWashService,
} from "@/utils/carWashServices";
import { notificationManager } from "@/components/NotificationModal";

// Enhanced category system
interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  variants?: CategoryVariant[];
  isActive: boolean;
}

interface CategoryVariant {
  id: string;
  name: string;
  priceMultiplier: number;
  description: string;
}

// Enhanced product interface
interface EnhancedProduct extends Product {
  categoryId: string;
  variantId?: string;
  tags: string[];
  images: string[];
  specifications: Record<string, string>;
  isService: boolean;
}

export default function EnhancedInventoryManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<EnhancedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnhancedProduct[]>(
    [],
  );
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [carWashServices, setCarWashServices] = useState<CarWashService[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showServicePricingModal, setShowServicePricingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<CarWashService | null>(
    null,
  );
  const [editingCategory, setEditingCategory] =
    useState<ProductCategory | null>(null);
  const [editingService, setEditingService] = useState<CarWashService | null>(
    null,
  );
  const [serviceModalMode, setServiceModalMode] = useState<"add" | "edit">(
    "add",
  );

  const [newProduct, setNewProduct] = useState({
    name: "",
    categoryId: "",
    variantId: "",
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
    tags: "",
    specifications: "",
    isService: false,
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    icon: "📦",
    color: "#3B82F6",
    variants: [] as CategoryVariant[],
  });

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    basePrice: 200,
    duration: "30 mins",
    features: [""],
    category: "basic" as CarWashService["category"],
    isActive: true,
  });

  // Default categories with variants
  const defaultCategories: ProductCategory[] = [
    {
      id: "car_care_products",
      name: "Car Care Products",
      description: "Cleaning and maintenance products",
      icon: "🧴",
      color: "#3B82F6",
      variants: [
        {
          id: "premium",
          name: "Premium",
          priceMultiplier: 1.3,
          description: "High-end products",
        },
        {
          id: "standard",
          name: "Standard",
          priceMultiplier: 1.0,
          description: "Regular products",
        },
        {
          id: "economy",
          name: "Economy",
          priceMultiplier: 0.8,
          description: "Budget-friendly",
        },
      ],
      isActive: true,
    },
    {
      id: "car_wash_services",
      name: "Car Wash Services",
      description: "Vehicle cleaning services with dynamic pricing",
      icon: "🚗",
      color: "#F59E0B",
      variants: [
        {
          id: "sedan",
          name: "Sedan",
          priceMultiplier: 1.0,
          description: "Standard cars",
        },
        {
          id: "suv",
          name: "SUV",
          priceMultiplier: 1.3,
          description: "Sport utility vehicles",
        },
        {
          id: "van",
          name: "Van",
          priceMultiplier: 1.5,
          description: "Large vehicles",
        },
        {
          id: "pickup",
          name: "Pick-up",
          priceMultiplier: 1.4,
          description: "Pickup trucks",
        },
        {
          id: "motorcycle",
          name: "Motorcycle",
          priceMultiplier: 0.6,
          description: "Two-wheelers",
        },
      ],
      isActive: true,
    },
    {
      id: "accessories",
      name: "Car Accessories",
      description: "Vehicle accessories and parts",
      icon: "🔧",
      color: "#8B5CF6",
      variants: [
        {
          id: "interior",
          name: "Interior",
          priceMultiplier: 1.0,
          description: "Interior accessories",
        },
        {
          id: "exterior",
          name: "Exterior",
          priceMultiplier: 1.2,
          description: "Exterior accessories",
        },
        {
          id: "performance",
          name: "Performance",
          priceMultiplier: 1.5,
          description: "Performance parts",
        },
      ],
      isActive: true,
    },
    {
      id: "tools",
      name: "Tools & Equipment",
      description: "Professional cleaning tools",
      icon: "🛠️",
      color: "#10B981",
      variants: [
        {
          id: "manual",
          name: "Manual",
          priceMultiplier: 1.0,
          description: "Hand tools",
        },
        {
          id: "electric",
          name: "Electric",
          priceMultiplier: 1.8,
          description: "Electric tools",
        },
        {
          id: "pneumatic",
          name: "Pneumatic",
          priceMultiplier: 2.0,
          description: "Air-powered tools",
        },
      ],
      isActive: true,
    },
  ];

  useEffect(() => {
    loadData();
    initializeCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const initializeCategories = () => {
    const stored = localStorage.getItem("fac_product_categories");
    if (!stored) {
      localStorage.setItem(
        "fac_product_categories",
        JSON.stringify(defaultCategories),
      );
      setCategories(defaultCategories);
    } else {
      setCategories(JSON.parse(stored));
    }
  };

  const loadData = () => {
    // Load regular products and convert to enhanced format
    const regularProducts = getProducts();
    const enhancedProducts: EnhancedProduct[] = regularProducts.map(
      (product) => ({
        ...product,
        categoryId: product.category,
        tags: [],
        images: [],
        specifications: {},
        isService: false,
      }),
    );
    setProducts(enhancedProducts);

    // Load car wash services
    setCarWashServices(getCarWashServices());
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
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleAddCategory = () => {
    if (!newCategory.name) {
      notificationManager.error(
        "Missing Information",
        "Please enter category name",
      );
      return;
    }

    const category: ProductCategory = {
      id: newCategory.name.toLowerCase().replace(/\s+/g, "_"),
      name: newCategory.name,
      description: newCategory.description,
      icon: newCategory.icon,
      color: newCategory.color,
      variants: newCategory.variants,
      isActive: true,
    };

    const updatedCategories = [...categories, category];
    setCategories(updatedCategories);
    localStorage.setItem(
      "fac_product_categories",
      JSON.stringify(updatedCategories),
    );

    notificationManager.success(
      "Category Added",
      `${newCategory.name} category created`,
    );

    setNewCategory({
      name: "",
      description: "",
      icon: "📦",
      color: "#3B82F6",
      variants: [],
    });
    setShowAddCategoryModal(false);
  };

  const addVariantToNewCategory = () => {
    setNewCategory({
      ...newCategory,
      variants: [
        ...newCategory.variants,
        {
          id: `variant_${newCategory.variants.length + 1}`,
          name: "",
          priceMultiplier: 1.0,
          description: "",
        },
      ],
    });
  };

  const updateCategoryVariant = (
    index: number,
    field: keyof CategoryVariant,
    value: any,
  ) => {
    const updatedVariants = [...newCategory.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setNewCategory({ ...newCategory, variants: updatedVariants });
  };

  const showServicePricing = (service: CarWashService) => {
    setSelectedService(service);
    setShowServicePricingModal(true);
  };

  // Category CRUD Functions
  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.description) {
      alert("Please fill in all required fields");
      return;
    }

    const category: ProductCategory = {
      id: `category_${Date.now()}`,
      name: newCategory.name,
      description: newCategory.description,
      icon: newCategory.icon,
      color: newCategory.color,
      variants: newCategory.variants,
      isActive: true,
    };

    setCategories([...categories, category]);
    setNewCategory({
      name: "",
      description: "",
      icon: "📦",
      color: "#3B82F6",
      variants: [],
    });
    setShowAddCategoryModal(false);
    alert("Category created successfully!");
  };

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      variants: [...(category.variants || [])],
    });
    setShowEditCategoryModal(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategory.name || !newCategory.description) {
      alert("Please fill in all required fields");
      return;
    }

    const updatedCategory: ProductCategory = {
      ...editingCategory,
      name: newCategory.name,
      description: newCategory.description,
      icon: newCategory.icon,
      color: newCategory.color,
      variants: newCategory.variants,
    };

    setCategories(
      categories.map((c) =>
        c.id === editingCategory.id ? updatedCategory : c,
      ),
    );
    setNewCategory({
      name: "",
      description: "",
      icon: "📦",
      color: "#3B82F6",
      variants: [],
    });
    setEditingCategory(null);
    setShowEditCategoryModal(false);
    alert("Category updated successfully!");
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter((c) => c.id !== categoryId));
      alert("Category deleted successfully!");
    }
  };

  // Service CRUD Functions
  const handleAddService = () => {
    if (!newService.name || !newService.description) {
      alert("Please fill in all required fields");
      return;
    }

    const filteredFeatures = newService.features.filter((f) => f.trim() !== "");
    if (filteredFeatures.length === 0) {
      alert("Please add at least one feature");
      return;
    }

    try {
      const service = addCarWashService({
        ...newService,
        features: filteredFeatures,
      });

      setCarWashServices([...carWashServices, service]);
      setNewService({
        name: "",
        description: "",
        basePrice: 200,
        duration: "30 mins",
        features: [""],
        category: "basic",
        isActive: true,
      });
      setShowServiceModal(false);
      alert("Service added successfully!");
    } catch (error) {
      alert("Failed to add service");
    }
  };

  const handleEditService = (service: CarWashService) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      description: service.description,
      basePrice: service.basePrice,
      duration: service.duration,
      features: [...service.features],
      category: service.category,
      isActive: service.isActive,
    });
    setServiceModalMode("edit");
    setShowServiceModal(true);
  };

  const handleUpdateService = () => {
    if (!editingService || !newService.name || !newService.description) {
      alert("Please fill in all required fields");
      return;
    }

    const filteredFeatures = newService.features.filter((f) => f.trim() !== "");
    if (filteredFeatures.length === 0) {
      alert("Please add at least one feature");
      return;
    }

    try {
      updateCarWashService(editingService.id, {
        ...newService,
        features: filteredFeatures,
      });

      setCarWashServices(
        carWashServices.map((s) =>
          s.id === editingService.id
            ? { ...s, ...newService, features: filteredFeatures }
            : s,
        ),
      );

      setNewService({
        name: "",
        description: "",
        basePrice: 200,
        duration: "30 mins",
        features: [""],
        category: "basic",
        isActive: true,
      });
      setEditingService(null);
      setServiceModalMode("add");
      setShowServiceModal(false);
      alert("Service updated successfully!");
    } catch (error) {
      alert("Failed to update service");
    }
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        deleteCarWashService(serviceId);
        setCarWashServices(carWashServices.filter((s) => s.id !== serviceId));
        alert("Service deleted successfully!");
      } catch (error) {
        alert("Failed to delete service");
      }
    }
  };

  // Helper functions for service features
  const addServiceFeature = () => {
    setNewService({
      ...newService,
      features: [...newService.features, ""],
    });
  };

  const updateServiceFeature = (index: number, value: string) => {
    const updatedFeatures = [...newService.features];
    updatedFeatures[index] = value;
    setNewService({
      ...newService,
      features: updatedFeatures,
    });
  };

  const removeServiceFeature = (index: number) => {
    if (newService.features.length > 1) {
      const updatedFeatures = newService.features.filter((_, i) => i !== index);
      setNewService({
        ...newService,
        features: updatedFeatures,
      });
    }
  };

  const getVariantDisplay = (categoryId: string, variantId?: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || !variantId) return "";

    const variant = category.variants?.find((v) => v.id === variantId);
    return variant ? ` (${variant.name})` : "";
  };

  const calculateVariantPrice = (
    basePrice: number,
    categoryId: string,
    variantId?: string,
  ) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || !variantId) return basePrice;

    const variant = category.variants?.find((v) => v.id === variantId);
    return variant ? basePrice * variant.priceMultiplier : basePrice;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <StickyHeader showBack={false} title="Enhanced Inventory" />

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

      <div className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 mt-16">
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
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
                      <Car className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {carWashServices.length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Car Services
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {categories.length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Categories
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
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
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
                        <TableHead>Category</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        const category = categories.find(
                          (c) => c.id === product.categoryId,
                        );
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {product.description}
                                  {getVariantDisplay(
                                    product.categoryId,
                                    product.variantId,
                                  )}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                style={{
                                  backgroundColor: category?.color,
                                  color: "white",
                                }}
                              >
                                {category?.icon} {category?.name || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono">
                              {product.sku}
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
                            <TableCell>
                              ₱
                              {calculateVariantPrice(
                                product.unitPrice,
                                product.categoryId,
                                product.variantId,
                              ).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  product.currentStock <= product.minStockLevel
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {product.currentStock <= product.minStockLevel
                                  ? "Low Stock"
                                  : "In Stock"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Product Categories</h2>
                <Button onClick={() => setShowAddCategoryModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span style={{ color: category.color }}>
                          {category.icon} {category.name}
                        </span>
                        <div className="flex gap-2 items-center">
                          <Badge variant="outline">
                            {category.variants?.length || 0} variants
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                              className="text-blue-500 hover:text-blue-600 p-1"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-500 hover:text-red-600 p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      {category.variants && category.variants.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Variants:</p>
                          {category.variants.map((variant) => (
                            <div
                              key={variant.id}
                              className="flex justify-between items-center text-sm"
                            >
                              <span>{variant.name}</span>
                              <Badge variant="secondary">
                                {variant.priceMultiplier}x
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Car Wash Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Car Wash Services
                  </h2>
                  <p className="text-gray-600">
                    Dynamic pricing based on vehicle type - Perfect for POS
                    integration
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setNewService({
                      name: "",
                      description: "",
                      basePrice: 200,
                      duration: "30 mins",
                      features: [""],
                      category: "basic",
                      isActive: true,
                    });
                    setServiceModalMode("add");
                    setShowServiceModal(true);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {carWashServices.map((service) => (
                  <Card
                    key={service.id}
                    className="bg-white border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-gray-900 text-lg">
                            {service.name}
                          </CardTitle>
                          <Badge
                            className={
                              service.category === "basic"
                                ? "bg-blue-100 text-blue-700"
                                : service.category === "premium"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-purple-100 text-purple-700"
                            }
                          >
                            {service.category}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showServicePricing(service)}
                            className="text-orange-500 hover:text-orange-600 p-1"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditService(service)}
                            className="text-blue-500 hover:text-blue-600 p-1"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Base Price:
                          </span>
                          <span className="text-lg font-bold text-orange-600">
                            ₱{service.basePrice}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Duration:</span>
                          <span className="text-sm">{service.duration}</span>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => showServicePricing(service)}
                        >
                          <Car className="h-4 w-4 mr-2" />
                          View Vehicle Pricing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Other tabs remain the same... */}
            <TabsContent value="movements">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Movements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Stock movement tracking will be displayed here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suppliers">
              <Card>
                <CardHeader>
                  <CardTitle>Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Supplier management will be displayed here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Analytics and reports will be displayed here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Category Modal */}
      <Dialog
        open={showAddCategoryModal}
        onOpenChange={setShowAddCategoryModal}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new product category with variants
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="Car Care Products"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                placeholder="Description of the category"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryIcon">Icon (Emoji)</Label>
                <Input
                  id="categoryIcon"
                  placeholder="📦"
                  value={newCategory.icon}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, icon: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="categoryColor">Color</Label>
                <Input
                  id="categoryColor"
                  type="color"
                  value={newCategory.color}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, color: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Variants (Price Multipliers)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVariantToNewCategory}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variant
                </Button>
              </div>

              {newCategory.variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2 p-3 border rounded"
                >
                  <Input
                    placeholder="Variant name"
                    value={variant.name}
                    onChange={(e) =>
                      updateCategoryVariant(index, "name", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="1.0"
                    value={variant.priceMultiplier}
                    onChange={(e) =>
                      updateCategoryVariant(
                        index,
                        "priceMultiplier",
                        parseFloat(e.target.value) || 1.0,
                      )
                    }
                  />
                  <Input
                    placeholder="Description"
                    value={variant.description}
                    onChange={(e) =>
                      updateCategoryVariant(
                        index,
                        "description",
                        e.target.value,
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddCategoryModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              <Save className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Pricing Modal */}
      <Dialog
        open={showServicePricingModal}
        onOpenChange={setShowServicePricingModal}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedService?.name} - Vehicle Pricing</DialogTitle>
            <DialogDescription>
              Base price: ₱{selectedService?.basePrice} - Prices calculated with
              vehicle multipliers
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle Type</TableHead>
                    <TableHead>Subtype</TableHead>
                    <TableHead>Final Price</TableHead>
                    <TableHead>Multiplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleTypes.map((vehicleType) => {
                    if (vehicleType.category === "motorcycle") {
                      return motorcycleSubtypes.map((subtype) => {
                        const finalPrice = calculateServicePrice(
                          selectedService.basePrice,
                          vehicleType.id,
                          subtype.id,
                        );
                        return (
                          <TableRow key={`${vehicleType.id}-${subtype.id}`}>
                            <TableCell>
                              <div className="flex items-center">
                                <Bike className="h-4 w-4 mr-2 text-orange-500" />
                                {vehicleType.name}
                              </div>
                            </TableCell>
                            <TableCell>{subtype.name}</TableCell>
                            <TableCell className="font-bold text-orange-600">
                              ₱{finalPrice}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {(
                                  vehicleType.multiplier * subtype.multiplier
                                ).toFixed(1)}
                                x
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      });
                    } else {
                      const finalPrice = calculateServicePrice(
                        selectedService.basePrice,
                        vehicleType.id,
                      );
                      return (
                        <TableRow key={vehicleType.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Car className="h-4 w-4 mr-2 text-blue-500" />
                              {vehicleType.name}
                            </div>
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell className="font-bold text-orange-600">
                            ₱{finalPrice}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {vehicleType.multiplier}x
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowServicePricingModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog
        open={showEditCategoryModal}
        onOpenChange={setShowEditCategoryModal}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category details and variants
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="editCategoryName">Category Name</Label>
              <Input
                id="editCategoryName"
                placeholder="Car Care Products"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="editCategoryDescription">Description</Label>
              <Textarea
                id="editCategoryDescription"
                placeholder="Description of the category"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCategoryIcon">Icon (Emoji)</Label>
                <Input
                  id="editCategoryIcon"
                  placeholder="📦"
                  value={newCategory.icon}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, icon: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editCategoryColor">Color</Label>
                <Input
                  id="editCategoryColor"
                  type="color"
                  value={newCategory.color}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, color: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Variants (Price Multipliers)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVariantToNewCategory}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variant
                </Button>
              </div>

              {newCategory.variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2 p-3 border rounded"
                >
                  <Input
                    placeholder="Variant name"
                    value={variant.name}
                    onChange={(e) =>
                      updateCategoryVariant(index, "name", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="1.0"
                    value={variant.priceMultiplier}
                    onChange={(e) =>
                      updateCategoryVariant(
                        index,
                        "priceMultiplier",
                        parseFloat(e.target.value) || 1.0,
                      )
                    }
                  />
                  <Input
                    placeholder="Description"
                    value={variant.description}
                    onChange={(e) =>
                      updateCategoryVariant(
                        index,
                        "description",
                        e.target.value,
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditCategoryModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Modal (Add/Edit) */}
      <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {serviceModalMode === "add" ? "Add New Service" : "Edit Service"}
            </DialogTitle>
            <DialogDescription>
              {serviceModalMode === "add"
                ? "Create a new car wash service with dynamic pricing"
                : "Update service details and pricing"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                placeholder="Classic Wash"
                value={newService.name}
                onChange={(e) =>
                  setNewService({ ...newService, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="serviceDescription">Description</Label>
              <Textarea
                id="serviceDescription"
                placeholder="Basic exterior cleaning with quality optimization"
                value={newService.description}
                onChange={(e) =>
                  setNewService({ ...newService, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceBasePrice">Base Price (₱)</Label>
                <Input
                  id="serviceBasePrice"
                  type="number"
                  value={newService.basePrice}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      basePrice: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="serviceDuration">Duration</Label>
                <Input
                  id="serviceDuration"
                  placeholder="30 mins"
                  value={newService.duration}
                  onChange={(e) =>
                    setNewService({ ...newService, duration: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="serviceCategory">Category</Label>
              <Select
                value={newService.category}
                onValueChange={(value: any) =>
                  setNewService({ ...newService, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Features</Label>
              <div className="space-y-2">
                {newService.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Professional wash system"
                      value={feature}
                      onChange={(e) =>
                        updateServiceFeature(index, e.target.value)
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeServiceFeature(index)}
                      disabled={newService.features.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addServiceFeature}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="serviceActive"
                checked={newService.isActive}
                onChange={(e) =>
                  setNewService({ ...newService, isActive: e.target.checked })
                }
              />
              <Label htmlFor="serviceActive">Service is active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowServiceModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={
                serviceModalMode === "add"
                  ? handleAddService
                  : handleUpdateService
              }
            >
              {serviceModalMode === "add" ? "Add Service" : "Update Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
