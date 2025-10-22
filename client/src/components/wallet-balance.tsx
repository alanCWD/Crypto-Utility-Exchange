import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, TrendingUp, TrendingDown } from "lucide-react";

interface Balance {
  currency: string;
  amount: string;
  usdValue: string;
  change24h: string;
}

interface WalletBalanceProps {
  balances?: Balance[];
}

const defaultBalances: Balance[] = [
  { currency: "XRP", amount: "5,000.00", usdValue: "2,600.00", change24h: "+2.4" },
  { currency: "USDT", amount: "1,000.00", usdValue: "1,000.00", change24h: "0.0" },
  { currency: "RLUSD", amount: "500.00", usdValue: "500.00", change24h: "+0.1" },
];

export function WalletBalance({ balances = defaultBalances }: WalletBalanceProps) {
  const totalUsdValue = balances.reduce(
    (sum, balance) => sum + parseFloat(balance.usdValue.replace(/,/g, "")),
    0
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Wallet Balance</CardTitle>
          <WalletIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Total Balance</div>
          <div className="text-2xl font-bold font-mono" data-testid="text-total-balance">
            ${totalUsdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="space-y-3">
          {balances.map((balance) => {
            const isPositive = parseFloat(balance.change24h) >= 0;
            return (
              <div
                key={balance.currency}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                data-testid={`balance-${balance.currency.toLowerCase()}`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">{balance.currency}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {balance.amount}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold font-mono text-sm mb-1">
                    ${balance.usdValue}
                  </div>
                  <div
                    className={`text-xs flex items-center justify-end gap-1 ${
                      isPositive ? "text-success" : "text-destructive"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {isPositive ? "+" : ""}{balance.change24h}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
