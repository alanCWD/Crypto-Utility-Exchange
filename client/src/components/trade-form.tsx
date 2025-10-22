import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { Wallet } from "@shared/schema";

interface TradeFormProps {
  onTrade?: (type: "buy" | "sell", amount: number, price: number) => void;
  isLoading?: boolean;
  wallet?: Wallet;
}

export function TradeForm({ onTrade, isLoading, wallet }: TradeFormProps) {
  const [buyAmount, setBuyAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState("0.5200");
  const [buyPercentage, setBuyPercentage] = useState([0]);
  
  const [sellAmount, setSellAmount] = useState("");
  const [sellPrice, setSellPrice] = useState("0.5200");
  const [sellPercentage, setSellPercentage] = useState([0]);

  const usdtBalance = wallet ? parseFloat(wallet.usdtBalance) : 1000;
  const xrpBalance = wallet ? parseFloat(wallet.xrpBalance) : 5000;

  const handleBuy = () => {
    if (buyAmount && buyPrice) {
      onTrade?.("buy", parseFloat(buyAmount), parseFloat(buyPrice));
    }
  };

  const handleSell = () => {
    if (sellAmount && sellPrice) {
      onTrade?.("sell", parseFloat(sellAmount), parseFloat(sellPrice));
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="buy" data-testid="tab-buy">Buy</TabsTrigger>
            <TabsTrigger value="sell" data-testid="tab-sell">Sell</TabsTrigger>
          </TabsList>

          {/* Buy Tab */}
          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buy-price" className="text-xs text-muted-foreground">
                Price (USD)
              </Label>
              <Input
                id="buy-price"
                type="number"
                step="0.0001"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="font-mono"
                data-testid="input-buy-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buy-amount" className="text-xs text-muted-foreground">
                Amount (XRP)
              </Label>
              <Input
                id="buy-amount"
                type="number"
                step="0.01"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="0.00"
                className="font-mono"
                data-testid="input-buy-amount"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Percentage</Label>
              <Slider
                value={buyPercentage}
                onValueChange={(value) => {
                  setBuyPercentage(value);
                  const amount = (usdtBalance * value[0]) / 100;
                  setBuyAmount((amount / parseFloat(buyPrice)).toFixed(2));
                }}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <Button
                    key={percent}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setBuyPercentage([percent]);
                      const amount = (usdtBalance * percent) / 100;
                      setBuyAmount((amount / parseFloat(buyPrice)).toFixed(2));
                    }}
                    data-testid={`button-buy-${percent}`}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono font-semibold" data-testid="text-buy-total">
                  ${buyAmount ? (parseFloat(buyAmount) * parseFloat(buyPrice)).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Available</span>
                <span className="font-mono">${usdtBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</span>
              </div>
            </div>

            <Button
              className="w-full bg-success hover:bg-success border-success-border"
              onClick={handleBuy}
              disabled={isLoading || !buyAmount || parseFloat(buyAmount) <= 0}
              data-testid="button-execute-buy"
            >
              {isLoading ? "Processing..." : "Buy XRP"}
            </Button>
          </TabsContent>

          {/* Sell Tab */}
          <TabsContent value="sell" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sell-price" className="text-xs text-muted-foreground">
                Price (USD)
              </Label>
              <Input
                id="sell-price"
                type="number"
                step="0.0001"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="font-mono"
                data-testid="input-sell-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sell-amount" className="text-xs text-muted-foreground">
                Amount (XRP)
              </Label>
              <Input
                id="sell-amount"
                type="number"
                step="0.01"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="0.00"
                className="font-mono"
                data-testid="input-sell-amount"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Percentage</Label>
              <Slider
                value={sellPercentage}
                onValueChange={(value) => {
                  setSellPercentage(value);
                  const amount = (xrpBalance * value[0]) / 100;
                  setSellAmount(amount.toFixed(2));
                }}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <Button
                    key={percent}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setSellPercentage([percent]);
                      const amount = (xrpBalance * percent) / 100;
                      setSellAmount(amount.toFixed(2));
                    }}
                    data-testid={`button-sell-${percent}`}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono font-semibold" data-testid="text-sell-total">
                  ${sellAmount ? (parseFloat(sellAmount) * parseFloat(sellPrice)).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Available</span>
                <span className="font-mono">{xrpBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XRP</span>
              </div>
            </div>

            <Button
              className="w-full bg-destructive hover:bg-destructive border-destructive-border"
              onClick={handleSell}
              disabled={isLoading || !sellAmount || parseFloat(sellAmount) <= 0}
              data-testid="button-execute-sell"
            >
              {isLoading ? "Processing..." : "Sell XRP"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
