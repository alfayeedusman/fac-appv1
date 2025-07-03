export interface PrinterConfig {
  type: "thermal" | "bluetooth" | "wifi" | "usb" | "web";
  name: string;
  address?: string; // For Bluetooth MAC or IP address
  characterWidth: number; // Characters per line (typically 32 or 48 for thermal)
  paperWidth: number; // Paper width in mm (58mm or 80mm typical)
  encoding: "utf8" | "ascii" | "cp437";
  cutPaper: boolean;
  cashDrawer: boolean;
}

export interface ReceiptData {
  transactionNumber: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  timestamp: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  amountPaid?: number;
  changeGiven?: number;
  referenceNumber?: string;
}

export interface ReceiptTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  header: {
    businessName: string;
    address: string;
    phone: string;
    email?: string;
    logo?: string;
    showDateTime: boolean;
  };
  body: {
    showCustomerInfo: boolean;
    showItemDetails: boolean;
    showBarcode: boolean;
    itemFormat: "detailed" | "simple" | "compact";
    priceAlignment: "left" | "right" | "center";
  };
  footer: {
    thankYouMessage: string;
    returnPolicy?: string;
    socialMedia?: Array<{ platform: string; handle: string }>;
    promotional?: string;
    qrCode?: string;
  };
  styling: {
    fontSize: "small" | "medium" | "large";
    fontStyle: "normal" | "bold";
    alignment: "left" | "center" | "right";
    lineSpacing: number;
    borders: boolean;
    separators: boolean;
  };
}

// Default receipt template
const defaultTemplate: ReceiptTemplate = {
  id: "default",
  name: "Default Receipt",
  isDefault: true,
  header: {
    businessName: "Fully Automated Carwash",
    address: "123 Main Street, City, Country",
    phone: "+63 123 456 7890",
    email: "info@fullyautomatedcarwash.com",
    showDateTime: true,
  },
  body: {
    showCustomerInfo: true,
    showItemDetails: true,
    showBarcode: false,
    itemFormat: "detailed",
    priceAlignment: "right",
  },
  footer: {
    thankYouMessage: "Thank you for choosing our service!",
    returnPolicy: "Please keep this receipt for your records.",
    promotional: "Follow us @FACCarwash for promos!",
  },
  styling: {
    fontSize: "medium",
    fontStyle: "normal",
    alignment: "center",
    lineSpacing: 1,
    borders: false,
    separators: true,
  },
};

export class PrintingService {
  private config: PrinterConfig;
  private template: ReceiptTemplate;

  constructor(config?: Partial<PrinterConfig>) {
    this.config = {
      type: "thermal",
      name: "Default Thermal Printer",
      characterWidth: 48,
      paperWidth: 80,
      encoding: "utf8",
      cutPaper: true,
      cashDrawer: false,
      ...config,
    };
    this.template = this.getReceiptTemplate();
  }

  // Get receipt template from localStorage
  getReceiptTemplate(): ReceiptTemplate {
    const stored = localStorage.getItem("fac_receipt_template");
    return stored ? JSON.parse(stored) : defaultTemplate;
  }

  // Save receipt template to localStorage
  saveReceiptTemplate(template: ReceiptTemplate): void {
    localStorage.setItem("fac_receipt_template", JSON.stringify(template));
    this.template = template;
  }

  // Get all templates
  getAllTemplates(): ReceiptTemplate[] {
    const stored = localStorage.getItem("fac_receipt_templates");
    const templates = stored ? JSON.parse(stored) : [defaultTemplate];
    return templates;
  }

  // Save all templates
  saveAllTemplates(templates: ReceiptTemplate[]): void {
    localStorage.setItem("fac_receipt_templates", JSON.stringify(templates));
  }

  // Format receipt content based on template
  formatReceipt(data: ReceiptData): string {
    const { characterWidth } = this.config;
    const template = this.template;
    let receipt = "";

    // Helper functions
    const centerText = (text: string): string => {
      const padding = Math.max(0, (characterWidth - text.length) / 2);
      return " ".repeat(Math.floor(padding)) + text;
    };

    const rightAlign = (text: string): string => {
      const padding = Math.max(0, characterWidth - text.length);
      return " ".repeat(padding) + text;
    };

    const formatLine = (left: string, right: string): string => {
      const maxLeft = characterWidth - right.length - 1;
      const leftTruncated =
        left.length > maxLeft ? left.substring(0, maxLeft) : left;
      const padding = characterWidth - leftTruncated.length - right.length;
      return leftTruncated + " ".repeat(Math.max(1, padding)) + right;
    };

    const addSeparator = (): void => {
      if (template.styling.separators) {
        receipt += "-".repeat(characterWidth) + "\n";
      }
    };

    // Header
    if (template.styling.alignment === "center") {
      receipt += centerText(template.header.businessName) + "\n";
      receipt += centerText(template.header.address) + "\n";
      receipt += centerText(template.header.phone) + "\n";
      if (template.header.email) {
        receipt += centerText(template.header.email) + "\n";
      }
    } else {
      receipt += template.header.businessName + "\n";
      receipt += template.header.address + "\n";
      receipt += template.header.phone + "\n";
      if (template.header.email) {
        receipt += template.header.email + "\n";
      }
    }

    if (template.header.showDateTime) {
      const dateTime = new Date(data.timestamp).toLocaleString();
      receipt += centerText(dateTime) + "\n";
    }

    addSeparator();
    receipt += centerText(`TXN: ${data.transactionNumber}`) + "\n";
    receipt += centerText(`Cashier: ${data.cashierName}`) + "\n";

    if (template.body.showCustomerInfo && data.customerName) {
      receipt += centerText(`Customer: ${data.customerName}`) + "\n";
      if (data.customerPhone) {
        receipt += centerText(`Phone: ${data.customerPhone}`) + "\n";
      }
    }

    addSeparator();

    // Items
    if (template.body.showItemDetails) {
      data.items.forEach((item) => {
        if (template.body.itemFormat === "detailed") {
          receipt += `${item.name}\n`;
          receipt +=
            formatLine(
              `  ${item.quantity} x ₱${item.unitPrice.toFixed(2)}`,
              `₱${item.subtotal.toFixed(2)}`,
            ) + "\n";
        } else if (template.body.itemFormat === "simple") {
          receipt +=
            formatLine(
              `${item.quantity}x ${item.name}`,
              `₱${item.subtotal.toFixed(2)}`,
            ) + "\n";
        } else {
          // compact
          receipt +=
            formatLine(
              `${item.quantity}x ${item.name.substring(0, characterWidth - 15)}`,
              `₱${item.subtotal.toFixed(2)}`,
            ) + "\n";
        }
      });
    }

    addSeparator();

    // Totals
    receipt += formatLine("Subtotal:", `₱${data.subtotal.toFixed(2)}`) + "\n";
    if (data.discountAmount > 0) {
      receipt +=
        formatLine("Discount:", `-₱${data.discountAmount.toFixed(2)}`) + "\n";
    }
    receipt += formatLine("Tax (12%):", `₱${data.taxAmount.toFixed(2)}`) + "\n";
    receipt += formatLine("TOTAL:", `₱${data.totalAmount.toFixed(2)}`) + "\n";

    addSeparator();

    // Payment info
    receipt += formatLine("Payment:", data.paymentMethod.toUpperCase()) + "\n";
    if (data.amountPaid) {
      receipt +=
        formatLine("Amount Paid:", `₱${data.amountPaid.toFixed(2)}`) + "\n";
    }
    if (data.changeGiven && data.changeGiven > 0) {
      receipt +=
        formatLine("Change:", `₱${data.changeGiven.toFixed(2)}`) + "\n";
    }
    if (data.referenceNumber) {
      receipt += formatLine("Ref #:", data.referenceNumber) + "\n";
    }

    addSeparator();

    // Footer
    if (template.footer.thankYouMessage) {
      receipt += centerText(template.footer.thankYouMessage) + "\n";
    }
    if (template.footer.returnPolicy) {
      receipt += centerText(template.footer.returnPolicy) + "\n";
    }
    if (template.footer.promotional) {
      receipt += centerText(template.footer.promotional) + "\n";
    }

    receipt += "\n\n";

    return receipt;
  }

  // Print via Web Bluetooth (for Bluetooth printers)
  async printViaBluetooth(receiptData: ReceiptData): Promise<void> {
    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth is not supported in this browser");
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["000018f0-0000-1000-8000-00805f9b34fb"] }],
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
      });

      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(
        "000018f0-0000-1000-8000-00805f9b34fb",
      );
      const characteristic = await service.getCharacteristic(
        "00002af1-0000-1000-8000-00805f9b34fb",
      );

      const receiptText = this.formatReceipt(receiptData);
      const encoder = new TextEncoder();
      const data = encoder.encode(receiptText);

      // ESC/POS commands
      const commands = new Uint8Array([
        0x1b,
        0x40, // Initialize printer
        ...data,
        0x1d,
        0x56,
        0x00, // Cut paper (if enabled)
      ]);

      await characteristic.writeValue(commands);
      console.log("Receipt printed via Bluetooth");
    } catch (error) {
      console.error("Bluetooth printing failed:", error);
      throw error;
    }
  }

  // Print via Web Serial (for USB/Serial printers)
  async printViaSerial(receiptData: ReceiptData): Promise<void> {
    try {
      if (!navigator.serial) {
        throw new Error("Web Serial is not supported in this browser");
      }

      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });

      const receiptText = this.formatReceipt(receiptData);
      const encoder = new TextEncoder();
      const data = encoder.encode(receiptText);

      const writer = port.writable!.getWriter();
      await writer.write(data);
      writer.releaseLock();

      await port.close();
      console.log("Receipt printed via Serial");
    } catch (error) {
      console.error("Serial printing failed:", error);
      throw error;
    }
  }

  // Print via browser (fallback method)
  async printViaBrowser(receiptData: ReceiptData): Promise<void> {
    const receiptText = this.formatReceipt(receiptData);
    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${receiptData.transactionNumber}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                margin: 0; 
                padding: 20px;
                width: ${this.config.paperWidth}mm;
              }
              pre { 
                white-space: pre-wrap; 
                margin: 0; 
              }
              @media print {
                body { margin: 0; padding: 0; }
                @page { margin: 0; size: ${this.config.paperWidth}mm auto; }
              }
            </style>
          </head>
          <body>
            <pre>${receiptText}</pre>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 1000);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  // Main print function
  async printReceipt(receiptData: ReceiptData): Promise<void> {
    try {
      switch (this.config.type) {
        case "bluetooth":
          await this.printViaBluetooth(receiptData);
          break;
        case "usb":
          await this.printViaSerial(receiptData);
          break;
        case "thermal":
        case "wifi":
        case "web":
        default:
          await this.printViaBrowser(receiptData);
          break;
      }
    } catch (error) {
      console.error("Printing failed, falling back to browser print:", error);
      await this.printViaBrowser(receiptData);
    }
  }

  // Update printer configuration
  updateConfig(newConfig: Partial<PrinterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem("fac_printer_config", JSON.stringify(this.config));
  }

  // Get current configuration
  getConfig(): PrinterConfig {
    return { ...this.config };
  }

  // Load configuration from localStorage
  static loadConfig(): PrinterConfig {
    const stored = localStorage.getItem("fac_printer_config");
    return stored
      ? JSON.parse(stored)
      : {
          type: "thermal",
          name: "Default Thermal Printer",
          characterWidth: 48,
          paperWidth: 80,
          encoding: "utf8",
          cutPaper: true,
          cashDrawer: false,
        };
  }
}

// Global printing service instance
let globalPrintingService: PrintingService | null = null;

export const getPrintingService = (): PrintingService => {
  if (!globalPrintingService) {
    const config = PrintingService.loadConfig();
    globalPrintingService = new PrintingService(config);
  }
  return globalPrintingService;
};

export const resetPrintingService = (
  config?: Partial<PrinterConfig>,
): PrintingService => {
  const finalConfig = config
    ? { ...PrintingService.loadConfig(), ...config }
    : PrintingService.loadConfig();
  globalPrintingService = new PrintingService(finalConfig);
  return globalPrintingService;
};
