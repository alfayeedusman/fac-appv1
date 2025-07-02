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
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Users,
  Car,
  DollarSign,
  Clock,
  Phone,
  Mail,
  Navigation,
  TrendingUp,
  Star,
} from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  status: "active" | "inactive" | "maintenance";
  coordinates: {
    lat: number;
    lng: number;
  };
  stats: {
    monthlyRevenue: number;
    totalCustomers: number;
    totalWashes: number;
    averageRating: number;
    staffCount: number;
  };
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
  services: string[];
}

interface BranchManagementProps {
  userRole: string;
}

export default function BranchManagement({ userRole }: BranchManagementProps) {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: "1",
      name: "Tumaga Branch",
      address: "Tumaga Road, Zamboanga City",
      phone: "+63 962 123 4567",
      email: "tumaga@facautocare.com",
      manager: "Juan Dela Cruz",
      status: "active",
      coordinates: { lat: 6.9214, lng: 122.079 },
      stats: {
        monthlyRevenue: 89560,
        totalCustomers: 567,
        totalWashes: 1234,
        averageRating: 4.8,
        staffCount: 8,
      },
      operatingHours: {
        open: "07:00",
        close: "19:00",
        days: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
      },
      services: ["Classic Wash", "VIP Silver", "VIP Gold", "Premium Detail"],
    },
    {
      id: "2",
      name: "Boalan Branch",
      address: "Boalan Road, Zamboanga City",
      phone: "+63 962 987 6543",
      email: "boalan@facautocare.com",
      manager: "Maria Santos",
      status: "active",
      coordinates: { lat: 6.9094, lng: 122.0736 },
      stats: {
        monthlyRevenue: 67220,
        totalCustomers: 423,
        totalWashes: 989,
        averageRating: 4.6,
        staffCount: 6,
      },
      operatingHours: {
        open: "08:00",
        close: "18:00",
        days: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
      },
      services: ["Classic Wash", "VIP Silver", "VIP Gold"],
    },
    {
      id: "3",
      name: "Tetuan Branch",
      address: "Tetuan Road, Zamboanga City",
      phone: "+63 962 555 7777",
      email: "tetuan@facautocare.com",
      manager: "Carlos Rodriguez",
      status: "maintenance",
      coordinates: { lat: 6.9167, lng: 122.0833 },
      stats: {
        monthlyRevenue: 45890,
        totalCustomers: 298,
        totalWashes: 678,
        averageRating: 4.5,
        staffCount: 4,
      },
      operatingHours: {
        open: "09:00",
        close: "17:00",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      },
      services: ["Classic Wash", "VIP Silver"],
    },
  ]);

  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isAddingBranch, setIsAddingBranch] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-500";
      case "maintenance":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "maintenance":
        return "Maintenance";
      default:
        return "Unknown";
    }
  };

  const totalRevenue = branches.reduce(
    (sum, branch) => sum + branch.stats.monthlyRevenue,
    0,
  );
  const totalCustomers = branches.reduce(
    (sum, branch) => sum + branch.stats.totalCustomers,
    0,
  );
  const totalWashes = branches.reduce(
    (sum, branch) => sum + branch.stats.totalWashes,
    0,
  );
  const totalStaff = branches.reduce(
    (sum, branch) => sum + branch.stats.staffCount,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Branch Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Branches</p>
                <p className="text-2xl font-black">{branches.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-black">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Customers</p>
                <p className="text-2xl font-black">
                  {totalCustomers.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Staff</p>
                <p className="text-2xl font-black">{totalStaff}</p>
              </div>
              <Users className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Management Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-fac-orange-500" />
              <span>Branch Management</span>
            </div>
            {userRole === "superadmin" && (
              <Dialog open={isAddingBranch} onOpenChange={setIsAddingBranch}>
                <DialogTrigger asChild>
                  <Button className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Branch
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Branch</DialogTitle>
                    <DialogDescription>
                      Create a new branch location for Fayeed Auto Care.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Branch Name</Label>
                      <Input placeholder="e.g., Downtown Branch" />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Textarea placeholder="Complete address" rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Phone</Label>
                        <Input placeholder="+63 962 XXX XXXX" />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input placeholder="branch@facautocare.com" />
                      </div>
                    </div>
                    <div>
                      <Label>Manager</Label>
                      <Input placeholder="Manager name" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingBranch(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-fac-orange-500 hover:bg-fac-orange-600"
                      onClick={() => setIsAddingBranch(false)}
                    >
                      Add Branch
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <Card key={branch.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-fac-orange-500" />
                  <span className="text-lg font-black">{branch.name}</span>
                </div>
                <Badge
                  className={`${getStatusColor(branch.status)} text-white font-bold`}
                >
                  {getStatusLabel(branch.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Branch Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Navigation className="h-4 w-4" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{branch.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Manager: {branch.manager}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {branch.operatingHours.open} - {branch.operatingHours.close}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Monthly Revenue</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(branch.stats.monthlyRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Customers</span>
                  <span className="font-bold">
                    {branch.stats.totalCustomers}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Washes</span>
                  <span className="font-bold">{branch.stats.totalWashes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-bold">
                      {branch.stats.averageRating}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Staff</span>
                  <span className="font-bold">{branch.stats.staffCount}</span>
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="text-sm font-medium mb-2">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {branch.services.map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {userRole === "superadmin" && (
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
