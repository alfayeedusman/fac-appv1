import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Download,
  Wifi,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { printerDetectionService, DetectedPrinter } from "@/services/printerDetectionService";

export default function PrinterConfiguration() {
  const [printers, setPrinters] = useState<DetectedPrinter[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [preferredPrinter, setPreferredPrinter] = useState<string | null>(null);

  useEffect(() => {
    loadPrinters();
    // Load saved preference
    const saved = localStorage.getItem("preferredPrinter");
    if (saved) {
      setPreferredPrinter(saved);
      setSelectedPrinter(saved);
    }
  }, []);

  const loadPrinters = async () => {
    try {
      setIsDetecting(true);
      const detected = await printerDetectionService.detectPrinters();
      setPrinters(detected);
      toast({
        title: "Printers Detected",
        description: `Found ${detected.length} printer${detected.length !== 1 ? "s" : ""}`,
      });
    } catch (error) {
      console.error("Error detecting printers:", error);
      toast({
        title: "Error",
        description: "Could not detect printers. Using system default.",
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSetDefault = (printerId: string) => {
    setPreferredPrinter(printerId);
    localStorage.setItem("preferredPrinter", printerId);
    toast({
      title: "Success",
      description: "Default printer updated",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "offline":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPrinterTypeColor = (type: string) => {
    switch (type) {
      case "thermal":
        return "bg-orange-100 text-orange-900 border-orange-300";
      case "standard":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "pdf":
        return "bg-purple-100 text-purple-900 border-purple-300";
      default:
        return "bg-gray-100 text-gray-900 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Printer Status Overview */}
      <Card className="glass border-border shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Printer className="h-6 w-6 text-orange-500" />
              <div>
                <CardTitle>Printer Configuration</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {printerDetectionService.getPrinterInfo()}
                </p>
              </div>
            </div>
            <Button
              onClick={loadPrinters}
              disabled={isDetecting}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isDetecting ? "animate-spin" : ""}`}
              />
              {isDetecting ? "Detecting..." : "Detect Printers"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Available Printers */}
      {printers.length > 0 && (
        <Card className="glass border-border shadow-xl">
          <CardHeader>
            <CardTitle>Available Printers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {printers.map((printer) => (
              <div
                key={printer.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(printer.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">
                        {printer.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`${getPrinterTypeColor(printer.type)} border`}
                      >
                        {printer.type === "pdf"
                          ? "📄 PDF"
                          : printer.type === "thermal"
                          ? "🖨️ Thermal"
                          : "🖨️ Standard"}
                      </Badge>
                      {printer.isDefault && (
                        <Badge className="bg-green-500 text-white">
                          Default
                        </Badge>
                      )}
                      {preferredPrinter === printer.id && (
                        <Badge className="bg-blue-500 text-white">
                          Preferred
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Status: <span className="capitalize">{printer.status}</span>
                      {printer.supportedMedia && printer.supportedMedia.length > 0 && (
                        <span> • Media: {printer.supportedMedia.join(", ")}</span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleSetDefault(printer.id)}
                  disabled={preferredPrinter === printer.id}
                  variant={
                    preferredPrinter === printer.id ? "default" : "outline"
                  }
                  size="sm"
                  className="ml-2"
                >
                  {preferredPrinter === printer.id ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Selected
                    </>
                  ) : (
                    "Set as Default"
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Printer Selection */}
      {printers.length > 0 && (
        <Card className="glass border-border shadow-xl">
          <CardHeader>
            <CardTitle>Quick Printer Selection</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Choose a printer for next print job
            </p>
          </CardHeader>
          <CardContent>
            <Select value={selectedPrinter || ""} onValueChange={setSelectedPrinter}>
              <SelectTrigger>
                <SelectValue placeholder="Select a printer" />
              </SelectTrigger>
              <SelectContent>
                {printers.map((printer) => (
                  <SelectItem key={printer.id} value={printer.id}>
                    {printer.name} ({printer.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Printer Tips */}
      <Card className="glass border-border shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-base">🖨️ Printer Setup Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex gap-2">
              <span className="text-orange-500">✓</span>
              <span>
                <strong>Auto-Detection:</strong> Click "Detect Printers" to scan
                for available printers on your system
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500">✓</span>
              <span>
                <strong>Thermal Printers:</strong> For best results with 80mm
                thermal receipt printers, select "Thermal" type
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500">✓</span>
              <span>
                <strong>Driver Installation:</strong> Ensure your printer drivers
                are installed on your system
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500">✓</span>
              <span>
                <strong>Default Printer:</strong> Set a preferred printer - receipts
                will print to this automatically
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500">✓</span>
              <span>
                <strong>Network Printers:</strong> Ensure network printers are
                connected and accessible
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500">✓</span>
              <span>
                <strong>USB Printers:</strong> Connect via USB and wait for driver
                installation to complete
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* No Printers Detected */}
      {!isDetecting && printers.length === 0 && (
        <Card className="glass border-border shadow-xl border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  No Printers Detected
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Make sure your printer is:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Connected to your computer (USB or Network)</li>
                  <li>Powered on and ready</li>
                  <li>Drivers installed on your system</li>
                  <li>Set as a system printer</li>
                </ul>
                <Button
                  onClick={loadPrinters}
                  disabled={isDetecting}
                  className="mt-4 bg-yellow-600 hover:bg-yellow-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
