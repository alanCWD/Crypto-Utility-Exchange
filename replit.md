# XRPL Exchange - Consumer Trading Platform

## Project Overview
A consumer-facing centralized exchange (CEX)-style trading platform built for the XRP Ledger ecosystem. This addresses a key gap in the XRPL environment by providing a user-friendly platform for retail traders to trade XRP and XRPL tokens with fiat on-ramps.

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
3. **Markets Overview** - View all XRPL tokens with 24h changes and volumes
4. **Wallet Management** - View balances, transaction history
5. **Fiat On-Ramp** - Buy XRP with USD via Stripe
6. **Dark Mode** - Professional dark-first trading interface
7. **Responsive Design** - Mobile-friendly layouts

## Database Schema
- **users** - User accounts from Replit Auth
- **sessions** - Session storage for authentication
- **wallets** - User crypto balances (XRP, USDT, RLUSD)
- **transactions** - All wallet transactions and trades
- **trades** - Buy/sell order history

## Design System
- **Primary Color**: XRP Blue (hsl(218, 100%, 50%))
- **Success/Buy**: Green (hsl(145, 80%, 42%))
- **Destructive/Sell**: Red (hsl(0, 84%, 60%))
- **Dark Mode**: Default theme optimized for trading
- **Typography**: Inter for UI, Roboto Mono for prices/numbers
- **Components**: Shadcn UI with custom trading components

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
- All data models defined
- Design tokens configured
- All React components built
- Landing page, dashboard, markets, wallet, buy pages complete
- Beautiful UI with proper spacing, typography, and interactions

**Phase 2: Backend** 🚧 IN PROGRESS
- Need to implement database setup
- Need to implement API routes
- Need to implement Replit Auth

**Phase 3: Integration** ⏳ PENDING
- Connect frontend to backend APIs
- Implement real data fetching
- Add error handling and loading states
- Testing

## Notes
- MVP uses simulated market data for demonstration
- Real XRPL integration planned for future phases
- All trading functionality designed for future blockchain connection
- Focus on professional, trust-inspiring UI for retail traders
