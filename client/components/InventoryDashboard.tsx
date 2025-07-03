import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Eye,
  RefreshCw,
  ShoppingCart,
  Truck,
  Activity,
  PieChart,
} from "lucide-react";
import {
  getProducts,
  Product,
  getStockMovements,
  StockMovement,
} from "@/utils/inventoryData";
import { getCarWashServices } from "@/utils/carWashServices";
import { getPOSTransactions } from "@/utils/posData";

interface InventoryMetrics {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalServices: number;
  averageStockLevel: number;
  topValueProducts: Product[];
  lowStockProducts: Product[];
  categoryDistribution: Record<string, { count: number; value: number }>;
  recentMovements: StockMovement[];
  fastMovingProducts: Array<{
    product: Product;
    soldQuantity: number;
    revenue: number;
  }>;
  stockTurnover: Array<{
    product: Product;
    turnoverRate: number;
    daysOnHand: number;
  }>;
}

export default function InventoryDashboard() {
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
  const [viewMode, setViewMode] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  const calculateMetrics = (): InventoryMetrics => {
    const products = getProducts().filter((p) => p.status === "active");
    const services = getCarWashServices().filter((s) => s.isActive);
    const stockMovements = getStockMovements();
    const transactions = getPOSTransactions().filter(
      (t) => t.status === "completed",
    );

    // Basic metrics
    const totalProducts = products.length;
    const totalServices = services.length;
    const totalValue = products.reduce(
      (sum, p) => sum + p.currentStock * p.costPrice,
      0,
    );
    const lowStockCount = products.filter(
      (p) => p.currentStock <= p.minStockLevel,
    ).length;
    const outOfStockCount = products.filter((p) => p.currentStock === 0).length;
    const averageStockLevel =
      products.length > 0
        ? products.reduce((sum, p) => sum + p.currentStock, 0) / products.length
        : 0;

    // Top value products (by inventory value)
    const topValueProducts = [...products]
      .sort(
        (a, b) => b.currentStock * b.costPrice - a.currentStock * a.costPrice,
      )
      .slice(0, 5);

    // Low stock products
    const lowStockProducts = products
      .filter((p) => p.currentStock <= p.minStockLevel && p.currentStock > 0)
      .sort((a, b) => a.currentStock - b.currentStock)
      .slice(0, 10);

    // Category distribution
    const categoryDistribution: Record<
      string,
      { count: number; value: number }
    > = {};
    products.forEach((product) => {
      const category = product.category || "Uncategorized";
      if (!categoryDistribution[category]) {
        categoryDistribution[category] = { count: 0, value: 0 };
      }
      categoryDistribution[category].count++;
      categoryDistribution[category].value +=
        product.currentStock * product.costPrice;
    });

    // Recent stock movements (last 10)
    const recentMovements = stockMovements
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);

    // Fast-moving products (based on sales)
    const productSales = new Map<
      string,
      { quantity: number; revenue: number }
    >();

    transactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const existing = productSales.get(item.productId) || {
          quantity: 0,
          revenue: 0,
        };
        productSales.set(item.productId, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.subtotal,
        });
      });
    });

    const fastMovingProducts = Array.from(productSales.entries())
      .map(([productId, sales]) => {
        const product = products.find((p) => p.id === productId);
        return product
          ? {
              product,
              soldQuantity: sales.quantity,
              revenue: sales.revenue,
            }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.soldQuantity - a!.soldQuantity)
      .slice(0, 5) as Array<{
      product: Product;
      soldQuantity: number;
      revenue: number;
    }>;

    // Stock turnover calculation
    const stockTurnover = products
      .map((product) => {
        const sales = productSales.get(product.id);
        const soldQuantity = sales?.quantity || 0;
        const averageInventory =
          (product.currentStock + product.minStockLevel) / 2;
        const turnoverRate =
          averageInventory > 0 ? soldQuantity / averageInventory : 0;
        const daysOnHand = turnoverRate > 0 ? 365 / turnoverRate : Infinity;

        return {
          product,
          turnoverRate,
          daysOnHand: daysOnHand === Infinity ? 999 : Math.round(daysOnHand),
        };
      })
      .sort((a, b) => b.turnoverRate - a.turnoverRate);

    return {
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
      totalServices,
      averageStockLevel,
      topValueProducts,
      lowStockProducts,
      categoryDistribution,
      recentMovements,
      fastMovingProducts,
      stockTurnover: stockTurnover.slice(0, 10),
    };
  };

  const loadMetrics = () => {
    setIsLoading(true);
    const calculatedMetrics = calculateMetrics();
    setMetrics(calculatedMetrics);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const formatCurrency = (amount: number) =>
    `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0)
      return { label: "Out of Stock", color: "destructive" };
    if (product.currentStock <= product.minStockLevel)
      return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  const getStockPercentage = (current: number, max: number) => {
    return max > 0 ? Math.min((current / max) * 100, 100) : 0;
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
          <h2 className="text-2xl font-bold text-gray-900">
            Inventory Dashboard
          </h2>
          <p className="text-gray-600">
            Monitor stock levels and inventory value
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="movements">Movements</SelectItem>
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
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {metrics.totalProducts}
                </p>
                <p className="text-xs text-blue-600">
                  {metrics.totalServices} services
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">
                  Inventory Value
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(metrics.totalValue)}
                </p>
                <p className="text-xs text-green-600">At cost price</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">
                  Low Stock Items
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {metrics.lowStockCount}
                </p>
                <p className="text-xs text-yellow-600">Need attention</p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-full">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-red-900">
                  {metrics.outOfStockCount}
                </p>
                <p className="text-xs text-red-600">Urgent restock</p>
              </div>
              <div className="p-3 bg-red-500 rounded-full">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Value Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                Top Value Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.topValueProducts.map((product, index) => {
                  const inventoryValue =
                    product.currentStock * product.costPrice;
                  return (
                    <div
                      key={product.id}
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
                            {product.currentStock} units @{" "}
                            {formatCurrency(product.costPrice)}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-green-600">
                        {formatCurrency(inventoryValue)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.lowStockProducts.length > 0 ? (
                  metrics.lowStockProducts.map((product) => {
                    const stockPercentage = getStockPercentage(
                      product.currentStock,
                      product.minStockLevel * 2,
                    );
                    const status = getStockStatus(product);

                    return (
                      <div
                        key={product.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <Badge
                            variant={status.color as any}
                            className={
                              status.color === "warning"
                                ? "bg-yellow-100 text-yellow-700"
                                : status.color === "destructive"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                            }
                          >
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>
                            {product.currentStock} / {product.minStockLevel} min
                          </span>
                          <span>{formatCurrency(product.unitPrice)}</span>
                        </div>
                        <Progress
                          value={stockPercentage}
                          className="mt-2 h-2"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>All products are well stocked!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "analysis" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fast Moving Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Fast Moving Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.fastMovingProducts.map((item, index) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Badge variant="secondary" className="mr-3">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.soldQuantity} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(item.revenue)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stock: {item.product.currentStock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-purple-500" />
                Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics.categoryDistribution).map(
                  ([category, data]) => {
                    const valuePercentage =
                      metrics.totalValue > 0
                        ? (data.value / metrics.totalValue) * 100
                        : 0;

                    return (
                      <div key={category} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">
                            {category}
                          </p>
                          <span className="text-sm text-gray-600">
                            {data.count} products
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Value: {formatCurrency(data.value)}</span>
                          <span>{valuePercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={valuePercentage} className="h-2" />
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "movements" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2 text-indigo-500" />
              Recent Stock Movements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentMovements.length > 0 ? (
                metrics.recentMovements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          movement.type === "in"
                            ? "bg-green-100"
                            : movement.type === "out"
                              ? "bg-red-100"
                              : "bg-blue-100"
                        }`}
                      >
                        {movement.type === "in" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : movement.type === "out" ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <RefreshCw className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {movement.productName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {movement.type === "in"
                            ? "Stock In"
                            : movement.type === "out"
                              ? "Stock Out"
                              : "Adjustment"}
                          {movement.reason && ` - ${movement.reason}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          movement.type === "in"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {movement.type === "in" ? "+" : "-"}
                        {Math.abs(movement.quantity)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(movement.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent stock movements</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
