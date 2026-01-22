import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Key,
  Eye,
  EyeOff,
  Settings,
  Calendar,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { neonDbClient } from "@/services/neonDatabaseService";
import { toast } from "@/hooks/use-toast";

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
  loginCredentials: {
    username: string;
    password: string;
    lastLogin?: Date;
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
  washHistory: WashRecord[];
}

interface WashRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  carModel: string;
  plateNumber: string;
  serviceType: string;
  amount: number;
  washDate: Date;
  duration: string;
  staffMember: string;
  status: "completed" | "in-progress" | "cancelled";
}

interface BranchManagementProps {
  userRole: string;
}

export default function BranchManagement({ userRole }: BranchManagementProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [newBranch, setNewBranch] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    manager: "",
    username: "",
    password: "",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Load branches data from backend
  const loadBranches = async () => {
    try {
      setLoading(true);
      console.log("🏪 Loading branches from database...");

      const result = await neonDbClient.getBranches();
      console.log("✅ Branches loaded:", result);

      if (result.success && result.branches) {
        // Transform backend data to match frontend interface
        const transformedBranches: Branch[] = result.branches.map(
          (branch: any) => ({
            id: branch.id,
            name: branch.name,
            address: branch.address || "Address not set",
            phone: branch.phone || "N/A",
            email: branch.email || "N/A",
            manager: branch.managerName || "Manager not assigned",
            status: branch.isActive ? "active" : "inactive",
            coordinates: {
              lat: parseFloat(branch.latitude) || 6.9214,
              lng: parseFloat(branch.longitude) || 122.079,
            },
            loginCredentials: {
              username: `${branch.code || branch.name.toLowerCase().replace(/\s+/g, "_")}_branch`,
              password: "****",
              lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
            stats: {
              monthlyRevenue: branch.stats?.monthlyRevenue || 0,
              totalCustomers: branch.stats?.totalCustomers || 0,
              totalWashes: branch.stats?.totalWashes || 0,
              averageRating: branch.stats?.averageRating || 4.5,
              staffCount: branch.stats?.staffCount || 0,
            },
            operatingHours: {
              open: branch.operatingHours?.monday?.open || "08:00",
              close: branch.operatingHours?.monday?.close || "18:00",
              days: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ],
            },
            services: branch.services || [
              "Classic Wash",
              "VIP Silver",
              "VIP Gold",
            ],
            washHistory: [], // TODO: Load actual wash history
          }),
        );

        setBranches(transformedBranches);
      } else {
        console.warn(
          "⚠️ No branches found or failed to load, using empty array",
        );
        setBranches([]);
      }
    } catch (error) {
      console.error("❌ Error loading branches:", error);
      toast({
        title: "Error Loading Branches",
        description: "Failed to load branch data. Showing empty state.",
        variant: "destructive",
      });
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-muted";
      case "maintenance":
        return "bg-yellow-500";
      default:
        return "bg-muted";
    }
  };

  const getWashStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleAddBranch = async () => {
    if (newBranch.name && newBranch.address && newBranch.username) {
      try {
        // Call backend API to create branch
        const result = await neonDbClient.createBranch({
          name: newBranch.name,
          code: newBranch.username.toLowerCase().replace(/\s+/g, "_"),
          address: newBranch.address,
          phone: newBranch.phone,
          email: newBranch.email,
          managerName: newBranch.manager,
          type: "full_service",
          timezone: "Asia/Manila",
        });

        if (result.success && result.branch) {
          // Transform backend response to match frontend interface
          const branch: Branch = {
            id: result.branch.id,
            name: result.branch.name,
            address: result.branch.address || "Address not set",
            phone: result.branch.phone || "N/A",
            email: result.branch.email || "N/A",
            manager: result.branch.managerName || "Manager not assigned",
            status: result.branch.is_active ? "active" : "inactive",
            coordinates: {
              lat: parseFloat(result.branch.latitude) || 6.9214,
              lng: parseFloat(result.branch.longitude) || 122.079,
            },
            loginCredentials: {
              username: newBranch.username,
              password: "****",
            },
            stats: {
              monthlyRevenue: result.branch.stats?.monthlyRevenue || 0,
              totalCustomers: result.branch.stats?.totalCustomers || 0,
              totalWashes: result.branch.stats?.totalWashes || 0,
              averageRating: result.branch.stats?.averageRating || 4.5,
              staffCount: result.branch.stats?.staffCount || 0,
            },
            operatingHours: {
              open: result.branch.operatingHours?.monday?.open || "08:00",
              close: result.branch.operatingHours?.monday?.close || "18:00",
              days: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ],
            },
            services: result.branch.services || [
              "Classic Wash",
              "VIP Silver",
              "VIP Gold",
            ],
            washHistory: [],
          };

          setBranches((prev) => [...prev, branch]);
          setNewBranch({
            name: "",
            address: "",
            phone: "",
            email: "",
            manager: "",
            username: "",
            password: "",
          });
          setIsAddBranchOpen(false);

          toast({
            title: "Success",
            description: `Branch "${newBranch.name}" added successfully!`,
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create branch",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error adding branch:", error);
        toast({
          title: "Error",
          description: "Failed to add branch. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this branch? This action cannot be undone.",
      )
    ) {
      try {
        const result = await neonDbClient.deleteBranch(branchId);

        if (result.success) {
          setBranches((prev) =>
            prev.filter((branch) => branch.id !== branchId),
          );
          toast({
            title: "Success",
            description: "Branch deleted successfully!",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete branch",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting branch:", error);
        toast({
          title: "Error",
          description: "Failed to delete branch. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const togglePasswordVisibility = (branchId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
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
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="wash-history">Wash History</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Branch Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-blue-100 text-sm">Total Branches</div>
                    <div className="text-2xl font-black">
                      {loading ? (
                        <span className="animate-pulse">-</span>
                      ) : (
                        branches.length
                      )}
                    </div>
                  </div>
                  <MapPin className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-green-100 text-sm">Total Revenue</div>
                    <div className="text-2xl font-black">
                      {loading ? (
                        <span className="animate-pulse">-</span>
                      ) : (
                        formatCurrency(totalRevenue)
                      )}
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-purple-100 text-sm">
                      Total Customers
                    </div>
                    <div className="text-2xl font-black">
                      {loading ? (
                        <span className="animate-pulse">-</span>
                      ) : (
                        totalCustomers.toLocaleString()
                      )}
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-orange-100 text-sm">Total Staff</div>
                    <div className="text-2xl font-black">
                      {loading ? (
                        <span className="animate-pulse">-</span>
                      ) : (
                        totalStaff
                      )}
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-fac-orange-500" />
                  <span>Branch Management</span>
                </div>
                {userRole === "superadmin" && (
                  <Dialog
                    open={isAddBranchOpen}
                    onOpenChange={setIsAddBranchOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Branch
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add New Branch</DialogTitle>
                        <DialogDescription>
                          Create a new branch location with login credentials.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Branch Name</Label>
                            <Input
                              value={newBranch.name}
                              onChange={(e) =>
                                setNewBranch({
                                  ...newBranch,
                                  name: e.target.value,
                                })
                              }
                              placeholder="e.g., Downtown Branch"
                            />
                          </div>
                          <div>
                            <Label>Manager</Label>
                            <Input
                              value={newBranch.manager}
                              onChange={(e) =>
                                setNewBranch({
                                  ...newBranch,
                                  manager: e.target.value,
                                })
                              }
                              placeholder="Manager name"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Address</Label>
                          <Textarea
                            value={newBranch.address}
                            onChange={(e) =>
                              setNewBranch({
                                ...newBranch,
                                address: e.target.value,
                              })
                            }
                            placeholder="Complete address"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={newBranch.phone}
                              onChange={(e) =>
                                setNewBranch({
                                  ...newBranch,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="+63 962 XXX XXXX"
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              value={newBranch.email}
                              onChange={(e) =>
                                setNewBranch({
                                  ...newBranch,
                                  email: e.target.value,
                                })
                              }
                              placeholder="branch@facautocare.com"
                            />
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-bold mb-3">Login Credentials</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Username</Label>
                              <Input
                                value={newBranch.username}
                                onChange={(e) =>
                                  setNewBranch({
                                    ...newBranch,
                                    username: e.target.value,
                                  })
                                }
                                placeholder="branch_username"
                              />
                            </div>
                            <div>
                              <Label>Password</Label>
                              <Input
                                type="password"
                                value={newBranch.password}
                                onChange={(e) =>
                                  setNewBranch({
                                    ...newBranch,
                                    password: e.target.value,
                                  })
                                }
                                placeholder="secure_password"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddBranchOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-fac-orange-500 hover:bg-fac-orange-600"
                          onClick={handleAddBranch}
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
              <Card
                key={branch.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-fac-orange-500" />
                      <span className="text-lg font-black">{branch.name}</span>
                    </div>
                    <Badge
                      className={`${getStatusColor(branch.status)} text-white font-bold`}
                    >
                      {branch.status.toUpperCase()}
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
                      <Users className="h-4 w-4" />
                      <span>Manager: {branch.manager}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="bg-muted p-3 rounded-lg space-y-2 theme-transition">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Monthly Revenue
                      </span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(branch.stats.monthlyRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Washes</span>
                      <span className="font-bold">
                        {branch.stats.totalWashes}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Staff</span>
                      <span className="font-bold">
                        {branch.stats.staffCount}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedBranch(branch)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Washes
                    </Button>
                    {userRole === "superadmin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => handleDeleteBranch(branch.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Wash History Tab */}
        <TabsContent value="wash-history" className="space-y-6">
          {selectedBranch ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-fac-orange-500" />
                    <span>Wash History - {selectedBranch.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBranch(null)}
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedBranch.washHistory.map((wash) => (
                    <div
                      key={wash.id}
                      className="border border-border rounded-lg p-4 hover:bg-accent theme-transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-bold text-foreground">
                              {wash.customerName}
                            </h4>
                            <Badge
                              className={`${getWashStatusColor(wash.status)} text-white font-bold`}
                            >
                              {wash.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <span>
                              <strong>Car:</strong> {wash.carModel}
                            </span>
                            <span>
                              <strong>Plate:</strong> {wash.plateNumber}
                            </span>
                            <span>
                              <strong>Service:</strong> {wash.serviceType}
                            </span>
                            <span>
                              <strong>Staff:</strong> {wash.staffMember}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(wash.amount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(wash.washDate, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-black mb-2">
                  Select a Branch
                </h3>
                <p className="text-gray-600">
                  Choose a branch to view its wash history
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-fac-orange-500" />
                <span>Branch Login Credentials</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-black">{branch.name}</h4>
                      <Badge
                        className={`${getStatusColor(branch.status)} text-white font-bold`}
                      >
                        {branch.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Username
                        </Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            type="text"
                            value={branch.loginCredentials.username}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Password
                        </Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            type={showPassword[branch.id] ? "text" : "password"}
                            value={branch.loginCredentials.password}
                            readOnly
                            className="bg-gray-50"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePasswordVisibility(branch.id)}
                            className="px-2"
                          >
                            {showPassword[branch.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Last Login
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          {branch.loginCredentials.lastLogin
                            ? formatDistanceToNow(
                                branch.loginCredentials.lastLogin,
                                { addSuffix: true },
                              )
                            : "Never logged in"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
