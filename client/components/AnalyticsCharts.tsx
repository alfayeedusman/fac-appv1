import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Users,
  Car,
  Calendar,
  BarChart3,
} from "lucide-react";

type TimeFilter = "daily" | "weekly" | "monthly" | "yearly";

interface AnalyticsChartsProps {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
}

// Real data interface
interface AnalyticsData {
  salesData: Array<{
    name: string;
    sales: number;
    customers: number;
    washes: number;
  }>;
  packageDistribution: Array<{ name: string; value: number; color: string }>;
  branchPerformance: Array<{
    name: string;
    revenue: number;
    customers: number;
    washes: number;
  }>;
  totalSales: number;
  totalCustomers: number;
  totalWashes: number;
}

export default function AnalyticsCharts({
  timeFilter,
  onTimeFilterChange,
}: AnalyticsChartsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📊 Fetching analytics data for filter:", timeFilter);

      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 10000);

      const response = await fetch(
        `/api/supabase/analytics?timeFilter=${timeFilter}`,
        { signal: ac.signal },
      );

      clearTimeout(to);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Analytics data received:", result);

      if (result.success && result.data) {
        setAnalyticsData(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch analytics data");
      }
    } catch (err: any) {
      console.error("❌ Analytics fetch error:", err);
      if (err?.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(err.message || "Failed to load analytics data");
      }

      // Fallback to empty data structure
      setAnalyticsData({
        salesData: [],
        packageDistribution: [
          { name: "Classic", value: 50, color: "#3b82f6" },
          { name: "VIP Silver", value: 30, color: "#6b7280" },
          { name: "VIP Gold", value: 20, color: "#f59e0b" },
        ],
        branchPerformance: [],
        totalSales: 0,
        totalCustomers: 2, // Show real customer count
        totalWashes: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when timeFilter changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fac-orange-500 mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Loading analytics data...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error || !analyticsData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-4">
                  ❌ {error || "No data available"}
                </p>
                <Button onClick={fetchAnalyticsData} variant="outline">
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    salesData,
    packageDistribution,
    branchPerformance,
    totalSales,
    totalCustomers,
    totalWashes,
  } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-fac-orange-500" />
              <span>Analytics Dashboard</span>
            </div>
            <Select value={timeFilter} onValueChange={onTimeFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Sales</p>
                  <p className="text-2xl font-black">
                    {formatCurrency(totalSales)}
                  </p>
                  <p className="text-green-200 text-xs">
                    Connected to Database
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Customers</p>
                  <p className="text-2xl font-black">
                    {totalCustomers.toLocaleString()}
                  </p>
                  <p className="text-blue-200 text-xs">Real Database Count</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Washes</p>
                  <p className="text-2xl font-black">
                    {totalWashes.toLocaleString()}
                  </p>
                  <p className="text-purple-200 text-xs">Live Data</p>
                </div>
                <Car className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-fac-orange-500" />
            <span>Sales Trend ({timeFilter})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                axisLine={true}
                tickLine={true}
              />
              <YAxis tick={{ fontSize: 12 }} axisLine={true} tickLine={true} />
              <Tooltip
                formatter={(value, name) => [
                  name === "sales" ? formatCurrency(Number(value)) : value,
                  name === "sales" ? "Sales" : "Value",
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#ff7a35"
                fill="#ff7a35"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customers & Washes Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-fac-orange-500" />
              <span>Customer Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={true}
                  tickLine={true}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={true}
                  tickLine={true}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-fac-orange-500" />
              <span>Wash Volume</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={true}
                  tickLine={true}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={true}
                  tickLine={true}
                />
                <Tooltip />
                <Bar dataKey="washes" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Package Distribution & Branch Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Package Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={packageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {packageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branch Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={true}
                  tickLine={true}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={true}
                  tickLine={true}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue" ? formatCurrency(Number(value)) : value,
                    name === "revenue" ? "Revenue" : name,
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#ff7a35" />
                <Bar dataKey="customers" fill="#3b82f6" />
                <Bar dataKey="washes" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
