import { useState, useEffect } from "react";
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
  Zap,
  Users,
  Shield,
  UserCheck,
  UserX,
  Search,
  Crown,
  UserPlus,
  User as UserIcon,
  Check,
  X,
  Wifi,
} from "lucide-react";
import ReceiptLivePreview from "@/components/ReceiptLivePreview";
import PrinterConfiguration from "@/components/PrinterConfiguration";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { supabaseDbClient } from "@/services/supabaseDatabaseService";
import { receiptPrintService } from "@/services/receiptPrintService";
import Swal from "sweetalert2";
import { Upload, Download } from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
  approvalStatus?: string;
}

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
  paperWidth: number;
  includeLogo: boolean;
  includeQR: boolean;
  includeSignature: boolean;
}

interface FeatureSettings {
  posEnabled: boolean;
  vatEnabled: boolean;
}

// Role definitions with permissions
const roleDefinitions = {
  superadmin: {
    name: "Super Administrator",
    description: "Full system access",
    color: "bg-red-500",
    permissions: [
      "dashboard",
      "customers",
      "user-management",
      "ads",
      "packages",
      "branches",
      "analytics",
      "sales",
      "inventory",
      "notifications",
      "cms",
      "push-notifications",
      "gamification",
      "subscription-approval",
      "booking",
      "pos",
      "crew-management",
      "images",
      "database",
      "settings",
    ],
  },
  admin: {
    name: "Administrator",
    description: "Most system features",
    color: "bg-orange-500",
    permissions: [
      "dashboard",
      "customers",
      "ads",
      "packages",
      "branches",
      "analytics",
      "sales",
      "inventory",
      "notifications",
      "cms",
      "push-notifications",
      "gamification",
      "subscription-approval",
      "booking",
      "pos",
      "crew-management",
      "settings",
    ],
  },
  manager: {
    name: "Manager",
    description: "Limited system access",
    color: "bg-blue-500",
    permissions: [
      "dashboard",
      "customers",
      "ads",
      "packages",
      "analytics",
      "sales",
      "inventory",
      "bookings",
    ],
  },
  staff: {
    name: "Staff",
    description: "View and manage bookings",
    color: "bg-green-500",
    permissions: ["dashboard", "bookings", "pos"],
  },
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<
    "receipt" | "taxes" | "features" | "users" | "printers"
  >("receipt");
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
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
    termsText: "",
    printingMode: "auto",
    printerType: "thermal",
  });

  const [features, setFeatures] = useState<FeatureSettings>({
    posEnabled: true,
    vatEnabled: true,
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

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
    role: "staff",
  });

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
  const [deleteType, setDeleteType] = useState<"tax" | "user">("tax");

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const result = await supabaseDbClient.getStaffUsers();
      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast({ title: "Error", description: "Failed to load users" });
    } finally {
      setUsersLoading(false);
    }
  };

  // User Management Functions
  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({
      email: "",
      fullName: "",
      phoneNumber: "",
      role: "staff",
    });
    setShowUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      fullName: user.fullName || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || "staff",
    });
    setShowUserDialog(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.email.trim()) {
      toast({ title: "Error", description: "Email is required" });
      return;
    }
    if (!userForm.fullName.trim()) {
      toast({ title: "Error", description: "Full name is required" });
      return;
    }
    if (!userForm.role) {
      toast({ title: "Error", description: "Role is required" });
      return;
    }

    try {
      if (editingUser) {
        toast({
          title: "Info",
          description: "User update functionality coming soon",
        });
      } else {
        const newUser = {
          fullName: userForm.fullName,
          email: userForm.email,
          role: userForm.role,
          permissions:
            roleDefinitions[userForm.role as keyof typeof roleDefinitions]
              ?.permissions || [],
          contactNumber: userForm.phoneNumber,
          branchLocation: "Main",
        };
        const result = await supabaseDbClient.createStaffUser(newUser);
        if (result.success) {
          toast({ title: "Success", description: "User created successfully" });
          setShowUserDialog(false);
          loadUsers();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create user",
          });
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast({ title: "Error", description: "Failed to save user" });
    }
  };

  const handleDeleteUser = async () => {
    if (deleteId && deleteType === "user") {
      try {
        toast({
          title: "Info",
          description: "User deletion functionality coming soon",
        });
        setShowDeleteDialog(false);
        setDeleteId(null);
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({ title: "Error", description: "Failed to delete user" });
      }
    }
  };

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
      toast({
        title: "Error",
        description: "Tax percentage must be between 0 and 100",
      });
      return;
    }

    if (editingTax) {
      setTaxes(
        taxes.map((t) => (t.id === editingTax.id ? { ...t, ...taxForm } : t)),
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
      taxes.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)),
    );
    toast({ title: "Success", description: "Tax status updated" });
  };

  const handleDeleteTax = () => {
    if (deleteId && deleteType === "tax") {
      setTaxes(taxes.filter((t) => t.id !== deleteId));
      toast({ title: "Success", description: "Tax deleted successfully" });
    }
    setShowDeleteDialog(false);
    setDeleteId(null);
  };

  // Receipt Settings Functions
  const handleSaveReceiptSettings = () => {
    try {
      // Save to receipt print service
      receiptPrintService.updateSettings(receiptSettings);
      // Also save to localStorage for persistence
      localStorage.setItem("receiptSettings", JSON.stringify(receiptSettings));
      toast({
        title: "Success",
        description: "Receipt settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving receipt settings:", error);
      toast({
        title: "Error",
        description: "Failed to save receipt settings",
      });
    }
  };

  const handlePreviewReceipt = () => {
    try {
      const testData = {
        transactionNumber: "TXN-2024-001234",
        date: new Date(),
        items: [
          { name: "Basic Wash", quantity: 1, price: 150, subtotal: 150 },
          { name: "Wax Polish", quantity: 1, price: 200, subtotal: 200 },
        ],
        subtotal: 350,
        taxAmount: 42,
        discountAmount: 0,
        totalAmount: 392,
        paymentMethod: "cash",
        amountPaid: 400,
        changeAmount: 8,
        customerName: "John Doe",
        cashierName: "Maria Santos",
      };

      receiptPrintService.previewReceipt(testData, receiptSettings);
    } catch (error) {
      console.error("Error previewing receipt:", error);
      toast({
        title: "Error",
        description: "Failed to preview receipt. Check popup blocker settings.",
      });
    }
  };

  // Feature Toggle Functions
  const handleTogglePOS = () => {
    setFeatures({
      ...features,
      posEnabled: !features.posEnabled,
    });
    toast({
      title: "Success",
      description: `POS system ${!features.posEnabled ? "enabled" : "disabled"}`,
    });
  };

  const handleToggleVAT = () => {
    setFeatures({
      ...features,
      vatEnabled: !features.vatEnabled,
    });
    toast({
      title: "Success",
      description: `VAT ${!features.vatEnabled ? "enabled" : "disabled"}`,
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.fullName &&
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab("receipt")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "receipt"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Printer className="inline h-4 w-4 mr-2" />
          Receipt Designer
        </button>
        <button
          onClick={() => setActiveTab("printers")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "printers"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wifi className="inline h-4 w-4 mr-2" />
          Printer Setup
        </button>
        <button
          onClick={() => setActiveTab("taxes")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "taxes"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Percent className="inline h-4 w-4 mr-2" />
          Tax Management
        </button>
        <button
          onClick={() => setActiveTab("features")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "features"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="inline h-4 w-4 mr-2" />
          Features
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "users"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="inline h-4 w-4 mr-2" />
          User Management
        </button>
      </div>

      {/* Printer Setup Tab */}
      {activeTab === "printers" && <PrinterConfiguration />}

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
                <Label htmlFor="company-email">Company Email (Optional)</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={receiptSettings.companyEmail || ""}
                  onChange={(e) =>
                    setReceiptSettings({
                      ...receiptSettings,
                      companyEmail: e.target.value,
                    })
                  }
                  placeholder="info@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="header-message">Header Message</Label>
                <Input
                  id="header-message"
                  value={receiptSettings.headerMessage || ""}
                  onChange={(e) =>
                    setReceiptSettings({
                      ...receiptSettings,
                      headerMessage: e.target.value,
                    })
                  }
                  placeholder="e.g., Professional Car Washing Services"
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
                <Label htmlFor="terms-text">
                  Terms & Conditions (Optional)
                </Label>
                <Textarea
                  id="terms-text"
                  value={receiptSettings.termsText || ""}
                  onChange={(e) =>
                    setReceiptSettings({
                      ...receiptSettings,
                      termsText: e.target.value,
                    })
                  }
                  placeholder="Enter terms and conditions (will appear at bottom of receipt)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-upload">Company Logo (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target?.result as string;
                          setReceiptSettings({
                            ...receiptSettings,
                            logoUrl: dataUrl,
                          });
                          toast({
                            title: "Success",
                            description: "Logo uploaded successfully",
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="flex-1"
                  />
                </div>
                {receiptSettings.logoUrl && (
                  <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                    <img
                      src={receiptSettings.logoUrl}
                      alt="Logo Preview"
                      style={{ maxWidth: "100px", maxHeight: "100px" }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 text-red-500"
                      onClick={() => {
                        setReceiptSettings({
                          ...receiptSettings,
                          logoUrl: undefined,
                        });
                        toast({
                          title: "Success",
                          description: "Logo removed",
                        });
                      }}
                    >
                      Remove Logo
                    </Button>
                  </div>
                )}
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

              <div className="space-y-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <Label className="text-base font-semibold">
                  🖨️ Printing Mode & Settings
                </Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="printing-mode">Printing Mode</Label>
                    <Select
                      value={receiptSettings.printingMode}
                      onValueChange={(value) =>
                        setReceiptSettings({
                          ...receiptSettings,
                          printingMode: value as "auto" | "manual",
                        })
                      }
                    >
                      <SelectTrigger id="printing-mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          🤖 Auto Print (No Prompt)
                        </SelectItem>
                        <SelectItem value="manual">
                          👆 Manual Print (Ask User)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600 mt-1">
                      {receiptSettings.printingMode === "auto"
                        ? "✓ Receipts will print automatically to the default printer without showing a dialog"
                        : "✓ Users will be asked to confirm before printing each receipt"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="printer-type">Printer Type</Label>
                    <Select
                      value={receiptSettings.printerType}
                      onValueChange={(value) =>
                        setReceiptSettings({
                          ...receiptSettings,
                          printerType: value as "thermal" | "standard",
                        })
                      }
                    >
                      <SelectTrigger id="printer-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thermal">
                          🖨️ Thermal Printer (80mm)
                        </SelectItem>
                        <SelectItem value="standard">
                          📄 Standard Printer (A4)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600 mt-1">
                      {receiptSettings.printerType === "thermal"
                        ? "✓ Optimized for thermal receipt printers"
                        : "✓ Optimized for standard letter-size printers"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Receipt Features
                </Label>
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
                    <span>Include Company Logo/Name (Black & White)</span>
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
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showTermsConditions}
                      onChange={(e) =>
                        setReceiptSettings({
                          ...receiptSettings,
                          showTermsConditions: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span>Include Terms & Conditions</span>
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

          {/* Live Preview Panel */}
          <ReceiptLivePreview settings={receiptSettings} />
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
                    <Label htmlFor="tax-percentage">Percentage (%)</Label>
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
                          onClick={() => handleToggleTax(tax.id)}
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
                            setDeleteType("tax");
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

      {/* Features Tab */}
      {activeTab === "features" && (
        <div className="space-y-6">
          <div className="grid gap-6">
            {/* POS Feature Card */}
            <Card className="glass border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        Point of Sale (POS)
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Enable/disable POS sales terminal
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                      features.posEnabled
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {features.posEnabled ? (
                      <>
                        <Check className="h-5 w-5" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5" />
                        Disabled
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {features.posEnabled
                    ? "The Point of Sale system is currently active. Staff can process sales through the POS terminal."
                    : "The Point of Sale system is disabled. Sales cannot be processed through the terminal."}
                </p>
                <Button
                  onClick={handleTogglePOS}
                  className={`${
                    features.posEnabled
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {features.posEnabled ? "Disable POS" : "Enable POS"}
                </Button>
              </CardContent>
            </Card>

            {/* VAT Feature Card */}
            <Card className="glass border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg">
                      <Percent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        VAT/Tax System
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Enable/disable tax calculations
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                      features.vatEnabled
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {features.vatEnabled ? (
                      <>
                        <Check className="h-5 w-5" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5" />
                        Disabled
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {features.vatEnabled
                    ? "VAT/Tax system is active. Taxes will be calculated and applied to all transactions."
                    : "VAT/Tax system is disabled. No tax calculations will be applied."}
                </p>
                <Button
                  onClick={handleToggleVAT}
                  className={`${
                    features.vatEnabled
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {features.vatEnabled ? "Disable VAT/Tax" : "Enable VAT/Tax"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Staff & User Management</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Manage admin and staff accounts
              </p>
            </div>
            <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleAddUser}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? "Edit User" : "Add New User"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser
                      ? "Update user information"
                      : "Create a new staff or admin account"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm({ ...userForm, email: e.target.value })
                      }
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Full Name</Label>
                    <Input
                      id="user-name"
                      value={userForm.fullName}
                      onChange={(e) =>
                        setUserForm({ ...userForm, fullName: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-phone">Phone Number</Label>
                    <Input
                      id="user-phone"
                      value={userForm.phoneNumber}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="+63 123 456 7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-role">Role</Label>
                    <Select
                      value={userForm.role}
                      onValueChange={(value) =>
                        setUserForm({ ...userForm, role: value })
                      }
                    >
                      <SelectTrigger id="user-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="superadmin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowUserDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveUser}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Save User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          <Card className="glass border-border shadow-xl">
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-6 text-center text-muted-foreground">
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  {searchQuery ? "No users found" : "No users yet"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.email}
                          </TableCell>
                          <TableCell>{user.fullName || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                roleDefinitions[
                                  user.role as keyof typeof roleDefinitions
                                ]?.color || "bg-gray-500"
                              }
                            >
                              {roleDefinitions[
                                user.role as keyof typeof roleDefinitions
                              ]?.name || user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                  setDeleteId(user.id);
                                  setDeleteType("user");
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteType === "tax" ? "Delete Tax" : "Delete User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === "tax"
                ? "Are you sure you want to delete this tax? This action cannot be undone."
                : "Are you sure you want to delete this user? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={
                deleteType === "tax" ? handleDeleteTax : handleDeleteUser
              }
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
