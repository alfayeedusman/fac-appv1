import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Printer,
  Eye,
  Save,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Settings,
  Monitor,
  Bluetooth,
  Wifi,
  Usb,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StickyHeader from "@/components/StickyHeader";
import AdminSidebar from "@/components/AdminSidebar";
import {
  PrintingService,
  ReceiptTemplate,
  PrinterConfig,
  ReceiptData,
  getPrintingService,
  resetPrintingService,
} from "@/utils/printingService";
import { notificationManager } from "@/components/NotificationModal";

const sampleReceiptData: ReceiptData = {
  transactionNumber: "TXN1234567890",
  cashierName: "John Doe",
  customerName: "Jane Smith",
  customerPhone: "+63 912 345 6789",
  timestamp: new Date().toISOString(),
  items: [
    {
      name: "Classic Wash - Sedan",
      quantity: 1,
      unitPrice: 200,
      subtotal: 200,
    },
    {
      name: "Car Wax Premium",
      quantity: 2,
      unitPrice: 150,
      subtotal: 300,
    },
    {
      name: "Tire Cleaner",
      quantity: 1,
      unitPrice: 120,
      subtotal: 120,
    },
  ],
  subtotal: 620,
  discountAmount: 20,
  taxAmount: 72,
  totalAmount: 672,
  paymentMethod: "cash",
  amountPaid: 700,
  changeGiven: 28,
};

export default function AdminReceiptDesigner() {
  const navigate = useNavigate();
  const [printingService, setPrintingService] =
    useState<PrintingService>(getPrintingService());
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] =
    useState<ReceiptTemplate | null>(null);
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(
    printingService.getConfig(),
  );
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [newTemplate, setNewTemplate] = useState<Partial<ReceiptTemplate>>({
    name: "",
    isDefault: false,
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
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const allTemplates = printingService.getAllTemplates();
    setTemplates(allTemplates);

    const defaultTemplate = allTemplates.find((t) => t.isDefault);
    if (defaultTemplate) {
      setCurrentTemplate(defaultTemplate);
    }
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name) {
      notificationManager.error(
        "Template Name Required",
        "Please enter a template name",
      );
      return;
    }

    const template: ReceiptTemplate = {
      id: `template_${Date.now()}`,
      ...newTemplate,
    } as ReceiptTemplate;

    const updatedTemplates = [...templates, template];

    // If this is set as default, unset others
    if (template.isDefault) {
      updatedTemplates.forEach((t) => {
        if (t.id !== template.id) t.isDefault = false;
      });
    }

    printingService.saveAllTemplates(updatedTemplates);
    setTemplates(updatedTemplates);
    setShowTemplateModal(false);

    notificationManager.success(
      "Template Saved",
      `${template.name} has been saved successfully`,
    );
  };

  const handleUpdateTemplate = (template: ReceiptTemplate) => {
    const updatedTemplates = templates.map((t) =>
      t.id === template.id ? template : t,
    );

    // If this is set as default, unset others
    if (template.isDefault) {
      updatedTemplates.forEach((t) => {
        if (t.id !== template.id) t.isDefault = false;
      });
    }

    printingService.saveAllTemplates(updatedTemplates);
    setTemplates(updatedTemplates);
    setCurrentTemplate(template);

    notificationManager.success(
      "Template Updated",
      `${template.name} has been updated`,
    );
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template?.isDefault) {
      notificationManager.error(
        "Cannot Delete",
        "Cannot delete the default template",
      );
      return;
    }

    const updatedTemplates = templates.filter((t) => t.id !== templateId);
    printingService.saveAllTemplates(updatedTemplates);
    setTemplates(updatedTemplates);

    if (currentTemplate?.id === templateId) {
      setCurrentTemplate(updatedTemplates.find((t) => t.isDefault) || null);
    }

    notificationManager.success("Template Deleted", "Template removed");
  };

  const handlePreviewReceipt = () => {
    if (!currentTemplate) {
      notificationManager.error("No Template", "Please select a template");
      return;
    }

    const tempService = new PrintingService(printerConfig);
    tempService.saveReceiptTemplate(currentTemplate);
    const content = tempService.formatReceipt(sampleReceiptData);
    setPreviewContent(content);
    setShowPreview(true);
  };

  const handleTestPrint = async () => {
    if (!currentTemplate) {
      notificationManager.error("No Template", "Please select a template");
      return;
    }

    setIsLoading(true);
    try {
      const tempService = new PrintingService(printerConfig);
      tempService.saveReceiptTemplate(currentTemplate);
      await tempService.printReceipt(sampleReceiptData);
      notificationManager.success("Print Test", "Test receipt sent to printer");
    } catch (error) {
      notificationManager.error("Print Failed", "Failed to print test receipt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePrinterConfig = (updates: Partial<PrinterConfig>) => {
    const newConfig = { ...printerConfig, ...updates };
    setPrinterConfig(newConfig);
    setPrintingService(resetPrintingService(newConfig));
  };

  const exportTemplate = (template: ReceiptTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${template.name.replace(/\s+/g, "_")}_template.json`;
    link.click();
  };

  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template: ReceiptTemplate = JSON.parse(
          e.target?.result as string,
        );
        template.id = `imported_${Date.now()}`;
        template.isDefault = false;

        const updatedTemplates = [...templates, template];
        printingService.saveAllTemplates(updatedTemplates);
        setTemplates(updatedTemplates);

        notificationManager.success(
          "Template Imported",
          `${template.name} imported successfully`,
        );
      } catch (error) {
        notificationManager.error("Import Failed", "Invalid template file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <StickyHeader showBack={false} title="Receipt Designer" />

      <AdminSidebar
        activeTab="cms"
        onTabChange={(tab) => {
          if (tab === "overview") navigate("/admin-dashboard");
          else if (tab === "inventory") navigate("/inventory-management");
          else if (tab === "push-notifications")
            navigate("/admin-push-notifications");
          else if (tab === "gamification") navigate("/admin-gamification");
          else if (tab === "subscription-approval")
            navigate("/admin-subscription-approval");
          else if (tab === "pos") navigate("/pos");
          else if (tab === "user-management")
            navigate("/admin-user-management");
        }}
        userRole={localStorage.getItem("userRole") || "admin"}
        notificationCount={0}
      />

      <div className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 mt-16">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Receipt Design Center
            </h1>
            <p className="text-gray-600">
              Customize receipt templates and printer settings
            </p>
          </div>

          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Receipt Templates</TabsTrigger>
              <TabsTrigger value="printer">Printer Settings</TabsTrigger>
              <TabsTrigger value="preview">Preview & Test</TabsTrigger>
            </TabsList>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Receipt Templates</h2>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importTemplate}
                    className="hidden"
                    id="import-template"
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("import-template")?.click()
                    }
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button onClick={() => setShowTemplateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      currentTemplate?.id === template.id
                        ? "ring-2 ring-orange-500 border-orange-200"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() => setCurrentTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {template.name}
                          </CardTitle>
                          {template.isDefault && (
                            <Badge className="mt-1">Default</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportTemplate(template);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            disabled={template.isDefault}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <strong>Business:</strong>{" "}
                          {template.header.businessName}
                        </p>
                        <p>
                          <strong>Style:</strong> {template.styling.fontSize}{" "}
                          {template.styling.fontStyle}
                        </p>
                        <p>
                          <strong>Format:</strong> {template.body.itemFormat}
                        </p>
                        <div className="flex items-center gap-2">
                          {template.body.showCustomerInfo && (
                            <Badge variant="secondary" className="text-xs">
                              Customer Info
                            </Badge>
                          )}
                          {template.body.showBarcode && (
                            <Badge variant="secondary" className="text-xs">
                              Barcode
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Template Editor */}
              {currentTemplate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Edit className="h-5 w-5 mr-2" />
                      Edit Template: {currentTemplate.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Header Settings */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">
                          Header Settings
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label>Business Name</Label>
                            <Input
                              value={currentTemplate.header.businessName}
                              onChange={(e) =>
                                handleUpdateTemplate({
                                  ...currentTemplate,
                                  header: {
                                    ...currentTemplate.header,
                                    businessName: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Address</Label>
                            <Textarea
                              value={currentTemplate.header.address}
                              onChange={(e) =>
                                handleUpdateTemplate({
                                  ...currentTemplate,
                                  header: {
                                    ...currentTemplate.header,
                                    address: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={currentTemplate.header.phone}
                              onChange={(e) =>
                                handleUpdateTemplate({
                                  ...currentTemplate,
                                  header: {
                                    ...currentTemplate.header,
                                    phone: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              value={currentTemplate.header.email || ""}
                              onChange={(e) =>
                                handleUpdateTemplate({
                                  ...currentTemplate,
                                  header: {
                                    ...currentTemplate.header,
                                    email: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={currentTemplate.header.showDateTime}
                              onCheckedChange={(checked) =>
                                handleUpdateTemplate({
                                  ...currentTemplate,
                                  header: {
                                    ...currentTemplate.header,
                                    showDateTime: checked,
                                  },
                                })
                              }
                            />
                            <Label>Show Date & Time</Label>
                          </div>
                        </div>
                      </div>

                      {/* Body Settings */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">
                          Body Settings
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={currentTemplate.body.showCustomerInfo}
                              onCheckedChange={(checked) =>
                                handleUpdateTemplate({
                                  ...currentTemplate,
                                  body: {
                                    ...currentTemplate.body,
                                    showCustomerInfo: checked,
                                  },
                                })
                              }
                            />
                            <Label>Show Customer Information</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={currentTemplate.body.showItemDetails}
                              onCheckedChange={(checked) =>
                                handleUpdateTemplate({
                                  ...currentTemplate,
                                  body: {
                                    ...currentTemplate.body,
                                    showItemDetails: checked,
                                  },
                                })
                              }
                            />
                            <Label>Show Item Details</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={currentTemplate.body.showBarcode}
                              onCheckedChange={(checked) =>
                                handleUpdateTemplate({
                                  ...currentTemplate,
                                  body: {
                                    ...currentTemplate.body,
                                    showBarcode: checked,
                                  },
                                })
                              }
                            />
                            <Label>Show Barcode</Label>
                          </div>
                          <div>
                            <Label>Item Format</Label>
                            <Select
                              value={currentTemplate.body.itemFormat}
                              onValueChange={(value: any) =>
                                handleUpdateTemplate({
                                  ...currentTemplate,
                                  body: {
                                    ...currentTemplate.body,
                                    itemFormat: value,
                                  },
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="detailed">
                                  Detailed
                                </SelectItem>
                                <SelectItem value="simple">Simple</SelectItem>
                                <SelectItem value="compact">Compact</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Price Alignment</Label>
                            <Select
                              value={currentTemplate.body.priceAlignment}
                              onValueChange={(value: any) =>
                                handleUpdateTemplate({
                                  ...currentTemplate,
                                  body: {
                                    ...currentTemplate.body,
                                    priceAlignment: value,
                                  },
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Settings */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">
                        Footer Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Thank You Message</Label>
                          <Input
                            value={currentTemplate.footer.thankYouMessage}
                            onChange={(e) =>
                              handleUpdateTemplate({
                                ...currentTemplate,
                                footer: {
                                  ...currentTemplate.footer,
                                  thankYouMessage: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Return Policy</Label>
                          <Input
                            value={currentTemplate.footer.returnPolicy || ""}
                            onChange={(e) =>
                              handleUpdateTemplate({
                                ...currentTemplate,
                                footer: {
                                  ...currentTemplate.footer,
                                  returnPolicy: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Promotional Message</Label>
                          <Input
                            value={currentTemplate.footer.promotional || ""}
                            onChange={(e) =>
                              handleUpdateTemplate({
                                ...currentTemplate,
                                footer: {
                                  ...currentTemplate.footer,
                                  promotional: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Styling Settings */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">
                        Styling Settings
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Font Size</Label>
                          <Select
                            value={currentTemplate.styling.fontSize}
                            onValueChange={(value: any) =>
                              handleUpdateTemplate({
                                ...currentTemplate,
                                styling: {
                                  ...currentTemplate.styling,
                                  fontSize: value,
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Font Style</Label>
                          <Select
                            value={currentTemplate.styling.fontStyle}
                            onValueChange={(value: any) =>
                              handleUpdateTemplate({
                                ...currentTemplate,
                                styling: {
                                  ...currentTemplate.styling,
                                  fontStyle: value,
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Alignment</Label>
                          <Select
                            value={currentTemplate.styling.alignment}
                            onValueChange={(value: any) =>
                              handleUpdateTemplate({
                                ...currentTemplate,
                                styling: {
                                  ...currentTemplate.styling,
                                  alignment: value,
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <Switch
                            checked={currentTemplate.styling.separators}
                            onCheckedChange={(checked) =>
                              handleUpdateTemplate({
                                ...currentTemplate,
                                styling: {
                                  ...currentTemplate.styling,
                                  separators: checked,
                                },
                              })
                            }
                          />
                          <Label>Line Separators</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={currentTemplate.isDefault}
                        onCheckedChange={(checked) =>
                          handleUpdateTemplate({
                            ...currentTemplate,
                            isDefault: checked,
                          })
                        }
                      />
                      <Label>Set as Default Template</Label>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Printer Settings Tab */}
            <TabsContent value="printer" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Printer Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Printer Type</Label>
                        <Select
                          value={printerConfig.type}
                          onValueChange={(value: any) =>
                            handleUpdatePrinterConfig({ type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="thermal">
                              <div className="flex items-center">
                                <Printer className="h-4 w-4 mr-2" />
                                Thermal Printer
                              </div>
                            </SelectItem>
                            <SelectItem value="bluetooth">
                              <div className="flex items-center">
                                <Bluetooth className="h-4 w-4 mr-2" />
                                Bluetooth Printer
                              </div>
                            </SelectItem>
                            <SelectItem value="wifi">
                              <div className="flex items-center">
                                <Wifi className="h-4 w-4 mr-2" />
                                WiFi Printer
                              </div>
                            </SelectItem>
                            <SelectItem value="usb">
                              <div className="flex items-center">
                                <Usb className="h-4 w-4 mr-2" />
                                USB Printer
                              </div>
                            </SelectItem>
                            <SelectItem value="web">
                              <div className="flex items-center">
                                <Monitor className="h-4 w-4 mr-2" />
                                Web Browser
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Printer Name</Label>
                        <Input
                          value={printerConfig.name}
                          onChange={(e) =>
                            handleUpdatePrinterConfig({ name: e.target.value })
                          }
                        />
                      </div>

                      {(printerConfig.type === "bluetooth" ||
                        printerConfig.type === "wifi") && (
                        <div>
                          <Label>
                            {printerConfig.type === "bluetooth"
                              ? "Bluetooth Address"
                              : "IP Address"}
                          </Label>
                          <Input
                            value={printerConfig.address || ""}
                            onChange={(e) =>
                              handleUpdatePrinterConfig({
                                address: e.target.value,
                              })
                            }
                            placeholder={
                              printerConfig.type === "bluetooth"
                                ? "00:11:22:33:44:55"
                                : "192.168.1.100"
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Paper Width (mm)</Label>
                        <Select
                          value={printerConfig.paperWidth.toString()}
                          onValueChange={(value) =>
                            handleUpdatePrinterConfig({
                              paperWidth: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="58">58mm</SelectItem>
                            <SelectItem value="80">80mm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Characters per Line</Label>
                        <Select
                          value={printerConfig.characterWidth.toString()}
                          onValueChange={(value) =>
                            handleUpdatePrinterConfig({
                              characterWidth: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="32">32 characters</SelectItem>
                            <SelectItem value="42">42 characters</SelectItem>
                            <SelectItem value="48">48 characters</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Character Encoding</Label>
                        <Select
                          value={printerConfig.encoding}
                          onValueChange={(value: any) =>
                            handleUpdatePrinterConfig({ encoding: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utf8">UTF-8</SelectItem>
                            <SelectItem value="ascii">ASCII</SelectItem>
                            <SelectItem value="cp437">CP437</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={printerConfig.cutPaper}
                          onCheckedChange={(checked) =>
                            handleUpdatePrinterConfig({ cutPaper: checked })
                          }
                        />
                        <Label>Auto Cut Paper</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={printerConfig.cashDrawer}
                          onCheckedChange={(checked) =>
                            handleUpdatePrinterConfig({ cashDrawer: checked })
                          }
                        />
                        <Label>Open Cash Drawer</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview & Test Tab */}
            <TabsContent value="preview" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Preview & Testing</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handlePreviewReceipt}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Receipt
                  </Button>
                  <Button
                    onClick={handleTestPrint}
                    disabled={isLoading}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Printer className="h-4 w-4 mr-2" />
                    )}
                    Test Print
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Transaction Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div>
                        <strong>Transaction:</strong>{" "}
                        {sampleReceiptData.transactionNumber}
                      </div>
                      <div>
                        <strong>Cashier:</strong>{" "}
                        {sampleReceiptData.cashierName}
                      </div>
                      <div>
                        <strong>Customer:</strong>{" "}
                        {sampleReceiptData.customerName}
                      </div>
                      <div>
                        <strong>Items:</strong>
                        <ul className="ml-4 mt-2 space-y-1">
                          {sampleReceiptData.items.map((item, index) => (
                            <li key={index}>
                              {item.quantity}x {item.name} - ₱{item.subtotal}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Total:</strong> ₱{sampleReceiptData.totalAmount}
                      </div>
                      <div>
                        <strong>Payment:</strong>{" "}
                        {sampleReceiptData.paymentMethod} - ₱
                        {sampleReceiptData.amountPaid}
                      </div>
                      <div>
                        <strong>Change:</strong> ₱
                        {sampleReceiptData.changeGiven}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Current Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>Template:</strong>{" "}
                        {currentTemplate?.name || "None selected"}
                      </div>
                      <div>
                        <strong>Printer:</strong> {printerConfig.name}
                      </div>
                      <div>
                        <strong>Type:</strong> {printerConfig.type}
                      </div>
                      <div>
                        <strong>Paper:</strong> {printerConfig.paperWidth}mm (
                        {printerConfig.characterWidth} chars)
                      </div>
                      <div>
                        <strong>Features:</strong>
                        <div className="ml-4 mt-1 flex flex-wrap gap-1">
                          {printerConfig.cutPaper && (
                            <Badge variant="secondary" className="text-xs">
                              Paper Cut
                            </Badge>
                          )}
                          {printerConfig.cashDrawer && (
                            <Badge variant="secondary" className="text-xs">
                              Cash Drawer
                            </Badge>
                          )}
                          {currentTemplate?.body.showCustomerInfo && (
                            <Badge variant="secondary" className="text-xs">
                              Customer Info
                            </Badge>
                          )}
                          {currentTemplate?.body.showBarcode && (
                            <Badge variant="secondary" className="text-xs">
                              Barcode
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* New Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a custom receipt template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
                placeholder="My Custom Template"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newTemplate.isDefault}
                onCheckedChange={(checked) =>
                  setNewTemplate({ ...newTemplate, isDefault: checked })
                }
              />
              <Label>Set as default template</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTemplateModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-4 border rounded-lg">
            <pre className="font-mono text-xs whitespace-pre-wrap overflow-auto max-h-96">
              {previewContent}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
