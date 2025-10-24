# Utility Crypto Exchange - Educational Trading Platform

## Project Overview
A utility-first cryptocurrency trading platform with embedded educational context. Unlike speculation-focused exchanges, this platform emphasizes trading cryptocurrencies that solve real-world problems across DeFi, storage, IoT, enterprise solutions, and more. Educational tooltips and category filters help traders make informed decisions based on actual utility and use cases.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Recharts
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Payments**: Stripe for fiat on-ramps
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

## Features Implemented
1. **Authentication** - Replit Auth with session management
2. **Trading Dashboard** - Real-time price charts, order book, buy/sell forms
3. **Markets Overview** - 23 utility-focused cryptocurrencies with category filtering
4. **Educational Context** - Info icon tooltips on each crypto showing primaryUtility and useCaseDescription
5. **Category Filtering** - 14 category filters (All, DeFi, Payments, Smart Contracts, Layer-2, Enterprise, Storage, IoT, Oracles, Interoperability, Stablecoins, Supply Chain, Computing, Exchange) with color-coded badges
6. **Wallet Management** - View balances, transaction history
7. **Fiat On-Ramp** - Buy crypto with USD via Stripe
8. **Dark Mode** - Professional dark-first trading interface
9. **Responsive Design** - Mobile-friendly layouts
10. **Search & Filter** - Search by name/symbol/pair, filter by category simultaneously

## Database Schema
- **users** - User accounts from Replit Auth
- **sessions** - Session storage for authentication
- **wallets** - User crypto balances (XRP, USDT, RLUSD)
- **transactions** - All wallet transactions and trades
- **trades** - Buy/sell order history

## Design System
- **Primary Color**: Platform Blue (hsl(218, 100%, 50%))
- **Success/Buy**: Green (hsl(145, 80%, 42%))
- **Destructive/Sell**: Red (hsl(0, 84%, 60%))
- **Category Colors**: Purple (DeFi), Orange (Storage), Teal (IoT), etc.
- **Dark Mode**: Default theme optimized for trading
- **Typography**: Inter for UI, Roboto Mono for prices/numbers
- **Components**: Shadcn UI with custom trading components + educational tooltips

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/                 # Shadcn components
│   │   ├── app-sidebar.tsx     # Navigation sidebar
│   │   ├── price-chart.tsx     # Trading chart with Recharts
│   │   ├── order-book.tsx      # Buy/sell order book
│   │   ├── trade-form.tsx      # Buy/sell trade form
│   │   ├── wallet-balance.tsx  # Balance display
│   │   ├── transaction-history.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/
│   │   ├── landing.tsx         # Landing page (logged out)
│   │   ├── dashboard.tsx       # Trading dashboard (main)
│   │   ├── markets.tsx         # Markets overview
│   │   ├── wallet.tsx          # Wallet management
│   │   ├── buy-xrp.tsx         # Fiat checkout
│   │   └── not-found.tsx
│   ├── hooks/
│   │   └── useAuth.ts          # Authentication hook
│   ├── lib/
│   │   ├── queryClient.ts
│   │   └── authUtils.ts
│   └── App.tsx
server/
├── db.ts                       # Database connection
├── storage.ts                  # Storage layer (to implement)
├── routes.ts                   # API routes (to implement)
└── replitAuth.ts              # Auth setup (to implement)
shared/
└── schema.ts                   # Database schema
```

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key (frontend)
- `REPL_ID` - Replit app ID (auto-provided)
- `REPLIT_DOMAINS` - App domains (auto-provided)

## Development Status
**Phase 1: Schema & Frontend** ✅ COMPLETE
- All data models defined in shared/schema.ts
- Design tokens configured in index.css
- All React components built with exceptional visual quality
- Landing page, dashboard, markets, wallet, buy pages complete
- Beautiful UI with proper spacing, typography, and interactions
- All components have data-testid attributes for testing

**Phase 2: Backend** ✅ COMPLETE
- PostgreSQL database setup with Drizzle ORM
- Complete storage layer (DatabaseStorage class)
- All API routes implemented and validated
- Replit Auth integrated with session management
- Stripe payment integration (gracefully conditional)
- Trade execution with automatic wallet updates

**Phase 3: Integration** ✅ COMPLETE
- All pages connected to backend via React Query
- Real-time data fetching with auto-refresh (markets: 30s)
- Comprehensive error handling with toast notifications
- Loading states throughout application
- Trade mutations invalidate cache automatically
- Authentication flow with proper redirects
- Graceful degradation when Stripe not configured

## MVP Status: ✅ COMPLETE & READY FOR TESTING
- Server running successfully on port 5000
- No runtime or LSP errors
- All critical issues resolved:
  - QueryClient provider error fixed
  - Routing deep-linking fixed
  - Markets real-time data integrated
  - Stripe graceful degradation implemented
- Architect approved and ready for deployment

## Next Steps (Production)
1. Configure Stripe keys for fiat on-ramp (optional)
2. Run end-to-end smoke tests (login, trading, wallet flows)
3. Add automated UI/integration tests
4. Deploy to production with proper session secrets

## Utility-First Educational Platform Features
### 23 Utility Cryptocurrencies
All cryptocurrencies include educational metadata:
- **Bitcoin (BTC)** - Payments: Digital currency for peer-to-peer transactions
- **Ethereum (ETH)** - Smart Contracts: Decentralized applications and smart contracts
- **Solana (SOL)** - Smart Contracts: High-speed transactions and DeFi applications
- **XRP (XRP)** - Payments: Cross-border payments and remittances
- **Chainlink (LINK)** - Oracles: Real-world data for smart contracts
- **Hedera (HBAR)** - Enterprise: Enterprise-grade distributed ledger
- **Polygon (MATIC)** - Layer-2: Ethereum scaling solution
- **Cardano (ADA)** - Smart Contracts: Research-driven blockchain platform
- **Stellar (XLM)** - Payments: Cross-border payments for financial institutions
- **Filecoin (FIL)** - Storage: Decentralized file storage
- **VeChain (VET)** - Supply Chain: Supply chain management and tracking
- **IOTA (MIOTA)** - IoT: Machine-to-machine transactions
- **Algorand (ALGO)** - DeFi: Pure proof-of-stake blockchain
- **Tezos (XTZ)** - Smart Contracts: Self-amending blockchain
- **Internet Computer (ICP)** - Computing: Decentralized internet and web services
- **The Graph (GRT)** - Oracles: Indexing protocol for blockchain data
- **Cosmos (ATOM)** - Interoperability: Blockchain interoperability
- **Polkadot (DOT)** - Interoperability: Multi-chain network
- **Avalanche (AVAX)** - DeFi: High-throughput smart contract platform
- **Aave (AAVE)** - DeFi: Decentralized lending protocol
- **Uniswap (UNI)** - DeFi: Decentralized exchange protocol
- **USDT (USDT)** - Stablecoins: USD-pegged stablecoin
- **Binance Coin (BNB)** - Exchange: Binance ecosystem utility token

### Category System
14 categories with color-coded badges:
- **DeFi** (Purple) - Decentralized finance protocols
- **Payments** (Green) - Cross-border and peer-to-peer payments
- **Smart Contracts** (Blue) - Programmable blockchain platforms
- **Layer-2** (Indigo) - Scaling solutions
- **Enterprise** (Slate) - Enterprise blockchain solutions
- **Storage** (Orange) - Decentralized file storage
- **IoT** (Teal) - Internet of Things and machine-to-machine
- **Oracles** (Yellow) - Real-world data integration
- **Interoperability** (Pink) - Cross-chain communication
- **Stablecoins** (Emerald) - Price-stable cryptocurrencies
- **Supply Chain** (Amber) - Logistics and tracking
- **Computing** (Violet) - Decentralized computing
- **Exchange** (Gold) - Exchange ecosystem tokens

### Educational Features
- **Info Icon Tooltips**: Hover over any crypto to see full name, primary utility, and detailed use case
- **Category Badges**: Color-coded category labels for quick identification
- **Category Filtering**: Filter markets by specific use case category
- **Search Integration**: Search works on filtered results

## Notes
- MVP uses simulated market data for demonstration
- Educational focus: Emphasizes real-world utility over speculation
- Query structure: `["/api/markets", category]` with custom queryFn for proper filtering
- Real blockchain integration planned for future phases
- Focus on professional, trust-inspiring UI with embedded education
- Gracefully handles missing Stripe configuration in development
