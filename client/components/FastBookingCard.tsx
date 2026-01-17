import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Clock,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface FastService {
  id: string;
  name: string;
  category: string;
  price: number;
  icon?: React.ReactNode;
  duration: number; // in minutes
  popular?: boolean;
}

interface FastBookingCardProps {
  services: FastService[];
  onSelectService: (service: FastService) => void;
  isLoading?: boolean;
}

export default function FastBookingCard({
  services,
  onSelectService,
  isLoading = false,
}: FastBookingCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fastServices: FastService[] = [
    {
      id: "quick-wash",
      name: "Quick Wash",
      category: "carwash",
      price: 499,
      duration: 30,
      popular: true,
    },
    {
      id: "standard-wash",
      name: "Standard Wash",
      category: "carwash",
      price: 799,
      duration: 45,
    },
    {
      id: "premium-wash",
      name: "Premium Wash",
      category: "carwash",
      price: 1299,
      duration: 60,
    },
    {
      id: "detailing",
      name: "Auto Detailing",
      category: "auto_detailing",
      price: 2499,
      duration: 90,
    },
  ];

  const handleSelect = (service: FastService) => {
    setSelectedId(service.id);
    setTimeout(() => onSelectService(service), 300);
  };

  return (
    <Card className="glass border-border/50 shadow-lg overflow-hidden bg-gradient-to-br from-white/50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-950/30">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-white" />
              <h3 className="font-bold text-white text-lg">Fast Booking</h3>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 text-xs">
              -30% faster
            </Badge>
          </div>
          <p className="text-white/90 text-sm">
            Select a popular service and book in seconds
          </p>
        </div>

        {/* Services Grid */}
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {fastServices.slice(0, 4).map((service) => (
              <button
                key={service.id}
                onClick={() => handleSelect(service)}
                disabled={isLoading}
                className={`relative p-3 rounded-xl border-2 transition-all duration-300 group
                  ${
                    selectedId === service.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50"
                      : "border-border/50 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-muted/50"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {/* Popular Badge */}
                {service.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
                    Popular
                  </Badge>
                )}

                <div className="text-left">
                  <div className="font-semibold text-sm text-foreground flex items-center justify-between mb-1">
                    <span>{service.name}</span>
                    {selectedId === service.id && (
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.duration}m
                    </span>
                    <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                      ₱{service.price}
                    </span>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all pointer-events-none" />
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg border border-blue-200/30 dark:border-blue-800/30">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">
              ⏱️ <strong>~5 minutes</strong> to complete full booking after selecting a service
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => selectedId && handleSelect(fastServices.find(s => s.id === selectedId)!)}
            disabled={!selectedId || isLoading}
            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold h-11 rounded-xl flex items-center justify-center gap-2 group transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            Continue Booking
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
