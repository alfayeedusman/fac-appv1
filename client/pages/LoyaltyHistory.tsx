import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Gift, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import StickyHeader from "@/components/StickyHeader";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: "earned" | "spent";
  amount: number;
  description: string;
  relatedBooking?: string;
  relatedReward?: string;
  createdAt: string;
}

export default function LoyaltyHistory() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "earned" | "spent">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [page, filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (filter !== "all") {
        params.append("type", filter);
      }

      const response = await fetch(`/api/gamification/loyalty?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch transactions");

      const data = await response.json();
      if (page === 1) {
        setTransactions(data.transactions || []);
      } else {
        setTransactions([...transactions, ...(data.transactions || [])]);
      }
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transaction history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: "all" | "earned" | "spent") => {
    setFilter(newFilter);
    setPage(1);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  });

  const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    const isEarned = transaction.type === "earned";
    const Icon = isEarned ? ArrowDown : ArrowUp;
    const bgColor = isEarned ? "bg-green-100" : "bg-red-100";
    const textColor = isEarned ? "text-green-700" : "text-red-700";
    const badgeVariant = isEarned ? "default" : "destructive";

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-lg", bgColor)}>
              <Icon className={cn("w-5 h-5", textColor)} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm">{transaction.description}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(transaction.createdAt), "MMM dd, yyyy hh:mm a")}
              </p>
              {(transaction.relatedBooking || transaction.relatedReward) && (
                <p className="text-xs text-muted-foreground mt-2">
                  {transaction.relatedBooking && `Booking #${transaction.relatedBooking}`}
                  {transaction.relatedReward && `Reward: ${transaction.relatedReward}`}
                </p>
              )}
            </div>

            <div className="text-right flex-shrink-0">
              <p className={cn("font-bold text-lg", isEarned ? "text-green-600" : "text-red-600")}>
                {isEarned ? "+" : "-"}{transaction.amount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <StickyHeader title="Loyalty History" />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => handleFilterChange(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="earned">Earned</TabsTrigger>
            <TabsTrigger value="spent">Spent</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            {/* Loading State */}
            {loading && page === 1 && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6 space-y-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Transactions List */}
            {!loading && (
              <>
                {filteredTransactions.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {filteredTransactions.map((transaction) => (
                        <TransactionItem key={transaction.id} transaction={transaction} />
                      ))}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                      <div className="mt-6 text-center">
                        <Button
                          variant="outline"
                          onClick={() => setPage(page + 1)}
                          disabled={loading}
                        >
                          {loading ? "Loading..." : "Load More"}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                      <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No transactions</h3>
                      <p className="text-sm text-muted-foreground">
                        {filter === "all"
                          ? "Your transaction history will appear here"
                          : `No ${filter} transactions yet`}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
