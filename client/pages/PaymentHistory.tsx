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
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileImage,
  TrendingUp,
  Package,
  Crown,
  Shield,
  Star,
  RefreshCw,
} from "lucide-react";
import StickyHeader from "@/components/StickyHeader";
import BottomNavigation from "@/components/BottomNavigation";
import {
  SubscriptionRequest,
  getSubscriptionRequests,
} from "@/utils/subscriptionApprovalData";

interface TransactionHistory {
  id: string;
  type: "subscription" | "upgrade" | "renewal" | "payment";
  title: string;
  description: string;
  amount: string;
  status: "pending" | "approved" | "rejected" | "completed" | "failed";
  date: string;
  packageType?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  adminNotes?: string;
}

export default function PaymentHistory() {
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    TransactionHistory[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const userEmail = localStorage.getItem("userEmail") || "";
  const userId = `user_${userEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

  useEffect(() => {
    loadTransactionHistory();
  }, []);

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, searchTerm, statusFilter, typeFilter, sortBy]);

  const loadTransactionHistory = () => {
    // Get user's subscription requests
    const allRequests = getSubscriptionRequests();
    const userRequests = allRequests.filter((req) => req.userId === userId);

    // Convert subscription requests to transaction history
    const subscriptionTransactions: TransactionHistory[] = userRequests.map(
      (req) => ({
        id: req.id,
        type: "subscription",
        title: `${req.packageType} Subscription`,
        description: `Payment for ${req.packageType} monthly subscription`,
        amount: req.paymentDetails.amount,
        status: req.status === "approved" ? "completed" : req.status,
        date: req.submissionDate,
        packageType: req.packageType,
        paymentMethod: req.paymentMethod,
        referenceNumber: req.paymentDetails.referenceNumber,
        adminNotes: req.reviewNotes,
      }),
    );

    // Only show real user subscription transactions - no sample data
    const allTransactions = subscriptionTransactions;
    setTransactions(allTransactions);
  };

  const filterAndSortTransactions = () => {
    let filtered = [...transactions];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((txn) => txn.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((txn) => txn.type === typeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (txn) =>
          txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          txn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          txn.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort transactions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount":
          const aAmount = parseFloat(a.amount.replace(/[₱,]/g, ""));
          const bAmount = parseFloat(b.amount.replace(/[₱,]/g, ""));
          return bAmount - aAmount;
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredTransactions(filtered);
  };

  const getStatusColor = (status: TransactionHistory["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed":
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: TransactionHistory["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "completed":
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: TransactionHistory["type"]) => {
    switch (type) {
      case "subscription":
        return <Package className="h-4 w-4" />;
      case "upgrade":
        return <TrendingUp className="h-4 w-4" />;
      case "renewal":
        return <RefreshCw className="h-4 w-4" />;
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPackageIcon = (packageType?: string) => {
    if (!packageType) return <Package className="h-4 w-4" />;

    if (packageType.includes("Classic")) return <Shield className="h-4 w-4" />;
    if (packageType.includes("VIP")) return <Crown className="h-4 w-4" />;
    if (packageType.includes("Premium")) return <Star className="h-4 w-4" />;
    return <Package className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodColor = (method?: string) => {
    if (!method) return "text-gray-600";

    switch (method) {
      case "gcash":
        return "text-blue-600";
      case "maya":
        return "text-green-600";
      case "bank_transfer":
        return "text-purple-600";
      case "over_counter":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getTransactionStats = () => {
    const stats = {
      total: transactions.length,
      pending: transactions.filter((t) => t.status === "pending").length,
      completed: transactions.filter(
        (t) => t.status === "completed" || t.status === "approved",
      ).length,
      failed: transactions.filter(
        (t) => t.status === "failed" || t.status === "rejected",
      ).length,
      totalAmount: transactions
        .filter((t) => t.status === "completed" || t.status === "approved")
        .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[₱,]/g, "")), 0),
    };
    return stats;
  };

  const stats = getTransactionStats();

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden pb-20">
      <StickyHeader showBack={true} title="Payment History" />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-80 h-80 rounded-full bg-gradient-to-r from-fac-orange-500/8 to-purple-500/8 blur-3xl animate-breathe"></div>
        <div className="absolute bottom-1/3 right-1/6 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/8 to-fac-orange-500/8 blur-2xl animate-float"></div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full glass hover-lift"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="gradient-primary p-3 rounded-xl animate-pulse-glow">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-foreground">
                  Payment{" "}
                  <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                    History
                  </span>
                </h1>
                <p className="text-muted-foreground font-medium">
                  Track your transactions and account activity
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={loadTransactionHistory}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up animate-delay-100">
          <Card className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">
                Total Transactions
              </p>
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
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xl font-bold text-foreground">
                {stats.completed}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="bg-fac-orange-100 dark:bg-fac-orange-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <DollarSign className="h-5 w-5 text-fac-orange-600 dark:text-fac-orange-400" />
              </div>
              <p className="text-xl font-bold text-foreground">
                ₱{stats.totalAmount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-background/90 backdrop-blur-sm border-border">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
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
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-4 animate-fade-in-up animate-delay-300">
          {filteredTransactions.length === 0 ? (
            <Card className="glass border-border">
              <CardContent className="p-8 text-center">
                <div className="bg-muted/30 p-6 rounded-full w-fit mx-auto mb-4">
                  <CreditCard className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  No transactions found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your filters or search terms."
                    : "You haven't made any transactions yet."}
                </p>
                {(searchTerm ||
                  statusFilter !== "all" ||
                  typeFilter !== "all") && (
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="glass border-border hover-lift transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-fac-orange-100 dark:bg-fac-orange-900/30 p-3 rounded-lg">
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg">
                          {transaction.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {transaction.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        {transaction.amount}
                      </p>
                      <Badge className={getStatusColor(transaction.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(transaction.status)}
                          <span className="capitalize">
                            {transaction.status}
                          </span>
                        </div>
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">Date</p>
                      <p className="text-muted-foreground">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                    {transaction.paymentMethod && (
                      <div>
                        <p className="font-medium text-foreground">
                          Payment Method
                        </p>
                        <p
                          className={`capitalize ${getPaymentMethodColor(transaction.paymentMethod)}`}
                        >
                          {transaction.paymentMethod.replace("_", " ")}
                        </p>
                      </div>
                    )}
                    {transaction.referenceNumber && (
                      <div>
                        <p className="font-medium text-foreground">
                          Reference Number
                        </p>
                        <p className="font-mono text-muted-foreground">
                          {transaction.referenceNumber}
                        </p>
                      </div>
                    )}
                  </div>

                  {transaction.packageType && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getPackageIcon(transaction.packageType)}
                        <span className="font-medium text-foreground">
                          {transaction.packageType}
                        </span>
                      </div>
                    </div>
                  )}

                  {transaction.adminNotes && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Admin Notes:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.adminNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Info */}
        {filteredTransactions.length > 0 && (
          <div className="text-center mt-8 animate-fade-in-up animate-delay-400">
            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} of {transactions.length}{" "}
                transactions
                {statusFilter !== "all" && ` • Status: ${statusFilter}`}
                {typeFilter !== "all" && ` • Type: ${typeFilter}`}
                {searchTerm && ` • Search: "${searchTerm}"`}
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
