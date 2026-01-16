import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getDailySalesReport,
  getTodayTransactions,
  getTodayExpenses,
  deleteExpense,
} from "@/utils/posTransactionTracker";
import {
  TrendingUp,
  AlertCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";

export default function DailyPOSSalesWidget() {
  const [salesReport, setSalesReport] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    try {
      const report = getDailySalesReport();
      setSalesReport(report);
      setTransactions(getTodayTransactions());
      setExpenses(getTodayExpenses());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Load data once on mount, don't poll continuously to avoid lag
  }, []);

  if (!salesReport) return null;

  return (
    <div className="space-y-6">
      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Sales */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ₱{salesReport.totalSales.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {salesReport.transactionCount} transaction{salesReport.transactionCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  ₱{salesReport.totalExpenses.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {salesReport.expenseCount} expense{salesReport.expenseCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="bg-gradient-to-r from-red-100 to-pink-100 p-4 rounded-xl">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Income */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow col-span-1 md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Net Income</p>
                <p className={`text-3xl font-bold mt-1 ${
                  salesReport.netIncome >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  ₱{salesReport.netIncome.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Today's profit margin
                </p>
              </div>
              <div className={`bg-gradient-to-r ${
                salesReport.netIncome >= 0
                  ? "from-emerald-100 to-green-100"
                  : "from-orange-100 to-yellow-100"
              } p-4 rounded-xl`}>
                <TrendingUp className={`h-8 w-8 ${
                  salesReport.netIncome >= 0 ? "text-green-600" : "text-orange-600"
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions and Expenses Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <Badge variant="secondary">
                {transactions.length} today
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {transactions.slice(-10).reverse().map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{transaction.customerInfo.name || "Walk-in"}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {transaction.time} · {transaction.paymentMethod}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      ₱{transaction.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No transactions today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Expenses Today</CardTitle>
              <Badge variant="secondary">
                {expenses.length} recorded
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {expenses.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 capitalize">{expense.category}</p>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {expense.description}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {expense.time} · {expense.paymentMethod}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-red-600">
                        ₱{expense.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <button
                        onClick={() => {
                          deleteExpense(expense.id);
                          loadData();
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-200 rounded-lg"
                        title="Delete expense"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No expenses recorded today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>
    </div>
  );
}
