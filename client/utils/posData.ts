import { updateProductStock } from "./inventoryData";

export interface POSItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discount?: number;
}

export interface POSTransaction {
  id: string;
  transactionNumber: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: POSItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: "cash" | "gcash" | "card" | "bank_transfer";
  paymentDetails?: {
    amountPaid?: number;
    changeGiven?: number;
    referenceNumber?: string;
  };
  status: "pending" | "completed" | "cancelled" | "refunded";
  timestamp: string;
  completedAt?: string;
  notes?: string;
}

export interface POSCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  productCount: number;
}

export interface DailySales {
  date: string;
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  topProducts: {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }[];
}

const sampleCategories: POSCategory[] = [
  {
    id: "car_care",
    name: "Car Care",
    color: "#3B82F6",
    icon: "🚗",
    productCount: 0,
  },
  {
    id: "accessories",
    name: "Accessories",
    color: "#8B5CF6",
    icon: "🔧",
    productCount: 0,
  },
  {
    id: "chemicals",
    name: "Chemicals",
    color: "#10B981",
    icon: "🧪",
    productCount: 0,
  },
  {
    id: "tools",
    name: "Tools",
    color: "#F59E0B",
    icon: "🛠️",
    productCount: 0,
  },
];

export const getPOSCategories = (): POSCategory[] => {
  const stored = localStorage.getItem("fac_pos_categories");
  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem("fac_pos_categories", JSON.stringify(sampleCategories));
  return sampleCategories;
};

export const getPOSTransactions = (): POSTransaction[] => {
  const stored = localStorage.getItem("fac_pos_transactions");
  return stored ? JSON.parse(stored) : [];
};

export const createPOSTransaction = (
  cashierId: string,
  cashierName: string,
  items: POSItem[],
  customerInfo?: { name?: string; phone?: string },
  paymentInfo?: {
    method: POSTransaction["paymentMethod"];
    amountPaid?: number;
    referenceNumber?: string;
  },
): POSTransaction => {
  const transactions = getPOSTransactions();
  const transactionNumber = `TXN${Date.now()}`;

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = items.reduce(
    (sum, item) => sum + (item.discount || 0),
    0,
  );
  const taxAmount = (subtotal - discountAmount) * 0.12; // 12% VAT
  const totalAmount = subtotal - discountAmount + taxAmount;

  const newTransaction: POSTransaction = {
    id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    transactionNumber,
    cashierId,
    cashierName,
    customerName: customerInfo?.name,
    customerPhone: customerInfo?.phone,
    items,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    paymentMethod: paymentInfo?.method || "cash",
    paymentDetails: paymentInfo
      ? {
          amountPaid: paymentInfo.amountPaid,
          changeGiven:
            paymentInfo.method === "cash" && paymentInfo.amountPaid
              ? paymentInfo.amountPaid - totalAmount
              : undefined,
          referenceNumber: paymentInfo.referenceNumber,
        }
      : undefined,
    status: "completed",
    timestamp: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  transactions.unshift(newTransaction);

  // Keep only last 1000 transactions
  if (transactions.length > 1000) {
    transactions.splice(1000);
  }

  localStorage.setItem("fac_pos_transactions", JSON.stringify(transactions));

  // Update inventory for each item
  items.forEach((item) => {
    updateProductStock(
      item.productId,
      0, // This will be calculated in updateProductStock based on current stock - quantity
      `POS Sale - ${transactionNumber}`,
    );
  });

  return newTransaction;
};

export const getDailySales = (date?: string): DailySales => {
  const targetDate = date || new Date().toISOString().split("T")[0];
  const transactions = getPOSTransactions().filter(
    (t) => t.timestamp.startsWith(targetDate) && t.status === "completed",
  );

  const totalSales = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalTransactions = transactions.length;
  const averageTransaction =
    totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Calculate top products
  const productSales: Record<
    string,
    { name: string; quantity: number; revenue: number }
  > = {};

  transactions.forEach((t) => {
    t.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      quantitySold: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    date: targetDate,
    totalSales,
    totalTransactions,
    averageTransaction,
    topProducts,
  };
};

export const getWeeklySales = (): DailySales[] => {
  const sales: DailySales[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    sales.push(getDailySales(dateString));
  }

  return sales;
};

export const getMonthlySales = (): DailySales[] => {
  const sales: DailySales[] = [];
  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), i);
    const dateString = date.toISOString().split("T")[0];
    sales.push(getDailySales(dateString));
  }

  return sales;
};

export const searchPOSTransactions = (query: string): POSTransaction[] => {
  const transactions = getPOSTransactions();
  const searchTerm = query.toLowerCase();

  return transactions.filter(
    (t) =>
      t.transactionNumber.toLowerCase().includes(searchTerm) ||
      t.customerName?.toLowerCase().includes(searchTerm) ||
      t.customerPhone?.includes(searchTerm) ||
      t.cashierName.toLowerCase().includes(searchTerm) ||
      t.items.some((item) =>
        item.productName.toLowerCase().includes(searchTerm),
      ),
  );
};

export const refundTransaction = (
  transactionId: string,
  reason: string,
): boolean => {
  const transactions = getPOSTransactions();
  const transactionIndex = transactions.findIndex(
    (t) => t.id === transactionId,
  );

  if (
    transactionIndex !== -1 &&
    transactions[transactionIndex].status === "completed"
  ) {
    transactions[transactionIndex].status = "refunded";
    transactions[transactionIndex].notes = `Refunded: ${reason}`;

    localStorage.setItem("fac_pos_transactions", JSON.stringify(transactions));

    // Restore inventory for refunded items
    transactions[transactionIndex].items.forEach((item) => {
      updateProductStock(
        item.productId,
        0, // This will be calculated to add back the quantity
        `Refund - ${transactions[transactionIndex].transactionNumber}`,
      );
    });

    return true;
  }

  return false;
};
