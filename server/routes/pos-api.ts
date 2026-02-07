import express from "express";
import express from "express";
import { getDatabase } from "../database/connection";
import {
  posTransactions,
  posTransactionItems,
  posExpenses,
  posSessions,
} from "../database/schema";
import { eq, and, gte, lte, desc, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { triggerPusherEvent } from "../services/pusherService";

const router = express.Router();

// ============= HELPER FUNCTIONS =============

// Round to 2 decimal places to prevent floating-point errors in financial calculations
const roundToTwo = (num: number): number => {
  return Math.round(num * 100) / 100;
};

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

    const db = await getDatabase();
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
    const db = await getDatabase();
    if (!db) {
      console.warn("⚠️ Database not initialized for POS session");
      return res.json({ session: null });
    }

    const { cashierId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    try {
      const result = await db
        .select()
        .from(posSessions)
        .where(
          and(
            eq(posSessions.cashierId, cashierId),
            gte(posSessions.sessionDate, todayISO),
            eq(posSessions.status, "open"),
          ),
        )
        .limit(1);

      const session = result[0];
      return res.json({ session: session || null });
    } catch (dbError: any) {
      console.warn("⚠️ Database query failed for POS session:", dbError.message?.substring(0, 100));
      // Return null session instead of error - graceful fallback
      return res.json({ session: null });
    }
  } catch (error) {
    console.error("Error fetching POS session:", error);
    res.json({ session: null });
  }
});

// Close POS Session with Reconciliation
router.post("/sessions/close/:sessionId", async (req, res) => {
  try {
    const db = await getDatabase();
    if (!db) {
      console.error("❌ Database not initialized for closing session");
      return res.status(500).json({ error: "Database not initialized" });
    }

    const { sessionId } = req.params;
    const { actualCash, actualDigital, remittanceNotes } = req.body;

    console.log(`🔒 Attempting to close POS session: ${sessionId}`, {
      actualCash,
      actualDigital,
      remittanceNotes,
    });

    // Fetch session
    const sessionResult = await db
      .select()
      .from(posSessions)
      .where(eq(posSessions.id, sessionId))
      .limit(1);

    const session = sessionResult[0];
    if (!session) {
      console.error(`❌ Session not found: ${sessionId}`);
      return res.status(404).json({ error: "Session not found" });
    }

    console.log(`✅ Session found, opening balance: ₱${session.openingBalance}`);

    // Get all transactions for this session (both POS transactions and bookings)
    const transactions = await db
      .select()
      .from(posTransactions)
      .where(
        and(
          gte(posTransactions.createdAt, session.openedAt || session.createdAt),
          lte(posTransactions.createdAt, new Date()),
        ),
      );

    console.log(`📊 Found ${transactions.length} POS transactions for session`);

    // Also include bookings as sales
    const { bookings } = await import("../database/schema");
    const bookingsData = await db
      .select()
      .from(bookings)
      .where(
        and(
          gte(bookings.createdAt, session.openedAt || session.createdAt),
          lte(bookings.createdAt, new Date()),
        ),
      );

    console.log(`📊 Found ${bookingsData.length} bookings for session`);

    // Combine all transactions
    const allTransactions = [
      ...transactions.map(t => ({
        totalAmount: parseFloat(t.totalAmount?.toString() || "0"),
        paymentMethod: t.paymentMethod || "cash",
        type: "pos"
      })),
      ...bookingsData.map(b => ({
        totalAmount: parseFloat(b.totalPrice?.toString() || "0"),
        paymentMethod: b.paymentMethod || "cash",
        type: "booking"
      }))
    ];

    // Calculate totals with proper rounding to prevent floating-point errors
    let totalCashSales = 0;
    let totalCardSales = 0;
    let totalGcashSales = 0;
    let totalBankSales = 0;

    allTransactions.forEach((trans) => {
      const amount = roundToTwo(trans.totalAmount);
      switch (trans.paymentMethod) {
        case "cash":
          totalCashSales = roundToTwo(totalCashSales + amount);
          break;
        case "card":
          totalCardSales = roundToTwo(totalCardSales + amount);
          break;
        case "gcash":
          totalGcashSales = roundToTwo(totalGcashSales + amount);
          break;
        case "bank":
          totalBankSales = roundToTwo(totalBankSales + amount);
          break;
      }
    });

    console.log(`💰 Transaction breakdown - Cash: ₱${totalCashSales}, Card: ₱${totalCardSales}, GCash: ₱${totalGcashSales}, Bank: ₱${totalBankSales}`);

    // Get total expenses
    const expenses = await db
      .select()
      .from(posExpenses)
      .where(eq(posExpenses.posSessionId, sessionId));

    const totalExpenses = roundToTwo(
      expenses.reduce(
        (sum, exp) => sum + roundToTwo(parseFloat(exp.amount.toString())),
        0,
      ),
    );

    console.log(`💸 Total expenses: ₱${totalExpenses}`);

    // Calculate expected balances with proper rounding
    const openingBalance = roundToTwo(
      parseFloat(session.openingBalance.toString()),
    );
    const expectedCash = roundToTwo(
      openingBalance + totalCashSales - totalExpenses,
    );
    const expectedDigital = roundToTwo(
      totalCardSales + totalGcashSales + totalBankSales,
    );

    console.log(`📋 Expected Balance - Cash: ₱${expectedCash} (Opening ₱${openingBalance} + Sales ₱${totalCashSales} - Expenses ₱${totalExpenses}), Digital: ₱${expectedDigital}`);

    // Calculate variance with proper rounding
    const actualCashAmount = roundToTwo(parseFloat(actualCash));
    const actualDigitalAmount = roundToTwo(parseFloat(actualDigital));
    const cashVariance = roundToTwo(actualCashAmount - expectedCash);
    const digitalVariance = roundToTwo(actualDigitalAmount - expectedDigital);
    const isBalanced =
      Math.abs(cashVariance) <= 0.01 && Math.abs(digitalVariance) <= 0.01;

    console.log(`💵 Actual vs Expected - Cash: ₱${actualCashAmount} (variance: ${cashVariance >= 0 ? "+" : ""}₱${cashVariance}), Digital: ₱${actualDigitalAmount} (variance: ${digitalVariance >= 0 ? "+" : ""}₱${digitalVariance})`);
    console.log(`✅ Session balanced: ${isBalanced}`);

    // Update session with properly rounded values
    const closingBalance = roundToTwo(actualCashAmount + actualDigitalAmount);

    const updateResult = await db
      .update(posSessions)
      .set({
        status: "closed",
        closedAt: new Date(),
        closingBalance: closingBalance.toString(),
        totalCashSales: totalCashSales.toString(),
        totalCardSales: totalCardSales.toString(),
        totalGcashSales: totalGcashSales.toString(),
        totalBankSales: totalBankSales.toString(),
        totalExpenses: totalExpenses.toString(),
        expectedCash: expectedCash.toString(),
        actualCash: actualCashAmount.toString(),
        cashVariance: cashVariance.toString(),
        expectedDigital: expectedDigital.toString(),
        actualDigital: actualDigitalAmount.toString(),
        digitalVariance: digitalVariance.toString(),
        remittanceNotes,
        isBalanced,
      })
      .where(eq(posSessions.id, sessionId));

    console.log(`🔒 POS session ${sessionId} closed successfully`);

    res.json({
      success: true,
      isBalanced,
      cashVariance,
      digitalVariance,
      closingBalance,
      message: isBalanced
        ? "POS closed successfully and balanced!"
        : "POS closed with variance",
    });
  } catch (error: any) {
    console.error("❌ Error closing POS session:", error);
    const errorMessage = error?.message || error?.toString() || "Unknown error";
    console.error("Error stack:", error?.stack);
    res.status(500).json({
      error: "Failed to close POS session",
      details: errorMessage,
    });
  }
});

// ============= TRANSACTION ROUTES =============

// Save Transaction
router.post("/transactions", async (req, res) => {
  try {
    console.log("💳 Processing POS transaction...");
    const db = await getDatabase();
    if (!db) {
      console.error("❌ Database not initialized for transaction");
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

    console.log("📊 Transaction details:", {
      transactionNumber,
      totalAmount,
      paymentMethod,
      itemsCount: items?.length || 0,
      branchId,
    });

    if (!transactionNumber || !totalAmount || !paymentMethod) {
      console.error("❌ Missing required transaction fields");
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Insert main transaction
    const transactionId = createId();
    const now = new Date();
    console.log(`⏱️ Current server time: ${now.toISOString()}`);

    const insertResult = await db.insert(posTransactions).values({
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

    console.log(`💾 Transaction inserted:`, {
      id: transactionId,
      transactionNumber,
      totalAmount,
      status: "completed",
      branchId: branchId || "default",
      insertedAt: now.toISOString(),
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

    console.log(`✅ Transaction saved successfully: ${transactionId}`);
    res.json({
      success: true,
      transactionId,
      message: "Transaction saved successfully",
    });

    // Emit Pusher event for POS transaction
    (async () => {
      try {
        const payload = {
          transactionId,
          transactionNumber,
          totalAmount: Number(totalAmount),
          paymentMethod,
          branchId: branchId || "default",
          cashierInfo,
          timestamp: new Date().toISOString(),
        };
        console.log(`🚀 Emitting pos.transaction.created event with payload:`, JSON.stringify(payload));

        // Broadcast to public and branch channels (also private versions)
        const results = await Promise.all([
          triggerPusherEvent(
            ["public-realtime", `branch-${branchId}`],
            "pos.transaction.created",
            payload,
          ),
          triggerPusherEvent(
            [`private-public-realtime`, `private-branch-${branchId}`],
            "pos.transaction.created",
            payload,
          ),
        ]);

        console.log(`✅ Pusher events emitted successfully:`, results);
      } catch (err) {
        console.error("❌ Failed to emit pos.transaction.created:", err);
      }
    })();
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ error: "Failed to save transaction" });
  }
});

// Get Transactions by Date
router.get("/transactions/:date", async (req, res) => {
  try {
    const db = await getDatabase();
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
          lte(posTransactions.createdAt, endDate),
        ),
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
    const db = await getDatabase();
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
          lte(posTransactions.createdAt, endDate),
        ),
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
      }),
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
    const db = await getDatabase();
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

    console.log(`💸 Expense recorded: ${category} - ₱${amount} (ID: ${expenseId})`);

    res.json({
      success: true,
      expenseId,
      message: "Expense recorded successfully",
    });

    // Emit Pusher event for real-time updates
    (async () => {
      try {
        const payload = {
          expenseId,
          posSessionId,
          category,
          description,
          amount: parseFloat(amount.toString()),
          paymentMethod,
          recordedBy: recordedByInfo?.id,
          recordedByName: recordedByInfo?.name,
          timestamp: new Date(),
        };
        // Broadcast to public and branch channels
        await Promise.all([
          triggerPusherEvent(
            ["public-realtime", `private-public-realtime`],
            "pos.expense.created",
            payload,
          ),
        ]);
        console.log("✅ Expense event emitted to Pusher");
      } catch (err) {
        console.warn("⚠️ Failed to emit pos.expense.created event:", err);
      }
    })();
  } catch (error) {
    console.error("Error saving expense:", error);
    res.status(500).json({ error: "Failed to save expense" });
  }
});

// Get Expenses by Session
router.get("/expenses/session/:sessionId", async (req, res) => {
  try {
    const db = await getDatabase();
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
    const db = await getDatabase();
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

// Get Daily Sales Report (includes both POS transactions AND bookings)
router.get("/reports/daily/:date", async (req, res) => {
  try {
    const db = await getDatabase();
    if (!db) {
      console.warn("⚠️ Database not initialized for daily report - returning fallback");
      return res.json({
        date: req.params.date,
        totalSales: 0,
        totalCash: 0,
        totalCard: 0,
        totalGcash: 0,
        totalBank: 0,
        totalExpenses: 0,
        netIncome: 0,
        transactionCount: 0,
        expenseCount: 0,
      });
    }

    const { date } = req.params;
    console.log(`📊 Generating daily report for: ${date}`);

    // Parse the date properly (format: YYYY-MM-DD)
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error(`❌ Invalid date format: ${date}`);
      return res.json({
        error: "Invalid date format. Use YYYY-MM-DD",
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
      });
    }

    const startDate = new Date(dateObj);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateObj);
    endDate.setHours(23, 59, 59, 999);

    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();

    console.log(`📅 Date requested: ${date}`);
    console.log(`⏰ Query date range:`);
    console.log(`   Start: ${startDateISO}`);
    console.log(`   End: ${endDateISO}`);

    let posTransactionsData: any[] = [];
    let bookingsData: any[] = [];
    let expenses: any[] = [];

    try {
      // Get POS transactions for the day
      console.log(`🔍 Querying POS transactions...`);
      posTransactionsData = await db
        .select()
        .from(posTransactions)
        .where(
          and(
            gte(posTransactions.createdAt, startDateISO),
            lte(posTransactions.createdAt, endDateISO),
            eq(posTransactions.status, "completed"),
          ),
        );

      console.log(`✅ Found ${posTransactionsData.length} POS transactions`);
      if (posTransactionsData.length > 0) {
        console.log(`   Sample transaction:`, {
          id: posTransactionsData[0].id,
          transactionNumber: posTransactionsData[0].transactionNumber,
          totalAmount: posTransactionsData[0].totalAmount,
          createdAt: posTransactionsData[0].createdAt,
          status: posTransactionsData[0].status,
        });
      }

      // Get bookings for the day (these are also sales)
      const { bookings } = await import("../database/schema");
      bookingsData = await db
        .select()
        .from(bookings)
        .where(
          and(
            gte(bookings.createdAt, startDateISO),
            lte(bookings.createdAt, endDateISO),
          ),
        );

      console.log(`✅ Found ${bookingsData.length} bookings`);

      // Get expenses from pos_expenses table
      expenses = await db
        .select()
        .from(posExpenses)
        .where(
          and(
            gte(posExpenses.createdAt, startDateISO),
            lte(posExpenses.createdAt, endDateISO),
          ),
        );

      console.log(`💰 Found ${expenses.length} expenses`);
    } catch (dbError: any) {
      console.warn("⚠️ Database query failed for daily report:", dbError.message?.substring(0, 150));
      posTransactionsData = [];
      bookingsData = [];
      expenses = [];
    }

    // Combine POS transactions and bookings for total sales
    const allTransactions = [
      ...posTransactionsData.map(t => ({
        totalAmount: parseFloat(t.totalAmount?.toString() || "0"),
        paymentMethod: t.paymentMethod || "unknown",
        source: "pos"
      })),
      ...bookingsData.map(b => ({
        totalAmount: parseFloat(b.totalPrice?.toString() || "0"),
        paymentMethod: b.paymentMethod || "unknown",
        source: "booking"
      }))
    ];

    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount.toString()),
      0,
    );

    console.log(`💰 Total expenses: ₱${totalExpenses.toFixed(2)}`);

    // Calculate totals from combined transactions
    const totalSales = allTransactions.reduce(
      (sum, trans) => sum + trans.totalAmount,
      0,
    );

    const totalCash = allTransactions
      .filter((t) => t.paymentMethod === "cash")
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const totalCard = allTransactions
      .filter((t) => t.paymentMethod === "card")
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const totalGcash = allTransactions
      .filter((t) => t.paymentMethod === "gcash")
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const totalBank = allTransactions
      .filter((t) => t.paymentMethod === "bank")
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const result = {
      date,
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalCash: parseFloat(totalCash.toFixed(2)),
      totalCard: parseFloat(totalCard.toFixed(2)),
      totalGcash: parseFloat(totalGcash.toFixed(2)),
      totalBank: parseFloat(totalBank.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netIncome: parseFloat((totalSales - totalExpenses).toFixed(2)),
      transactionCount: allTransactions.length,
      expenseCount: expenses.length,
    };

    console.log(`📈 Daily Report Summary for ${date}:`);
    console.log(`   Total Sales: ₱${result.totalSales}`);
    console.log(`   Total Expenses: ₱${result.totalExpenses}`);
    console.log(`   Net Income: ₱${result.netIncome}`);
    console.log(`   Transaction Count: ${result.transactionCount}`);
    console.log(`   Payment Breakdown - Cash: ₱${result.totalCash}, Card: ₱${result.totalCard}, GCash: ₱${result.totalGcash}, Bank: ₱${result.totalBank}`);
    res.json(result);
  } catch (error: any) {
    console.error("❌ Error generating daily report:", error);
    console.error("Error details:", error.message || error);
    // Return fallback report instead of error
    res.json({
      date: req.params.date,
      totalSales: 0,
      totalCash: 0,
      totalCard: 0,
      totalGcash: 0,
      totalBank: 0,
      totalExpenses: 0,
      netIncome: 0,
      transactionCount: 0,
      expenseCount: 0,
    });
  }
});

// ============= TRANSACTION QUERY ROUTES =============

// Get all transactions (with optional filters)
router.get("/transactions", async (req, res) => {
  try {
    const db = await getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    let query = db.select().from(posTransactions);

    // Apply date filters if provided
    if (startDate || endDate) {
      const filters = [];
      if (startDate) {
        const start = new Date(startDate as string);
        filters.push(gte(posTransactions.createdAt, start));
      }
      if (endDate) {
        const end = new Date(endDate as string);
        filters.push(lte(posTransactions.createdAt, end));
      }
      query = query.where(and(...filters));
    }

    // Order by newest first
    query = query.orderBy(desc(posTransactions.createdAt));

    // Apply pagination
    const transactions = await query
      .limit(parseInt(limit as string) || 100)
      .offset(parseInt(offset as string) || 0);

    // Get total count
    const countResult = await db.select().from(posTransactions);
    const totalCount = countResult.length;

    res.json({
      success: true,
      transactions,
      totalCount,
      count: transactions.length,
      limit: parseInt(limit as string) || 100,
      offset: parseInt(offset as string) || 0,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Get transaction details with items
router.get("/transactions/:transactionId", async (req, res) => {
  try {
    const db = await getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const { transactionId } = req.params;

    const transaction = await db
      .select()
      .from(posTransactions)
      .where(eq(posTransactions.id, transactionId))
      .limit(1);

    if (!transaction.length) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const items = await db
      .select()
      .from(posTransactionItems)
      .where(eq(posTransactionItems.transactionId, transactionId));

    res.json({
      success: true,
      transaction: transaction[0],
      items,
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

// Get transactions summary/statistics
router.get("/transactions/stats/summary", async (req, res) => {
  try {
    const db = await getDatabase();
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const transactions = await db
      .select()
      .from(posTransactions)
      .where(gte(posTransactions.createdAt, startDate))
      .orderBy(desc(posTransactions.createdAt));

    // Calculate statistics
    const stats = {
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce(
        (sum, t) => sum + parseFloat(t.totalAmount || "0"),
        0,
      ),
      totalTax: transactions.reduce(
        (sum, t) => sum + parseFloat(t.taxAmount || "0"),
        0,
      ),
      totalDiscount: transactions.reduce(
        (sum, t) => sum + parseFloat(t.discountAmount || "0"),
        0,
      ),
      paymentMethods: {} as Record<string, { count: number; amount: number }>,
      averageTransaction: 0,
      byStatus: {} as Record<string, number>,
    };

    // Group by payment method
    transactions.forEach((t) => {
      const method = t.paymentMethod || "cash";
      if (!stats.paymentMethods[method]) {
        stats.paymentMethods[method] = { count: 0, amount: 0 };
      }
      stats.paymentMethods[method].count++;
      stats.paymentMethods[method].amount += parseFloat(t.totalAmount || "0");

      // Count by status
      const status = t.status || "completed";
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    stats.averageTransaction =
      stats.totalTransactions > 0
        ? stats.totalRevenue / stats.totalTransactions
        : 0;

    res.json({
      success: true,
      stats,
      period: `${days} days`,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    res.status(500).json({ error: "Failed to fetch transaction statistics" });
  }
});

export default router;
