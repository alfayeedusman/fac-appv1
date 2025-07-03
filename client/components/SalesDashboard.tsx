import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  Star,
  RefreshCw,
} from "lucide-react";
import { getPOSTransactions, POSTransaction } from "@/utils/posData";
import { format, subDays, isWithinInterval, parseISO } from "date-fns";

interface SalesMetrics {
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  todayRevenue: number;
  todayTransactions: number;
  weekRevenue: number;
  monthRevenue: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  paymentMethods: Record<string, { count: number; amount: number }>;
  hourlyDistribution: Array<{
    hour: number;
    transactions: number;
    revenue: number;
  }>;
  dailyTrend: Array<{ date: string; revenue: number; transactions: number }>;
}

export default function SalesDashboard() {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [dateRange, setDateRange] = useState("7"); // Last 7 days
  const [isLoading, setIsLoading] = useState(false);

  const calculateMetrics = (
    transactions: POSTransaction[],
    days: number,
  ): SalesMetrics => {
    const now = new Date();
    const rangeStart = subDays(now, days);
    const today = new Date().toDateString();

    // Filter transactions within date range
    const filteredTransactions = transactions.filter((txn) => {
      const txnDate = parseISO(txn.timestamp);
      return (
        isWithinInterval(txnDate, { start: rangeStart, end: now }) &&
        txn.status === "completed"
      );
    });

    // Calculate basic metrics
    const totalRevenue = filteredTransactions.reduce(
      (sum, txn) => sum + txn.totalAmount,
      0,
    );
    const totalTransactions = filteredTransactions.length;
    const averageTransaction =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Today's metrics
    const todayTransactions = filteredTransactions.filter(
      (txn) => new Date(txn.timestamp).toDateString() === today,
    );
    const todayRevenue = todayTransactions.reduce(
      (sum, txn) => sum + txn.totalAmount,
      0,
    );

    // Week and month metrics
    const weekStart = subDays(now, 7);
    const monthStart = subDays(now, 30);

    const weekTransactions = transactions.filter((txn) => {
      const txnDate = parseISO(txn.timestamp);
      return (
        isWithinInterval(txnDate, { start: weekStart, end: now }) &&
        txn.status === "completed"
      );
    });

    const monthTransactions = transactions.filter((txn) => {
      const txnDate = parseISO(txn.timestamp);
      return (
        isWithinInterval(txnDate, { start: monthStart, end: now }) &&
        txn.status === "completed"
      );
    });

    const weekRevenue = weekTransactions.reduce(
      (sum, txn) => sum + txn.totalAmount,
      0,
    );
    const monthRevenue = monthTransactions.reduce(
      (sum, txn) => sum + txn.totalAmount,
      0,
    );

    // Top products
    const productMap = new Map<string, { quantity: number; revenue: number }>();

    filteredTransactions.forEach((txn) => {
      txn.items.forEach((item) => {
        const existing = productMap.get(item.productName) || {
          quantity: 0,
          revenue: 0,
        };
        productMap.set(item.productName, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.subtotal,
        });
      });
    });

    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Payment methods distribution
    const paymentMethods: Record<string, { count: number; amount: number }> =
      {};
    filteredTransactions.forEach((txn) => {
      const method = txn.paymentMethod;
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, amount: 0 };
      }
      paymentMethods[method].count++;
      paymentMethods[method].amount += txn.totalAmount;
    });

    // Hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
      const hourTransactions = filteredTransactions.filter((txn) => {
        const txnHour = new Date(txn.timestamp).getHours();
        return txnHour === hour;
      });

      return {
        hour,
        transactions: hourTransactions.length,
        revenue: hourTransactions.reduce(
          (sum, txn) => sum + txn.totalAmount,
          0,
        ),
      };
    });

    // Daily trend
    const dailyTrend = Array.from({ length: days }, (_, i) => {
      const date = subDays(now, days - 1 - i);
      const dateStr = date.toDateString();

      const dayTransactions = filteredTransactions.filter(
        (txn) => new Date(txn.timestamp).toDateString() === dateStr,
      );

      return {
        date: format(date, "MMM dd"),
        revenue: dayTransactions.reduce((sum, txn) => sum + txn.totalAmount, 0),
        transactions: dayTransactions.length,
      };
    });

    return {
      totalRevenue,
      totalTransactions,
      averageTransaction,
      todayRevenue,
      todayTransactions: todayTransactions.length,
      weekRevenue,
      monthRevenue,
      topProducts,
      paymentMethods,
      hourlyDistribution,
      dailyTrend,
    };
  };

  const loadMetrics = () => {
    setIsLoading(true);
    const transactions = getPOSTransactions();
    const days = parseInt(dateRange);
    const calculatedMetrics = calculateMetrics(transactions, days);
    setMetrics(calculatedMetrics);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  const formatCurrency = (amount: number) =>
    `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, trend: "neutral" as const };
    const percentage = ((current - previous) / previous) * 100;
    const trend = percentage > 0 ? "up" : percentage < 0 ? "down" : "neutral";
    return { percentage: Math.abs(percentage), trend };
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Dashboard</h2>
          <p className="text-gray-600">Monitor your POS sales performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={loadMetrics}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <p className="text-xs text-green-600">Last {dateRange} days</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {metrics.totalTransactions}
                </p>
                <p className="text-xs text-blue-600">Total completed</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">
                  Average Sale
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(metrics.averageTransaction)}
                </p>
                <p className="text-xs text-orange-600">Per transaction</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">
                  Today's Sales
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(metrics.todayRevenue)}
                </p>
                <p className="text-xs text-purple-600">
                  {metrics.todayTransactions} transactions
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <Badge variant="secondary" className="mr-3">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.quantity} units sold
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-green-600">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-500" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.paymentMethods).map(([method, data]) => {
                const percentage =
                  metrics.totalRevenue > 0
                    ? (data.amount / metrics.totalRevenue) * 100
                    : 0;
                return (
                  <div
                    key={method}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {method.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {data.count} transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(data.amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Sales Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-2 h-40">
            {metrics.dailyTrend.map((day, index) => {
              const maxRevenue = Math.max(
                ...metrics.dailyTrend.map((d) => d.revenue),
              );
              const height =
                maxRevenue > 0 ? (day.revenue / maxRevenue) * 120 : 0;

              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-orange-500 rounded-t w-full min-h-[4px] transition-all duration-300 hover:bg-orange-600"
                    style={{ height: `${height}px` }}
                    title={`${day.date}: ${formatCurrency(day.revenue)} (${day.transactions} txns)`}
                  />
                  <p className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                    {day.date}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-indigo-500" />
            Peak Sales Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-1">
            {metrics.hourlyDistribution.map((hour) => {
              const maxTransactions = Math.max(
                ...metrics.hourlyDistribution.map((h) => h.transactions),
              );
              const intensity =
                maxTransactions > 0 ? hour.transactions / maxTransactions : 0;
              const opacity = 0.1 + intensity * 0.9;

              return (
                <div
                  key={hour.hour}
                  className="aspect-square bg-orange-500 rounded flex items-center justify-center text-xs text-white font-medium"
                  style={{ opacity }}
                  title={`${hour.hour}:00 - ${hour.transactions} transactions, ${formatCurrency(hour.revenue)}`}
                >
                  {hour.hour}
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Darker colors indicate higher sales volume
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
