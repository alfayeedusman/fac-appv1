import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, Car, Truck, Zap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import StickyHeader from "@/components/StickyHeader";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  type: string;
  isDefault: boolean;
  createdAt: string;
}

const VEHICLE_ICONS: Record<string, any> = {
  sedan: Car,
  suv: Truck,
  truck: Truck,
  van: Truck,
  hatchback: Car,
  coupe: Car,
  motorcycle: Zap,
};

export default function Vehicles() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/supabase/vehicles/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      
      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast({
        title: "Error",
        description: "Failed to load vehicles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/supabase/vehicles/${vehicleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete vehicle");

      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      setDeleteConfirm(null);
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
    const IconComponent = VEHICLE_ICONS[vehicle.type] || Car;
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Vehicle Icon and Basic Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-secondary p-3 rounded-lg">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                  </p>
                </div>
              </div>
              {vehicle.isDefault && (
                <Badge className="bg-green-500/20 text-green-700">Default</Badge>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-2 gap-4 py-3 border-y">
              <div>
                <p className="text-xs text-muted-foreground">Plate Number</p>
                <p className="font-mono font-semibold">{vehicle.plateNumber.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Color</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded border"
                    style={{ backgroundColor: vehicle.color }}
                  />
                  <span className="text-sm capitalize">{vehicle.color}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive"
                onClick={() => setDeleteConfirm(vehicle.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <StickyHeader title="My Vehicles" />
      
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Add Vehicle Button */}
        <Button
          onClick={() => navigate("/vehicles/add")}
          className="w-full"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Vehicle
        </Button>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Vehicles List */}
        {!loading && vehicles.length > 0 && (
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No vehicles yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add your first vehicle to get started
              </p>
              <Button onClick={() => navigate("/vehicles/add")}>
                Add Vehicle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            disabled={deleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
