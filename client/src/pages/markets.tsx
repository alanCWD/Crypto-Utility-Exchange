import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Search, Info, Radio } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Market {
  id: string;
  symbol: string;
  pair: string;
  name: string;
  price: string;
  change24h: string;
  volume24h: string;
  high24h: string;
  low24h: string;
  category: string;
  primaryUtility: string;
  useCaseDescription: string;
}

const CATEGORIES = [
  "All",
  "DeFi",
  "Payments",
  "Smart Contracts",
  "Layer-2",
  "Enterprise",
  "Storage",
  "IoT",
  "Oracles",
  "Interoperability",
  "Stablecoins",
  "Supply Chain",
  "Computing",
  "Exchange",
];

// Color mapping for category badges
const CATEGORY_COLORS: Record<string, string> = {
  "DeFi": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Storage": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "IoT": "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "Enterprise": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Layer-2": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "Payments": "bg-green-500/20 text-green-400 border-green-500/30",
  "Oracles": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Interoperability": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Smart Contracts": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Stablecoins": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Supply Chain": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Computing": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "Exchange": "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export default function Markets() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch market data with category filter
  const { data: markets, isLoading: marketsLoading, error, dataUpdatedAt } = useQuery<Market[]>({
    queryKey: ["/api/markets", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory !== "All"
        ? `/api/markets?category=${encodeURIComponent(selectedCategory)}`
        : "/api/markets";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch markets");
      }
      return response.json();
    },
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

  // Filter markets by search query
  const filteredMarkets = markets?.filter(market =>
    market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format last updated timestamp
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Utility Crypto Markets</h1>
            <Badge 
              variant="outline" 
              className="bg-green-500/10 text-green-400 border-green-500/30 animate-pulse"
              data-testid="badge-live-prices"
            >
              <Radio className="h-3 w-3 mr-1" />
              Live Prices
            </Badge>
          </div>
          <p className="text-muted-foreground">Discover and trade cryptocurrencies solving real-world problems</p>
        </div>
        {lastUpdated && (
          <div className="text-sm text-muted-foreground" data-testid="text-last-updated">
            Last updated: {lastUpdated}
          </div>
        )}
      </div>

      {/* Category Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                data-testid={`filter-${category.toLowerCase()}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, symbol, or pair..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-market-search"
            />
          </div>
        </CardContent>
      </Card>

      {/* Markets Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedCategory === "All" ? "All Utility Cryptos" : `${selectedCategory} Cryptos`}
            {filteredMarkets && ` (${filteredMarkets.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {marketsLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : !filteredMarkets || filteredMarkets.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No markets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr className="text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Asset</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Category</th>
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
                  {filteredMarkets.map((market) => {
                    const isPositive = market.change24h.startsWith("+");
                    return (
                      <tr
                        key={market.id}
                        className="hover:bg-accent/50 transition-colors cursor-pointer"
                        data-testid={`market-${market.id}`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{market.symbol}</span>
                              <span className="text-xs text-muted-foreground">{market.pair}</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info
                                    className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-help transition-colors"
                                    data-testid={`info-${market.id}`}
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs" side="right">
                                  <div className="space-y-2">
                                    <div>
                                      <div className="font-semibold text-sm">{market.name}</div>
                                      <div className="text-xs text-muted-foreground">{market.primaryUtility}</div>
                                    </div>
                                    <div className="text-xs">{market.useCaseDescription}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="text-sm text-muted-foreground">{market.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={`text-xs ${CATEGORY_COLORS[market.category] || "bg-muted text-muted-foreground"}`}
                          >
                            {market.category}
                          </Badge>
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
            <div className="text-sm text-muted-foreground mb-1">Total Utility Cryptos</div>
            <div className="text-2xl font-bold font-mono">{markets?.length || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Across {CATEGORIES.length - 1} categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Current Category</div>
            <div className="text-2xl font-bold">{selectedCategory}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {filteredMarkets?.length || 0} assets
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Top Gainer</div>
            <div className="text-2xl font-bold">
              {filteredMarkets && filteredMarkets.length > 0
                ? filteredMarkets.reduce((max, m) =>
                    parseFloat(m.change24h) > parseFloat(max.change24h) ? m : max
                  ).symbol
                : "-"}
            </div>
            <div className="text-xs text-success mt-1">
              {filteredMarkets && filteredMarkets.length > 0
                ? `${
                    filteredMarkets.reduce((max, m) =>
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
