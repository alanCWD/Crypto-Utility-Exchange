import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { PriceChart } from "@/components/price-chart";
import { OrderBook } from "@/components/order-book";
import { TradeForm } from "@/components/trade-form";
import { WalletBalance } from "@/components/wallet-balance";
import { TransactionHistory } from "@/components/transaction-history";
import type { Wallet, Transaction } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Fetch wallet data
  const { data: wallet, isLoading: walletLoading } = useQuery<Wallet>({
    queryKey: ["/api/wallet"],
    enabled: isAuthenticated,
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  // Trade mutation
  const tradeMutation = useMutation({
    mutationFn: async (data: { type: "buy" | "sell"; amount: string; price: string; pair: string }) => {
      const total = (parseFloat(data.amount) * parseFloat(data.price)).toFixed(2);
      await apiRequest("POST", "/api/trades", {
        ...data,
        total,
        status: "completed",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      toast({
        title: "Trade Executed",
        description: "Your trade has been successfully executed",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Trade Failed",
        description: error.message || "Failed to execute trade",
        variant: "destructive",
      });
    },
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

  const handleTrade = (type: "buy" | "sell", amount: number, price: number) => {
    tradeMutation.mutate({
      type,
      amount: amount.toString(),
      price: price.toString(),
      pair: "XRP/USD",
    });
  };

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
      <div>
        <h1 className="text-3xl font-bold mb-2">Trading Dashboard</h1>
        <p className="text-muted-foreground">Monitor and execute trades on the XRPL</p>
      </div>

      {/* Main Trading View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart and Order Book */}
        <div className="lg:col-span-2 space-y-6">
          <PriceChart pair="XRP/USD" />
          <OrderBook />
        </div>

        {/* Right Column - Trade Form and Wallet */}
        <div className="space-y-6">
          <TradeForm
            onTrade={handleTrade}
            isLoading={tradeMutation.isPending}
            wallet={wallet}
          />
          {walletLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <WalletBalance balances={balances} />
          )}
        </div>
      </div>

      {/* Transaction History */}
      {transactionsLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <TransactionHistory transactions={displayTransactions} limit={5} />
      )}
    </div>
  );
}
