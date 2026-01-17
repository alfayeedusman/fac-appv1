import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DollarSign,
  Search,
  RefreshCw,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Eye,
  CreditCard,
  Banknote,
  QrCode,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Transaction {
  id: string;
  transactionNumber: string;
  cashierName: string;
  totalAmount: string;
  taxAmount: string;
  discountAmount: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items?: Array<{
    productName: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }>;
}

interface TransactionStats {
  totalTransactions: number;
  totalRevenue: number;
  totalTax: number;
  totalDiscount: number;
  averageTransaction: number;
  paymentMethods: Record<string, { count: number; amount: number }>;
  byStatus: Record<string, number>;
}

export default function SalesTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"today" | "week" | "month">("month");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [dateRange]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterPaymentMethod, filterStatus]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      if (dateRange === "today") {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === "week") {
        startDate.setDate(endDate.getDate() - 7);
      } else if (dateRange === "month") {
        startDate.setDate(endDate.getDate() - 30);
      }

      // Fetch transactions from API
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: "1000",
      });

      const response = await fetch(`/api/pos/transactions?${params}`);
      const data = await response.json();

      if (data.success && data.transactions) {
        setTransactions(data.transactions);
        console.log("✅ Transactions loaded:", data.transactions.length);
      } else {
        console.warn("Failed to load transactions:", data);
      }

      // Fetch statistics
      const statsParams = new URLSearchParams({
        days: dateRange === "today" ? "1" : dateRange === "week" ? "7" : "30",
      });

      const statsResponse = await fetch(`/api/pos/transactions/stats/summary?${statsParams}`);
      const statsData = await statsResponse.json();

      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
        console.log("✅ Stats loaded:", statsData.stats);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transaction data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.transactionNumber.toLowerCase().includes(term) ||
          t.cashierName.toLowerCase().includes(term)
      );
    }

    // Payment method filter
    if (filterPaymentMethod !== "all") {
      filtered = filtered.filter((t) => t.paymentMethod === filterPaymentMethod);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "cash":
        return <Banknote className="h-4 w-4 text-green-600" />;
      case "card":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "qr":
        return <QrCode className="h-4 w-4 text-purple-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "No data",
        description: "No transactions to export",
      });
      return;
    }

    const headers = [
      "Transaction ID",
      "Cashier",
      "Amount",
      "Tax",
      "Discount",
      "Payment Method",
      "Status",
      "Date",
    ];

    const rows = filteredTransactions.map((t) => [
      t.transactionNumber,
      t.cashierName,
      t.totalAmount,
      t.taxAmount,
      t.discountAmount,
      t.paymentMethod,
      t.status,
      format(new Date(t.createdAt), "yyyy-MM-dd HH:mm:ss"),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Sales & Transactions</h2>
          <p className="text-muted-foreground mt-1">
            Real-time POS transaction tracking and analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadTransactions}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={exportToCSV}
            disabled={filteredTransactions.length === 0}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <p className="text-xs text-green-700 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-green-900">
                ₱{stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-green-600 mt-1">{stats.totalTransactions} transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <p className="text-xs text-blue-700 font-medium">Average Sale</p>
              <p className="text-2xl font-bold text-blue-900">
                ₱{stats.averageTransaction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-blue-600 mt-1">Per transaction</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <p className="text-xs text-purple-700 font-medium">Total Tax</p>
              <p className="text-2xl font-bold text-purple-900">
                ₱{stats.totalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-purple-600 mt-1">Collected</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <p className="text-xs text-orange-700 font-medium">Total Discount</p>
              <p className="text-2xl font-bold text-orange-900">
                ₱{stats.totalDiscount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-orange-600 mt-1">Given</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-4">
              <p className="text-xs text-indigo-700 font-medium">Net Revenue</p>
              <p className="text-2xl font-bold text-indigo-900">
                ₱{(stats.totalRevenue - stats.totalDiscount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-indigo-600 mt-1">After discounts</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Methods & Status Overview */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.paymentMethods).map(([method, data]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getPaymentMethodIcon(method)}
                      <div>
                        <p className="font-medium text-sm capitalize">{method}</p>
                        <p className="text-xs text-muted-foreground">{data.count} transactions</p>
                      </div>
                    </div>
                    <p className="font-bold">
                      ₱{data.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Status */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Transaction Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            status === "completed"
                              ? "#10b981"
                              : status === "pending"
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      />
                      <p className="font-medium text-sm capitalize">{status}</p>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transaction ID or cashier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="qr">QR Code</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
              <p className="ml-2 text-muted-foreground">Loading transaction data...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.transactionNumber}
                      </TableCell>
                      <TableCell>{transaction.cashierName}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        ₱{parseFloat(transaction.totalAmount).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-sm">
                        ₱{parseFloat(transaction.taxAmount).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {parseFloat(transaction.discountAmount) > 0 ? (
                          <span className="text-red-600">
                            -₱{parseFloat(transaction.discountAmount).toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        ) : (
                          "₱0.00"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="text-sm capitalize">{transaction.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`capitalize border ${getStatusColor(transaction.status)}`}
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Transaction Details Modal */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transaction Details</CardTitle>
              <Button
                variant="ghost"
                onClick={() => setShowDetails(false)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono font-bold">{selectedTransaction.transactionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cashier</p>
                  <p className="font-semibold">{selectedTransaction.cashierName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-semibold">
                    {format(new Date(selectedTransaction.createdAt), "MMM dd, yyyy HH:mm:ss")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={`capitalize border ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold mb-3">Order Summary</h4>
                <div className="space-y-2">
                  {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                    selectedTransaction.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.productName} x{item.quantity}
                        </span>
                        <span>₱{parseFloat(item.subtotal).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No items details available</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>
                    ₱{(parseFloat(selectedTransaction.totalAmount) - parseFloat(selectedTransaction.taxAmount) + parseFloat(selectedTransaction.discountAmount)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₱{parseFloat(selectedTransaction.taxAmount).toLocaleString()}</span>
                </div>
                {parseFloat(selectedTransaction.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount</span>
                    <span>-₱{parseFloat(selectedTransaction.discountAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₱{parseFloat(selectedTransaction.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
