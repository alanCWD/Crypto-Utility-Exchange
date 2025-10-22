import {
  users,
  wallets,
  transactions,
  trades,
  type User,
  type UpsertUser,
  type Wallet,
  type InsertWallet,
  type Transaction,
  type InsertTransaction,
  type Trade,
  type InsertTrade,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Wallet operations
  getOrCreateWallet(userId: string): Promise<Wallet>;
  updateWalletBalance(
    userId: string,
    currency: "xrpBalance" | "usdtBalance" | "rlusdBalance",
    amount: string
  ): Promise<Wallet>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  
  // Trade operations
  createTrade(trade: InsertTrade): Promise<Trade>;
  getUserTrades(userId: string, limit?: number): Promise<Trade[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Wallet operations
  async getOrCreateWallet(userId: string): Promise<Wallet> {
    const [existingWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));

    if (existingWallet) {
      return existingWallet;
    }

    // Create new wallet with default balances
    const [newWallet] = await db
      .insert(wallets)
      .values({
        userId,
        xrpBalance: "5000.000000", // Starting balance for demo
        usdtBalance: "1000.00",
        rlusdBalance: "500.00",
      })
      .returning();

    return newWallet;
  }

  async updateWalletBalance(
    userId: string,
    currency: "xrpBalance" | "usdtBalance" | "rlusdBalance",
    amount: string
  ): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({
        [currency]: amount,
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, userId))
      .returning();

    return wallet;
  }

  // Transaction operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();

    return transaction;
  }

  async getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  // Trade operations
  async createTrade(tradeData: InsertTrade): Promise<Trade> {
    const [trade] = await db
      .insert(trades)
      .values(tradeData)
      .returning();

    return trade;
  }

  async getUserTrades(userId: string, limit: number = 50): Promise<Trade[]> {
    return await db
      .select()
      .from(trades)
      .where(eq(trades.userId, userId))
      .orderBy(desc(trades.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
