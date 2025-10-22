import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTransactionSchema, insertTradeSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Initialize Stripe only if secret key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Wallet routes
  app.get('/api/wallet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallet = await storage.getOrCreateWallet(userId);
      res.json(wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertTransactionSchema.safeParse({
        ...req.body,
        userId,
      });

      if (!validation.success) {
        return res.status(400).json({
          message: fromZodError(validation.error).message,
        });
      }

      const transaction = await storage.createTransaction(validation.data);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Trade routes
  app.get('/api/trades', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const trades = await storage.getUserTrades(userId, limit);
      res.json(trades);
    } catch (error) {
      console.error("Error fetching trades:", error);
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.post('/api/trades', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertTradeSchema.safeParse({
        ...req.body,
        userId,
      });

      if (!validation.success) {
        return res.status(400).json({
          message: fromZodError(validation.error).message,
        });
      }

      // Create the trade
      const trade = await storage.createTrade(validation.data);

      // Update wallet balance
      const wallet = await storage.getOrCreateWallet(userId);
      const currentXrpBalance = parseFloat(wallet.xrpBalance);
      const currentUsdtBalance = parseFloat(wallet.usdtBalance);
      const tradeAmount = parseFloat(validation.data.amount);
      const tradeTotal = parseFloat(validation.data.total);

      if (validation.data.type === "buy") {
        // Buying XRP - decrease USDT, increase XRP
        const newUsdtBalance = (currentUsdtBalance - tradeTotal).toFixed(2);
        const newXrpBalance = (currentXrpBalance + tradeAmount).toFixed(6);
        
        await storage.updateWalletBalance(userId, "usdtBalance", newUsdtBalance);
        await storage.updateWalletBalance(userId, "xrpBalance", newXrpBalance);
      } else {
        // Selling XRP - increase USDT, decrease XRP
        const newUsdtBalance = (currentUsdtBalance + tradeTotal).toFixed(2);
        const newXrpBalance = (currentXrpBalance - tradeAmount).toFixed(6);
        
        await storage.updateWalletBalance(userId, "xrpBalance", newXrpBalance);
        await storage.updateWalletBalance(userId, "usdtBalance", newUsdtBalance);
      }

      // Create transaction record
      await storage.createTransaction({
        userId,
        type: validation.data.type,
        currency: "XRP",
        amount: validation.data.amount,
        status: "completed",
        notes: `${validation.data.type === "buy" ? "Bought" : "Sold"} ${validation.data.amount} XRP at $${validation.data.price}`,
      });

      res.json(trade);
    } catch (error) {
      console.error("Error creating trade:", error);
      res.status(500).json({ message: "Failed to create trade" });
    }
  });

  // Market data route - simulated data for MVP
  app.get('/api/markets', async (req, res) => {
    try {
      // Simulated market data - in production this would come from XRPL or market data provider
      const markets = [
        {
          id: "xrp-usd",
          pair: "XRP/USD",
          name: "XRP",
          price: "0.5200",
          change24h: "+2.4",
          volume24h: "$1,234,567",
          high24h: "0.5350",
          low24h: "0.5080",
        },
        {
          id: "xrp-usdt",
          pair: "XRP/USDT",
          name: "XRP",
          price: "0.5198",
          change24h: "+2.3",
          volume24h: "$987,654",
          high24h: "0.5340",
          low24h: "0.5075",
        },
        {
          id: "solo-xrp",
          pair: "SOLO/XRP",
          name: "Sologenic",
          price: "0.0012",
          change24h: "+5.2",
          volume24h: "$45,678",
          high24h: "0.0013",
          low24h: "0.0011",
        },
        {
          id: "core-xrp",
          pair: "CORE/XRP",
          name: "Coreum",
          price: "0.0089",
          change24h: "-1.2",
          volume24h: "$23,456",
          high24h: "0.0095",
          low24h: "0.0085",
        },
        {
          id: "rlusd-usd",
          pair: "RLUSD/USD",
          name: "Ripple USD",
          price: "1.0001",
          change24h: "+0.01",
          volume24h: "$567,890",
          high24h: "1.0005",
          low24h: "0.9998",
        },
        {
          id: "gala-xrp",
          pair: "GALA/XRP",
          name: "Gala Games",
          price: "0.0045",
          change24h: "+3.8",
          volume24h: "$34,567",
          high24h: "0.0048",
          low24h: "0.0042",
        },
      ];
      
      res.json(markets);
    } catch (error) {
      console.error("Error fetching markets:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // Stripe payment route for fiat on-ramp
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        message: "Payment processing is not available. Please configure Stripe to enable fiat on-ramp." 
      });
    }

    try {
      const { amount } = req.body;
      const userId = req.user.claims.sub;

      if (!amount || amount < 10) {
        return res.status(400).json({ message: "Minimum purchase is $10" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId,
          type: "xrp_purchase",
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Webhook to handle successful payments
  app.post("/api/stripe-webhook", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment processing is not available" });
    }

    try {
      const event = req.body;

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata.userId;
        const usdAmount = paymentIntent.amount / 100;
        
        // Simulated XRP price
        const xrpPrice = 0.52;
        const xrpAmount = (usdAmount / xrpPrice).toFixed(6);

        // Update wallet balance
        const wallet = await storage.getOrCreateWallet(userId);
        const currentXrpBalance = parseFloat(wallet.xrpBalance);
        const newXrpBalance = (currentXrpBalance + parseFloat(xrpAmount)).toFixed(6);
        
        await storage.updateWalletBalance(userId, "xrpBalance", newXrpBalance);

        // Create transaction record
        await storage.createTransaction({
          userId,
          type: "fiat_purchase",
          currency: "XRP",
          amount: xrpAmount,
          status: "completed",
          notes: `Purchased ${xrpAmount} XRP with $${usdAmount.toFixed(2)} USD via Stripe`,
        });
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: "Webhook handler failed" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
