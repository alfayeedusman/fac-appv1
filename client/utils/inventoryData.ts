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
  type: "in" | "out" | "adjustment" | "transfer";
  quantity: number;
  reason: string;
  reference?: string; // PO number, sale ID, etc.
  previousStock: number;
  newStock: number;
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
  status: "active" | "inactive";
  createdDate: string;
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
    status: "active",
    createdDate: new Date().toISOString(),
  },
  {
    id: "SUP002",
    name: "DetailPro Supplies",
    contactPerson: "Maria Santos",
    email: "maria@detailpro.com",
    phone: "+63 918 234 5678",
    address: "456 Commerce St, Quezon City",
    status: "active",
    createdDate: new Date().toISOString(),
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
    type: "in",
    quantity: newProduct.currentStock,
    reason: "Initial stock",
    previousStock: 0,
    newStock: newProduct.currentStock,
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
      type: newStock > oldStock ? "in" : "out",
      quantity: Math.abs(newStock - oldStock),
      reason,
      previousStock: oldStock,
      newStock,
      performedBy: localStorage.getItem("userEmail") || "system",
    });
  }
};

export const getStockMovements = (): StockMovement[] => {
  const stored = localStorage.getItem("fac_stock_movements");
  return stored ? JSON.parse(stored) : [];
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
  supplierData: Omit<Supplier, "id" | "createdDate">,
): Supplier => {
  const suppliers = getSuppliers();

  const newSupplier: Supplier = {
    ...supplierData,
    id: `SUP${String(suppliers.length + 1).padStart(3, "0")}`,
    createdDate: new Date().toISOString(),
  };

  suppliers.push(newSupplier);
  localStorage.setItem("fac_suppliers", JSON.stringify(suppliers));
  return newSupplier;
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
