import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard, Shield, Lock } from "lucide-react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/lib/queryClient";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/wallet`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing}
        data-testid="button-complete-purchase"
      >
        {isProcessing ? "Processing..." : "Complete Purchase"}
      </Button>
    </form>
  );
}

export default function BuyXRP() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [amount, setAmount] = useState("100");
  const [xrpAmount, setXrpAmount] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const xrpPrice = 0.52; // Simulated price

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

  useEffect(() => {
    if (amount) {
      const usdAmount = parseFloat(amount);
      if (!isNaN(usdAmount)) {
        setXrpAmount((usdAmount / xrpPrice).toFixed(2));
      }
    } else {
      setXrpAmount("");
    }
  }, [amount]);

  const handleCreatePayment = async () => {
    const usdAmount = parseFloat(amount);
    if (isNaN(usdAmount) || usdAmount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum purchase is $10",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingPayment(true);
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: usdAmount,
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPayment(false);
    }
  };

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
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Buy XRP</h1>
          <p className="text-muted-foreground">Purchase XRP with USD using your credit or debit card</p>
        </div>

        {!clientSecret ? (
          <Card>
            <CardHeader>
              <CardTitle>Enter Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="usd-amount">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="usd-amount"
                    type="number"
                    step="0.01"
                    min="10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7 font-mono text-lg"
                    placeholder="100.00"
                    data-testid="input-purchase-amount"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Minimum: $10.00</p>
              </div>

              {xrpAmount && (
                <div className="p-4 rounded-lg bg-accent/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You will receive</span>
                    <span className="font-mono font-semibold" data-testid="text-xrp-estimate">
                      {xrpAmount} XRP
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Exchange rate</span>
                    <span className="font-mono">1 XRP = ${xrpPrice.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing fee</span>
                    <span className="font-mono">$0.00</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="font-mono">${amount}</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleCreatePayment}
                disabled={isLoadingPayment || !amount || parseFloat(amount) < 10}
                data-testid="button-proceed-payment"
              >
                {isLoadingPayment ? "Loading..." : "Proceed to Payment"}
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  <span>256-bit SSL</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>
            </CardContent>
          </Card>
        )}

        <Card className="bg-accent/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Secure & Instant
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• XRP delivered instantly to your wallet</li>
              <li>• Bank-grade encryption for all transactions</li>
              <li>• Powered by Stripe for secure payments</li>
              <li>• No hidden fees or charges</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
