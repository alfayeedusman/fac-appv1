import { useState } from "react";

interface QRScanResult {
  type: "branch" | "service" | "customer";
  branchId?: string;
  branchName?: string;
  serviceId?: string;
  customerId?: string;
  timestamp: string;
}

interface UseQRScannerReturn {
  showQRScanner: boolean;
  openQRScanner: () => void;
  closeQRScanner: () => void;
  handleScanSuccess: (result: QRScanResult) => void;
}

export function useQRScanner(
  onScanSuccess?: (result: QRScanResult) => void,
): UseQRScannerReturn {
  const [showQRScanner, setShowQRScanner] = useState(false);

  const openQRScanner = () => {
    setShowQRScanner(true);
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
  };

  const handleScanSuccess = (result: QRScanResult) => {
    if (onScanSuccess) {
      onScanSuccess(result);
    } else {
      // Default behavior - show success message
      alert(`✅ QR Code Scanned!
      
Branch: ${result.branchName}
ID: ${result.branchId}
Time: ${new Date(result.timestamp).toLocaleString()}`);
    }
    closeQRScanner();
  };

  return {
    showQRScanner,
    openQRScanner,
    closeQRScanner,
    handleScanSuccess,
  };
}
