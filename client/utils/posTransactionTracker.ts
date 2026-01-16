// POS Transaction and Expense Tracker
export interface POSTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  amount: number;
  customerInfo: {
    id: string;
    name?: string;
  };
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  timestamp: number;
}

export interface POSExpense {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  timestamp: number;
}

export interface DailySalesReport {
  date: string;
  totalSales: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  expenseCount: number;
}

// Local storage key
const TRANSACTIONS_KEY = "pos_transactions";
const EXPENSES_KEY = "pos_expenses";

// Save transaction
export const saveTransaction = (transaction: Omit<POSTransaction, "id" | "timestamp">) => {
  const transactions = getTransactions();
  const newTransaction: POSTransaction = {
    ...transaction,
    id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return newTransaction;
};

// Get all transactions
export const getTransactions = (): POSTransaction[] => {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Get today's transactions
export const getTodayTransactions = (): POSTransaction[] => {
  const today = new Date().toISOString().split("T")[0];
  return getTransactions().filter((t) => t.date === today);
};

// Get transactions by date
export const getTransactionsByDate = (date: string): POSTransaction[] => {
  return getTransactions().filter((t) => t.date === date);
};

// Save expense
export const saveExpense = (expense: Omit<POSExpense, "id" | "timestamp">) => {
  const expenses = getExpenses();
  const newExpense: POSExpense = {
    ...expense,
    id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  expenses.push(newExpense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  return newExpense;
};

// Get all expenses
export const getExpenses = (): POSExpense[] => {
  const stored = localStorage.getItem(EXPENSES_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Get today's expenses
export const getTodayExpenses = (): POSExpense[] => {
  const today = new Date().toISOString().split("T")[0];
  return getExpenses().filter((e) => e.date === today);
};

// Get expenses by date
export const getExpensesByDate = (date: string): POSExpense[] => {
  return getExpenses().filter((e) => e.date === date);
};

// Calculate daily sales report
export const getDailySalesReport = (date?: string): DailySalesReport => {
  const reportDate = date || new Date().toISOString().split("T")[0];
  const transactions = getTransactionsByDate(reportDate);
  const expenses = getExpensesByDate(reportDate);

  const totalSales = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    date: reportDate,
    totalSales: Math.round(totalSales * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netIncome: Math.round((totalSales - totalExpenses) * 100) / 100,
    transactionCount: transactions.length,
    expenseCount: expenses.length,
  };
};

// Delete transaction
export const deleteTransaction = (transactionId: string) => {
  const transactions = getTransactions();
  const filtered = transactions.filter((t) => t.id !== transactionId);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
};

// Delete expense
export const deleteExpense = (expenseId: string) => {
  const expenses = getExpenses();
  const filtered = expenses.filter((e) => e.id !== expenseId);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
};

// Clear all transactions (use with caution)
export const clearTransactions = () => {
  localStorage.removeItem(TRANSACTIONS_KEY);
};

// Clear all expenses (use with caution)
export const clearExpenses = () => {
  localStorage.removeItem(EXPENSES_KEY);
};
