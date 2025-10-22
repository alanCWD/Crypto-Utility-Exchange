import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Shield, Zap, DollarSign } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">X</span>
            </div>
            <span className="text-xl font-semibold">XRPL Exchange</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl mb-6">
              Trade XRP & XRPL Tokens
              <span className="block text-primary mt-2">Built for the Ecosystem</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The first consumer-focused exchange built natively for the XRP Ledger. 
              Spot trading, fiat on-ramps, and real-time market data.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="text-lg h-12 px-8" asChild data-testid="button-get-started">
                <a href="/api/login">Get Started</a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-12 px-8" data-testid="button-learn-more">
                Learn More
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            {[
              { label: "24h Volume", value: "$1.2M" },
              { label: "Active Traders", value: "2,400+" },
              { label: "Avg. Fee", value: "0.1%" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat) => (
              <Card key={stat.label} className="p-6 text-center">
                <div className="text-2xl font-bold font-mono text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose XRPL Exchange?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Professional trading platform designed specifically for the XRP Ledger ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Spot Trading",
                description: "Trade XRP/USD and XRP/USDT with real-time charts and order books",
              },
              {
                icon: <DollarSign className="h-8 w-8" />,
                title: "Fiat On-Ramp",
                description: "Buy XRP directly with USD using credit or debit cards via Stripe",
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Lightning Fast",
                description: "Built on XRPL's 1,500+ TPS infrastructure for instant settlements",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Bank-Grade Security",
                description: "Your assets are protected with enterprise-level encryption",
              },
            ].map((feature) => (
              <Card key={feature.title} className="p-6 hover-elevate">
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-12 text-center bg-gradient-to-br from-primary/10 to-background border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of traders already using XRPL Exchange to trade XRP and XRPL tokens
            </p>
            <Button size="lg" className="text-lg h-12 px-8" asChild data-testid="button-cta-signup">
              <a href="/api/login">Create Free Account</a>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">X</span>
              </div>
              <span className="font-semibold">XRPL Exchange</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 XRPL Exchange. Built for the XRP Ledger ecosystem.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
