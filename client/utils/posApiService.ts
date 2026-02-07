// POS API Service - Database integration instead of localStorage

const API_BASE = "/api/pos";

export interface POSTransaction {
  id: string;
  transactionNumber: string;
  customerInfo?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentReference?: string;
  amountPaid: number;
  changeAmount: number;
  cashierInfo?: {
    id: string;
    name: string;
  };
  branchId: string;
  timestamp?: number;
}

export interface POSExpense {
  id?: string;
  posSessionId: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  recordedByInfo?: {
    id: string;
    name: string;
  };
}

export interface POSSession {
  id: string;
  status: "open" | "closed";
  sessionDate: Date;
  cashierId: string;
  cashierName: string;
  branchId: string;
  openingBalance: number;
  closingBalance?: number;
  totalCashSales?: number;
  totalCardSales?: number;
  totalGcashSales?: number;
  totalBankSales?: number;
  totalExpenses?: number;
  isBalanced?: boolean;
}

export interface DailySalesReport {
  date: string;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalGcash: number;
  totalBank: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  expenseCount: number;
}

// ============= POS SESSION FUNCTIONS =============

export async function openPOSSession(
  cashierId: string,
  cashierName: string,
  branchId: string,
  openingBalance: number
): Promise<{ sessionId: string; success: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/sessions/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cashierId,
        cashierName,
        branchId,
        openingBalance,
      }),
    });

    if (!response.ok) throw new Error("Failed to open POS session");
    return await response.json();
  } catch (error) {
    console.error("Error opening POS session:", error);
    throw error;
  }
}

export async function getCurrentPOSSession(
  cashierId: string
): Promise<POSSession | null> {
  try {
    console.log(`🔍 Fetching current POS session for cashier: ${cashierId}`);
    const response = await fetch(
      `${API_BASE}/sessions/current/${cashierId}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to fetch POS session: HTTP ${response.status}`, errorText);
      throw new Error(`HTTP ${response.status}: Failed to fetch POS session`);
    }

    const data = await response.json();
    console.log(`✅ POS session response received:`, data);
    return data.session || null;
  } catch (error) {
    console.error("Error fetching current POS session:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function closePOSSession(
  sessionId: string,
  actualCash: number,
  actualDigital: number,
  remittanceNotes: string
): Promise<{ success: boolean; isBalanced: boolean; cashVariance: number; digitalVariance: number }> {
  try {
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log("Closing POS session:", {
      sessionId,
      actualCash,
      actualDigital,
      remittanceNotes,
    });

    const response = await fetch(`${API_BASE}/sessions/close/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actualCash: Number(actualCash),
        actualDigital: Number(actualDigital),
        remittanceNotes: remittanceNotes || "",
      }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`Failed to close POS session: ${errorData.error || response.statusText}`);
      } catch (parseError) {
        throw new Error(`Failed to close POS session: HTTP ${response.status} - ${errorText}`);
      }
    }

    const responseText = await response.text();
    console.log("Response text:", responseText);

    if (!responseText) {
      throw new Error("Empty response from server");
    }

    const data = JSON.parse(responseText);
    console.log("Parsed response:", data);

    return data;
  } catch (error) {
    console.error("Error closing POS session:", error);
    throw error;
  }
}

// ============= TRANSACTION FUNCTIONS =============

export async function saveTransaction(
  transaction: POSTransaction
): Promise<{ transactionId: string; success: boolean }> {
  try {
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const response = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...transaction,
        transactionNumber,
      }),
    });

    if (!response.ok) throw new Error("Failed to save transaction");
    return await response.json();
  } catch (error) {
    console.error("Error saving transaction:", error);
    throw error;
  }
}

export async function getTransactionsByDate(
  date: string
): Promise<POSTransaction[]> {
  try {
    const response = await fetch(`${API_BASE}/transactions/${date}`);
    if (!response.ok) throw new Error("Failed to fetch transactions");
    const data = await response.json();
    return data.transactions || [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function getTransactionsWithDetails(
  date: string
): Promise<POSTransaction[]> {
  try {
    const response = await fetch(`${API_BASE}/transactions/${date}/detailed`);
    if (!response.ok) throw new Error("Failed to fetch transactions");
    const data = await response.json();
    return data.transactions || [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

// ============= EXPENSE FUNCTIONS =============

export async function saveExpense(
  expense: POSExpense
): Promise<{ expenseId: string; success: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    });

    if (!response.ok) throw new Error("Failed to save expense");
    return await response.json();
  } catch (error) {
    console.error("Error saving expense:", error);
    throw error;
  }
}

export async function getExpensesBySession(
  sessionId: string
): Promise<POSExpense[]> {
  try {
    const response = await fetch(`${API_BASE}/expenses/session/${sessionId}`);
    if (!response.ok) throw new Error("Failed to fetch expenses");
    const data = await response.json();
    return data.expenses || [];
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
}

export async function deleteExpense(expenseId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/expenses/${expenseId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting expense:", error);
    return false;
  }
}

// ============= REPORT FUNCTIONS =============

export async function getDailySalesReport(date: string): Promise<DailySalesReport> {
  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📊 Fetching daily report for ${date} (Attempt ${attempt}/${maxRetries})`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE}/reports/daily/${date}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`⚠️ API returned status ${response.status} for daily report`);
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);

        // If it's a 500 error, it might have returned fallback data
        if (response.status === 500 && errorData.totalSales !== undefined) {
          return errorData;
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch daily report`);
      }

      const responseData = await response.json();
      // Handle both wrapped { success, data } and direct response formats
      const data = responseData.data || responseData;
      console.log(`✅ Daily report fetched successfully:`, data);
      return data;
    } catch (error: any) {
      lastError = error;
      console.warn(`❌ Attempt ${attempt} failed:`, error?.message || error);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed, return empty report
  console.error(
    `❌ Failed to fetch daily report after ${maxRetries} attempts:`,
    lastError
  );

  // Return fallback data
  const fallbackReport: DailySalesReport = {
    date,
    totalSales: 0,
    totalCash: 0,
    totalCard: 0,
    totalGcash: 0,
    totalBank: 0,
    totalExpenses: 0,
    netIncome: 0,
    transactionCount: 0,
    expenseCount: 0,
  };

  console.log(
    "📋 Using fallback empty report. Please refresh or check server status."
  );
  return fallbackReport;
}
