import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";

// Simulated price data for demo
const generatePriceData = () => {
  const data = [];
  const basePrice = 0.52;
  let currentPrice = basePrice;
  
  for (let i = 0; i < 24; i++) {
    const change = (Math.random() - 0.48) * 0.02;
    currentPrice += change;
    data.push({
      time: `${i}:00`,
      price: parseFloat(currentPrice.toFixed(4)),
    });
  }
  return data;
};

interface PriceChartProps {
  pair?: string;
}

export function PriceChart({ pair = "XRP/USD" }: PriceChartProps) {
  const data = useMemo(() => generatePriceData(), []);
  const currentPrice = data[data.length - 1].price;
  const previousPrice = data[0].price;
  const change = currentPrice - previousPrice;
  const changePercent = ((change / previousPrice) * 100).toFixed(2);
  const isPositive = change >= 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-1">{pair}</CardTitle>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold font-mono" data-testid="text-current-price">
                ${currentPrice.toFixed(4)}
              </span>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? "text-success" : "text-destructive"
                }`}
                data-testid="text-price-change"
              >
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {isPositive ? "+" : ""}{changePercent}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
            <div className="text-sm font-mono font-semibold">$1,234,567</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? "hsl(145, 80%, 42%)" : "hsl(0, 84%, 60%)"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? "hsl(145, 80%, 42%)" : "hsl(0, 84%, 60%)"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toFixed(3)}`}
              domain={["dataMin - 0.01", "dataMax + 0.01"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`$${value.toFixed(4)}`, "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "hsl(145, 80%, 42%)" : "hsl(0, 84%, 60%)"}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
