import memoize from "memoizee";

interface KrakenTickerData {
  a: string[]; // Ask [price, whole lot volume, lot volume]
  b: string[]; // Bid [price, whole lot volume, lot volume]
  c: string[]; // Last trade closed [price, lot volume]
  v: string[]; // Volume [today, last 24 hours]
  p: string[]; // Volume weighted average price [today, last 24 hours]
  t: number[]; // Number of trades [today, last 24 hours]
  l: string[]; // Low [today, last 24 hours]
  h: string[]; // High [today, last 24 hours]
  o: string;   // Today's opening price
}

interface KrakenTickerResponse {
  error: string[];
  result: {
    [pair: string]: KrakenTickerData;
  };
}

// Mapping from our symbols to Kraken pair names
// Note: 29 out of 33 cryptos have live Kraken data. Missing pairs fallback to simulated prices.
// Unavailable on Kraken (as of 2025): 
//   - LYX (Lukso): Not listed on Kraken
//   - VELO (Velo): Not listed on Kraken
//   - HONEY (Hivemapper): Small-cap IoT token, not yet listed
//   - DIMO: Small-cap IoT token, not yet listed
// These 4 cryptos (~12.5%) use simulated data while maintaining educational utility context.
const KRAKEN_PAIR_MAP: Record<string, string> = {
  // Top Tier
  "BTC": "XXBTZUSD",
  "ETH": "XETHZUSD",
  "SOL": "SOLUSD",
  "XRP": "XXRPZUSD",
  "BNB": "BNBUSD",
  "USDT": "USDTZUSD",
  "USDC": "USDCUSD",
  
  // DeFi & Smart Contracts
  "ADA": "ADAUSD",
  "POL": "POLUSD",   // Polygon rebranded MATIC → POL in 2024
  "AVAX": "AVAXUSD",
  "ALGO": "ALGOUSD",
  "TRX": "TRXUSD",
  "SUI": "SUIUSD",
  "APT": "APTUSD",  // Aptos - SEC-approved Layer 1 smart contract platform
  "ENA": "ENAUSD",  // Ethena - available on Kraken
  
  // Interoperability & Oracles
  "LINK": "LINKUSD",
  "DOT": "DOTUSD",
  "ATOM": "ATOMUSD",
  "FLR": "FLRUSD",
  
  // Enterprise & Infrastructure
  "HBAR": "HBARUSD",
  "ICP": "ICPUSD",
  "VET": "VETUSD",
  
  // Payments & Digital Cash
  "LTC": "LTCUSD",
  "XLM": "XXLMZUSD",
  "DOGE": "XDGUSD",
  
  // Storage & Data
  "FIL": "FILUSD",
  "AR": "ARUSD",
  
  // IoT
  "HNT": "HNTUSD",
  // HONEY, DIMO not available on Kraken - will use simulated data
};

// Fetch ticker data from Kraken (no memoization, we'll handle caching at route level)
async function fetchKrakenTickers(): Promise<KrakenTickerResponse | null> {
  try {
    // Get all pairs we need
    const pairs = Object.values(KRAKEN_PAIR_MAP).join(",");
    const url = `https://api.kraken.com/0/public/Ticker?pair=${pairs}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Kraken API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data: KrakenTickerResponse = await response.json();
    
    if (data.error && data.error.length > 0) {
      console.error("Kraken API returned errors:", data.error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching from Kraken API:", error);
    return null;
  }
}

// Memoized version with 30-second cache
export const getKrakenTickers = memoize(fetchKrakenTickers, {
  maxAge: 30000, // 30 seconds
  promise: true,
  normalizer: () => "kraken-tickers", // Single cache key for all tickers
});

export interface MarketPriceData {
  price: string;
  change24h: string;
  volume24h: string;
  high24h: string;
  low24h: string;
}

// Extract price data for a specific symbol
export function getPriceDataForSymbol(
  symbol: string,
  krakenData: KrakenTickerResponse | null
): MarketPriceData | null {
  if (!krakenData || !krakenData.result) {
    return null;
  }
  
  const krakenPair = KRAKEN_PAIR_MAP[symbol];
  if (!krakenPair) {
    return null;
  }
  
  // Kraken might return pairs with different formatting
  // Try exact match first, then try to find by checking all keys
  let tickerData = krakenData.result[krakenPair];
  
  if (!tickerData) {
    // Try to find by checking all result keys
    const foundKey = Object.keys(krakenData.result).find(key => 
      key.includes(krakenPair.replace("Z", "").replace("X", ""))
    );
    
    if (foundKey) {
      tickerData = krakenData.result[foundKey];
    }
  }
  
  if (!tickerData) {
    return null;
  }
  
  // Calculate 24h price change percentage
  const currentPrice = parseFloat(tickerData.c[0]);
  const openPrice = parseFloat(tickerData.o);
  const change24h = ((currentPrice - openPrice) / openPrice * 100).toFixed(2);
  
  // Calculate volume in USD (volume in base currency * volume weighted average price)
  const volumeBaseAsset = parseFloat(tickerData.v[1]); // 24h volume in base asset
  const vwap = parseFloat(tickerData.p[1]); // 24h volume weighted average price
  const volumeUSD = volumeBaseAsset * vwap;
  
  // Format volume in millions or billions
  let volumeFormatted: string;
  if (volumeUSD >= 1_000_000_000) {
    volumeFormatted = `$${(volumeUSD / 1_000_000_000).toFixed(1)}B`;
  } else if (volumeUSD >= 1_000_000) {
    volumeFormatted = `$${(volumeUSD / 1_000_000).toFixed(1)}M`;
  } else if (volumeUSD >= 1_000) {
    volumeFormatted = `$${(volumeUSD / 1_000).toFixed(1)}K`;
  } else {
    volumeFormatted = `$${volumeUSD.toFixed(0)}`;
  }
  
  return {
    price: currentPrice.toFixed(currentPrice < 1 ? 4 : 2),
    change24h: (parseFloat(change24h) >= 0 ? "+" : "") + change24h,
    volume24h: volumeFormatted,
    high24h: parseFloat(tickerData.h[1]).toFixed(currentPrice < 1 ? 4 : 2),
    low24h: parseFloat(tickerData.l[1]).toFixed(currentPrice < 1 ? 4 : 2),
  };
}
