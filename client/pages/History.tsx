import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Car,
  Clock,
  MapPin,
  Search,
  Filter,
  CheckCircle,
  Star,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNavigation from "@/components/BottomNavigation";
import StickyHeader from "@/components/StickyHeader";

interface WashHistory {
  id: string;
  service: string;
  vehicleType: string;
  date: string;
  time: string;
  status: "completed" | "scheduled" | "cancelled";
  amount: number;
  branch: string;
  rating?: number;
  voucher?: string;
}

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [washHistory] = useState<WashHistory[]>([
    {
      id: "1",
      service: "VIP ProMax Wash",
      vehicleType: "SUV",
      date: "2024-01-15",
      time: "10:30 AM",
      status: "completed",
      amount: 0,
      branch: "Tumaga Hub",
      rating: 5,
    },
    {
      id: "2",
      service: "Classic Wash",
      vehicleType: "Sedan",
      date: "2024-01-10",
      time: "2:15 PM",
      status: "completed",
      amount: 0,
      branch: "Boalan Hub",
      rating: 4,
    },
    {
      id: "3",
      service: "Premium Detail",
      vehicleType: "Van",
      date: "2024-01-05",
      time: "9:00 AM",
      status: "completed",
      amount: 0,
      branch: "Tumaga Hub",
      rating: 5,
      voucher: "SAVE20",
    },
    {
      id: "4",
      service: "Express Wash",
      vehicleType: "Big Bike",
      date: "2024-01-20",
      time: "3:00 PM",
      status: "scheduled",
      amount: 0,
      branch: "Boalan Hub",
    },
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
        )}
      />
    ));
  };

  const filteredHistory = washHistory.filter((item) => {
    const matchesSearch = item.service
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Wash History</h1>
            <ThemeToggle />
          </div>

          {/* Search and Filter */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Status Filter */}
          <div className="flex space-x-2 mt-3">
            {["all", "completed", "scheduled", "cancelled"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "text-xs",
                  filterStatus === status
                    ? "bg-fac-orange-500 hover:bg-fac-orange-600"
                    : "",
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {filteredHistory.map((item) => (
          <Card key={item.id} className="bg-card border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {item.service}
                    </h3>
                    {item.voucher && (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <Receipt className="h-3 w-3 mr-1" />
                        {item.voucher}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
                    <Car className="h-4 w-4" />
                    <span>{item.vehicleType}</span>
                    <span>•</span>
                    <span>{formatDate(item.date)}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{item.branch}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    className={cn(
                      "text-xs mb-2",
                      item.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : item.status === "scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700",
                    )}
                  >
                    {item.status === "completed" && (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    {item.status === "scheduled" && (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {item.status.toUpperCase()}
                  </Badge>
                  {item.rating && (
                    <div className="flex items-center space-x-1">
                      {renderStars(item.rating)}
                    </div>
                  )}
                </div>
              </div>

              {item.status === "completed" && (
                <div className="flex space-x-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Receipt
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Book Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredHistory.length === 0 && (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No wash history found</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
