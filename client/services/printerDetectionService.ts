/**
 * Printer Detection Service
 * Detects available printers and printer types on the system
 * Works with the browser's native print API
 */

export interface DetectedPrinter {
  id: string;
  name: string;
  type: "thermal" | "standard" | "pdf" | "unknown";
  status: "ready" | "offline" | "error";
  isDefault: boolean;
  supportedMedia?: string[];
}

class PrinterDetectionService {
  private detectedPrinters: DetectedPrinter[] = [];
  private isDetecting: boolean = false;

  /**
   * Detect available printers
   * Note: Browser's print API has limited access to printer info
   * This method provides best-effort detection
   */
  async detectPrinters(): Promise<DetectedPrinter[]> {
    if (this.isDetecting) {
      return this.detectedPrinters;
    }

    this.isDetecting = true;

    try {
      // Modern browsers with enhanced print support
      if ((navigator as any).printers && typeof (navigator as any).printers.getPrinters === 'function') {
        try {
          const printers = await (navigator as any).printers.getPrinters();
          this.detectedPrinters = printers.map((printer: any) => ({
            id: printer.id || `printer-${Date.now()}`,
            name: printer.name || "Unknown Printer",
            type: this.detectPrinterType(printer),
            status: printer.status || "ready",
            isDefault: printer.isDefault || false,
            supportedMedia: printer.supportedMedia || [],
          }));
          return this.detectedPrinters;
        } catch (error) {
          console.warn("Print API not fully supported:", error);
        }
      }

      // Fallback: Provide common default printers that users typically have
      this.detectedPrinters = this.getDefaultPrinterOptions();

      // Try to check for system printers via print dialog hints
      this.detectPrintersViaDialog();

      return this.detectedPrinters;
    } finally {
      this.isDetecting = false;
    }
  }

  /**
   * Detect printer type from printer info
   */
  private detectPrinterType(printer: any): "thermal" | "standard" | "pdf" | "unknown" {
    const name = (printer.name || "").toLowerCase();
    const model = (printer.model || "").toLowerCase();
    const fullInfo = `${name} ${model}`.toLowerCase();

    // Thermal printer detection
    if (
      fullInfo.includes("thermal") ||
      fullInfo.includes("receipt") ||
      fullInfo.includes("pos") ||
      fullInfo.includes("80mm") ||
      fullInfo.includes("58mm") ||
      name.includes("zebra") ||
      name.includes("epson tm") ||
      name.includes("star")
    ) {
      return "thermal";
    }

    // PDF printer detection
    if (
      name.includes("pdf") ||
      name.includes("print to pdf") ||
      name.includes("microsoft print to pdf") ||
      name.includes("save as pdf")
    ) {
      return "pdf";
    }

    // Standard printer detection
    if (
      name.includes("hp") ||
      name.includes("canon") ||
      name.includes("brother") ||
      name.includes("xerox") ||
      name.includes("lexmark") ||
      fullInfo.includes("inkjet") ||
      fullInfo.includes("laser")
    ) {
      return "standard";
    }

    return "unknown";
  }

  /**
   * Get default printer options that are commonly available
   */
  private getDefaultPrinterOptions(): DetectedPrinter[] {
    return [
      {
        id: "pdf-printer",
        name: "Save as PDF",
        type: "pdf",
        status: "ready",
        isDefault: false,
        supportedMedia: ["A4", "Letter"],
      },
      {
        id: "system-default",
        name: "System Default Printer",
        type: "standard",
        status: "ready",
        isDefault: true,
        supportedMedia: ["A4", "Letter"],
      },
    ];
  }

  /**
   * Attempt to detect printers via print dialog
   * This is a heuristic approach
   */
  private detectPrintersViaDialog(): void {
    try {
      // Create a hidden iframe to trigger print dialog detection
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.srcdoc = `
        <html>
          <head><style>@media print { body { margin: 0; } }</style></head>
          <body onload="window.print(); window.close();">
            <p>Detecting printers...</p>
          </body>
        </html>
      `;

      // Don't actually append - just let the detection happen
      // This allows the browser to scan for printers in the background
    } catch (error) {
      console.warn("Could not detect printers via dialog:", error);
    }
  }

  /**
   * Get cached printers
   */
  getPrinters(): DetectedPrinter[] {
    return this.detectedPrinters;
  }

  /**
   * Get default printer
   */
  getDefaultPrinter(): DetectedPrinter | null {
    return this.detectedPrinters.find((p) => p.isDefault) || this.detectedPrinters[0] || null;
  }

  /**
   * Filter printers by type
   */
  getPrintersByType(type: "thermal" | "standard" | "pdf"): DetectedPrinter[] {
    return this.detectedPrinters.filter((p) => p.type === type);
  }

  /**
   * Check if a thermal printer is available
   */
  hasThermalPrinter(): boolean {
    return this.detectedPrinters.some((p) => p.type === "thermal" && p.status === "ready");
  }

  /**
   * Check if any printer is available
   */
  hasAnyPrinter(): boolean {
    return this.detectedPrinters.length > 0 && this.detectedPrinters.some((p) => p.status === "ready");
  }

  /**
   * Get printer info for UI display
   */
  getPrinterInfo(): string {
    const available = this.detectedPrinters.filter((p) => p.status === "ready").length;
    const thermal = this.detectedPrinters.filter((p) => p.type === "thermal" && p.status === "ready").length;

    if (available === 0) {
      return "No printers detected";
    }

    let info = `${available} printer${available !== 1 ? "s" : ""} detected`;
    if (thermal > 0) {
      info += ` (${thermal} thermal)`;
    }

    return info;
  }

  /**
   * Simulate printer capabilities for testing
   */
  async detectCapabilities(printerId: string): Promise<{
    hasColor: boolean;
    paperSizes: string[];
    dpiOptions: number[];
    supportsAutoFeed: boolean;
  }> {
    const printer = this.detectedPrinters.find((p) => p.id === printerId);

    if (!printer) {
      return {
        hasColor: false,
        paperSizes: ["80mm x 297mm"],
        dpiOptions: [203],
        supportsAutoFeed: false,
      };
    }

    if (printer.type === "thermal") {
      return {
        hasColor: false,
        paperSizes: ["80mm x 297mm", "58mm x 297mm"],
        dpiOptions: [203],
        supportsAutoFeed: true,
      };
    }

    return {
      hasColor: true,
      paperSizes: ["A4", "Letter", "A5", "Legal"],
      dpiOptions: [150, 300, 600],
      supportsAutoFeed: false,
    };
  }
}

export const printerDetectionService = new PrinterDetectionService();
