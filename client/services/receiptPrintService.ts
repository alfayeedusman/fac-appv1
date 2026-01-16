import type { POSTransaction } from "@/utils/databaseSchema";

export interface ReceiptSettings {
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

export interface ReceiptData {
  transactionNumber: string;
  date: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  amountPaid: number;
  changeAmount: number;
  customerName?: string;
  customerPhone?: string;
  cashierName?: string;
}

class ReceiptPrintService {
  private settings: ReceiptSettings | null = null;
  private printWindow: Window | null = null;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem("receiptSettings");
      if (saved) {
        this.settings = JSON.parse(saved);
      } else {
        this.settings = this.getDefaultSettings();
      }
    } catch (error) {
      console.error("Error loading receipt settings:", error);
      this.settings = this.getDefaultSettings();
    }
  }

  private getDefaultSettings(): ReceiptSettings {
    return {
      companyName: "Fayeed Auto Care",
      companyAddress: "Zamboanga City, Philippines",
      companyPhone: "+63 123 456 7890",
      companyEmail: "info@fayeedautocare.com",
      footerMessage: "Thank you for choosing Fayeed Auto Care!",
      paperWidth: 80,
      includeLogo: true,
      includeQR: false,
      includeSignature: false,
      headerMessage: "Professional Car Washing Services",
      showTermsConditions: false,
      printingMode: "auto",
      printerType: "thermal",
    };
  }

  updateSettings(settings: Partial<ReceiptSettings>) {
    this.settings = { ...this.settings!, ...settings };
    localStorage.setItem("receiptSettings", JSON.stringify(this.settings));
  }

  getSettings(): ReceiptSettings {
    return this.settings || this.getDefaultSettings();
  }

  /**
   * Generate HTML receipt for thermal printer
   * Thermal printers typically use 80mm width with monospace font
   */
  generateReceiptHTML(data: ReceiptData, settings?: ReceiptSettings): string {
    const cfg = settings || this.settings || this.getDefaultSettings();
    const date = new Date(data.date);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    const width = cfg.paperWidth;
    const charsPerLine = width === 58 ? 32 : width === 80 ? 48 : 56;

    const padCenter = (text: string, length: number) => {
      const padding = Math.max(0, length - text.length);
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return " ".repeat(leftPad) + text + " ".repeat(rightPad);
    };

    const padRight = (text: string, length: number) => {
      return text + " ".repeat(Math.max(0, length - text.length));
    };

    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Courier New', monospace;
            width: ${width}mm;
            margin: 0;
            padding: 0;
        }
        .receipt {
            width: 100%;
            padding: 2mm;
            font-size: 10pt;
            line-height: 1.2;
        }
        .header {
            text-align: center;
            margin-bottom: 2mm;
            border-bottom: 1px dashed #000;
            padding-bottom: 2mm;
        }
        .logo {
            font-size: 20pt;
            font-weight: bold;
            color: #d97706;
            margin-bottom: 1mm;
        }
        .company-name {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 1mm;
        }
        .company-info {
            font-size: 8pt;
            line-height: 1.3;
            margin-bottom: 1mm;
        }
        .transaction-info {
            font-size: 8pt;
            margin: 2mm 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 2mm;
        }
        .items {
            margin: 2mm 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 1mm;
        }
        .item {
            font-size: 9pt;
            margin-bottom: 1mm;
        }
        .item-name {
            display: flex;
            justify-content: space-between;
        }
        .item-detail {
            font-size: 8pt;
            color: #666;
            display: flex;
            justify-content: space-between;
        }
        .totals {
            margin: 2mm 0;
            font-size: 9pt;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 1mm 0;
        }
        .total-amount {
            font-weight: bold;
            font-size: 12pt;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 1mm 0;
            margin: 1mm 0;
        }
        .payment-info {
            font-size: 8pt;
            margin: 1mm 0;
        }
        .qr-code {
            text-align: center;
            margin: 2mm 0;
        }
        .qr-code img {
            max-width: 60mm;
        }
        .signature-line {
            margin-top: 2mm;
            border-top: 1px solid #000;
            height: 8mm;
            text-align: center;
            font-size: 8pt;
        }
        .footer {
            text-align: center;
            font-size: 8pt;
            margin-top: 1mm;
            line-height: 1.3;
        }
        .center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="receipt">`;

    // Header
    html += `<div class="header">`;

    if (cfg.includeLogo) {
      if (cfg.logoUrl) {
        html += `<div class="logo"><img src="${cfg.logoUrl}" style="max-width: 50mm; max-height: 20mm; filter: grayscale(100%);"></div>`;
      } else {
        // Simple black and white system logo for thermal printer
        html += `<div class="logo" style="font-family: monospace; font-size: 11pt; font-weight: bold; margin-bottom: 2mm;">
                  ╔════════════════════╗<br>
                  ║  FAYEED AUTO CARE  ║<br>
                  ║  Professional Wash ║<br>
                  ╚════════════════════╝
                </div>`;
      }
    } else {
      // Display company name prominently even without logo
      html += `<div class="company-name" style="font-size: 12pt; font-weight: bold; margin-bottom: 1mm;">FAYEED AUTO CARE</div>`;
    }

    html += `<div class="company-info">
                ${cfg.headerMessage ? cfg.headerMessage + "<br>" : ""}
                ${cfg.companyAddress}<br>
                ${cfg.companyPhone}${cfg.companyEmail ? "<br>" + cfg.companyEmail : ""}
            </div>
        </div>`;

    // Transaction Info
    html += `<div class="transaction-info">
            <div class="total-row">
                <span>Receipt #: ${data.transactionNumber}</span>
            </div>
            <div class="total-row">
                <span>Date: ${dateStr}</span>
                <span>Time: ${timeStr}</span>
            </div>
            ${
              data.customerName
                ? `<div class="total-row"><span>Customer: ${data.customerName}</span></div>`
                : ""
            }
            ${
              data.cashierName
                ? `<div class="total-row"><span>Cashier: ${data.cashierName}</span></div>`
                : ""
            }
        </div>`;

    // Items
    html += `<div class="items">`;
    data.items.forEach((item) => {
      const itemTotal = (item.quantity * item.price).toFixed(2);
      html += `<div class="item">
                <div class="item-name">
                    <span>${item.name}</span>
                    <span>₱${itemTotal}</span>
                </div>
                <div class="item-detail">
                    <span>${item.quantity}x @ ₱${item.price.toFixed(2)}</span>
                </div>
            </div>`;
    });
    html += `</div>`;

    // Totals
    html += `<div class="totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>₱${data.subtotal.toFixed(2)}</span>
            </div>
            ${
              data.discountAmount > 0
                ? `<div class="total-row">
                <span>Discount:</span>
                <span>-₱${data.discountAmount.toFixed(2)}</span>
            </div>`
                : ""
            }
            ${
              data.taxAmount > 0
                ? `<div class="total-row">
                <span>Tax:</span>
                <span>₱${data.taxAmount.toFixed(2)}</span>
            </div>`
                : ""
            }
        </div>`;

    // Total Amount
    html += `<div class="total-amount">
            <div class="total-row">
                <span>TOTAL</span>
                <span>₱${data.totalAmount.toFixed(2)}</span>
            </div>
        </div>`;

    // Payment Info
    html += `<div class="payment-info">
            <div class="total-row">
                <span>Payment Method:</span>
                <span>${data.paymentMethod.toUpperCase()}</span>
            </div>
            <div class="total-row">
                <span>Amount Paid:</span>
                <span>₱${data.amountPaid.toFixed(2)}</span>
            </div>
            ${
              data.changeAmount > 0
                ? `<div class="total-row">
                <span>Change:</span>
                <span>₱${data.changeAmount.toFixed(2)}</span>
            </div>`
                : ""
            }
        </div>`;

    // QR Code (placeholder)
    if (cfg.includeQR) {
      html += `<div class="qr-code">
                <div style="font-size: 8pt; margin-bottom: 1mm;">Scan for details</div>
                <div style="text-align: center; font-size: 20pt;">█ █</div>
                <div style="font-size: 7pt;">QR Code</div>
            </div>`;
    }

    // Signature Line
    if (cfg.includeSignature) {
      html += `<div class="signature-line">Signature</div>`;
    }

    // Footer
    html += `<div class="footer">
            <div style="margin-bottom: 1mm; border-top: 1px dashed #000; padding-top: 1mm;">
                ${cfg.footerMessage}
            </div>
            <div style="font-size: 7pt; color: #666;">
                Generated: ${new Date().toLocaleString()}
            </div>
            ${
              cfg.showTermsConditions && cfg.termsText
                ? `<div style="font-size: 7pt; margin-top: 1mm; line-height: 1.2;">
                ${cfg.termsText}
            </div>`
                : ""
            }
        </div>`;

    html += `</div></body></html>`;

    return html;
  }

  /**
   * Print receipt to thermal or standard printer
   * Auto mode: prints directly without dialog
   * Manual mode: shows print dialog for user confirmation
   */
  async printReceipt(data: ReceiptData, settings?: ReceiptSettings) {
    try {
      const cfg = settings || this.settings || this.getDefaultSettings();
      const html = this.generateReceiptHTML(data, cfg);

      // Create a new window for printing
      const printWindow = window.open("", "", "height=600,width=800");
      if (!printWindow) {
        throw new Error("Could not open print window. Check popup blocker settings.");
      }

      printWindow.document.write(html);
      printWindow.document.close();

      // Wait for content to load before printing
      printWindow.onload = () => {
        // Auto print mode - print directly without dialog
        if (cfg.printingMode === "auto") {
          // For thermal printers, use direct print
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 500);
        } else {
          // Manual mode - show print dialog
          printWindow.print();
          // Keep window open so user can see preview if needed
          setTimeout(() => {
            printWindow.close();
          }, 3000);
        }
      };
    } catch (error) {
      console.error("Error printing receipt:", error);
      throw error;
    }
  }

  /**
   * Preview receipt in current window
   */
  previewReceipt(data: ReceiptData, settings?: ReceiptSettings) {
    const html = this.generateReceiptHTML(data, settings);
    const previewWindow = window.open("", "receipt_preview", "height=800,width=900");
    if (!previewWindow) {
      throw new Error("Could not open preview window. Check popup blocker settings.");
    }

    previewWindow.document.write(html);
    previewWindow.document.close();
  }

  /**
   * Save receipt as PDF (requires external library)
   */
  async downloadReceiptPDF(data: ReceiptData, settings?: ReceiptSettings) {
    try {
      // This requires html2pdf or similar library
      // For now, just provide the print functionality
      const html = this.generateReceiptHTML(data, settings);
      console.log("To save as PDF, implement html2pdf library");
      return html;
    } catch (error) {
      console.error("Error downloading receipt:", error);
      throw error;
    }
  }
}

export const receiptPrintService = new ReceiptPrintService();
