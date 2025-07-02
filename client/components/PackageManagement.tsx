import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Package, Plus, Edit, Trash2 } from "lucide-react";

interface ServicePackage {
  id: string;
  name: string;
  basePrice: number;
  duration: string;
  features: string[];
  active: boolean;
}

interface PackageManagementProps {
  userRole: string;
  packages: ServicePackage[];
  setPackages: (packages: ServicePackage[]) => void;
  formatCurrency: (amount: number) => string;
}

export default function PackageManagement({
  userRole,
  packages,
  setPackages,
  formatCurrency,
}: PackageManagementProps) {
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [packageModalMode, setPackageModalMode] = useState<"add" | "edit">(
    "add",
  );
  const [currentPackage, setCurrentPackage] = useState<ServicePackage | null>(
    null,
  );
  const [newPackage, setNewPackage] = useState<Partial<ServicePackage>>({
    name: "",
    basePrice: 0,
    duration: "",
    features: [],
    active: true,
  });
  const [editingFeatures, setEditingFeatures] = useState<string>("");

  const handleOpenPackageModal = (
    mode: "add" | "edit",
    pkg?: ServicePackage,
  ) => {
    setPackageModalMode(mode);
    if (mode === "edit" && pkg) {
      setCurrentPackage(pkg);
      setNewPackage({
        name: pkg.name,
        basePrice: pkg.basePrice,
        duration: pkg.duration,
        features: pkg.features,
        active: pkg.active,
      });
      setEditingFeatures(pkg.features.join("\n"));
    } else {
      setCurrentPackage(null);
      setNewPackage({
        name: "",
        basePrice: 0,
        duration: "",
        features: [],
        active: true,
      });
      setEditingFeatures("");
    }
    setIsPackageModalOpen(true);
  };

  const handleSavePackageModal = () => {
    if (packageModalMode === "edit" && currentPackage) {
      // Update existing package
      const updatedPackage = {
        ...currentPackage,
        name: newPackage.name!,
        basePrice: newPackage.basePrice!,
        duration: newPackage.duration!,
        features: editingFeatures.split("\n").filter((f) => f.trim() !== ""),
        active: newPackage.active!,
      };
      setPackages(
        packages.map((pkg) =>
          pkg.id === currentPackage.id ? updatedPackage : pkg,
        ),
      );
      alert("Package updated successfully!");
    } else {
      // Add new package
      if (newPackage.name && newPackage.basePrice) {
        const id = newPackage.name.toLowerCase().replace(/\s+/g, "-");
        const features = editingFeatures
          .split("\n")
          .filter((f) => f.trim() !== "");
        setPackages([
          ...packages,
          {
            id,
            name: newPackage.name!,
            basePrice: newPackage.basePrice!,
            duration: newPackage.duration || "30 mins",
            features,
            active: true,
          },
        ]);
        alert("Package added successfully!");
      }
    }
    setIsPackageModalOpen(false);
    setCurrentPackage(null);
    setNewPackage({
      name: "",
      basePrice: 0,
      duration: "",
      features: [],
      active: true,
    });
    setEditingFeatures("");
  };

  const handleDeletePackage = (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      setPackages(packages.filter((pkg) => pkg.id !== id));
      alert("Package deleted successfully!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Package Management Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-fac-orange-500" />
              <span>Package Management</span>
              <Badge variant="outline" className="text-xs">
                Role: {userRole} | Editing:{" "}
                {userRole === "superadmin" || userRole === "admin"
                  ? "Enabled"
                  : "Disabled"}
              </Badge>
            </div>
            {(userRole === "superadmin" || userRole === "admin") && (
              <Button
                onClick={() => handleOpenPackageModal("add")}
                className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg font-black">{pkg.name}</span>
                <Badge
                  className={`${pkg.active ? "bg-green-500" : "bg-gray-400"} text-white font-bold`}
                >
                  {pkg.active ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Price */}
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-fac-orange-500">
                    {formatCurrency(pkg.basePrice)}
                  </p>
                  {(userRole === "superadmin" || userRole === "admin") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenPackageModal("edit", pkg)}
                      className="border-fac-orange-200 text-fac-orange-600 hover:bg-fac-orange-50"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    <strong>Duration:</strong> {pkg.duration}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    Features:
                  </p>
                  <div className="space-y-1">
                    {pkg.features.map((feature, index) => (
                      <p
                        key={index}
                        className="text-sm text-gray-600 font-medium"
                      >
                        • {feature}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {(userRole === "superadmin" || userRole === "admin") && (
                  <div className="flex space-x-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenPackageModal("edit", pkg)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Package</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete the "{pkg.name}"
                            package? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeletePackage(pkg.id)}
                          >
                            Delete Package
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Package Modal */}
      <Dialog open={isPackageModalOpen} onOpenChange={setIsPackageModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {packageModalMode === "edit" ? "Edit Package" : "Add New Package"}
            </DialogTitle>
            <DialogDescription>
              {packageModalMode === "edit"
                ? "Update the package details below."
                : "Create a new service package for customers."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="packageName" className="font-bold">
                Package Name
              </Label>
              <Input
                id="packageName"
                value={newPackage.name}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, name: e.target.value })
                }
                placeholder="e.g., Premium VIP"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="packagePrice" className="font-bold">
                Base Price (PHP)
              </Label>
              <Input
                id="packagePrice"
                type="number"
                value={newPackage.basePrice}
                onChange={(e) =>
                  setNewPackage({
                    ...newPackage,
                    basePrice: Number(e.target.value),
                  })
                }
                placeholder="e.g., 1500"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="packageDuration" className="font-bold">
                Duration
              </Label>
              <Input
                id="packageDuration"
                value={newPackage.duration}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, duration: e.target.value })
                }
                placeholder="e.g., 45 mins"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="packageFeatures" className="font-bold">
                Package Features
              </Label>
              <Textarea
                id="packageFeatures"
                value={editingFeatures}
                onChange={(e) => setEditingFeatures(e.target.value)}
                placeholder="Enter each feature on a new line&#10;e.g.:&#10;Premium exterior wash&#10;Interior vacuum&#10;Tire shine&#10;Dashboard clean"
                className="mt-1 min-h-[120px]"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter each feature on a new line
              </p>
            </div>

            {packageModalMode === "edit" && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="packageActive" className="font-bold">
                  Active Package
                </Label>
                <input
                  type="checkbox"
                  id="packageActive"
                  checked={newPackage.active}
                  onChange={(e) =>
                    setNewPackage({ ...newPackage, active: e.target.checked })
                  }
                  className="w-4 h-4 text-fac-orange-500 border-gray-300 rounded focus:ring-fac-orange-500"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPackageModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-fac-orange-500 hover:bg-fac-orange-600"
              onClick={handleSavePackageModal}
              disabled={!newPackage.name || !newPackage.basePrice}
            >
              {packageModalMode === "edit" ? "Update Package" : "Add Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
