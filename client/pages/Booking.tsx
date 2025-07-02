import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Droplets,
  Crown,
  CheckCircle,
  XCircle,
  Star,
  Plus,
  Filter,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  operatingHours: string;
  services: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookingHistory {
  id: string;
  date: string;
  time: string;
  branch: string;
  service: string;
  status: "completed" | "cancelled" | "upcoming" | "in-progress";
  price: number;
}

interface ServicePackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  icon: string;
}

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const branches: Branch[] = [
    {
      id: "tumaga",
      name: "Tumaga Branch",
      address: "123 Tumaga Road, Zamboanga City",
      phone: "+63 912 345 6789",
      operatingHours: "8:00 AM - 6:00 PM",
      services: ["Classic Wash", "VIP ProMax", "Premium Wash"],
    },
    {
      id: "boalan",
      name: "Boalan Branch",
      address: "456 Boalan Street, Zamboanga City",
      phone: "+63 912 987 6543",
      operatingHours: "8:00 AM - 6:00 PM",
      services: ["Classic Wash", "VIP ProMax", "Premium Wash"],
    },
  ];

  const servicePackages: ServicePackage[] = [
    {
      id: "classic",
      name: "Classic Wash",
      duration: "30 mins",
      price: 150,
      description: "Basic exterior wash and dry",
      icon: "droplets",
    },
    {
      id: "vip-promax",
      name: "VIP ProMax",
      duration: "45 mins",
      price: 300,
      description: "Premium wash with interior cleaning",
      icon: "star",
    },
    {
      id: "premium",
      name: "Premium Wash",
      duration: "60 mins",
      price: 500,
      description: "Complete detailing service",
      icon: "crown",
    },
  ];

  const timeSlots: TimeSlot[] = [
    { time: "8:00 AM", available: true },
    { time: "9:00 AM", available: true },
    { time: "10:00 AM", available: false },
    { time: "11:00 AM", available: true },
    { time: "12:00 PM", available: true },
    { time: "1:00 PM", available: false },
    { time: "2:00 PM", available: true },
    { time: "3:00 PM", available: true },
    { time: "4:00 PM", available: true },
    { time: "5:00 PM", available: true },
  ];

  const bookingHistory: BookingHistory[] = [
    {
      id: "1",
      date: "2024-01-25",
      time: "10:30 AM",
      branch: "Tumaga",
      service: "VIP ProMax",
      status: "completed",
      price: 300,
    },
    {
      id: "2",
      date: "2024-01-30",
      time: "2:00 PM",
      branch: "Boalan",
      service: "Classic Wash",
      status: "upcoming",
      price: 150,
    },
    {
      id: "3",
      date: "2024-01-22",
      time: "9:00 AM",
      branch: "Tumaga",
      service: "Premium Wash",
      status: "completed",
      price: 500,
    },
    {
      id: "4",
      date: "2024-01-15",
      time: "3:30 PM",
      branch: "Boalan",
      service: "Classic Wash",
      status: "cancelled",
      price: 150,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "upcoming":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "in-progress":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getServiceIcon = (iconType: string) => {
    switch (iconType) {
      case "droplets":
        return <Droplets className="h-5 w-5" />;
      case "star":
        return <Star className="h-5 w-5" />;
      case "crown":
        return <Crown className="h-5 w-5" />;
      default:
        return <Droplets className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleBooking = () => {
    if (selectedDate && selectedBranch && selectedService && selectedTime) {
      alert(
        `Booking confirmed!\nDate: ${selectedDate.toDateString()}\nTime: ${selectedTime}\nBranch: ${selectedBranch}\nService: ${selectedService}`,
      );
    } else {
      alert("Please fill in all booking details.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fac-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-fac-blue-900">Booking</h1>
            <p className="text-fac-blue-700">Schedule your car wash service</p>
          </div>
        </div>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule" className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="branches" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Branches
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {/* Service Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {servicePackages.map((service) => (
                    <div
                      key={service.id}
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer transition-all",
                        selectedService === service.id
                          ? "border-fac-blue-600 bg-fac-blue-50"
                          : "border-gray-200 hover:border-fac-blue-300",
                      )}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <div className="flex items-center mb-3">
                        <div className="bg-fac-blue-100 p-2 rounded-full mr-3">
                          {getServiceIcon(service.icon)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-gray-600">
                            {service.duration}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {service.description}
                      </p>
                      <p className="font-bold text-fac-blue-600">
                        ₱{service.price}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Branch & Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Branch</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedBranch}
                    onValueChange={setSelectedBranch}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Time Slot Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={
                        selectedTime === slot.time ? "default" : "outline"
                      }
                      className={cn(
                        "h-12",
                        !slot.available &&
                          "opacity-50 cursor-not-allowed bg-gray-100",
                        selectedTime === slot.time &&
                          "bg-fac-blue-600 hover:bg-fac-blue-700",
                      )}
                      disabled={!slot.available}
                      onClick={() =>
                        slot.available ? setSelectedTime(slot.time) : null
                      }
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary & Confirm */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-semibold">
                      {selectedService
                        ? servicePackages.find((s) => s.id === selectedService)
                            ?.name
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Branch:</span>
                    <span className="font-semibold">
                      {selectedBranch
                        ? branches.find((b) => b.id === selectedBranch)?.name
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">
                      {selectedDate
                        ? selectedDate.toDateString()
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">
                      {selectedTime || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-fac-blue-600">
                      ₱
                      {selectedService
                        ? servicePackages.find((s) => s.id === selectedService)
                            ?.price
                        : 0}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full bg-fac-blue-600 hover:bg-fac-blue-700"
                  onClick={handleBooking}
                  disabled={
                    !selectedDate ||
                    !selectedBranch ||
                    !selectedService ||
                    !selectedTime
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Confirm Booking
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Booking History</CardTitle>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookingHistory.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(booking.status)}
                        <div>
                          <h4 className="font-semibold">{booking.service}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{formatDate(booking.date)}</span>
                            <span>•</span>
                            <span>{booking.time}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {booking.branch}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <p className="text-sm font-semibold mt-1">
                          ₱{booking.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches" className="space-y-6">
            {branches.map((branch) => (
              <Card key={branch.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-fac-blue-600" />
                      {branch.name}
                    </CardTitle>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-gray-700">{branch.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {branch.operatingHours}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {branch.services.map((service) => (
                        <Badge key={service} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
