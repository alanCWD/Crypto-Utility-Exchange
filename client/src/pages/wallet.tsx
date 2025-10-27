import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { WalletBalance } from "@/components/wallet-balance";
import { TransactionHistory } from "@/components/transaction-history";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, DollarSign } from "lucide-react";
import type { Wallet as WalletType, Transaction } from "@shared/schema";

export default function Wallet() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch wallet data
  const { data: wallet, isLoading: walletLoading } = useQuery<WalletType>({
    queryKey: ["/api/wallet"],
    enabled: isAuthenticated,
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Convert wallet data to balance format
  const balances = wallet
    ? [
        {
          currency: "XRP",
          amount: parseFloat(wallet.xrpBalance).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          usdValue: (parseFloat(wallet.xrpBalance) * 0.52).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          change24h: "+2.4",
        },
        {
          currency: "USDT",
          amount: parseFloat(wallet.usdtBalance).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          usdValue: parseFloat(wallet.usdtBalance).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          change24h: "0.0",
        },
        {
          currency: "RLUSD",
          amount: parseFloat(wallet.rlusdBalance).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          usdValue: parseFloat(wallet.rlusdBalance).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          change24h: "+0.1",
        },
      ]
    : undefined;

  // Convert transactions to display format
  const displayTransactions = transactions?.map((tx) => ({
    id: tx.id,
    type: tx.type as "buy" | "sell" | "deposit" | "withdrawal" | "fiat_purchase",
    currency: tx.currency,
    amount: parseFloat(tx.amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    status: tx.status as "completed" | "pending" | "failed",
    timestamp: new Date(tx.createdAt!),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Wallet</h1>
          <p className="text-muted-foreground">Manage your crypto assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-deposit">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Deposit
          </Button>
          <Button variant="outline" data-testid="button-withdraw">
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
          <Button asChild data-testid="button-buy-crypto">
            <a href="/buy">
              <DollarSign className="h-4 w-4 mr-2" />
              Buy Crypto
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          {walletLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <WalletBalance balances={balances} />
          )}
        </div>
        <div className="lg:col-span-2">
          {transactionsLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <TransactionHistory transactions={displayTransactions} />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6"
              data-testid="button-quick-buy"
            >
              <DollarSign className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Buy XRP</div>
                <div className="text-xs text-muted-foreground">With credit card</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6"
              data-testid="button-quick-send"
            >
              <ArrowUpFromLine className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Send</div>
                <div className="text-xs text-muted-foreground">To another wallet</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6"
              data-testid="button-quick-receive"
            >
              <ArrowDownToLine className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Receive</div>
                <div className="text-xs text-muted-foreground">Get your address</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
