export interface Product {
  id: string;
  name: string;
  category: "car_care" | "accessories" | "tools" | "chemicals" | "parts";
  description: string;
  sku: string;
  barcode?: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  costPrice: number;
  supplier: string;
  location: string;
  status: "active" | "discontinued" | "out_of_stock";
  lastUpdated: string;
  createdDate: string;
  imageUrl?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: "in" | "out" | "adjustment" | "transfer";
  quantity: number;
  reason: string;
  reference?: string; // PO number, sale ID, etc.
  previousStock?: number;
  newBalance: number;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Sample products for demo
const sampleProducts: Product[] = [
  {
    id: "PRD001",
    name: "Car Shampoo Premium",
    category: "car_care",
    description: "High-quality car washing shampoo for premium service",
    sku: "CS-PREM-001",
    barcode: "1234567890123",
    currentStock: 25,
    minStockLevel: 10,
    maxStockLevel: 100,
    unitPrice: 350.0,
    costPrice: 200.0,
    supplier: "AutoCare Supplies Inc.",
    location: "A1-B2",
    status: "active",
    lastUpdated: new Date().toISOString(),
    createdDate: new Date().toISOString(),
    imageUrl: "",
  },
  {
    id: "PRD002",
    name: "Microfiber Towel Set",
    category: "accessories",
    description: "Professional grade microfiber towels for detailing",
    sku: "MF-TOWEL-SET",
    currentStock: 15,
    minStockLevel: 5,
    maxStockLevel: 50,
    unitPrice: 450.0,
    costPrice: 250.0,
    supplier: "DetailPro Supplies",
    location: "B2-C1",
    status: "active",
    lastUpdated: new Date().toISOString(),
    createdDate: new Date().toISOString(),
  },
  {
    id: "PRD003",
    name: "Tire Shine Spray",
    category: "chemicals",
    description: "Professional tire shine for that perfect finish",
    sku: "TS-SPRAY-500",
    currentStock: 8,
    minStockLevel: 10,
    maxStockLevel: 40,
    unitPrice: 280.0,
    costPrice: 150.0,
    supplier: "ChemClean Solutions",
    location: "C1-D2",
    status: "active",
    lastUpdated: new Date().toISOString(),
    createdDate: new Date().toISOString(),
  },
];

const sampleSuppliers: Supplier[] = [
  {
    id: "SUP001",
    name: "AutoCare Supplies Inc.",
    contactPerson: "John Martinez",
    email: "john@autocaresupplies.com",
    phone: "+63 917 123 4567",
    address: "123 Industrial Ave, Makati City",
    website: "https://www.autocaresupplies.com",
    notes: "Premium car care products supplier. Reliable delivery.",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "SUP002",
    name: "DetailPro Supplies",
    contactPerson: "Maria Santos",
    email: "maria@detailpro.com",
    phone: "+63 918 234 5678",
    address: "456 Commerce St, Quezon City",
    website: "https://www.detailpro.com",
    notes: "Professional detailing tools and accessories.",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "SUP003",
    name: "ChemClean Solutions",
    contactPerson: "Roberto Cruz",
    email: "roberto@chemclean.com",
    phone: "+63 919 345 6789",
    address: "789 Chemical Drive, Pasig City",
    website: "https://www.chemclean.com",
    notes: "Chemical solutions and professional-grade cleaners.",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem("fac_inventory_products");
  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem(
    "fac_inventory_products",
    JSON.stringify(sampleProducts),
  );
  return sampleProducts;
};

export const addProduct = (
  productData: Omit<Product, "id" | "createdDate" | "lastUpdated">,
): Product => {
  const products = getProducts();

  const newProduct: Product = {
    ...productData,
    id: `PRD${String(products.length + 1).padStart(3, "0")}`,
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };

  products.push(newProduct);
  localStorage.setItem("fac_inventory_products", JSON.stringify(products));

  // Log stock movement
  addStockMovement({
    productId: newProduct.id,
    productName: newProduct.name,
    type: "in",
    quantity: newProduct.currentStock,
    reason: "Initial stock",
    previousStock: 0,
    newBalance: newProduct.currentStock,
    performedBy: localStorage.getItem("userEmail") || "system",
    notes: "Product added to inventory",
  });

  return newProduct;
};

export const updateProductStock = (
  productId: string,
  newStock: number,
  reason: string,
): void => {
  const products = getProducts();
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex !== -1) {
    const oldStock = products[productIndex].currentStock;
    products[productIndex].currentStock = newStock;
    products[productIndex].lastUpdated = new Date().toISOString();

    // Update status based on stock level
    if (newStock === 0) {
      products[productIndex].status = "out_of_stock";
    } else if (
      products[productIndex].status === "out_of_stock" &&
      newStock > 0
    ) {
      products[productIndex].status = "active";
    }

    localStorage.setItem("fac_inventory_products", JSON.stringify(products));

    // Log stock movement
    addStockMovement({
      productId,
      productName: products[productIndex].name,
      type: newStock > oldStock ? "in" : "out",
      quantity: Math.abs(newStock - oldStock),
      reason,
      previousStock: oldStock,
      newBalance: newStock,
      performedBy: localStorage.getItem("userEmail") || "system",
    });
  }
};

// Sample stock movements
const sampleStockMovements: StockMovement[] = [
  {
    id: "STK001",
    productId: "PRD001",
    productName: "Car Shampoo Premium",
    type: "in",
    quantity: 50,
    reason: "Initial stock",
    newBalance: 25,
    performedBy: "Admin",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    notes: "First stock delivery"
  },
  {
    id: "STK002",
    productId: "PRD002",
    productName: "Microfiber Towel Set",
    type: "in",
    quantity: 30,
    reason: "Restock",
    newBalance: 15,
    performedBy: "Manager",
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    notes: "Regular restock from supplier"
  },
  {
    id: "STK003",
    productId: "PRD001",
    productName: "Car Shampoo Premium",
    type: "out",
    quantity: 25,
    reason: "Daily usage",
    newBalance: 25,
    performedBy: "Staff",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    notes: "Used for service operations"
  }
];

export const getStockMovements = (): StockMovement[] => {
  const stored = localStorage.getItem("fac_stock_movements");
  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem("fac_stock_movements", JSON.stringify(sampleStockMovements));
  return sampleStockMovements;
};

export const addStockMovement = (
  movementData: Omit<StockMovement, "id" | "timestamp">,
): StockMovement => {
  const movements = getStockMovements();

  const newMovement: StockMovement = {
    ...movementData,
    id: `STK${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  movements.unshift(newMovement);

  // Keep only last 1000 movements
  if (movements.length > 1000) {
    movements.splice(1000);
  }

  localStorage.setItem("fac_stock_movements", JSON.stringify(movements));
  return newMovement;
};

export const getSuppliers = (): Supplier[] => {
  const stored = localStorage.getItem("fac_suppliers");
  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem("fac_suppliers", JSON.stringify(sampleSuppliers));
  return sampleSuppliers;
};

export const addSupplier = (
  supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
): Supplier => {
  const suppliers = getSuppliers();

  const newSupplier: Supplier = {
    ...supplierData,
    id: `SUP${String(suppliers.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  suppliers.push(newSupplier);
  localStorage.setItem("fac_suppliers", JSON.stringify(suppliers));
  return newSupplier;
};

export const updateProduct = (
  productId: string,
  updates: Partial<Omit<Product, "id" | "createdDate">>,
): Product | null => {
  const products = getProducts();
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    return null;
  }

  const updatedProduct: Product = {
    ...products[productIndex],
    ...updates,
    lastUpdated: new Date().toISOString(),
  };

  products[productIndex] = updatedProduct;
  localStorage.setItem("fac_inventory_products", JSON.stringify(products));
  return updatedProduct;
};

export const deleteProduct = (productId: string): boolean => {
  const products = getProducts();
  const initialLength = products.length;
  const filteredProducts = products.filter((p) => p.id !== productId);

  if (filteredProducts.length === initialLength) {
    return false; // Product not found
  }

  localStorage.setItem("fac_inventory_products", JSON.stringify(filteredProducts));
  return true;
};

export const deleteSupplier = (supplierId: string): boolean => {
  const suppliers = getSuppliers();
  const initialLength = suppliers.length;
  const filteredSuppliers = suppliers.filter((s) => s.id !== supplierId);

  if (filteredSuppliers.length === initialLength) {
    return false; // Supplier not found
  }

  localStorage.setItem("fac_suppliers", JSON.stringify(filteredSuppliers));
  return true;
};

export const getLowStockProducts = (): Product[] => {
  const products = getProducts();
  return products.filter(
    (p) => p.currentStock <= p.minStockLevel && p.status === "active",
  );
};

export const getOutOfStockProducts = (): Product[] => {
  const products = getProducts();
  return products.filter(
    (p) => p.currentStock === 0 || p.status === "out_of_stock",
  );
};

export const searchProducts = (query: string): Product[] => {
  const products = getProducts();
  const searchTerm = query.toLowerCase();

  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.sku.toLowerCase().includes(searchTerm) ||
      p.barcode?.includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm),
  );
};
