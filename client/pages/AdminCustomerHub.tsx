import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Eye,
  MapPin,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabaseDbClient, User } from "@/services/supabaseDatabaseService";
import StickyHeader from "@/components/StickyHeader";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminCustomerHub() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const allCustomers = await supabaseDbClient.getAllUsers();
      
      // Filter to only customer role
      const customersList = allCustomers.filter(
        (user) => user.role === "user" || user.role === "customer"
      );
      
      setCustomers(customersList);
      
      // Calculate stats
      setStats({
        total: customersList.length,
        active: customersList.filter((c) => c.status !== "inactive").length,
        inactive: customersList.filter((c) => c.status === "inactive").length,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactNumber?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <StickyHeader
        showBack={true}
        title="Customer Hub"
        backTo="/admin-dashboard"
      />

      <div className="flex">
        <AdminSidebar
          activeTab="customers"
          onTabChange={(tab) => {
            if (tab === "crew")
              navigate("/admin-crew-management");
            else if (tab === "overview") navigate("/admin-dashboard");
            else if (tab === "cms") navigate("/admin-cms");
            else if (tab === "fac-map") navigate("/admin-fac-map");
            else if (tab === "customers") navigate("/admin-customer-hub");
            else if (tab === "user-management")
              navigate("/admin-user-management");
            else if (tab === "images") navigate("/admin-image-manager");
            else if (tab === "notifications") navigate("/admin-notifications");
            else if (tab === "ads") navigate("/admin-ads");
            else if (tab === "booking") navigate("/admin-booking-settings");
            else if (tab === "gamification") navigate("/admin-gamification");
            else {
              navigate("/admin-dashboard");
            }
          }}
        />

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Users className="w-8 h-8" />
                  Customer Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  View and manage all customers
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Inactive Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.inactive}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Search Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customers Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Customers ({filteredCustomers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading customers...</div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No customers found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">
                              {customer.fullName || "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {customer.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {customer.contactNumber || "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {customer.branchLocation || "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  customer.status === "inactive"
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {customer.status || "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {customer.createdAt
                                  ? new Date(customer.createdAt).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
