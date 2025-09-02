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
  TrendingUp,
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
  DollarSign,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
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
import SafeSelectItem from "@/components/SafeSelectItem";
import {
  getCarWashServices,
  addCarWashService,
  updateCarWashService,
  deleteCarWashService,
  vehicleTypes,
  motorcycleSubtypes,
  calculateServicePrice,
  CarWashService,
} from "@/utils/carWashServices";
import { notificationManager } from "@/components/NotificationModal";
import { neonDbClient } from "@/services/neonDatabaseService";

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
      id: "car_care",
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
      id: "chemicals",
      name: "Chemicals & Solutions",
      description: "Chemical products for cleaning and detailing",
      icon: "🧪",
      color: "#F59E0B",
      variants: [
        {
          id: "concentrated",
          name: "Concentrated",
          priceMultiplier: 1.5,
          description: "High-concentration formulas",
        },
        {
          id: "ready_to_use",
          name: "Ready-to-Use",
          priceMultiplier: 1.0,
          description: "Pre-diluted solutions",
        },
        {
          id: "eco_friendly",
          name: "Eco-Friendly",
          priceMultiplier: 1.2,
          description: "Environmentally safe formulas",
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
    {
      id: "parts",
      name: "Car Parts",
      description: "Vehicle parts and components",
      icon: "⚙️",
      color: "#EF4444",
      variants: [
        {
          id: "oem",
          name: "OEM",
          priceMultiplier: 1.5,
          description: "Original equipment manufacturer",
        },
        {
          id: "aftermarket",
          name: "Aftermarket",
          priceMultiplier: 1.0,
          description: "Third-party parts",
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

  const removeVariantFromCategory = (index: number) => {
    const updatedVariants = newCategory.variants.filter((_, i) => i !== index);
    setNewCategory({ ...newCategory, variants: updatedVariants });
  };

  const showServicePricing = (service: CarWashService) => {
    setSelectedService(service);
    setShowServicePricingModal(true);
  };

  // Product CRUD Functions
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.categoryId) {
      alert("Please fill in all required fields (Name and Category)");
      return;
    }

    try {
      if (editingProductId) {
        // Update existing product
        const updateData = {
          name: newProduct.name,
          category: categories.find(c => c.id === newProduct.categoryId)?.name || "Unknown",
          description: newProduct.description,
          sku: newProduct.sku || `SKU-${Date.now()}`,
          barcode: newProduct.barcode,
          currentStock: newProduct.currentStock,
          minStockLevel: newProduct.minStockLevel,
          maxStockLevel: newProduct.maxStockLevel,
          unitPrice: newProduct.unitPrice,
          costPrice: newProduct.costPrice,
          supplier: newProduct.supplier,
          location: newProduct.location,
          status: "active" as const,
        };

        const updatedProduct = updateProduct(editingProductId, updateData);
        if (updatedProduct) {
          // Refresh products from storage and convert to enhanced format
          const refreshedProducts = getProducts().map(product => ({
            ...product,
            categoryId: product.category,
            tags: [],
            images: [],
            specifications: {},
            isService: false,
          }));
          setProducts(refreshedProducts);

          notificationManager.showSuccess(
            "Product Updated!",
            `${updatedProduct.name} has been updated successfully.`
          );
        }
        setEditingProductId(null);
      } else {
        // Create new product using utility
        const productData = {
          name: newProduct.name,
          category: newProduct.categoryId as "car_care" | "accessories" | "tools" | "chemicals" | "parts",
          description: newProduct.description,
          sku: newProduct.sku || `SKU-${Date.now()}`,
          barcode: newProduct.barcode,
          currentStock: newProduct.currentStock,
          minStockLevel: newProduct.minStockLevel,
          maxStockLevel: newProduct.maxStockLevel,
          unitPrice: newProduct.unitPrice,
          costPrice: newProduct.costPrice,
          supplier: newProduct.supplier,
          location: newProduct.location,
        };

        const persistedProduct = addProduct(productData);

        // Refresh products from storage and convert to enhanced format
        const refreshedProducts = getProducts().map(product => ({
          ...product,
          categoryId: product.category,
          tags: [],
          images: [],
          specifications: {},
          isService: false,
        }));
        setProducts(refreshedProducts);

        notificationManager.showSuccess(
          "Product Created!",
          `${persistedProduct.name} has been added to inventory successfully.`
        );
      }

      // Clear form
      setNewProduct({
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

      setShowAddProductModal(false);

    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product. Please try again.");
    }
  };

  const handleEditProduct = (product: EnhancedProduct) => {
    setNewProduct({
      name: product.name,
      categoryId: product.categoryId,
      variantId: product.variantId || "",
      description: product.description || "",
      sku: product.sku,
      barcode: product.barcode || "",
      currentStock: product.currentStock,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      unitPrice: product.unitPrice || 0,
      costPrice: product.costPrice || 0,
      supplier: product.supplier || "",
      location: product.location || "",
      tags: product.tags.join(', '),
      specifications: JSON.stringify(product.specifications),
      isService: product.isService,
    });
    setShowAddProductModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== productId));
      notificationManager.showSuccess("Product Deleted", "Product removed from inventory.");
    }
  };

  const handleStockAdjustment = (productId: string, newStock: number, reason: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const updatedProducts = products.map(p =>
      p.id === productId
        ? { ...p, currentStock: newStock, updatedAt: new Date().toISOString() }
        : p
    );
    setProducts(updatedProducts);

    // Add stock movement record
    const movement: StockMovement = {
      id: `movement_${Date.now()}`,
      productId: productId,
      productName: product.name,
      type: newStock > product.currentStock ? "in" : "out",
      quantity: Math.abs(newStock - product.currentStock),
      reason: reason,
      performedBy: "Admin",
      timestamp: new Date().toISOString(),
      newBalance: newStock,
      notes: `Stock adjusted from ${product.currentStock} to ${newStock}`
    };

    setStockMovements([movement, ...stockMovements]);

    notificationManager.showSuccess(
      "Stock Updated",
      `${product.name} stock updated to ${newStock} units`
    );
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

  // Supplier Management Functions
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    notes: ""
  });
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.contactPerson) {
      alert("Please fill in required fields (Name and Contact Person)");
      return;
    }

    try {
      const supplier: Supplier = {
        id: `supplier_${Date.now()}`,
        name: newSupplier.name,
        contactPerson: newSupplier.contactPerson,
        email: newSupplier.email,
        phone: newSupplier.phone,
        address: newSupplier.address,
        website: newSupplier.website,
        notes: newSupplier.notes,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setSuppliers([...suppliers, supplier]);

      // Clear form
      setNewSupplier({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        website: "",
        notes: ""
      });

      setShowAddSupplierModal(false);

      notificationManager.showSuccess(
        "Supplier Added!",
        `${supplier.name} has been added to your supplier list.`
      );

    } catch (error) {
      console.error("Error adding supplier:", error);
      alert("Error adding supplier. Please try again.");
    }
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      setSuppliers(suppliers.filter((s) => s.id !== supplierId));
      notificationManager.showSuccess("Supplier Deleted", "Supplier removed from list.");
    }
  };

  // Analytics Functions
  const getInventoryAnalytics = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.currentStock * (p.costPrice || 0)), 0);
    const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel);
    const outOfStockProducts = products.filter(p => p.currentStock === 0);
    const topProducts = [...products]
      .sort((a, b) => (b.currentStock * (b.unitPrice || 0)) - (a.currentStock * (a.unitPrice || 0)))
      .slice(0, 5);

    const categoryBreakdown = categories.map(category => {
      const categoryProducts = products.filter(p => p.categoryId === category.id);
      const categoryValue = categoryProducts.reduce((sum, p) => sum + (p.currentStock * (p.costPrice || 0)), 0);
      return {
        category: category.name,
        count: categoryProducts.length,
        value: categoryValue,
        color: category.color
      };
    });

    return {
      totalProducts,
      totalValue,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts,
      outOfStockProducts,
      topProducts,
      categoryBreakdown,
      recentMovements: stockMovements.slice(0, 10)
    };
  };

  // Debug function to test database connection
  const handleDebugConnection = async () => {
    try {
      console.log('🔍 Starting database debug...');
      const debugResult = await neonDbClient.debugConnection();

      const message = `
Base URL: ${debugResult.baseUrl}
Connected: ${debugResult.isConnected}
Test: ${JSON.stringify(debugResult.testResults, null, 2)}
Init: ${JSON.stringify(debugResult.initResults, null, 2)}
      `;

      alert(`Database Debug Results:\n${message}`);
      console.log('🔍 Full debug result:', debugResult);
    } catch (error) {
      console.error('❌ Debug failed:', error);
      alert(`Debug failed: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
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
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SafeSelectItem key={category.id} value={category.id}>
                        {typeof category.icon === 'string' ? category.icon : '📦'} {category.name}
                      </SafeSelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => setShowAddProductModal(true)} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
                {import.meta.env.DEV && (
                  <Button
                    onClick={handleDebugConnection}
                    variant="outline"
                    size="sm"
                    className="hidden lg:flex"
                  >
                    🔍 Debug DB
                  </Button>
                )}
              </div>

              {/* Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Products Inventory</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="min-w-full">
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold">Product Categories</h2>
                <Button onClick={() => setShowAddCategoryModal(true)} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
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
                        <div className="flex gap-1 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showServicePricing(service)}
                            className="text-orange-500 hover:text-orange-600 p-1 min-w-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditService(service)}
                            className="text-blue-500 hover:text-blue-600 p-1 min-w-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-500 hover:text-red-600 p-1 min-w-0"
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
                          className="w-full text-sm"
                          onClick={() => showServicePricing(service)}
                        >
                          <Car className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">View Vehicle Pricing</span>
                          <span className="sm:hidden">Pricing</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

        {/* Other tabs remain the same... */}
        {/* Stock Movements Tab */}
        <TabsContent value="movements" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Stock Movements</h2>
              <p className="text-muted-foreground">Track all inventory movements and changes</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Stock Movements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stockMovements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No stock movements recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Performed By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="font-medium">
                            {movement.productName}
                          </TableCell>
                          <TableCell>
                            <Badge variant={movement.type === 'in' ? 'default' : 'destructive'}>
                              {movement.type === 'in' ? 'Stock In' : 'Stock Out'}
                            </Badge>
                          </TableCell>
                          <TableCell>{movement.quantity}</TableCell>
                          <TableCell>{movement.reason}</TableCell>
                          <TableCell>
                            {new Date(movement.timestamp).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{movement.performedBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Suppliers</h2>
              <p className="text-muted-foreground">Manage your supplier network</p>
            </div>
            <Button onClick={() => setShowAddSupplierModal(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-500" />
                      <span className="truncate">{supplier.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{supplier.contactPerson}</span>
                  </div>
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer"
                         className="text-blue-500 hover:underline truncate">
                        Website
                      </a>
                    </div>
                  )}
                  {supplier.notes && (
                    <div className="text-sm text-muted-foreground mt-2">
                      <p className="line-clamp-2">{supplier.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {suppliers.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers yet</h3>
                <p className="text-gray-500 mb-4">Start by adding your first supplier to track your supply chain.</p>
                <Button onClick={() => setShowAddSupplierModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Supplier
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Inventory Analytics</h2>
            <p className="text-muted-foreground">Comprehensive inventory insights and reports</p>
          </div>

          {(() => {
            const analytics = getInventoryAnalytics();
            return (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Package className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">{analytics.totalProducts}</p>
                          <p className="text-sm text-muted-foreground">Total Products</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold">₱{analytics.totalValue.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Inventory Value</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-8 w-8 text-orange-500" />
                        <div>
                          <p className="text-2xl font-bold">{analytics.lowStockCount}</p>
                          <p className="text-sm text-muted-foreground">Low Stock Items</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="text-2xl font-bold">{analytics.outOfStockCount}</p>
                          <p className="text-sm text-muted-foreground">Out of Stock</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Category Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.categoryBreakdown.map((cat) => (
                        <div key={cat.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: cat.color }}
                            ></div>
                            <span className="font-medium">{cat.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{cat.count} products</div>
                            <div className="text-sm text-muted-foreground">₱{cat.value.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Low Stock Alert */}
                {analytics.lowStockProducts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-5 w-5" />
                        Low Stock Alert
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Current Stock</TableHead>
                              <TableHead>Min Level</TableHead>
                              <TableHead>Action Needed</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analytics.lowStockProducts.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>
                                  <Badge variant="destructive">{product.currentStock}</Badge>
                                </TableCell>
                                <TableCell>{product.minStockLevel}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">Reorder Soon</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Products by Value */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Top Products by Inventory Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.currentStock} units</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">₱{((product.costPrice || 0) * product.currentStock).toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">@₱{product.costPrice || 0} each</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>

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

      {/* Add Product Modal */}
      <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory with complete details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  placeholder="Car Shampoo Premium"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="productCategory">Category *</Label>
                <Select
                  value={newProduct.categoryId}
                  onValueChange={(value) =>
                    setNewProduct({ ...newProduct, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SafeSelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SafeSelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newProduct.categoryId && (
              <div>
                <Label htmlFor="productVariant">Variant</Label>
                <Select
                  value={newProduct.variantId}
                  onValueChange={(value) =>
                    setNewProduct({ ...newProduct, variantId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select variant (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .find((c) => c.id === newProduct.categoryId)
                      ?.variants?.map((variant) => (
                        <SafeSelectItem key={variant.id} value={variant.id}>
                          {variant.name} (×{variant.priceMultiplier})
                        </SafeSelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="productDescription">Description</Label>
              <Textarea
                id="productDescription"
                placeholder="Product description and features"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productSku">SKU</Label>
                <Input
                  id="productSku"
                  placeholder="SKU-001"
                  value={newProduct.sku}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, sku: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="productBarcode">Barcode</Label>
                <Input
                  id="productBarcode"
                  placeholder="1234567890123"
                  value={newProduct.barcode}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, barcode: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
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
                <Label htmlFor="minStock">Min Stock Level</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
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
                <Label htmlFor="maxStock">Max Stock Level</Label>
                <Input
                  id="maxStock"
                  type="number"
                  min="0"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitPrice">Unit Price (₱)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.unitPrice}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      unitPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="costPrice">Cost Price (₱)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.costPrice}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      costPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="Supplier name"
                  value={newProduct.supplier}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, supplier: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  placeholder="Warehouse A, Shelf 1"
                  value={newProduct.location}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, location: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="premium, car care, cleaning"
                value={newProduct.tags}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, tags: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="specifications">Specifications (JSON format)</Label>
              <Textarea
                id="specifications"
                placeholder='{"volume": "500ml", "ph": "7.0"}'
                value={newProduct.specifications}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, specifications: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddProductModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Supplier Modal */}
      <Dialog open={showAddSupplierModal} onOpenChange={setShowAddSupplierModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier to your supplier database
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="supplierName">Supplier Name *</Label>
              <Input
                id="supplierName"
                placeholder="ABC Supply Co."
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
                placeholder="John Smith"
                value={newSupplier.contactPerson}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, contactPerson: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplierEmail">Email</Label>
                <Input
                  id="supplierEmail"
                  type="email"
                  placeholder="contact@abcsupply.com"
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
                  placeholder="+63 912 345 6789"
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

            <div>
              <Label htmlFor="supplierWebsite">Website</Label>
              <Input
                id="supplierWebsite"
                placeholder="https://www.abcsupply.com"
                value={newSupplier.website}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, website: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="supplierNotes">Notes</Label>
              <Textarea
                id="supplierNotes"
                placeholder="Additional notes about this supplier"
                value={newSupplier.notes}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, notes: e.target.value })
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
            <Button onClick={handleAddSupplier}>
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
