import React from 'react';
import { User, CreditCard } from 'lucide-react';

interface CustomerInfo {
  uniqueId: string;
  name: string;
}

interface PaymentInfo {
  method: 'cash' | 'gcash' | 'card';
  amountPaid: string;
  referenceNumber: string;
}

interface SimplePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: CustomerInfo) => void;
  paymentInfo: PaymentInfo;
  setPaymentInfo: (info: PaymentInfo) => void;
  total: number;
  change: number;
  onPayment: () => void;
}

export function SimplePaymentModal({
  isOpen,
  onClose,
  customerInfo,
  setCustomerInfo,
  paymentInfo,
  setPaymentInfo,
  total,
  change,
  onPayment
}: SimplePaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Process Payment</h2>
          <p className="text-gray-600">Complete the transaction details</p>
        </div>

        <div className="space-y-4">
          {/* Customer ID */}
          <div>
            <label htmlFor="customer-id" className="block text-sm font-medium mb-2">
              Customer ID/Phone *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="customer-id"
                type="text"
                placeholder="Enter customer ID or phone number"
                value={customerInfo.uniqueId}
                onChange={(e) => setCustomerInfo({ ...customerInfo, uniqueId: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label htmlFor="customer-name" className="block text-sm font-medium mb-2">
              Customer Name (Optional)
            </label>
            <input
              id="customer-name"
              type="text"
              placeholder="Enter customer name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select
              value={paymentInfo.method}
              onChange={(e) => setPaymentInfo({ ...paymentInfo, method: e.target.value as 'cash' | 'gcash' | 'card' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="card">Credit/Debit Card</option>
            </select>
          </div>

          {/* Amount Paid (for cash) */}
          {paymentInfo.method === "cash" && (
            <div>
              <label htmlFor="amount-paid" className="block text-sm font-medium mb-2">
                Amount Paid
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">₱</span>
                <input
                  id="amount-paid"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentInfo.amountPaid}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, amountPaid: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {change > 0 && (
                <div className="text-sm text-green-600 font-medium mt-1">
                  Change: ₱{change.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Reference Number (for digital payments) */}
          {(paymentInfo.method === "gcash" || paymentInfo.method === "card") && (
            <div>
              <label htmlFor="reference-number" className="block text-sm font-medium mb-2">
                Reference Number *
              </label>
              <input
                id="reference-number"
                type="text"
                placeholder="Enter reference/confirmation number"
                value={paymentInfo.referenceNumber}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, referenceNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Total Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-orange-600">₱{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={onPayment}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
}
