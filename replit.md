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
4. **Educational Context** - Tooltips and info cards explaining real-world use cases
5. **Category Filtering** - Filter by DeFi, Storage, IoT, Enterprise, Layer-2, Payments, etc.
6. **Wallet Management** - View balances, transaction history
7. **Fiat On-Ramp** - Buy crypto with USD via Stripe
8. **Dark Mode** - Professional dark-first trading interface
9. **Responsive Design** - Mobile-friendly layouts

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

## Notes
- MVP uses simulated market data for demonstration
- 23 utility-focused cryptocurrencies covering DeFi, Storage, IoT, Enterprise, Layer-2, Oracles, and more
- Educational tooltips and category badges help traders understand real-world use cases
- Real blockchain integration planned for future phases
- Focus on professional, trust-inspiring UI with embedded education
- Gracefully handles missing Stripe configuration in development
