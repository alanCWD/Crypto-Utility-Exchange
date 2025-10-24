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

  // Market data route - simulated utility-focused crypto data
  app.get('/api/markets', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      // 23 utility-focused cryptocurrencies with educational metadata
      const allMarkets = [
        {
          id: "btc-usd",
          symbol: "BTC",
          pair: "BTC/USD",
          name: "Bitcoin",
          price: "42150.00",
          change24h: "+1.8",
          volume24h: "$28.4B",
          high24h: "42850.00",
          low24h: "41200.00",
          category: "Payments",
          primaryUtility: "Digital currency & store of value",
          useCaseDescription: "Peer-to-peer payments powered by the Lightning Network",
        },
        {
          id: "eth-usd",
          symbol: "ETH",
          pair: "ETH/USD",
          name: "Ethereum",
          price: "2245.50",
          change24h: "+2.3",
          volume24h: "$15.2B",
          high24h: "2290.00",
          low24h: "2185.00",
          category: "Smart Contracts",
          primaryUtility: "Smart contracts",
          useCaseDescription: "Foundation of DeFi, NFTs, and tokenized assets",
        },
        {
          id: "sol-usd",
          symbol: "SOL",
          pair: "SOL/USD",
          name: "Solana",
          price: "98.45",
          change24h: "+4.2",
          volume24h: "$2.1B",
          high24h: "101.20",
          low24h: "94.50",
          category: "DeFi",
          primaryUtility: "High-speed dApps & payments",
          useCaseDescription: "Used for DeFi, retail payments, and NFTs (e.g., Shopify integration)",
        },
        {
          id: "xrp-usd",
          symbol: "XRP",
          pair: "XRP/USD",
          name: "XRP",
          price: "0.5200",
          change24h: "+2.4",
          volume24h: "$1.2B",
          high24h: "0.5350",
          low24h: "0.5080",
          category: "Payments",
          primaryUtility: "Cross-border banking",
          useCaseDescription: "Used for international transfers via RippleNet",
        },
        {
          id: "link-usd",
          symbol: "LINK",
          pair: "LINK/USD",
          name: "Chainlink",
          price: "14.75",
          change24h: "+3.1",
          volume24h: "$580M",
          high24h: "15.20",
          low24h: "14.30",
          category: "Oracles",
          primaryUtility: "Data oracles",
          useCaseDescription: "Connects blockchains with real-world data for DeFi and tokenization",
        },
        {
          id: "hbar-usd",
          symbol: "HBAR",
          pair: "HBAR/USD",
          name: "Hedera",
          price: "0.0678",
          change24h: "+1.5",
          volume24h: "$145M",
          high24h: "0.0695",
          low24h: "0.0662",
          category: "Enterprise",
          primaryUtility: "Enterprise-grade DLT",
          useCaseDescription: "Used in supply chain, carbon credits, and identity management",
        },
        {
          id: "matic-usd",
          symbol: "MATIC",
          pair: "MATIC/USD",
          name: "Polygon",
          price: "0.845",
          change24h: "+2.8",
          volume24h: "$425M",
          high24h: "0.870",
          low24h: "0.815",
          category: "Layer-2",
          primaryUtility: "Layer-2 scaling",
          useCaseDescription: "Scales Ethereum via sidechains and zk rollups",
        },
        {
          id: "ada-usd",
          symbol: "ADA",
          pair: "ADA/USD",
          name: "Cardano",
          price: "0.485",
          change24h: "+1.2",
          volume24h: "$380M",
          high24h: "0.495",
          low24h: "0.472",
          category: "Smart Contracts",
          primaryUtility: "Smart contract protocol",
          useCaseDescription: "Used for digital identity and governance in Africa",
        },
        {
          id: "avax-usd",
          symbol: "AVAX",
          pair: "AVAX/USD",
          name: "Avalanche",
          price: "36.20",
          change24h: "+3.5",
          volume24h: "$620M",
          high24h: "37.50",
          low24h: "34.80",
          category: "Enterprise",
          primaryUtility: "Enterprise blockchain",
          useCaseDescription: "Supports RWA tokenization and on-chain settlement",
        },
        {
          id: "algo-usd",
          symbol: "ALGO",
          pair: "ALGO/USD",
          name: "Algorand",
          price: "0.185",
          change24h: "+0.9",
          volume24h: "$95M",
          high24h: "0.192",
          low24h: "0.180",
          category: "Enterprise",
          primaryUtility: "Fintech infrastructure",
          useCaseDescription: "Supports CBDCs and government projects",
        },
        {
          id: "bnb-usd",
          symbol: "BNB",
          pair: "BNB/USD",
          name: "BNB",
          price: "315.80",
          change24h: "+1.7",
          volume24h: "$1.1B",
          high24h: "322.00",
          low24h: "308.50",
          category: "Exchange",
          primaryUtility: "Exchange utility",
          useCaseDescription: "Used for transaction fees and ecosystem dApps",
        },
        {
          id: "dot-usd",
          symbol: "DOT",
          pair: "DOT/USD",
          name: "Polkadot",
          price: "7.25",
          change24h: "+2.1",
          volume24h: "$285M",
          high24h: "7.50",
          low24h: "7.05",
          category: "Interoperability",
          primaryUtility: "Interoperability network",
          useCaseDescription: "Enables communication among different blockchains",
        },
        {
          id: "atom-usd",
          symbol: "ATOM",
          pair: "ATOM/USD",
          name: "Cosmos",
          price: "10.45",
          change24h: "+1.8",
          volume24h: "$195M",
          high24h: "10.80",
          low24h: "10.15",
          category: "Interoperability",
          primaryUtility: "Blockchain interoperability",
          useCaseDescription: "Provides cross-chain communication with IBC protocol",
        },
        {
          id: "xcn-usd",
          symbol: "XCN",
          pair: "XCN/USD",
          name: "Chain",
          price: "0.0245",
          change24h: "-0.5",
          volume24h: "$12M",
          high24h: "0.0255",
          low24h: "0.0238",
          category: "Enterprise",
          primaryUtility: "Institutional DeFi",
          useCaseDescription: "Serves enterprise blockchain APIs",
        },
        {
          id: "vet-usd",
          symbol: "VET",
          pair: "VET/USD",
          name: "VeChain",
          price: "0.0285",
          change24h: "+2.3",
          volume24h: "$75M",
          high24h: "0.0295",
          low24h: "0.0275",
          category: "Supply Chain",
          primaryUtility: "Supply chain tracing",
          useCaseDescription: "Tracks goods authenticity and logistics",
        },
        {
          id: "icp-usd",
          symbol: "ICP",
          pair: "ICP/USD",
          name: "Internet Computer",
          price: "12.80",
          change24h: "+3.8",
          volume24h: "$145M",
          high24h: "13.20",
          low24h: "12.35",
          category: "Computing",
          primaryUtility: "Decentralized computing",
          useCaseDescription: "Runs backend apps and smart contracts natively on-chain",
        },
        {
          id: "hnt-usd",
          symbol: "HNT",
          pair: "HNT/USD",
          name: "Helium",
          price: "6.45",
          change24h: "+4.2",
          volume24h: "$85M",
          high24h: "6.75",
          low24h: "6.15",
          category: "IoT",
          primaryUtility: "IoT network",
          useCaseDescription: "Decentralized telecom data network",
        },
        {
          id: "honey-usd",
          symbol: "HONEY",
          pair: "HONEY/USD",
          name: "Hivemapper",
          price: "0.0875",
          change24h: "+5.1",
          volume24h: "$8M",
          high24h: "0.0925",
          low24h: "0.0825",
          category: "IoT",
          primaryUtility: "Mapping infrastructure",
          useCaseDescription: "Crowdsourced global map with real-world data",
        },
        {
          id: "dimo-usd",
          symbol: "DIMO",
          pair: "DIMO/USD",
          name: "DIMO",
          price: "0.145",
          change24h: "+3.7",
          volume24h: "$5M",
          high24h: "0.152",
          low24h: "0.138",
          category: "IoT",
          primaryUtility: "Vehicle data ownership",
          useCaseDescription: "Lets drivers earn crypto for sharing telemetry data",
        },
        {
          id: "fil-usd",
          symbol: "FIL",
          pair: "FIL/USD",
          name: "Filecoin",
          price: "5.85",
          change24h: "+2.0",
          volume24h: "$195M",
          high24h: "6.05",
          low24h: "5.65",
          category: "Storage",
          primaryUtility: "Decentralized file storage",
          useCaseDescription: "Hosts verifiable data storage",
        },
        {
          id: "ar-usd",
          symbol: "AR",
          pair: "AR/USD",
          name: "Arweave",
          price: "8.95",
          change24h: "+1.5",
          volume24h: "$68M",
          high24h: "9.25",
          low24h: "8.75",
          category: "Storage",
          primaryUtility: "Permanent web storage",
          useCaseDescription: "Used for long-term data archiving",
        },
        {
          id: "ena-usd",
          symbol: "ENA",
          pair: "ENA/USD",
          name: "Ethena",
          price: "0.685",
          change24h: "+0.8",
          volume24h: "$125M",
          high24h: "0.705",
          low24h: "0.670",
          category: "DeFi",
          primaryUtility: "Synthetic dollar platform",
          useCaseDescription: "Provides stable yield-backed synthetic assets",
        },
        {
          id: "usdc-usd",
          symbol: "USDC",
          pair: "USDC/USD",
          name: "USD Coin",
          price: "1.0000",
          change24h: "+0.00",
          volume24h: "$6.2B",
          high24h: "1.0003",
          low24h: "0.9998",
          category: "Stablecoins",
          primaryUtility: "Regulated stablecoin",
          useCaseDescription: "Used for digital payments and remittances",
        },
      ];

      // Filter by category if provided
      const markets = category && category !== "All"
        ? allMarkets.filter(m => m.category === category)
        : allMarkets;
      
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
