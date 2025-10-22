import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Market {
  id: string;
  pair: string;
  name: string;
  price: string;
  change24h: string;
  volume24h: string;
  high24h: string;
  low24h: string;
}

export default function Markets() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch market data
  const { data: markets, isLoading: marketsLoading, error } = useQuery<Market[]>({
    queryKey: ["/api/markets"],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
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

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load market data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

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
          {marketsLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : !markets || markets.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No markets available</p>
            </div>
          ) : (
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
                      24h High
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground text-right">
                      24h Low
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {markets.map((market) => {
                    const isPositive = market.change24h.startsWith("+");
                    return (
                      <tr
                        key={market.id}
                        className="hover:bg-accent/50 transition-colors cursor-pointer"
                        data-testid={`market-${market.id}`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold">{market.pair}</div>
                            <div className="text-xs text-muted-foreground">{market.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono font-semibold">${market.price}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge
                            variant={isPositive ? "default" : "destructive"}
                            className={`font-mono ${
                              isPositive ? "bg-success border-success-border" : ""
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {isPositive ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {market.change24h}%
                            </div>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono text-sm">{market.volume24h}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono text-sm text-success">${market.high24h}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono text-sm text-destructive">${market.low24h}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">24h Trading Volume</div>
            <div className="text-2xl font-bold font-mono">$3.2M</div>
            <div className="text-xs text-success mt-1">+12.3% from yesterday</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Active Markets</div>
            <div className="text-2xl font-bold font-mono">{markets?.length || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Trading pairs available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Top Gainer</div>
            <div className="text-2xl font-bold">
              {markets && markets.length > 0
                ? markets.reduce((max, m) =>
                    parseFloat(m.change24h) > parseFloat(max.change24h) ? m : max
                  ).pair
                : "-"}
            </div>
            <div className="text-xs text-success mt-1">
              {markets && markets.length > 0
                ? `${
                    markets.reduce((max, m) =>
                      parseFloat(m.change24h) > parseFloat(max.change24h) ? m : max
                    ).change24h
                  }%`
                : ""}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
