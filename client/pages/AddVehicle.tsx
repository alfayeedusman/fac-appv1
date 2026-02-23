import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import StickyHeader from "@/components/StickyHeader";

const VEHICLE_TYPES = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "truck", label: "Truck" },
  { value: "van", label: "Van" },
  { value: "hatchback", label: "Hatchback" },
  { value: "coupe", label: "Coupe" },
  { value: "motorcycle", label: "Motorcycle" },
];

const COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#FFFFFF", label: "White" },
  { value: "#808080", label: "Gray" },
  { value: "#FF0000", label: "Red" },
  { value: "#0000FF", label: "Blue" },
  { value: "#FFFF00", label: "Yellow" },
  { value: "#FFA500", label: "Orange" },
  { value: "#800080", label: "Purple" },
  { value: "#FFC0CB", label: "Pink" },
  { value: "#008000", label: "Green" },
  { value: "#A52A2A", label: "Brown" },
  { value: "#C0C0C0", label: "Silver" },
];

interface FormData {
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  type: string;
  isDefault: boolean;
}

export default function AddVehicle() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "#000000",
    plateNumber: "",
    type: "sedan",
    isDefault: false,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.make.trim()) newErrors.make = "Make is required";
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (!formData.plateNumber.trim()) newErrors.plateNumber = "Plate number is required";
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = `Year must be between 1900 and ${new Date().getFullYear() + 1}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/supabase/vehicles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create vehicle");

      toast({
        title: "Success",
        description: "Vehicle added successfully",
      });

      navigate("/vehicles");
    } catch (error) {
      console.error("Error creating vehicle:", error);
      toast({
        title: "Error",
        description: "Failed to add vehicle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background pb-10">
      <StickyHeader title="Add Vehicle" />

      <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Make and Model */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
              <CardDescription>Basic information about your vehicle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    placeholder="e.g., Toyota, Honda"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className={errors.make ? "border-destructive" : ""}
                  />
                  {errors.make && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.make}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    placeholder="e.g., Camry, Civic"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className={errors.model ? "border-destructive" : ""}
                  />
                  {errors.model && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.model}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={formData.year.toString()}
                    onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}
                  >
                    <SelectTrigger id="year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 50 }, (_, i) => currentYear - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.year && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.year}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plate Number and Color */}
          <Card>
            <CardHeader>
              <CardTitle>Identification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Plate Number *</Label>
                <Input
                  id="plateNumber"
                  placeholder="e.g., ABC-1234"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                  className={errors.plateNumber ? "border-destructive" : ""}
                />
                {errors.plateNumber && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.plateNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger id="color">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: formData.color }}
                      />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: c.value }}
                          />
                          {c.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Set as Default */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked as boolean })}
                />
                <Label htmlFor="isDefault" className="cursor-pointer">
                  Set as default vehicle for bookings
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/vehicles")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Adding..." : "Add Vehicle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
