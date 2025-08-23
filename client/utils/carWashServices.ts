export interface VehicleType {
  id: string;
  name: string;
  category: "car" | "motorcycle";
  multiplier: number; // Price multiplier for this vehicle type
}

export interface MotorcycleSubtype {
  id: string;
  name: string;
  multiplier: number;
}

export interface CarWashService {
  id: string;
  name: string;
  description: string;
  basePrice: number; // Base price that gets multiplied by vehicle type
  duration: string;
  features: string[];
  category: "basic" | "premium" | "luxury";
  isActive: boolean;
  createdDate: string;
}

export interface ServiceVariant {
  serviceId: string;
  vehicleTypeId: string;
  motorcycleSubtypeId?: string;
  finalPrice: number;
}

// Vehicle types with pricing multipliers
export const vehicleTypes: VehicleType[] = [
  {
    id: "sedan",
    name: "Sedan",
    category: "car",
    multiplier: 1.0, // Base price
  },
  {
    id: "suv",
    name: "SUV",
    category: "car",
    multiplier: 1.3, // 30% more than base
  },
  {
    id: "van",
    name: "Van",
    category: "car",
    multiplier: 1.5, // 50% more than base
  },
  {
    id: "pickup",
    name: "Pick-up Truck",
    category: "car",
    multiplier: 1.4, // 40% more than base
  },
  {
    id: "motorcycle",
    name: "Motorcycle",
    category: "motorcycle",
    multiplier: 0.6, // 40% less than base
  },
];

// Motorcycle subtypes with additional multipliers
export const motorcycleSubtypes: MotorcycleSubtype[] = [
  {
    id: "small",
    name: "Small Bike (Scooter, 150cc and below)",
    multiplier: 0.8, // 80% of motorcycle base
  },
  {
    id: "medium",
    name: "Medium Bike (151-400cc)",
    multiplier: 1.0, // 100% of motorcycle base
  },
  {
    id: "big",
    name: "Big Bike (401cc and above)",
    multiplier: 1.3, // 130% of motorcycle base
  },
];

// Default car wash services
const defaultServices: CarWashService[] = [
  {
    id: "classic",
    name: "Classic Wash",
    description: "Basic exterior cleaning with quality optimization",
    basePrice: 200,
    duration: "30 mins",
    features: [
      "Professional wash system",
      "Exterior cleaning",
      "Tire shine",
      "Basic protection",
    ],
    category: "basic",
    isActive: true,
    createdDate: new Date().toISOString(),
  },
  {
    id: "regular",
    name: "Regular Wash",
    description: "Standard wash with interior wipe",
    basePrice: 300,
    duration: "45 mins",
    features: [
      "Professional wash system",
      "Exterior cleaning",
      "Interior wipe down",
      "Tire shine",
      "Basic protection",
    ],
    category: "basic",
    isActive: true,
    createdDate: new Date().toISOString(),
  },
  {
    id: "vip_pro",
    name: "VIP Pro Wash",
    description: "Premium wash with advanced care systems",
    basePrice: 400,
    duration: "60 mins",
    features: [
      "Premium wash",
      "Interior deep clean",
      "Paint protection",
      "Wax application",
      "Dashboard treatment",
    ],
    category: "premium",
    isActive: true,
    createdDate: new Date().toISOString(),
  },
  {
    id: "vip_pro_max",
    name: "VIP Pro Max",
    description: "Complete wash with detailing",
    basePrice: 800,
    duration: "75 mins",
    features: [
      "Premium wash",
      "Interior deep clean",
      "Paint protection",
      "Wax application",
      "Dashboard treatment",
      "Wheel detailing",
    ],
    category: "premium",
    isActive: true,
    createdDate: new Date().toISOString(),
  },
  {
    id: "premium",
    name: "Premium Wash",
    description: "Full premium service",
    basePrice: 1500,
    duration: "90 mins",
    features: [
      "Complete exterior detail",
      "Full interior restoration",
      "Paint correction",
      "Premium wax application",
      "Leather conditioning",
      "Engine bay clean",
    ],
    category: "luxury",
    isActive: true,
    createdDate: new Date().toISOString(),
  },
  {
    id: "fac",
    name: "FAC Wash",
    description: "Ultimate luxury experience",
    basePrice: 2500,
    duration: "120 mins",
    features: [
      "Complete exterior detail",
      "Full interior restoration",
      "Paint correction",
      "Ceramic coating application",
      "Leather conditioning",
      "Engine bay clean",
      "VIP treatment",
    ],
    category: "luxury",
    isActive: true,
    createdDate: new Date().toISOString(),
  },
];

export const getCarWashServices = (): CarWashService[] => {
  const stored = localStorage.getItem("fac_carwash_services");
  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem("fac_carwash_services", JSON.stringify(defaultServices));
  return defaultServices;
};

export const addCarWashService = (
  serviceData: Omit<CarWashService, "id" | "createdDate">,
): CarWashService => {
  const services = getCarWashServices();

  const newService: CarWashService = {
    ...serviceData,
    id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdDate: new Date().toISOString(),
  };

  services.push(newService);
  localStorage.setItem("fac_carwash_services", JSON.stringify(services));
  return newService;
};

export const updateCarWashService = (
  serviceId: string,
  updates: Partial<CarWashService>,
): void => {
  const services = getCarWashServices();
  const serviceIndex = services.findIndex((s) => s.id === serviceId);

  if (serviceIndex !== -1) {
    services[serviceIndex] = { ...services[serviceIndex], ...updates };
    localStorage.setItem("fac_carwash_services", JSON.stringify(services));
  }
};

export const deleteCarWashService = (serviceId: string): void => {
  const services = getCarWashServices();
  const filteredServices = services.filter((s) => s.id !== serviceId);
  localStorage.setItem(
    "fac_carwash_services",
    JSON.stringify(filteredServices),
  );
};

export const calculateServicePrice = (
  basePrice: number,
  vehicleTypeId: string,
  motorcycleSubtypeId?: string,
): number => {
  const vehicleType = vehicleTypes.find((vt) => vt.id === vehicleTypeId);
  if (!vehicleType) return basePrice;

  let finalPrice = basePrice * vehicleType.multiplier;

  // Apply motorcycle subtype multiplier if applicable
  if (vehicleType.category === "motorcycle" && motorcycleSubtypeId) {
    const motorcycleSubtype = motorcycleSubtypes.find(
      (ms) => ms.id === motorcycleSubtypeId,
    );
    if (motorcycleSubtype) {
      finalPrice = finalPrice * motorcycleSubtype.multiplier;
    }
  }

  return Math.round(finalPrice);
};

export const getServiceVariants = (serviceId: string): ServiceVariant[] => {
  const service = getCarWashServices().find((s) => s.id === serviceId);
  if (!service) return [];

  const variants: ServiceVariant[] = [];

  vehicleTypes.forEach((vehicleType) => {
    if (vehicleType.category === "motorcycle") {
      // Create variants for each motorcycle subtype
      motorcycleSubtypes.forEach((subtype) => {
        variants.push({
          serviceId,
          vehicleTypeId: vehicleType.id,
          motorcycleSubtypeId: subtype.id,
          finalPrice: calculateServicePrice(
            service.basePrice,
            vehicleType.id,
            subtype.id,
          ),
        });
      });
    } else {
      // Create variant for car types
      variants.push({
        serviceId,
        vehicleTypeId: vehicleType.id,
        finalPrice: calculateServicePrice(service.basePrice, vehicleType.id),
      });
    }
  });

  return variants;
};

export const getAllServiceVariants = (): {
  service: CarWashService;
  variants: ServiceVariant[];
}[] => {
  const services = getCarWashServices().filter((s) => s.isActive);

  return services.map((service) => ({
    service,
    variants: getServiceVariants(service.id),
  }));
};

export const findServiceVariant = (
  serviceId: string,
  vehicleTypeId: string,
  motorcycleSubtypeId?: string,
): ServiceVariant | undefined => {
  const variants = getServiceVariants(serviceId);

  return variants.find(
    (variant) =>
      variant.vehicleTypeId === vehicleTypeId &&
      variant.motorcycleSubtypeId === motorcycleSubtypeId,
  );
};

export const getVehicleDisplayName = (
  vehicleTypeId: string,
  motorcycleSubtypeId?: string,
): string => {
  const vehicleType = vehicleTypes.find((vt) => vt.id === vehicleTypeId);
  if (!vehicleType) return "Unknown Vehicle";

  if (vehicleType.category === "motorcycle" && motorcycleSubtypeId) {
    const subtype = motorcycleSubtypes.find(
      (ms) => ms.id === motorcycleSubtypeId,
    );
    return subtype ? `${vehicleType.name} - ${subtype.name}` : vehicleType.name;
  }

  return vehicleType.name;
};
