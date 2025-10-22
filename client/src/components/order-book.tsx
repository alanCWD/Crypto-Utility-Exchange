import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

// Simulated order book data
const generateOrderBook = () => {
  const bids = [];
  const asks = [];
  const basePrice = 0.52;
  
  for (let i = 0; i < 10; i++) {
    bids.push({
      price: (basePrice - i * 0.0002).toFixed(4),
      amount: (Math.random() * 10000 + 1000).toFixed(2),
      total: ((basePrice - i * 0.0002) * (Math.random() * 10000 + 1000)).toFixed(2),
    });
    asks.push({
      price: (basePrice + i * 0.0002).toFixed(4),
      amount: (Math.random() * 10000 + 1000).toFixed(2),
      total: ((basePrice + i * 0.0002) * (Math.random() * 10000 + 1000)).toFixed(2),
    });
  }
  
  return { bids, asks: asks.reverse() };
};

export function OrderBook() {
  const { bids, asks } = useMemo(() => generateOrderBook(), []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Order Book</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-2 px-4 pb-2 text-xs font-medium text-muted-foreground border-b border-border">
          <div className="text-left">Price (USD)</div>
          <div className="text-right">Amount (XRP)</div>
          <div className="text-right">Total (USD)</div>
        </div>

        {/* Asks (Sell orders) */}
        <div className="max-h-[200px] overflow-y-auto">
          {asks.map((ask, i) => (
            <div
              key={`ask-${i}`}
              className="grid grid-cols-3 gap-2 px-4 py-1.5 text-xs font-mono hover:bg-accent/50 transition-colors relative"
            >
              <div
                className="absolute inset-0 bg-destructive/10"
                style={{ width: `${(parseFloat(ask.total) / 6000) * 100}%` }}
              />
              <div className="text-destructive relative z-10">{ask.price}</div>
              <div className="text-right relative z-10">{ask.amount}</div>
              <div className="text-right relative z-10">{ask.total}</div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="py-3 px-4 border-y border-border bg-accent/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Spread</span>
            <span className="font-mono font-semibold text-primary">
              ${(parseFloat(asks[asks.length - 1].price) - parseFloat(bids[0].price)).toFixed(4)}
            </span>
          </div>
        </div>

        {/* Bids (Buy orders) */}
        <div className="max-h-[200px] overflow-y-auto">
          {bids.map((bid, i) => (
            <div
              key={`bid-${i}`}
              className="grid grid-cols-3 gap-2 px-4 py-1.5 text-xs font-mono hover:bg-accent/50 transition-colors relative"
            >
              <div
                className="absolute inset-0 bg-success/10"
                style={{ width: `${(parseFloat(bid.total) / 6000) * 100}%` }}
              />
              <div className="text-success relative z-10">{bid.price}</div>
              <div className="text-right relative z-10">{bid.amount}</div>
              <div className="text-right relative z-10">{bid.total}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
