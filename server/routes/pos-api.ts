import express from "express";
import { getDatabase } from "../database/connection";
import {
  posTransactions,
  posTransactionItems,
  posExpenses,
  posSessions,
} from "../database/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const router = express.Router();

// ============= POS SESSION ROUTES =============

// Open POS Session
router.post("/sessions/open", async (req, res) => {
  try {
    const { cashierId, cashierName, branchId, openingBalance } = req.body;

    if (!cashierId || !branchId || openingBalance === undefined) {
      return res.status(400).json({
        error: "Missing required fields: cashierId, branchId, openingBalance",
      });
    }

    const db = getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const sessionId = createId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const session = await db.insert(posSessions).values({
      id: sessionId,
      status: "open",
      sessionDate: today,
      cashierId,
      cashierName,
      branchId,
      openingBalance: openingBalance.toString(),
    });

    res.json({
      success: true,
      sessionId,
      message: "POS session opened successfully",
    });
  } catch (error) {
    console.error("Error opening POS session:", error);
    res.status(500).json({ error: "Failed to open POS session" });
  }
});

// Get Current POS Session
router.get("/sessions/current/:cashierId", async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const { cashierId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await db
      .select()
      .from(posSessions)
      .where(
        and(
          eq(posSessions.cashierId, cashierId),
          gte(posSessions.sessionDate, today),
          eq(posSessions.status, "open")
        )
      )
      .limit(1);

    const session = result[0];
    if (!session) {
      return res.json({ session: null });
    }

    res.json({ session });
  } catch (error) {
    console.error("Error fetching POS session:", error);
    res.status(500).json({ error: "Failed to fetch POS session" });
  }
});

// Close POS Session with Reconciliation
router.post("/sessions/close/:sessionId", async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const { sessionId } = req.params;
    const {
      actualCash,
      actualDigital,
      remittanceNotes,
    } = req.body;

    // Fetch session
    const sessionResult = await db
      .select()
      .from(posSessions)
      .where(eq(posSessions.id, sessionId))
      .limit(1);

    const session = sessionResult[0];
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Get all transactions for this session
    const transactions = await db
      .select()
      .from(posTransactions)
      .where(
        and(
          gte(posTransactions.createdAt, session.openingAt || session.createdAt),
          lte(posTransactions.createdAt, new Date())
        )
      );

    // Calculate totals
    let totalCashSales = 0;
    let totalCardSales = 0;
    let totalGcashSales = 0;
    let totalBankSales = 0;

    transactions.forEach((trans) => {
      const amount = parseFloat(trans.totalAmount.toString());
      switch (trans.paymentMethod) {
        case "cash":
          totalCashSales += amount;
          break;
        case "card":
          totalCardSales += amount;
          break;
        case "gcash":
          totalGcashSales += amount;
          break;
        case "bank":
          totalBankSales += amount;
          break;
      }
    });

    // Get total expenses
    const expenses = await db
      .select()
      .from(posExpenses)
      .where(eq(posExpenses.posSessionId, sessionId));

    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount.toString()),
      0
    );

    // Calculate expected balances
    const openingBalance = parseFloat(session.openingBalance.toString());
    const expectedCash = openingBalance + totalCashSales - totalExpenses;
    const expectedDigital = totalCardSales + totalGcashSales + totalBankSales;

    // Calculate variance
    const cashVariance = parseFloat(actualCash) - expectedCash;
    const digitalVariance = parseFloat(actualDigital) - expectedDigital;
    const isBalanced = Math.abs(cashVariance) < 0.01 && Math.abs(digitalVariance) < 0.01;

    // Update session
    await db
      .update(posSessions)
      .set({
        status: "closed",
        closedAt: new Date(),
        closingBalance: (parseFloat(actualCash) + parseFloat(actualDigital)).toString(),
        totalCashSales: totalCashSales.toString(),
        totalCardSales: totalCardSales.toString(),
        totalGcashSales: totalGcashSales.toString(),
        totalBankSales: totalBankSales.toString(),
        totalExpenses: totalExpenses.toString(),
        expectedCash: expectedCash.toString(),
        actualCash: actualCash,
        cashVariance: cashVariance.toString(),
        expectedDigital: expectedDigital.toString(),
        actualDigital: actualDigital,
        digitalVariance: digitalVariance.toString(),
        remittanceNotes,
        isBalanced,
      })
      .where(eq(posSessions.id, sessionId));

    res.json({
      success: true,
      isBalanced,
      cashVariance,
      digitalVariance,
      message: isBalanced ? "POS closed successfully and balanced!" : "POS closed with variance",
    });
  } catch (error) {
    console.error("Error closing POS session:", error);
    res.status(500).json({ error: "Failed to close POS session" });
  }
});

// ============= TRANSACTION ROUTES =============

// Save Transaction
router.post("/transactions", async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const {
      transactionNumber,
      customerInfo,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentMethod,
      paymentReference,
      amountPaid,
      changeAmount,
      cashierInfo,
      branchId,
    } = req.body;

    if (!transactionNumber || !totalAmount || !paymentMethod) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Insert main transaction
    const transactionId = createId();
    await db.insert(posTransactions).values({
      id: transactionId,
      transactionNumber,
      customerId: customerInfo?.id,
      customerName: customerInfo?.name,
      customerEmail: customerInfo?.email,
      customerPhone: customerInfo?.phone,
      type: "sale",
      status: "completed",
      branchId: branchId || "default",
      cashierId: cashierInfo?.id || "unknown",
      cashierName: cashierInfo?.name || "Unknown",
      subtotal: subtotal?.toString() || "0",
      taxAmount: (taxAmount || 0).toString(),
      discountAmount: (discountAmount || 0).toString(),
      totalAmount: totalAmount.toString(),
      paymentMethod,
      paymentReference,
      amountPaid: amountPaid?.toString() || totalAmount.toString(),
      changeAmount: (changeAmount || 0).toString(),
      receiptData: JSON.stringify({
        items,
        customerInfo,
        timestamp: new Date(),
      }),
    });

    // Insert transaction items
    if (items && items.length > 0) {
      for (const item of items) {
        await db.insert(posTransactionItems).values({
          id: createId(),
          transactionId,
          productId: item.id,
          itemName: item.name,
          itemSku: item.sku,
          itemCategory: item.category,
          unitPrice: item.price.toString(),
          quantity: item.quantity,
          subtotal: (item.price * item.quantity).toString(),
          finalPrice: (item.price * item.quantity).toString(),
        });
      }
    }

    res.json({
      success: true,
      transactionId,
      message: "Transaction saved successfully",
    });
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ error: "Failed to save transaction" });
  }
});

// Get Transactions by Date
router.get("/transactions/:date", async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const { date } = req.params;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await db
      .select()
      .from(posTransactions)
      .where(
        and(
          gte(posTransactions.createdAt, startDate),
          lte(posTransactions.createdAt, endDate)
        )
      )
      .orderBy(desc(posTransactions.createdAt));

    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Get Transactions with Details
router.get("/transactions/:date/detailed", async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const { date } = req.params;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await db
      .select()
      .from(posTransactions)
      .where(
        and(
          gte(posTransactions.createdAt, startDate),
          lte(posTransactions.createdAt, endDate)
        )
      )
      .orderBy(desc(posTransactions.createdAt));

    // Get items for each transaction
    const transactionsWithItems = await Promise.all(
      transactions.map(async (trans) => {
        const items = await db
          .select()
          .from(posTransactionItems)
          .where(eq(posTransactionItems.transactionId, trans.id));
        return { ...trans, items };
      })
    );

    res.json({ transactions: transactionsWithItems });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ============= EXPENSE ROUTES =============

// Save Expense
router.post("/expenses", async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const {
      posSessionId,
      category,
      description,
      amount,
      paymentMethod,
      notes,
      recordedByInfo,
    } = req.body;

    if (!posSessionId || !category || !description || !amount) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const expenseId = createId();
    await db.insert(posExpenses).values({
      id: expenseId,
      posSessionId,
      category,
      description,
      amount: amount.toString(),
      paymentMethod: paymentMethod || "cash",
      notes,
      recordedBy: recordedByInfo?.id || "unknown",
      recordedByName: recordedByInfo?.name || "Unknown",
    });

    res.json({
      success: true,
      expenseId,
      message: "Expense recorded successfully",
    });
  } catch (error) {
    console.error("Error saving expense:", error);
    res.status(500).json({ error: "Failed to save expense" });
  }
});

// Get Expenses by Session
router.get("/expenses/session/:sessionId", async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const { sessionId } = req.params;

    const expenses = await db
      .select()
      .from(posExpenses)
      .where(eq(posExpenses.posSessionId, sessionId))
      .orderBy(desc(posExpenses.createdAt));

    res.json({ expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// Delete Expense
router.delete("/expenses/:expenseId", async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const { expenseId } = req.params;

    await db.delete(posExpenses).where(eq(posExpenses.id, expenseId));

    res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// ============= DAILY REPORT ROUTES =============

// Get Daily Sales Report
router.get("/reports/daily/:date", async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const { date } = req.params;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get transactions
    const transactions = await db
      .select()
      .from(posTransactions)
      .where(
        and(
          gte(posTransactions.createdAt, startDate),
          lte(posTransactions.createdAt, endDate),
          eq(posTransactions.status, "completed")
        )
      );

    // Get expenses
    const sessions = await db
      .select()
      .from(posSessions)
      .where(
        and(
          gte(posSessions.sessionDate, startDate),
          lte(posSessions.sessionDate, endDate)
        )
      );

    const sessionIds = sessions.map((s) => s.id);
    let totalExpenses = 0;
    if (sessionIds.length > 0) {
      const expenses = await db
        .select()
        .from(posExpenses)
        .where(
          inArray(posExpenses.posSessionId, sessionIds)
        );
      totalExpenses = expenses.reduce(
        (sum, exp) => sum + parseFloat(exp.amount.toString()),
        0
      );
    }

    // Calculate totals
    const totalSales = transactions.reduce(
      (sum, trans) => sum + parseFloat(trans.totalAmount.toString()),
      0
    );

    const totalCash = transactions
      .filter((t) => t.paymentMethod === "cash")
      .reduce((sum, t) => sum + parseFloat(t.totalAmount.toString()), 0);

    const totalCard = transactions
      .filter((t) => t.paymentMethod === "card")
      .reduce((sum, t) => sum + parseFloat(t.totalAmount.toString()), 0);

    const totalGcash = transactions
      .filter((t) => t.paymentMethod === "gcash")
      .reduce((sum, t) => sum + parseFloat(t.totalAmount.toString()), 0);

    const totalBank = transactions
      .filter((t) => t.paymentMethod === "bank")
      .reduce((sum, t) => sum + parseFloat(t.totalAmount.toString()), 0);

    res.json({
      date,
      totalSales,
      totalCash,
      totalCard,
      totalGcash,
      totalBank,
      totalExpenses,
      netIncome: totalSales - totalExpenses,
      transactionCount: transactions.length,
      expenseCount: sessionIds.length ? totalExpenses > 0 ? 1 : 0 : 0,
    });
  } catch (error) {
    console.error("Error generating daily report:", error);
    res.status(500).json({ error: "Failed to generate daily report" });
  }
});

export default router;
