import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Car,
  Bike,
  DollarSign,
  Clock,
  Star,
  Eye,
} from "lucide-react";
import {
  getCarWashServices,
  addCarWashService,
  updateCarWashService,
  deleteCarWashService,
  getAllServiceVariants,
  vehicleTypes,
  motorcycleSubtypes,
  CarWashService,
} from "@/utils/carWashServices";
import { notificationManager } from "@/components/NotificationModal";

export default function CarWashServiceManager() {
  const [services, setServices] = useState<CarWashService[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [selectedService, setSelectedService] = useState<CarWashService | null>(
    null,
  );
  const [editingService, setEditingService] = useState<CarWashService | null>(
    null,
  );

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    basePrice: 200,
    duration: "30 mins",
    features: [""],
    category: "basic" as CarWashService["category"],
    isActive: true,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    setServices(getCarWashServices());
  };

  const handleAddService = () => {
    if (!newService.name || !newService.description) {
      notificationManager.error(
        "Missing Information",
        "Please fill in service name and description",
      );
      return;
    }

    const filteredFeatures = newService.features.filter((f) => f.trim() !== "");
    if (filteredFeatures.length === 0) {
      notificationManager.error(
        "Missing Features",
        "Please add at least one feature",
      );
      return;
    }

    try {
      addCarWashService({
        ...newService,
        features: filteredFeatures,
      });

      notificationManager.success(
        "Service Added",
        `${newService.name} has been added successfully`,
      );

      setNewService({
        name: "",
        description: "",
        basePrice: 200,
        duration: "30 mins",
        features: [""],
        category: "basic",
        isActive: true,
      });
      setShowAddModal(false);
      loadServices();
    } catch (error) {
      notificationManager.error("Error", "Failed to add service");
    }
  };

  const handleDeleteService = (serviceId: string) => {
    try {
      deleteCarWashService(serviceId);
      notificationManager.success(
        "Service Deleted",
        "Service removed successfully",
      );
      loadServices();
    } catch (error) {
      notificationManager.error("Error", "Failed to delete service");
    }
  };

  const addFeature = () => {
    setNewService({
      ...newService,
      features: [...newService.features, ""],
    });
  };

  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...newService.features];
    updatedFeatures[index] = value;
    setNewService({
      ...newService,
      features: updatedFeatures,
    });
  };

  const removeFeature = (index: number) => {
    if (newService.features.length > 1) {
      const updatedFeatures = newService.features.filter((_, i) => i !== index);
      setNewService({
        ...newService,
        features: updatedFeatures,
      });
    }
  };

  const showServiceVariants = (service: CarWashService) => {
    setSelectedService(service);
    setShowVariantsModal(true);
  };

  const getCategoryColor = (category: CarWashService["category"]) => {
    switch (category) {
      case "basic":
        return "bg-blue-100 text-blue-700";
      case "premium":
        return "bg-orange-100 text-orange-700";
      case "luxury":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const serviceVariants = selectedService
    ? getAllServiceVariants().find((sv) => sv.service.id === selectedService.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Car Wash Services
          </h2>
          <p className="text-gray-600">
            Manage services with vehicle-based pricing
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card
            key={service.id}
            className="bg-white border-gray-200 hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-gray-900 text-lg">
                    {service.name}
                  </CardTitle>
                  <Badge className={getCategoryColor(service.category)}>
                    {service.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => showServiceVariants(service)}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                {service.description}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Base Price:</span>
                  <span className="font-bold text-orange-600 text-lg">
                    ₱{service.basePrice}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Duration:</span>
                  <span className="text-sm font-medium">
                    {service.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Features:</span>
                  <span className="text-sm font-medium">
                    {service.features.length} items
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Service Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Add New Car Wash Service
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new service with vehicle-based pricing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="serviceName" className="text-gray-700">
                Service Name
              </Label>
              <Input
                id="serviceName"
                placeholder="Classic Wash"
                value={newService.name}
                onChange={(e) =>
                  setNewService({ ...newService, name: e.target.value })
                }
                className="border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Basic exterior cleaning with quality optimization"
                value={newService.description}
                onChange={(e) =>
                  setNewService({ ...newService, description: e.target.value })
                }
                className="border-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice" className="text-gray-700">
                  Base Price (₱)
                </Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={newService.basePrice}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      basePrice: parseInt(e.target.value) || 0,
                    })
                  }
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-gray-700">
                  Duration
                </Label>
                <Input
                  id="duration"
                  placeholder="30 mins"
                  value={newService.duration}
                  onChange={(e) =>
                    setNewService({ ...newService, duration: e.target.value })
                  }
                  className="border-gray-300"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="text-gray-700">
                Category
              </Label>
              <Select
                value={newService.category}
                onValueChange={(value: CarWashService["category"]) =>
                  setNewService({ ...newService, category: value })
                }
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700">Features</Label>
              <div className="space-y-2">
                {newService.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Professional wash system"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="border-gray-300"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      disabled={newService.features.length === 1}
                      className="border-gray-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                  className="border-gray-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddService}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Variants Modal */}
      <Dialog open={showVariantsModal} onOpenChange={setShowVariantsModal}>
        <DialogContent className="sm:max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {selectedService?.name} - Pricing by Vehicle Type
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Base price: ₱{selectedService?.basePrice} - Final prices
              calculated with vehicle multipliers
            </DialogDescription>
          </DialogHeader>

          {serviceVariants && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle Type</TableHead>
                    <TableHead>Subtype</TableHead>
                    <TableHead>Final Price</TableHead>
                    <TableHead>Price Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceVariants.variants.map((variant, index) => {
                    const vehicleType = vehicleTypes.find(
                      (vt) => vt.id === variant.vehicleTypeId,
                    );
                    const motorcycleSubtype = variant.motorcycleSubtypeId
                      ? motorcycleSubtypes.find(
                          (ms) => ms.id === variant.motorcycleSubtypeId,
                        )
                      : null;

                    const basePrice = selectedService!.basePrice;
                    const priceDiff = variant.finalPrice - basePrice;
                    const priceChangePercent = (
                      (priceDiff / basePrice) *
                      100
                    ).toFixed(0);

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {vehicleType?.category === "motorcycle" ? (
                              <Bike className="h-4 w-4 mr-2 text-orange-500" />
                            ) : (
                              <Car className="h-4 w-4 mr-2 text-blue-500" />
                            )}
                            {vehicleType?.name}
                          </div>
                        </TableCell>
                        <TableCell>{motorcycleSubtype?.name || "-"}</TableCell>
                        <TableCell className="font-bold text-orange-600">
                          ₱{variant.finalPrice}
                        </TableCell>
                        <TableCell>
                          {priceDiff === 0 ? (
                            <Badge className="bg-gray-100 text-gray-700">
                              Base Price
                            </Badge>
                          ) : priceDiff > 0 ? (
                            <Badge className="bg-red-100 text-red-700">
                              +₱{priceDiff} (+{priceChangePercent}%)
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700">
                              ₱{priceDiff} ({priceChangePercent}%)
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVariantsModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
