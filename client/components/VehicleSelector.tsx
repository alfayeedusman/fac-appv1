import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Car, Truck, Bus, Bike } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleSelectorProps {
  value: {
    vehicleType: string;
    motorcycleType?: string;
  };
  onChange: (value: { vehicleType: string; motorcycleType?: string }) => void;
  className?: string;
}

const vehicleTypes = [
  { id: "sedan", name: "Sedan", icon: Car },
  { id: "suv", name: "SUV", icon: Car },
  { id: "hatchback", name: "Hatchback", icon: Car },
  { id: "pickup", name: "Pickup Truck", icon: Truck },
  { id: "van", name: "Van", icon: Bus },
  { id: "motorcycle", name: "Motorcycle", icon: Bike },
];

const motorcycleTypes = [
  { id: "small", name: "Small Motor (Scooter, 150cc and below)" },
  { id: "medium", name: "Medium Motor (151-400cc)" },
  { id: "big", name: "Big Bike (401cc and above)" },
];

export default function VehicleSelector({
  value,
  onChange,
  className,
}: VehicleSelectorProps) {
  const handleVehicleTypeChange = (vehicleType: string) => {
    if (vehicleType === "motorcycle") {
      onChange({
        vehicleType,
        motorcycleType: value.motorcycleType || "small",
      });
    } else {
      onChange({ vehicleType, motorcycleType: undefined });
    }
  };

  const handleMotorcycleTypeChange = (motorcycleType: string) => {
    onChange({ ...value, motorcycleType });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label className="text-sm font-medium mb-2 block">Vehicle Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {vehicleTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = value.vehicleType === type.id;

            return (
              <Button
                key={type.id}
                variant={isSelected ? "default" : "outline"}
                onClick={() => handleVehicleTypeChange(type.id)}
                className={cn(
                  "h-auto p-3 flex flex-col items-center space-y-2",
                  isSelected
                    ? "bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                    : "hover:bg-muted",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{type.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {value.vehicleType === "motorcycle" && (
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Motorcycle Type
          </Label>
          <Select
            value={value.motorcycleType || "small"}
            onValueChange={handleMotorcycleTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select motorcycle type" />
            </SelectTrigger>
            <SelectContent>
              {motorcycleTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
