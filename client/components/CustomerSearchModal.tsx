import React, { useState, useEffect, useRef } from "react";
import { Search, X, QrCode, Phone, Mail, User, Loader } from "lucide-react";
import { searchCustomers, getAllCustomers, parseQRCodeData, Customer } from "@/utils/customerService";

interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

export function CustomerSearchModal({
  isOpen,
  onClose,
  onSelectCustomer,
}: CustomerSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!isOpen) return null;

  // Load all customers when modal opens
  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await getAllCustomers();
        setCustomers(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadCustomers();
  }, [isOpen]);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setQrError(null);

    if (query.trim().length === 0) {
      setFilteredCustomers([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchCustomers(query);
      setFilteredCustomers(results);
    } finally {
      setIsLoading(false);
    }
  };

  // Start QR code scanner
  const startQRScanner = async () => {
    setShowQRScanner(true);
    setQrError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setQrError("Unable to access camera. Please check permissions.");
      setShowQRScanner(false);
    }
  };

  // Stop QR code scanner
  const stopQRScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowQRScanner(false);
  };

  // Handle QR code input (when user manually enters QR code data)
  const handleQRCodeInput = async (qrData: string) => {
    console.log(`📱 Processing QR code: ${qrData}`);
    const parsed = parseQRCodeData(qrData);

    // Search for customer using the parsed QR code data
    const results = await searchCustomers(parsed.value);
    if (results.length > 0) {
      console.log(`✅ Found customer from QR code: ${results[0].name}`);
      onSelectCustomer(results[0]);
      stopQRScanner();
      onClose();
    } else {
      setQrError(`No customer found for: ${qrData}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Select Customer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QR Scanner View */}
        {showQRScanner ? (
          <div className="flex flex-col space-y-4 flex-1">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg bg-black aspect-square object-cover"
            />
            <input
              type="text"
              placeholder="Or paste QR code data here..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  handleQRCodeInput(e.currentTarget.value.trim());
                  e.currentTarget.value = "";
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {qrError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {qrError}
              </div>
            )}
            <button
              onClick={stopQRScanner}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Close Scanner
            </button>
          </div>
        ) : (
          <>
            {/* Search Section */}
            <div className="mb-4 space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* QR Scanner Button */}
              <button
                onClick={startQRScanner}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <QrCode className="h-4 w-4" />
                <span>Scan QR Code</span>
              </button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-5 w-5 animate-spin text-gray-500" />
                </div>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      onSelectCustomer(customer);
                      onClose();
                    }}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-semibold text-gray-900">
                      {customer.name}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                      {customer.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {customer.id}
                    </div>
                  </button>
                ))
              ) : searchQuery ? (
                <div className="text-center py-8 text-gray-500">
                  No customers found
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Search for a customer or scan a QR code
                </div>
              )}
            </div>

            {/* Guest Checkout Option */}
            <button
              onClick={() => {
                onSelectCustomer({
                  id: `guest-${Date.now()}`,
                  name: "Guest Customer",
                });
                onClose();
              }}
              className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Continue as Guest</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
