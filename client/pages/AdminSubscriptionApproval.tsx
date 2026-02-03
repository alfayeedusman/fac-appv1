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

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // Filter by customer status
    if (customerFilter !== "all") {
      filtered = filtered.filter(
        (request) => request.customerStatus === customerFilter,
      );
    }

    // Filter by search term
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

    // Sort requests
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
      const result = await approveSubscriptionRequest(requestId, adminEmail, notes);
      if (!result.success) {
        notificationManager.error(
          "Approval Failed",
          result.error || "Failed to approve request. Please try again.",
        );
        return;
      }

      await loadRequests();
      notificationManager.success(
        "Request Approved! 🎉",
        "Subscription request approved successfully! Customer has been notified.",
        { autoClose: 4000 },
      );
    } catch (error) {
      console.error("Error approving request:", error);
      notificationManager.error(
        "Approval Failed",
        "Failed to approve request. Please try again.",
      );
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
          result.error || "Failed to reject request. Please try again.",
        );
        return;
      }

      await loadRequests();
      notificationManager.info(
        "Request Rejected",
        "Subscription request rejected. Customer has been notified.",
        { autoClose: 3000 },
      );
    } catch (error) {
      console.error("Error rejecting request:", error);
      notificationManager.error(
        "Rejection Failed",
        "Failed to reject request. Please try again.",
      );
    }
  };

  const handleBan = async (userId: string, reason: string) => {
    try {
      const result = await banCustomer(userId, adminEmail, reason);
      if (!result.success) {
        notificationManager.error(
          "Ban Failed",
          result.error || "Failed to ban customer. Please try again.",
        );
        return;
      }

      await loadRequests();
      notificationManager.warning(
        "Customer Banned",
        "Customer has been banned. All their requests have been updated.",
        { autoClose: 4000 },
      );
    } catch (error) {
      console.error("Error banning customer:", error);
      notificationManager.error(
        "Ban Failed",
        "Failed to ban customer. Please try again.",
      );
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      const result = await unbanCustomer(userId, adminEmail);
      if (!result.success) {
        notificationManager.error(
          "Unban Failed",
          result.error || "Failed to unban customer. Please try again.",
        );
        return;
      }

      await loadRequests();
      notificationManager.success(
        "Customer Unbanned",
        "Customer has been unbanned successfully.",
        { autoClose: 3000 },
      );
    } catch (error) {
      console.error("Error unbanning customer:", error);
      notificationManager.error(
        "Unban Failed",
        "Failed to unban customer. Please try again.",
      );
    }
  };

  const handleMarkUnderReview = async (requestId: string) => {
    const result = await updateSubscriptionRequest(requestId, {
      status: "under_review",
      reviewedBy: adminEmail,
      reviewedDate: new Date().toISOString(),
    });

    if (!result.success) {
      notificationManager.error(
        "Update Failed",
        result.error || "Failed to update request status.",
      );
      return;
    }

    await loadRequests();
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <Link to="/admin-dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full glass hover-lift"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="gradient-primary p-3 rounded-xl ">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-foreground">
                  Subscription{" "}
                  <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                    Approvals
                  </span>
                </h1>
                <p className="text-muted-foreground font-medium">
                  Review and manage subscription payment requests
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={loadRequests}
            variant="outline"
            className="flex items-center space-x-2 w-full lg:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 animate-fade-in-up animate-delay-100">
          <Card className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-xl font-bold text-foreground">
                {stats.pending}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xl font-bold text-foreground">
                {stats.underReview}
              </p>
              <p className="text-xs text-muted-foreground">Under Review</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xl font-bold text-foreground">
                {stats.approved}
              </p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-xl font-bold text-foreground">
                {stats.rejected}
              </p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-xl font-bold text-foreground">
                {stats.banned}
              </p>
              <p className="text-xs text-muted-foreground">Banned</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="glass border-border mb-8 animate-fade-in-up animate-delay-200">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Filter className="h-5 w-5 mr-2" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, name, email, package..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-background/90 backdrop-blur-sm border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Customer Status Filter */}
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500">
                  <SelectValue placeholder="Filter by customer" />
                </SelectTrigger>
                <SelectContent className="bg-background/90 backdrop-blur-sm border-border">
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-background/90 backdrop-blur-sm border-border">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount">Highest Amount</SelectItem>
                  <SelectItem value="package">Package Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-6 animate-fade-in-up animate-delay-300">
          {filteredRequests.length === 0 ? (
            <Card className="glass border-border">
              <CardContent className="p-8 text-center">
                <div className="bg-muted/30 p-6 rounded-full w-fit mx-auto mb-4">
                  <CreditCard className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  No subscription requests found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  customerFilter !== "all"
                    ? "Try adjusting your filters or search terms."
                    : "No subscription requests have been submitted yet."}
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
            filteredRequests.map((request) => (
              <SubscriptionRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                onBan={handleBan}
                onUnban={handleUnban}
              />
            ))
          )}
        </div>

        {/* Summary Info */}
        {filteredRequests.length > 0 && (
          <div className="text-center mt-8 animate-fade-in-up animate-delay-400">
            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredRequests.length} of {requests.length} requests
                {statusFilter !== "all" && ` • Status: ${statusFilter}`}
                {customerFilter !== "all" && ` • Customer: ${customerFilter}`}
                {searchTerm && ` • Search: "${searchTerm}"`}
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
