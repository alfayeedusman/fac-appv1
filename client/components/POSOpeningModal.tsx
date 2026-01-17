import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Lock } from "lucide-react";
import { openPOSSession } from "@/utils/posApiService";
import { notificationManager } from "@/components/NotificationModal";

interface POSOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionOpened: (sessionId: string) => void;
  cashierInfo: { id: string; name: string };
  branchId: string;
}

export default function POSOpeningModal({
  isOpen,
  onClose,
  onSessionOpened,
  cashierInfo,
  branchId,
}: POSOpeningModalProps) {
  const [openingBalance, setOpeningBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenSession = async () => {
    if (!openingBalance || openingBalance.trim() === "") {
      notificationManager.error(
        "Required Field",
        "Opening balance is required to start a POS session"
      );
      return;
    }

    const balance = parseFloat(openingBalance);
    if (isNaN(balance)) {
      notificationManager.error(
        "Invalid Input",
        "Please enter a valid number for opening balance"
      );
      return;
    }

    if (balance < 0) {
      notificationManager.error(
        "Invalid Amount",
        "Opening balance cannot be negative"
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await openPOSSession(
        cashierInfo.id,
        cashierInfo.name,
        branchId,
        parseFloat(openingBalance)
      );

      if (result.success && result.sessionId) {
        notificationManager.success(
          "Success",
          `POS opened with opening balance ₱${parseFloat(openingBalance).toFixed(2)}`
        );
        onSessionOpened(result.sessionId);
        setOpeningBalance("");
        onClose();
      } else {
        throw new Error("Failed to open POS session");
      }
    } catch (error) {
      console.error("Error opening POS:", error);
      notificationManager.error(
        "Error",
        "Failed to open POS session. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Open POS</h2>
              <p className="text-sm text-gray-600 mt-1">Initialize session for {cashierInfo.name}</p>
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

        {/* Form */}
        <div className="space-y-6">
          {/* Cashier Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Cashier</p>
            <p className="font-semibold text-gray-900">{cashierInfo.name}</p>
          </div>

          {/* Opening Balance Input */}
          <div>
            <label htmlFor="opening-balance" className="block text-sm font-medium text-gray-700 mb-2">
              Opening Balance (₱) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold">₱</span>
              <Input
                id="opening-balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount..."
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                disabled={isLoading}
                className="pl-8 text-lg"
                required
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter the exact amount of cash on hand at the start of your shift
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Note:</span> You will need to provide the exact cash amount when closing the POS for balance verification.
            </p>
          </div>

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
              onClick={handleOpenSession}
              disabled={isLoading || !openingBalance || isNaN(parseFloat(openingBalance || "0")) || parseFloat(openingBalance || "0") < 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={!openingBalance ? "Opening balance is required" : ""}
            >
              {isLoading ? "Opening..." : "Open POS"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
