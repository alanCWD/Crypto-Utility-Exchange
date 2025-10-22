import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, ShoppingCart, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdrawal" | "fiat_purchase";
  currency: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  timestamp: Date;
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
  limit?: number;
}

const defaultTransactions: Transaction[] = [
  {
    id: "1",
    type: "buy",
    currency: "XRP",
    amount: "1,000.00",
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    type: "fiat_purchase",
    currency: "XRP",
    amount: "500.00",
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    type: "sell",
    currency: "XRP",
    amount: "200.00",
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "4",
    type: "buy",
    currency: "XRP",
    amount: "750.00",
    status: "pending",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

const getTypeIcon = (type: Transaction["type"]) => {
  switch (type) {
    case "buy":
      return <ArrowDownRight className="h-4 w-4 text-success" />;
    case "sell":
      return <ArrowUpRight className="h-4 w-4 text-destructive" />;
    case "fiat_purchase":
      return <DollarSign className="h-4 w-4 text-primary" />;
    default:
      return <ShoppingCart className="h-4 w-4 text-muted-foreground" />;
  }
};

const getTypeLabel = (type: Transaction["type"]) => {
  switch (type) {
    case "buy":
      return "Buy";
    case "sell":
      return "Sell";
    case "fiat_purchase":
      return "Fiat Purchase";
    case "deposit":
      return "Deposit";
    case "withdrawal":
      return "Withdrawal";
    default:
      return type;
  }
};

export function TransactionHistory({
  transactions = defaultTransactions,
  limit,
}: TransactionHistoryProps) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {displayTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            displayTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                data-testid={`transaction-${tx.id}`}
              >
                <div className="flex-shrink-0">{getTypeIcon(tx.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{getTypeLabel(tx.type)}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(tx.timestamp, "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-sm">
                    {tx.type === "sell" ? "-" : "+"}
                    {tx.amount} {tx.currency}
                  </div>
                  <Badge
                    variant={
                      tx.status === "completed"
                        ? "default"
                        : tx.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
