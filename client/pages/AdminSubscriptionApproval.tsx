import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  DollarSign,
  UserX,
  RefreshCw,
  ChevronRight,
  Eye,
  Eye2Icon,
} from "lucide-react";
import SubscriptionRequestCard from "@/components/SubscriptionRequestCard";
import {
  SubscriptionRequest,
  getSubscriptionRequests,
  approveSubscriptionRequest,
  rejectSubscriptionRequest,
  banCustomer,
  unbanCustomer,
  getSubscriptionStats,
  updateSubscriptionRequest,
} from "@/utils/subscriptionApprovalData";
import { notificationManager } from "@/components/NotificationModal";

export default function AdminSubscriptionApproval() {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<
    SubscriptionRequest[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0,
    banned: 0,
  });

  const adminEmail = localStorage.getItem("userEmail") || "admin@fac.com";

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterAndSortRequests();
  }, [requests, searchTerm, statusFilter, customerFilter, sortBy]);

  const loadRequests = async () => {
    const [allRequests, subscriptionStats] = await Promise.all([
      getSubscriptionRequests({ status: "all" }),
      getSubscriptionStats(),
    ]);
    setRequests(allRequests);
    setStats(subscriptionStats);
  };

  const filterAndSortRequests = () => {
    let filtered = [...requests];

    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    if (customerFilter !== "all") {
      filtered = filtered.filter(
        (request) => request.customerStatus === customerFilter,
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.packageType
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.paymentDetails.referenceNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.submissionDate).getTime() -
            new Date(a.submissionDate).getTime()
          );
        case "oldest":
          return (
            new Date(a.submissionDate).getTime() -
            new Date(b.submissionDate).getTime()
          );
        case "amount":
          const aAmount = parseFloat(
            a.paymentDetails.amount.replace(/[₱,]/g, ""),
          );
          const bAmount = parseFloat(
            b.paymentDetails.amount.replace(/[₱,]/g, ""),
          );
          return bAmount - aAmount;
        case "package":
          return a.packageType.localeCompare(b.packageType);
        default:
          return 0;
      }
    });

    setFilteredRequests(filtered);
  };

  const handleApprove = async (requestId: string, notes?: string) => {
    try {
      const result = await approveSubscriptionRequest(
        requestId,
        adminEmail,
        notes,
      );
      if (!result.success) {
        notificationManager.error(
          "Approval Failed",
          result.error || "Failed to approve request.",
        );
        return;
      }

      await loadRequests();
      notificationManager.success(
        "Request Approved! 🎉",
        "Subscription approved successfully!",
        { autoClose: 4000 },
      );
    } catch (error) {
      console.error("Error approving request:", error);
      notificationManager.error("Approval Failed", "Please try again.");
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    try {
      const result = await rejectSubscriptionRequest(
        requestId,
        adminEmail,
        reason,
      );
      if (!result.success) {
        notificationManager.error(
          "Rejection Failed",
          result.error || "Failed to reject request.",
        );
        return;
      }

      await loadRequests();
      notificationManager.info(
        "Request Rejected",
        "Customer has been notified.",
        { autoClose: 3000 },
      );
    } catch (error) {
      console.error("Error rejecting request:", error);
      notificationManager.error("Rejection Failed", "Please try again.");
    }
  };

  const handleBan = async (userId: string, reason: string) => {
    try {
      const result = await banCustomer(userId, adminEmail, reason);
      if (!result.success) {
        notificationManager.error(
          "Ban Failed",
          result.error || "Failed to ban customer.",
        );
        return;
      }

      await loadRequests();
      notificationManager.warning("Customer Banned", "All requests updated.", {
        autoClose: 4000,
      });
    } catch (error) {
      console.error("Error banning customer:", error);
      notificationManager.error("Ban Failed", "Please try again.");
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      const result = await unbanCustomer(userId, adminEmail);
      if (!result.success) {
        notificationManager.error(
          "Unban Failed",
          result.error || "Failed to unban customer.",
        );
        return;
      }

      await loadRequests();
      notificationManager.success("Customer Unbanned", "Successfully unbanned.", {
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error unbanning customer:", error);
      notificationManager.error("Unban Failed", "Please try again.");
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
  }) => (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
      <div className={`absolute inset-0 opacity-5 ${color}`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            {Icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Link to="/admin-dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-fac-orange-500 to-fac-orange-600">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold">
                  Subscription
                  <span className="block text-xl font-semibold text-muted-foreground">
                    Approval Center
                  </span>
                </h1>
              </div>
              <p className="text-muted-foreground">
                Review, approve, and manage customer subscription requests
              </p>
            </div>
          </div>
          <Button
            onClick={loadRequests}
            variant="outline"
            size="lg"
            className="gap-2 self-start md:self-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard
            icon={<Users className="h-6 w-6 text-blue-600" />}
            label="Total Requests"
            value={stats.total}
            color="bg-blue-600"
          />
          <StatCard
            icon={<Clock className="h-6 w-6 text-yellow-600" />}
            label="Pending"
            value={stats.pending}
            color="bg-yellow-600"
          />
          <StatCard
            icon={<Eye className="h-6 w-6 text-purple-600" />}
            label="Under Review"
            value={stats.underReview}
            color="bg-purple-600"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
            label="Approved"
            value={stats.approved}
            color="bg-green-600"
          />
          <StatCard
            icon={<XCircle className="h-6 w-6 text-red-600" />}
            label="Rejected"
            value={stats.rejected}
            color="bg-red-600"
          />
          <StatCard
            icon={<UserX className="h-6 w-6 text-destructive" />}
            label="Banned"
            value={stats.banned}
            color="bg-destructive"
          />
        </div>

        {/* Filters Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ID, name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg border-0 bg-muted/50 focus:bg-muted"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-lg border-0 bg-muted/50">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="rounded-lg border-0 bg-muted/50">
                  <SelectValue placeholder="Filter by customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="rounded-lg border-0 bg-muted/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount">Highest Amount</SelectItem>
                  <SelectItem value="package">Package Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Section */}
        {filteredRequests.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mb-4">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No requests found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== "all" || customerFilter !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "No subscription requests yet."}
              </p>
              {(searchTerm ||
                statusFilter !== "all" ||
                customerFilter !== "all") && (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCustomerFilter("all");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                : "space-y-4"
            }
          >
            {filteredRequests.map((request) => (
              <SubscriptionRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                onBan={handleBan}
                onUnban={handleUnban}
              />
            ))}
          </div>
        )}

        {/* Summary Footer */}
        {filteredRequests.length > 0 && (
          <div className="text-center">
            <Card className="border-0 shadow-lg inline-block">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {filteredRequests.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {requests.length}
                  </span>{" "}
                  requests
                  {statusFilter !== "all" && ` • ${statusFilter}`}
                  {customerFilter !== "all" && ` • ${customerFilter}`}
                  {searchTerm && ` • "${searchTerm}"`}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
