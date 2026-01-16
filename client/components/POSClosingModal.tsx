import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, CheckCircle, AlertCircle } from "lucide-react";
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

  // Load sales data on mount
  useEffect(() => {
    if (isOpen) {
      loadSalesData();
    }
  }, [isOpen]);

  const loadSalesData = async () => {
    try {
      setIsCalculating(true);
      const today = new Date().toISOString().split("T")[0];
      const report = await getDailySalesReport(today);
      setSalesData(report);
    } catch (error) {
      console.error("Error loading sales data:", error);
      notificationManager.error("Error", "Failed to load sales data");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCloseSession = async () => {
    // Validate session ID first
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
            "Balance Variance Detected",
            `Cash variance: ₱${result.cashVariance.toFixed(2)} | Digital variance: ₱${result.digitalVariance.toFixed(2)}`
          );
          // Still allow closing but warn user
        } else {
          notificationManager.success(
            "Success",
            "POS closed successfully and balanced!"
          );
        }
        onSessionClosed();
        onClose();
      } else {
        throw new Error("Failed to close POS session");
      }
    } catch (error) {
      console.error("Error closing POS:", error);
      notificationManager.error(
        "Error",
        "Failed to close POS session. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const expectedCash = openingBalance + (salesData?.totalCash || 0) - (salesData?.totalExpenses || 0);
  const expectedDigital = (salesData?.totalCard || 0) + (salesData?.totalGcash || 0) + (salesData?.totalBank || 0);
  const cashVariance = parseFloat(actualCash || "0") - expectedCash;
  const digitalVariance = parseFloat(actualDigital || "0") - expectedDigital;
  const isCashBalanced = Math.abs(cashVariance) < 0.01;
  const isDigitalBalanced = Math.abs(digitalVariance) < 0.01;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Close POS & Balance</h2>
              <p className="text-sm text-gray-600 mt-1">Verify cash and digital payments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sales Summary */}
        {isCalculating ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading sales data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cash Reconciliation */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Cash Reconciliation</h3>
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Opening Balance:</span>
                    <span className="font-medium">₱{openingBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Cash Sales:</span>
                    <span className="font-medium">₱{(salesData?.totalCash || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Expenses:</span>
                    <span className="font-medium">-₱{(salesData?.totalExpenses || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-gray-900 font-semibold">
                    <span>Expected Cash:</span>
                    <span className="text-lg">₱{expectedCash.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="actual-cash" className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Cash Counted (₱) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold">₱</span>
                    <Input
                      id="actual-cash"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter amount..."
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      disabled={isLoading}
                      className="pl-8 text-lg"
                      required
                    />
                  </div>
                </div>

                {actualCash && (
                  <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                    isCashBalanced 
                      ? "bg-green-50 text-green-800 border border-green-200" 
                      : "bg-yellow-50 text-yellow-800 border border-yellow-200"
                  }`}>
                    {isCashBalanced ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <div className="text-sm">
                      <p className="font-semibold">
                        {isCashBalanced ? "✓ Cash Balanced" : "⚠ Variance Detected"}
                      </p>
                      <p>Variance: ₱{cashVariance.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Digital Reconciliation */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Digital Payments</h3>
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Card Sales:</span>
                    <span className="font-medium">₱{(salesData?.totalCard || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>GCash Sales:</span>
                    <span className="font-medium">₱{(salesData?.totalGcash || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Bank Transfer:</span>
                    <span className="font-medium">₱{(salesData?.totalBank || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-gray-900 font-semibold">
                    <span>Expected Digital:</span>
                    <span className="text-lg">₱{expectedDigital.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="actual-digital" className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Digital Verified (₱) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold">₱</span>
                    <Input
                      id="actual-digital"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter amount..."
                      value={actualDigital}
                      onChange={(e) => setActualDigital(e.target.value)}
                      disabled={isLoading}
                      className="pl-8 text-lg"
                      required
                    />
                  </div>
                </div>

                {actualDigital && (
                  <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                    isDigitalBalanced 
                      ? "bg-green-50 text-green-800 border border-green-200" 
                      : "bg-yellow-50 text-yellow-800 border border-yellow-200"
                  }`}>
                    {isDigitalBalanced ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <div className="text-sm">
                      <p className="font-semibold">
                        {isDigitalBalanced ? "✓ Digital Balanced" : "⚠ Variance Detected"}
                      </p>
                      <p>Variance: ₱{digitalVariance.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Remittance Notes */}
            <div>
              <label htmlFor="remittance-notes" className="block text-sm font-medium text-gray-700 mb-2">
                Remittance Notes (Optional)
              </label>
              <textarea
                id="remittance-notes"
                placeholder="Record any notes about the remittance..."
                value={remittanceNotes}
                onChange={(e) => setRemittanceNotes(e.target.value)}
                disabled={isLoading}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Transaction Details for Variance Debugging */}
            {(cashVariance !== 0 || digitalVariance !== 0) && (
              <Card className="border-0 shadow-md bg-red-50 border-l-4 border-red-500">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-red-900 mb-3">⚠️ Variance Detected - Review Transactions</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-red-800">
                      <strong>Cash Variance:</strong> ₱{Math.abs(cashVariance).toFixed(2)} {cashVariance > 0 ? "Surplus" : "Shortage"}
                    </p>
                    <p className="text-red-800">
                      <strong>Digital Variance:</strong> ₱{Math.abs(digitalVariance).toFixed(2)} {digitalVariance > 0 ? "Surplus" : "Shortage"}
                    </p>
                    <p className="text-red-700 mt-3 text-xs bg-white p-2 rounded border border-red-200">
                      💡 <strong>Tip:</strong> Review recent transactions to find missing or incorrect entries. Check if all cash sales were recorded in the system.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transaction Count & Verification */}
            <Card className="border-0 shadow-md bg-blue-50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Transaction Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Number of Transactions:</span>
                    <span className="font-medium">{salesData?.transactionCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Number of Expenses:</span>
                    <span className="font-medium">{salesData?.expenseCount || 0}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    All transactions from today are included in the expected amounts above.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total Sales:</span>
                    <span>₱{(salesData?.totalSales || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Total Expenses:</span>
                    <span>-₱{(salesData?.totalExpenses || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg text-gray-900">
                    <span>Net Income:</span>
                    <span className="text-green-600">₱{((salesData?.totalSales || 0) - (salesData?.totalExpenses || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseSession}
                disabled={isLoading || !actualCash || !actualDigital || !sessionId}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={!sessionId ? "No active POS session" : ""}
              >
                {isLoading ? "Closing..." : "Close & Balance POS"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
