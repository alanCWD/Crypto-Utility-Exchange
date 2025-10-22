import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change24h: string;
  volume24h: string;
  marketCap: string;
}

const markets: MarketData[] = [
  {
    symbol: "XRP",
    name: "XRP",
    price: "0.5200",
    change24h: "+2.4",
    volume24h: "1.2M",
    marketCap: "28.5B",
  },
  {
    symbol: "RLUSD",
    name: "Ripple USD",
    price: "1.0000",
    change24h: "+0.1",
    volume24h: "450K",
    marketCap: "125M",
  },
  {
    symbol: "SOLO",
    name: "Sologenic",
    price: "0.1850",
    change24h: "-1.2",
    volume24h: "85K",
    marketCap: "74M",
  },
  {
    symbol: "CSC",
    name: "CasinoCoin",
    price: "0.0012",
    change24h: "+5.8",
    volume24h: "12K",
    marketCap: "48M",
  },
];

export default function Markets() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Markets</h1>
        <p className="text-muted-foreground">Explore XRPL tokens and trading pairs</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              className="pl-10"
              data-testid="input-market-search"
            />
          </div>
        </CardContent>
      </Card>

      {/* Markets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Markets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr className="text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Market</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-right">
                    Price
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-right">
                    24h Change
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-right">
                    24h Volume
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-right">
                    Market Cap
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {markets.map((market) => {
                  const isPositive = market.change24h.startsWith("+");
                  return (
                    <tr
                      key={market.symbol}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                      data-testid={`market-row-${market.symbol.toLowerCase()}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {market.symbol[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold">{market.symbol}</div>
                            <div className="text-sm text-muted-foreground">{market.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold">
                        ${market.price}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge
                          variant={isPositive ? "default" : "destructive"}
                          className={`${
                            isPositive
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          } flex items-center gap-1 justify-end w-fit ml-auto`}
                        >
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {market.change24h}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm">
                        ${market.volume24h}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm">
                        ${market.marketCap}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
