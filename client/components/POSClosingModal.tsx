import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, CheckCircle, AlertCircle, TrendingUp, RefreshCw } from "lucide-react";
import { closePOSSession, getDailySalesReport } from "@/utils/posApiService";
import { notificationManager } from "@/components/NotificationModal";

interface POSClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionClosed: () => void;
  sessionId: string;
  openingBalance: number;
}

export default function POSClosingModal({
  isOpen,
  onClose,
  onSessionClosed,
  sessionId,
  openingBalance,
}: POSClosingModalProps) {
  const [actualCash, setActualCash] = useState("");
  const [actualDigital, setActualDigital] = useState("");
  const [remittanceNotes, setRemittanceNotes] = useState("");
  const [salesData, setSalesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSalesData();
      setActualCash("");
      setActualDigital("");
      setRemittanceNotes("");
    }
  }, [isOpen]);

  const loadSalesData = async () => {
    try {
      setIsCalculating(true);
      const today = new Date().toISOString().split("T")[0];
      console.log(`🔄 Loading sales data for ${today}...`);
      const report = await getDailySalesReport(today);
      setSalesData(report);
      console.log("✅ Sales data loaded:", report);
    } catch (error: any) {
      console.error("❌ Error loading sales data:", error);
      notificationManager.error(
        "Warning",
        "Could not load sales data from server. Using empty report. Please refresh if needed."
      );
      // Set empty sales data to allow closing
      setSalesData({
        date: new Date().toISOString().split("T")[0],
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
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCloseSession = async () => {
    if (!sessionId || sessionId.trim() === "") {
      notificationManager.error(
        "Error",
        "No active POS session found. Please open a session first."
      );
      return;
    }

    if (!actualCash || isNaN(parseFloat(actualCash))) {
      notificationManager.error(
        "Invalid Input",
        "Please enter actual cash amount"
      );
      return;
    }

    if (!actualDigital || isNaN(parseFloat(actualDigital))) {
      notificationManager.error(
        "Invalid Input",
        "Please enter actual digital payment amount"
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await closePOSSession(
        sessionId,
        parseFloat(actualCash),
        parseFloat(actualDigital),
        remittanceNotes
      );

      if (result.success) {
        if (!result.isBalanced) {
          notificationManager.error(
            "⚠️ Balance Variance Detected",
            `Cash variance: ₱${result.cashVariance.toFixed(2)} | Digital variance: ₱${result.digitalVariance.toFixed(2)}\n\nSession closed with variance recorded.`
          );
        } else {
          notificationManager.success(
            "✓ Success",
            "POS closed successfully and balanced perfectly!"
          );
        }
        onSessionClosed();
        onClose();
      } else {
        throw new Error("Failed to close POS session");
      }
    } catch (error: any) {
      console.error("Error closing POS:", error);
      notificationManager.error(
        "Error",
        error?.message || "Failed to close POS session. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Calculate all balances
  const totalCashSales = salesData?.totalCash || 0;
  const totalDigitalSales =
    (salesData?.totalCard || 0) +
    (salesData?.totalGcash || 0) +
    (salesData?.totalBank || 0);
  const totalExpenses = salesData?.totalExpenses || 0;

  // Expected cash calculation: Opening Balance + Cash Sales - Expenses
  const expectedCash = openingBalance + totalCashSales - totalExpenses;

  // Expected digital is just the digital sales (no expenses subtracted)
  const expectedDigital = totalDigitalSales;

  // Actual vs Expected
  const actualCashAmount = parseFloat(actualCash || "0");
  const actualDigitalAmount = parseFloat(actualDigital || "0");
  const cashVariance = actualCashAmount - expectedCash;
  const digitalVariance = actualDigitalAmount - expectedDigital;

  // Balance status
  const isCashBalanced = Math.abs(cashVariance) < 0.01;
  const isDigitalBalanced = Math.abs(digitalVariance) < 0.01;
  const isFullyBalanced = isCashBalanced && isDigitalBalanced;

  // Final totals
  const totalExpectedAmount = expectedCash + expectedDigital;
  const totalActualAmount = actualCashAmount + actualDigitalAmount;
  const totalVariance = cashVariance + digitalVariance;

  // Net income calculation
  const grossSales = totalCashSales + totalDigitalSales;
  const netIncome = grossSales - totalExpenses;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Close POS Session & Balance</h2>
              <p className="text-sm opacity-90 mt-1">Enter actual cash and digital payments to reconcile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white hover:bg-white/20 p-2 rounded disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isCalculating ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 mb-4">Loading sales data...</p>
              <Button
                onClick={loadSalesData}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : (
            <>
              {/* STEP 1: Sales Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Daily Sales Summary
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Opening Balance */}
                  <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-600 mb-1">Opening Balance</p>
                      <p className="text-xl font-bold text-green-600">
                        ₱{openingBalance.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Cash Sales */}
                  <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-600 mb-1">Cash Sales</p>
                      <p className="text-xl font-bold text-blue-600">
                        ₱{totalCashSales.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Digital Sales */}
                  <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-600 mb-1">Digital Sales</p>
                      <p className="text-xl font-bold text-purple-600">
                        ₱{totalDigitalSales.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Total Expenses */}
                  <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-orange-50">
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-600 mb-1">Total Expenses</p>
                      <p className="text-xl font-bold text-red-600">
                        -₱{totalExpenses.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* STEP 2: Expected Amounts */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  Expected Amount (Based on System Records)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Expected Cash */}
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          Expected Cash =(Opening ₱{openingBalance.toFixed(2)} + Cash Sales ₱{totalCashSales.toFixed(2)} - Expenses ₱{totalExpenses.toFixed(2)})
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          ₱{expectedCash.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Expected Digital */}
                  <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          Expected Digital =(Card ₱{(salesData?.totalCard || 0).toFixed(2)} + GCash ₱{(salesData?.totalGcash || 0).toFixed(2)} + Bank ₱{(salesData?.totalBank || 0).toFixed(2)})
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          ₱{expectedDigital.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-md bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        Total Expected:
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        ₱{totalExpectedAmount.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* STEP 3: Actual Count Entry */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  Enter Actual Amounts (Count Physical Cash & Verify Digital)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Actual Cash Input */}
                  <div className="space-y-2">
                    <label htmlFor="actual-cash" className="block text-sm font-semibold text-gray-700">
                      Actual Cash Counted (₱) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold">
                        ₱
                      </span>
                      <Input
                        id="actual-cash"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter physical cash amount..."
                        value={actualCash}
                        onChange={(e) => setActualCash(e.target.value)}
                        disabled={isLoading}
                        className="pl-8 text-lg font-semibold"
                        required
                      />
                    </div>
                    {actualCash && (
                      <div
                        className={`mt-2 p-3 rounded-lg flex items-start gap-2 ${
                          isCashBalanced
                            ? "bg-green-50 border border-green-200"
                            : "bg-yellow-50 border border-yellow-200"
                        }`}
                      >
                        {isCashBalanced ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              isCashBalanced
                                ? "text-green-900"
                                : "text-yellow-900"
                            }`}
                          >
                            {isCashBalanced ? "✓ Cash Balanced" : "⚠️ Variance Detected"}
                          </p>
                          <p
                            className={`text-sm ${
                              isCashBalanced
                                ? "text-green-700"
                                : "text-yellow-700"
                            }`}
                          >
                            Expected: ₱{expectedCash.toFixed(2)} | Actual: ₱{actualCashAmount.toFixed(2)}
                            <br />
                            Variance: {cashVariance >= 0 ? "+" : ""}₱{cashVariance.toFixed(2)} ({isCashBalanced ? "Balanced" : "Difference"})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actual Digital Input */}
                  <div className="space-y-2">
                    <label htmlFor="actual-digital" className="block text-sm font-semibold text-gray-700">
                      Actual Digital Verified (₱) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold">
                        ₱
                      </span>
                      <Input
                        id="actual-digital"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Verify digital total..."
                        value={actualDigital}
                        onChange={(e) => setActualDigital(e.target.value)}
                        disabled={isLoading}
                        className="pl-8 text-lg font-semibold"
                        required
                      />
                    </div>
                    {actualDigital && (
                      <div
                        className={`mt-2 p-3 rounded-lg flex items-start gap-2 ${
                          isDigitalBalanced
                            ? "bg-green-50 border border-green-200"
                            : "bg-yellow-50 border border-yellow-200"
                        }`}
                      >
                        {isDigitalBalanced ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              isDigitalBalanced
                                ? "text-green-900"
                                : "text-yellow-900"
                            }`}
                          >
                            {isDigitalBalanced ? "✓ Digital Balanced" : "⚠️ Variance Detected"}
                          </p>
                          <p
                            className={`text-sm ${
                              isDigitalBalanced
                                ? "text-green-700"
                                : "text-yellow-700"
                            }`}
                          >
                            Expected: ₱{expectedDigital.toFixed(2)} | Actual: ₱{actualDigitalAmount.toFixed(2)}
                            <br />
                            Variance: {digitalVariance >= 0 ? "+" : ""}₱{digitalVariance.toFixed(2)} ({isDigitalBalanced ? "Balanced" : "Difference"})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* STEP 4: Final Summary */}
              {actualCash && actualDigital && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    Final Balance Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Net Income */}
                    <Card className="border-2 border-green-300 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Net Income (Profit)
                          </span>
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Sales ₱{grossSales.toFixed(2)} - Expenses ₱{totalExpenses.toFixed(2)}
                        </p>
                        <p
                          className={`text-3xl font-bold ${
                            netIncome >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          ₱{netIncome.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Total Balance Status */}
                    <Card
                      className={`border-2 ${
                        isFullyBalanced
                          ? "border-green-300 bg-green-50"
                          : "border-yellow-300 bg-yellow-50"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Overall Balance Status
                          </span>
                          {isFullyBalanced ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <p
                          className={`text-sm mb-2 font-semibold ${
                            isFullyBalanced
                              ? "text-green-900"
                              : "text-yellow-900"
                          }`}
                        >
                          {isFullyBalanced ? "✓ All Balanced" : "⚠️ Variance Detected"}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">
                          Expected: ₱{totalExpectedAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600">
                          Actual: ₱{totalActualAmount.toFixed(2)}
                        </p>
                        <p
                          className={`text-sm font-bold mt-2 ${
                            totalVariance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Total Variance: {totalVariance >= 0 ? "+" : ""}₱{totalVariance.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Remittance Notes */}
              <div className="space-y-2">
                <label htmlFor="remittance-notes" className="block text-sm font-semibold text-gray-700">
                  Remittance Notes (Optional) - Document any discrepancies
                </label>
                <textarea
                  id="remittance-notes"
                  placeholder="e.g., ₱150 cash shortage due to... or ₱200 digital payment verification pending..."
                  value={remittanceNotes}
                  onChange={(e) => setRemittanceNotes(e.target.value)}
                  disabled={isLoading}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseSession}
                  disabled={
                    isLoading ||
                    !actualCash ||
                    !actualDigital ||
                    !sessionId
                  }
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFullyBalanced
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  }`}
                  title={!sessionId ? "No active POS session" : ""}
                >
                  {isLoading
                    ? "Closing..."
                    : isFullyBalanced
                    ? "✓ Close & Balance POS"
                    : "⚠️ Close POS (With Variance)"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
