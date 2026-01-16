import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Plus,
  Copy,
  Printer,
  Percent,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Tax {
  id: string;
  name: string;
  percentage: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface ReceiptSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  footerMessage: string;
  paperWidth: number; // in mm
  includeLogo: boolean;
  includeQR: boolean;
  includeSignature: boolean;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"receipt" | "taxes">("receipt");
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    companyName: "Fayeed Auto Care",
    companyAddress: "Zamboanga City, Philippines",
    companyPhone: "+63 123 456 7890",
    footerMessage: "Thank you for choosing Fayeed Auto Care!",
    paperWidth: 80,
    includeLogo: true,
    includeQR: true,
    includeSignature: false,
  });

  const [taxes, setTaxes] = useState<Tax[]>([
    {
      id: "1",
      name: "VAT",
      percentage: 12,
      description: "Value Added Tax",
      isActive: true,
      createdAt: "2024-01-01",
    },
  ]);

  const [showTaxDialog, setShowTaxDialog] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [taxForm, setTaxForm] = useState<Omit<Tax, "id" | "createdAt">>({
    name: "",
    percentage: 0,
    description: "",
    isActive: true,
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Tax Management Functions
  const handleAddTax = () => {
    setEditingTax(null);
    setTaxForm({
      name: "",
      percentage: 0,
      description: "",
      isActive: true,
    });
    setShowTaxDialog(true);
  };

  const handleEditTax = (tax: Tax) => {
    setEditingTax(tax);
    setTaxForm({
      name: tax.name,
      percentage: tax.percentage,
      description: tax.description,
      isActive: tax.isActive,
    });
    setShowTaxDialog(true);
  };

  const handleSaveTax = () => {
    if (!taxForm.name.trim()) {
      toast({ title: "Error", description: "Tax name is required" });
      return;
    }
    if (taxForm.percentage < 0 || taxForm.percentage > 100) {
      toast({ title: "Error", description: "Tax percentage must be between 0 and 100" });
      return;
    }

    if (editingTax) {
      setTaxes(
        taxes.map((t) =>
          t.id === editingTax.id
            ? { ...t, ...taxForm }
            : t
        )
      );
      toast({ title: "Success", description: "Tax updated successfully" });
    } else {
      const newTax: Tax = {
        id: `tax-${Date.now()}`,
        ...taxForm,
        createdAt: new Date().toISOString(),
      };
      setTaxes([...taxes, newTax]);
      toast({ title: "Success", description: "Tax added successfully" });
    }
    setShowTaxDialog(false);
  };

  const handleToggleTax = (id: string) => {
    setTaxes(
      taxes.map((t) =>
        t.id === id ? { ...t, isActive: !t.isActive } : t
      )
    );
    toast({ title: "Success", description: "Tax status updated" });
  };

  const handleDeleteTax = () => {
    if (deleteId) {
      setTaxes(taxes.filter((t) => t.id !== deleteId));
      toast({ title: "Success", description: "Tax deleted successfully" });
    }
    setShowDeleteDialog(false);
    setDeleteId(null);
  };

  // Receipt Settings Functions
  const handleSaveReceiptSettings = () => {
    toast({ title: "Success", description: "Receipt settings saved successfully" });
  };

  const handlePreviewReceipt = () => {
    // This would open a preview modal showing the receipt design
    toast({ title: "Info", description: "Receipt preview will open in a new window" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground">
              Manage receipt design and tax configurations
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("receipt")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "receipt"
                ? "border-b-2 border-orange-500 text-orange-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Printer className="inline h-4 w-4 mr-2" />
            Receipt Designer
          </button>
          <button
            onClick={() => setActiveTab("taxes")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "taxes"
                ? "border-b-2 border-orange-500 text-orange-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Percent className="inline h-4 w-4 mr-2" />
            Tax Management
          </button>
        </div>

        {/* Receipt Designer Tab */}
        {activeTab === "receipt" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Settings Panel */}
            <Card className="glass border-border shadow-xl">
              <CardHeader>
                <CardTitle>Receipt Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={receiptSettings.companyName}
                    onChange={(e) =>
                      setReceiptSettings({
                        ...receiptSettings,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-address">Company Address</Label>
                  <Textarea
                    id="company-address"
                    value={receiptSettings.companyAddress}
                    onChange={(e) =>
                      setReceiptSettings({
                        ...receiptSettings,
                        companyAddress: e.target.value,
                      })
                    }
                    placeholder="Enter company address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-phone">Company Phone</Label>
                  <Input
                    id="company-phone"
                    value={receiptSettings.companyPhone}
                    onChange={(e) =>
                      setReceiptSettings({
                        ...receiptSettings,
                        companyPhone: e.target.value,
                      })
                    }
                    placeholder="Enter company phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer-message">Footer Message</Label>
                  <Textarea
                    id="footer-message"
                    value={receiptSettings.footerMessage}
                    onChange={(e) =>
                      setReceiptSettings({
                        ...receiptSettings,
                        footerMessage: e.target.value,
                      })
                    }
                    placeholder="Enter footer message"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paper-width">Paper Width (mm)</Label>
                  <Input
                    id="paper-width"
                    type="number"
                    min="58"
                    max="100"
                    value={receiptSettings.paperWidth}
                    onChange={(e) =>
                      setReceiptSettings({
                        ...receiptSettings,
                        paperWidth: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Receipt Features</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={receiptSettings.includeLogo}
                        onChange={(e) =>
                          setReceiptSettings({
                            ...receiptSettings,
                            includeLogo: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span>Include Logo</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={receiptSettings.includeQR}
                        onChange={(e) =>
                          setReceiptSettings({
                            ...receiptSettings,
                            includeQR: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span>Include QR Code</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={receiptSettings.includeSignature}
                        onChange={(e) =>
                          setReceiptSettings({
                            ...receiptSettings,
                            includeSignature: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span>Include Signature Line</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={handlePreviewReceipt}
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleSaveReceiptSettings}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card className="glass border-border shadow-xl">
              <CardHeader>
                <CardTitle>Receipt Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 min-h-96 flex flex-col justify-center items-center text-center"
                  style={{ width: `${receiptSettings.paperWidth}mm` }}
                >
                  <div className="text-sm space-y-2">
                    {receiptSettings.includeLogo && (
                      <div className="text-2xl font-bold text-orange-500 mb-2">
                        🚗 FAC
                      </div>
                    )}
                    <p className="font-bold">{receiptSettings.companyName}</p>
                    <p className="text-xs text-gray-600 whitespace-pre-wrap">
                      {receiptSettings.companyAddress}
                    </p>
                    <p className="text-xs text-gray-600">
                      {receiptSettings.companyPhone}
                    </p>
                    <div className="border-t border-dashed my-2" />
                    <p className="text-xs font-bold">RECEIPT</p>
                    <div className="border-t border-dashed my-2" />
                    <p className="text-xs text-gray-600">Date: MM/DD/YYYY</p>
                    <p className="text-xs text-gray-600">Ref: #12345</p>
                    <div className="border-t border-dashed my-2" />
                    <p className="text-xs">Item 1 ............ 100.00</p>
                    <p className="text-xs">Item 2 ............ 150.00</p>
                    <div className="border-t border-dashed my-2" />
                    <p className="text-xs font-bold">Total ............ 250.00</p>
                    {receiptSettings.includeQR && (
                      <div className="my-2 text-center">
                        <div className="text-2xl">█ █</div>
                        <p className="text-xs mt-1">QR Code</p>
                      </div>
                    )}
                    {receiptSettings.includeSignature && (
                      <div className="my-2">
                        <div className="border-t border-gray-600 w-24 mx-auto" />
                        <p className="text-xs mt-1">Signature</p>
                      </div>
                    )}
                    <div className="border-t border-dashed my-2" />
                    <p className="text-xs text-gray-600 whitespace-pre-wrap">
                      {receiptSettings.footerMessage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tax Management Tab */}
        {activeTab === "taxes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Tax Configuration</h2>
              <Dialog open={showTaxDialog} onOpenChange={setShowTaxDialog}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleAddTax}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tax
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingTax ? "Edit Tax" : "Add New Tax"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTax
                        ? "Update tax configuration"
                        : "Create a new tax rate"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tax-name">Tax Name</Label>
                      <Input
                        id="tax-name"
                        value={taxForm.name}
                        onChange={(e) =>
                          setTaxForm({ ...taxForm, name: e.target.value })
                        }
                        placeholder="e.g., VAT, Income Tax"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-percentage">
                        Percentage (%)
                      </Label>
                      <Input
                        id="tax-percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={taxForm.percentage}
                        onChange={(e) =>
                          setTaxForm({
                            ...taxForm,
                            percentage: parseFloat(e.target.value),
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-description">Description</Label>
                      <Textarea
                        id="tax-description"
                        value={taxForm.description}
                        onChange={(e) =>
                          setTaxForm({
                            ...taxForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Tax description"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowTaxDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveTax}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Save Tax
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Tax List */}
            <div className="grid gap-4">
              {taxes.length === 0 ? (
                <Card className="glass border-border shadow-xl">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No taxes configured yet. Add your first tax to get started.
                  </CardContent>
                </Card>
              ) : (
                taxes.map((tax) => (
                  <Card key={tax.id} className="glass border-border shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-foreground">
                              {tax.name}
                            </h3>
                            <Badge
                              variant={tax.isActive ? "default" : "secondary"}
                            >
                              {tax.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {tax.description}
                          </p>
                          <p className="text-2xl font-bold text-orange-500">
                            {tax.percentage}%
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleToggleTax(tax.id)
                            }
                            title={tax.isActive ? "Disable" : "Enable"}
                          >
                            {tax.isActive ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTax(tax)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              setDeleteId(tax.id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tax? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={handleDeleteTax}
            className="bg-red-500 hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
