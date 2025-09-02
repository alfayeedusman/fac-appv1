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

// Sample data - in a real app, this would come from your API
const salesData = {
  daily: [
    { name: "Mon", sales: 12500, customers: 45, washes: 78 },
    { name: "Tue", sales: 15200, customers: 52, washes: 85 },
    { name: "Wed", sales: 18600, customers: 61, washes: 94 },
    { name: "Thu", sales: 14800, customers: 48, washes: 82 },
    { name: "Fri", sales: 22400, customers: 72, washes: 108 },
    { name: "Sat", sales: 28900, customers: 89, washes: 125 },
    { name: "Sun", sales: 25600, customers: 78, washes: 115 },
  ],
  weekly: [
    { name: "Week 1", sales: 89500, customers: 312, washes: 567 },
    { name: "Week 2", sales: 95200, customers: 345, washes: 602 },
    { name: "Week 3", sales: 105600, customers: 378, washes: 645 },
    { name: "Week 4", sales: 112800, customers: 402, washes: 688 },
  ],
  monthly: [
    { name: "Jan", sales: 156780, customers: 1247, washes: 2456 },
    { name: "Feb", sales: 189650, customers: 1456, washes: 2789 },
    { name: "Mar", sales: 198750, customers: 1523, washes: 2945 },
    { name: "Apr", sales: 178950, customers: 1398, washes: 2678 },
    { name: "May", sales: 201450, customers: 1567, washes: 3012 },
    { name: "Jun", sales: 225680, customers: 1689, washes: 3234 },
  ],
  yearly: [
    { name: "2020", sales: 1856780, customers: 12247, washes: 24567 },
    { name: "2021", sales: 2189650, customers: 15456, washes: 28789 },
    { name: "2022", sales: 2487500, customers: 17523, washes: 32945 },
    { name: "2023", sales: 2789500, customers: 19398, washes: 36678 },
    { name: "2024", sales: 3124500, customers: 21567, washes: 41012 },
  ],
};

const packageDistribution = [
  { name: "Classic", value: 45, color: "#3b82f6" },
  { name: "VIP Silver", value: 35, color: "#6b7280" },
  { name: "VIP Gold", value: 20, color: "#f59e0b" },
];

const branchPerformance = [
  { name: "Tumaga", revenue: 89560, customers: 567, washes: 1234 },
  { name: "Boalan", revenue: 67220, customers: 423, washes: 989 },
];

export default function AnalyticsCharts({
  timeFilter,
  onTimeFilterChange,
}: AnalyticsChartsProps) {
  const currentData = salesData[timeFilter];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalSales = currentData.reduce((sum, item) => sum + item.sales, 0);
  const totalCustomers = currentData.reduce(
    (sum, item) => sum + item.customers,
    0,
  );
  const totalWashes = currentData.reduce((sum, item) => sum + item.washes, 0);

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
            <AreaChart data={currentData}>
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
              <LineChart data={currentData}>
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
              <BarChart data={currentData}>
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
