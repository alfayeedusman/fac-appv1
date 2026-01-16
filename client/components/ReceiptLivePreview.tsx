import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Eye } from "lucide-react";
import { receiptPrintService } from "@/services/receiptPrintService";

interface ReceiptSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail?: string;
  footerMessage: string;
  paperWidth: number;
  includeLogo: boolean;
  includeQR: boolean;
  includeSignature: boolean;
  logoUrl?: string;
  headerMessage?: string;
  showTermsConditions?: boolean;
  termsText?: string;
  printingMode: "auto" | "manual";
  printerType: "thermal" | "standard";
}

interface ReceiptLivePreviewProps {
  settings: ReceiptSettings;
  onPreview?: () => void;
}

export default function ReceiptLivePreview({
  settings,
  onPreview,
}: ReceiptLivePreviewProps) {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Sample receipt data for preview
  const sampleData = {
    transactionNumber: "TXN-2024-001234",
    date: new Date(),
    items: [
      { name: "Premium Car Wash", quantity: 1, price: 150, subtotal: 150 },
      { name: "Wax Polish", quantity: 1, price: 200, subtotal: 200 },
      { name: "Interior Vacuum", quantity: 1, price: 100, subtotal: 100 },
    ],
    subtotal: 450,
    taxAmount: 54,
    discountAmount: 0,
    totalAmount: 504,
    paymentMethod: "cash",
    amountPaid: 500,
    changeAmount: -4,
    customerName: "Sample Customer",
    cashierName: "John Doe",
  };

  // Update preview whenever settings change
  useEffect(() => {
    try {
      setIsLoading(true);
      const html = receiptPrintService.generateReceiptHTML(sampleData, settings);
      setPreviewHtml(html);
    } catch (error) {
      console.error("Error generating preview:", error);
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const handleFullPreview = () => {
    try {
      receiptPrintService.previewReceipt(sampleData, settings);
    } catch (error) {
      console.error("Error opening preview:", error);
    }
  };

  const handlePrint = () => {
    try {
      receiptPrintService.printReceipt(sampleData, settings);
    } catch (error) {
      console.error("Error printing:", error);
    }
  };

  return (
    <Card className="glass border-border shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            Live Receipt Preview
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewHtml("")}
              title="Refresh preview"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Real-time preview of your receipt design
          <span className="text-xs ml-2">
            (Paper width: {settings.paperWidth}mm, Type: {settings.printerType})
          </span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Preview Container */}
        <div className="flex justify-center items-start overflow-x-auto bg-gray-50 rounded-lg p-4 min-h-96">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-3"></div>
              <p className="text-muted-foreground text-sm">Generating preview...</p>
            </div>
          ) : previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              style={{
                width: `${settings.paperWidth}mm`,
                height: "600px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                backgroundColor: "white",
              }}
              title="Receipt Preview"
              className="bg-white"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No preview available</p>
            </div>
          )}
        </div>

        {/* Preview Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-blue-50 p-2 rounded border border-blue-200">
            <p className="font-semibold text-blue-900">Width</p>
            <p className="text-blue-700">{settings.paperWidth}mm</p>
          </div>
          <div className="bg-purple-50 p-2 rounded border border-purple-200">
            <p className="font-semibold text-purple-900">Type</p>
            <p className="text-purple-700 capitalize">{settings.printerType}</p>
          </div>
          <div className="bg-green-50 p-2 rounded border border-green-200">
            <p className="font-semibold text-green-900">Mode</p>
            <p className="text-green-700 capitalize">{settings.printingMode}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleFullPreview}
            variant="outline"
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Full Preview
          </Button>
          <Button
            onClick={handlePrint}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Test Print
          </Button>
        </div>

        {/* Preview Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900">
          <p className="font-semibold mb-1">💡 Preview Tips:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Changes update automatically in the preview</li>
            <li>Click "Test Print" to see print dialog</li>
            <li>Thermal printers work best with 58-80mm width</li>
            <li>Include logo for professional appearance</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
