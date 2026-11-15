import WebSocket from 'ws';
import { EventEmitter } from 'events';

export const marketEmitter = new EventEmitter();

// Initial seed assets
export const ASSETS = [
  // --- GLOBAL MARKETS (USD) ---
  {
    symbol: "BTC/USD",
    name: "Bitcoin",
    category: "CRYPTO",
    market: "GLOBAL",
    price: 76420.50,
    change24h: 3.42,
    high24h: 77100.00,
    low24h: 74200.00,
    volume: "$38.2B",
    baseCurrency: "USD",
    tvSymbol: "BINANCE:BTCUSDT"
  },
  {
    symbol: "ETH/USD",
    name: "Ethereum",
    category: "CRYPTO",
    market: "GLOBAL",
    price: 2985.20,
    change24h: 2.15,
    high24h: 3040.00,
    low24h: 2910.00,
    volume: "$16.4B",
    baseCurrency: "USD",
    tvSymbol: "BINANCE:ETHUSDT"
  },
  {
    symbol: "SOL/USD",
    name: "Solana",
    category: "CRYPTO",
    market: "GLOBAL",
    price: 202.80,
    change24h: 6.80,
    high24h: 208.50,
    low24h: 191.00,
    volume: "$7.1B",
    baseCurrency: "USD",
    tvSymbol: "BINANCE:SOLUSDT"
  },
  {
    symbol: "XRP/USD",
    name: "Ripple",
    category: "CRYPTO",
    market: "GLOBAL",
    price: 0.584,
    change24h: 1.45,
    high24h: 0.610,
    low24h: 0.562,
    volume: "$3.8B",
    baseCurrency: "USD",
    tvSymbol: "BINANCE:XRPUSDT"
  },
  {
    symbol: "DOGE/USD",
    name: "Dogecoin",
    category: "CRYPTO",
    market: "GLOBAL",
    price: 0.182,
    change24h: 4.80,
    high24h: 0.194,
    low24h: 0.171,
    volume: "$2.9B",
    baseCurrency: "USD",
    tvSymbol: "BINANCE:DOGEUSDT"
  },
  {
    symbol: "BNB/USD",
    name: "BNB",
    category: "CRYPTO",
    market: "GLOBAL",
    price: 625.40,
    change24h: 1.20,
    high24h: 638.00,
    low24h: 618.00,
    volume: "$1.8B",
    baseCurrency: "USD",
    tvSymbol: "BINANCE:BNBUSDT"
  },
  {
    symbol: "ADA/USD",
    name: "Cardano",
    category: "CRYPTO",
    market: "GLOBAL",
    price: 0.442,
    change24h: 3.10,
    high24h: 0.460,
    low24h: 0.425,
    volume: "$950M",
    baseCurrency: "USD",
    tvSymbol: "BINANCE:ADAUSDT"
  },
  {
    symbol: "AVAX/USD",
    name: "Avalanche",
    category: "CRYPTO",
    market: "GLOBAL",
    price: 31.50,
    change24h: 5.40,
    high24h: 33.00,
    low24h: 29.80,
    volume: "$820M",
    baseCurrency: "USD",
    tvSymbol: "BINANCE:AVAXUSDT"
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    category: "STOCK",
    market: "GLOBAL",
    price: 148.60,
    change24h: 2.75,
    high24h: 150.20,
    low24h: 144.80,
    volume: "$12.8B",
    baseCurrency: "USD",
    tvSymbol: "NASDAQ:NVDA"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc",
    category: "STOCK",
    market: "GLOBAL",
    price: 321.20,
    change24h: 4.80,
    high24h: 328.00,
    low24h: 309.50,
    volume: "$18.5B",
    baseCurrency: "USD",
    tvSymbol: "NASDAQ:TSLA"
  },
  {
    symbol: "AAPL",
    name: "Apple Inc",
    category: "STOCK",
    market: "GLOBAL",
    price: 227.40,
    change24h: 0.65,
    high24h: 228.90,
    low24h: 225.80,
    volume: "$8.4B",
    baseCurrency: "USD",
    tvSymbol: "NASDAQ:AAPL"
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    category: "STOCK",
    market: "GLOBAL",
    price: 422.50,
    change24h: 1.15,
    high24h: 426.00,
    low24h: 418.50,
    volume: "$9.4B",
    baseCurrency: "USD",
    tvSymbol: "NASDAQ:MSFT"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc",
    category: "STOCK",
    market: "GLOBAL",
    price: 178.20,
    change24h: 0.85,
    high24h: 180.50,
    low24h: 176.00,
    volume: "$7.2B",
    baseCurrency: "USD",
    tvSymbol: "NASDAQ:GOOGL"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc",
    category: "STOCK",
    market: "GLOBAL",
    price: 208.50,
    change24h: 1.90,
    high24h: 211.00,
    low24h: 205.20,
    volume: "$8.6B",
    baseCurrency: "USD",
    tvSymbol: "NASDAQ:AMZN"
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc",
    category: "STOCK",
    market: "GLOBAL",
    price: 585.00,
    change24h: 2.30,
    high24h: 592.00,
    low24h: 578.00,
    volume: "$6.8B",
    baseCurrency: "USD",
    tvSymbol: "NASDAQ:META"
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc",
    category: "STOCK",
    market: "GLOBAL",
    price: 790.00,
    change24h: 1.40,
    high24h: 802.00,
    low24h: 782.00,
    volume: "$4.1B",
    baseCurrency: "USD",
    tvSymbol: "NASDAQ:NFLX"
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    category: "STOCK",
    market: "GLOBAL",
    price: 142.30,
    change24h: 3.20,
    high24h: 145.00,
    low24h: 139.50,
    volume: "$5.5B",
    baseCurrency: "USD",
    tvSymbol: "NASDAQ:AMD"
  },
  {
    symbol: "COIN",
    name: "Coinbase Global",
    category: "STOCK",
    market: "GLOBAL",
    price: 295.00,
    change24h: 6.40,
    high24h: 308.00,
    low24h: 282.00,
    volume: "$3.9B",
    baseCurrency: "USD",
    tvSymbol: "NASDAQ:COIN"
  },
  {
    symbol: "XAU/USD",
    name: "Gold Spot",
    category: "FOREX",
    market: "GLOBAL",
    price: 2684.50,
    change24h: -0.35,
    high24h: 2702.00,
    low24h: 2678.00,
    volume: "$24.1B",
    baseCurrency: "USD",
    tvSymbol: "OANDA:XAUUSD"
  },
  {
    symbol: "XAG/USD",
    name: "Silver Spot",
    category: "FOREX",
    market: "GLOBAL",
    price: 31.80,
    change24h: -0.65,
    high24h: 32.40,
    low24h: 31.20,
    volume: "$8.2B",
    baseCurrency: "USD",
    tvSymbol: "OANDA:XAGUSD"
  },
  {
    symbol: "WTI/USD",
    name: "Crude Oil WTI",
    category: "FOREX",
    market: "GLOBAL",
    price: 70.40,
    change24h: 1.35,
    high24h: 71.80,
    low24h: 69.50,
    volume: "$14.5B",
    baseCurrency: "USD",
    tvSymbol: "TVC:USOIL"
  },
  {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    category: "FOREX",
    market: "GLOBAL",
    price: 1.0725,
    change24h: 0.12,
    high24h: 1.0760,
    low24h: 1.0690,
    volume: "$45.0B",
    baseCurrency: "USD",
    tvSymbol: "FX:EURUSD"
  },
  {
    symbol: "GBP/USD",
    name: "British Pound / USD",
    category: "FOREX",
    market: "GLOBAL",
    price: 1.2950,
    change24h: 0.18,
    high24h: 1.3010,
    low24h: 1.2910,
    volume: "$32.0B",
    baseCurrency: "USD",
    tvSymbol: "FX:GBPUSD"
  },

  // --- INDIAN MARKETS (INR) ---
  {
    symbol: "NIFTY 50",
    name: "Nifty 50 Index",
    category: "INDEX",
    market: "INDIA",
    price: 24148.20,
    change24h: 0.85,
    high24h: 24260.00,
    low24h: 24020.00,
    volume: "₹28,500 Cr",
    baseCurrency: "INR",
    isOptionChainAvailable: true,
    tvSymbol: "BSE:SENSEX"
  },
  {
    symbol: "BANK NIFTY",
    name: "Nifty Bank Index",
    category: "INDEX",
    market: "INDIA",
    price: 51680.50,
    change24h: 1.15,
    high24h: 51920.00,
    low24h: 51300.00,
    volume: "₹18,200 Cr",
    baseCurrency: "INR",
    isOptionChainAvailable: true,
    tvSymbol: "BSE:SENSEX"
  },
  {
    symbol: "SENSEX",
    name: "BSE Sensex Index",
    category: "INDEX",
    market: "INDIA",
    price: 81106.65,
    change24h: 0.65,
    high24h: 81340.00,
    low24h: 80850.00,
    volume: "₹42,000 Cr",
    baseCurrency: "INR",
    isOptionChainAvailable: true,
    tvSymbol: "BSE:SENSEX"
  },
  {
    symbol: "NIFTY IT",
    name: "Nifty IT Sector Index",
    category: "INDEX",
    market: "INDIA",
    price: 41850.00,
    change24h: 0.45,
    high24h: 42100.00,
    low24h: 41600.00,
    volume: "₹6,800 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:SENSEX"
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    category: "STOCK",
    market: "INDIA",
    price: 1274.50,
    change24h: 1.20,
    high24h: 1285.00,
    low24h: 1262.00,
    volume: "₹1,850 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:RELIANCE"
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    category: "STOCK",
    market: "INDIA",
    price: 4140.00,
    change24h: -0.45,
    high24h: 4180.00,
    low24h: 4120.00,
    volume: "₹920 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:TCS"
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 1765.80,
    change24h: 1.40,
    high24h: 1778.00,
    low24h: 1750.00,
    volume: "₹2,100 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:HDFCBANK"
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 825.40,
    change24h: 2.10,
    high24h: 834.00,
    low24h: 815.00,
    volume: "₹1,450 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:TATAMOTORS"
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 1872.30,
    change24h: 1.10,
    high24h: 1890.00,
    low24h: 1855.00,
    volume: "₹1,350 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:INFY"
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 1245.50,
    change24h: 1.65,
    high24h: 1258.00,
    low24h: 1232.00,
    volume: "₹1,620 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:ICICIBANK"
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    category: "STOCK",
    market: "INDIA",
    price: 812.20,
    change24h: 0.90,
    high24h: 822.00,
    low24h: 805.00,
    volume: "₹1,480 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:SBIN"
  },
  {
    symbol: "ITC",
    name: "ITC Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 468.90,
    change24h: -0.30,
    high24h: 472.50,
    low24h: 466.00,
    volume: "₹890 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:ITC"
  },
  {
    symbol: "LT",
    name: "Larsen & Toubro Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 3620.00,
    change24h: 1.80,
    high24h: 3660.00,
    low24h: 3580.00,
    volume: "₹1,120 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:LT"
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 1580.40,
    change24h: 2.40,
    high24h: 1595.00,
    low24h: 1560.00,
    volume: "₹1,290 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:BHARTIARTL"
  },
  {
    symbol: "KOTAKBANK",
    name: "Kotak Mahindra Bank",
    category: "STOCK",
    market: "INDIA",
    price: 1740.00,
    change24h: 0.70,
    high24h: 1755.00,
    low24h: 1725.00,
    volume: "₹980 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:KOTAKBANK"
  },
  {
    symbol: "BAJFINANCE",
    name: "Bajaj Finance Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 6890.00,
    change24h: 1.95,
    high24h: 6980.00,
    low24h: 6810.00,
    volume: "₹1,560 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:BAJFINANCE"
  },
  {
    symbol: "MARUTI",
    name: "Maruti Suzuki India",
    category: "STOCK",
    market: "INDIA",
    price: 11350.00,
    change24h: 0.60,
    high24h: 11480.00,
    low24h: 11240.00,
    volume: "₹910 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:MARUTI"
  },
  {
    symbol: "WIPRO",
    name: "Wipro Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 545.00,
    change24h: -0.80,
    high24h: 552.00,
    low24h: 541.00,
    volume: "₹740 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:WIPRO"
  },
  {
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 1780.00,
    change24h: 1.15,
    high24h: 1798.00,
    low24h: 1765.00,
    volume: "₹820 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:SUNPHARMA"
  },
  {
    symbol: "ASIANPAINT",
    name: "Asian Paints Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 2920.00,
    change24h: -1.25,
    high24h: 2960.00,
    low24h: 2900.00,
    volume: "₹710 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:ASIANPAINT"
  },
  {
    symbol: "TITAN",
    name: "Titan Company Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 3240.00,
    change24h: 1.30,
    high24h: 3275.00,
    low24h: 3210.00,
    volume: "₹980 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:TITAN"
  },
  {
    symbol: "ADANIENT",
    name: "Adani Enterprises Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 2980.00,
    change24h: 3.80,
    high24h: 3040.00,
    low24h: 2910.00,
    volume: "₹2,300 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:ADANIENT"
  },
  {
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 2450.00,
    change24h: 0.40,
    high24h: 2470.00,
    low24h: 2435.00,
    volume: "₹860 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:HINDUNILVR"
  },
  {
    symbol: "AXISBANK",
    name: "Axis Bank Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 1180.00,
    change24h: 1.45,
    high24h: 1195.00,
    low24h: 1168.00,
    volume: "₹1,250 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:AXISBANK"
  },
  {
    symbol: "TATASTEEL",
    name: "Tata Steel Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 148.50,
    change24h: 2.20,
    high24h: 151.00,
    low24h: 146.00,
    volume: "₹1,180 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:TATASTEEL"
  },
  {
    symbol: "ZOMATO",
    name: "Zomato Ltd",
    category: "STOCK",
    market: "INDIA",
    price: 265.40,
    change24h: 4.10,
    high24h: 272.00,
    low24h: 258.00,
    volume: "₹1,950 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:ZOMATO"
  },
  {
    symbol: "JIOFIN",
    name: "Jio Financial Services",
    category: "STOCK",
    market: "INDIA",
    price: 318.00,
    change24h: 1.85,
    high24h: 324.00,
    low24h: 314.00,
    volume: "₹1,420 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:JIOFIN"
  },
  {
    symbol: "PAYTM",
    name: "One97 Communications (Paytm)",
    category: "STOCK",
    market: "INDIA",
    price: 785.00,
    change24h: 3.20,
    high24h: 802.00,
    low24h: 768.00,
    volume: "₹1,120 Cr",
    baseCurrency: "INR",
    tvSymbol: "BSE:PAYTM"
  }
];

export const TIMEFRAMES = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '1h': 60,
  '1D': 1440
};

// In-memory candle cache: `${symbol}_${timeframe}` -> array of OHLCV bars
const candleHistory = new Map();

// Helper to generate seed candlestick history
function generateSeedCandles(basePrice, count = 100, intervalMinutes = 5) {
  const bars = [];
  const intervalSeconds = intervalMinutes * 60;
  // Align now to interval boundary
  const now = Math.floor(Date.now() / 1000);
  const alignedNow = Math.floor(now / intervalSeconds) * intervalSeconds;
  let currentClose = basePrice * (1 - (count * 0.001)); // Slight upward trend overall

  for (let i = count; i >= 0; i--) {
    const time = alignedNow - (i * intervalSeconds);
    const volatility = basePrice * (0.002 * Math.sqrt(intervalMinutes));
    const delta = (Math.random() - 0.49) * volatility;
    const open = currentClose;
    const close = Math.max(open + delta, 0.01);
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 5000 + 500);

    bars.push({
      time,
      open: parseFloat(open.toFixed(basePrice < 2 ? 4 : 2)),
      high: parseFloat(high.toFixed(basePrice < 2 ? 4 : 2)),
      low: parseFloat(low.toFixed(basePrice < 2 ? 4 : 2)),
      close: parseFloat(close.toFixed(basePrice < 2 ? 4 : 2)),
      volume
    });

    currentClose = close;
  }
  return bars;
}

// Initialize candle history for all assets across all timeframes
ASSETS.forEach(a => {
  Object.keys(TIMEFRAMES).forEach(tf => {
    candleHistory.set(`${a.symbol}_${tf}`, generateSeedCandles(a.price, 100, TIMEFRAMES[tf]));
  });
});

export function getCandleHistory(symbol, timeframe = '5m') {
  const tf = TIMEFRAMES[timeframe] ? timeframe : '5m';
  const key = `${symbol}_${tf}`;
  if (!candleHistory.has(key)) {
    const asset = ASSETS.find(a => a.symbol === symbol);
    const basePrice = asset ? asset.price : 100;
    candleHistory.set(key, generateSeedCandles(basePrice, 100, TIMEFRAMES[tf]));
  }
  return candleHistory.get(key);
}

// ---------------------------------------------
// LIVE BINANCE WEBSOCKET INTEGRATION (Crypto)
// ---------------------------------------------
let binanceWS = null;

function connectBinanceStream() {
  try {
    const streams = "btcusdt@ticker/ethusdt@ticker/solusdt@ticker/dogeusdt@ticker/xrpusdt@ticker/bnbusdt@ticker/adausdt@ticker";
    binanceWS = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    binanceWS.on('open', () => {
      console.log('[Binance] Connected to Live WebSocket Stream');
    });

    binanceWS.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (!msg.data) return;
        const d = msg.data;
        const binanceMap = {
          "BTCUSDT": "BTC/USD",
          "ETHUSDT": "ETH/USD",
          "SOLUSDT": "SOL/USD",
          "DOGEUSDT": "DOGE/USD",
          "XRPUSDT": "XRP/USD",
          "BNBUSDT": "BNB/USD",
          "ADAUSDT": "ADA/USD"
        };
        const symbol = binanceMap[d.s];
        if (!symbol) return;

        const livePrice = parseFloat(d.c);
        const changePercent = parseFloat(d.P);
        const high = parseFloat(d.h);
        const low = parseFloat(d.l);

        updateAssetPrice(symbol, livePrice, changePercent, high, low);
      } catch (err) {
        // silently ignore parse errors
      }
    });

    binanceWS.on('error', (err) => {
      console.log('Binance WS error, reconnecting...', err.message);
    });

    binanceWS.on('close', () => {
      setTimeout(connectBinanceStream, 5000);
    });
  } catch (e) {
    console.log('Failed to start Binance stream:', e.message);
  }
}

// Update asset and broadcast tick
export function updateAssetPrice(symbol, newPrice, change24h, high, low) {
  const asset = ASSETS.find(a => a.symbol === symbol);
  if (!asset) return;

  asset.price = parseFloat(newPrice.toFixed(symbol === 'EUR/USD' ? 4 : 2));
  if (change24h !== undefined) asset.change24h = parseFloat(change24h.toFixed(2));
  if (high !== undefined) asset.high24h = parseFloat(high.toFixed(2));
  if (low !== undefined) asset.low24h = parseFloat(low.toFixed(2));

  // Update latest bar in candle history across all timeframes
  const now = Math.floor(Date.now() / 1000);
  Object.keys(TIMEFRAMES).forEach(tf => {
    const intervalSec = TIMEFRAMES[tf] * 60;
    const key = `${symbol}_${tf}`;
    const bars = candleHistory.get(key);
    if (bars && bars.length > 0) {
      const lastBar = bars[bars.length - 1];
      if (now - lastBar.time >= intervalSec) {
        bars.push({
          time: Math.floor(now / intervalSec) * intervalSec,
          open: asset.price,
          high: asset.price,
          low: asset.price,
          close: asset.price,
          volume: 1
        });
        if (bars.length > 150) bars.shift();
      } else {
        lastBar.high = Math.max(lastBar.high, asset.price);
        lastBar.low = Math.min(lastBar.low, asset.price);
        lastBar.close = asset.price;
        lastBar.volume = (lastBar.volume || 0) + 1;
      }
    }
  });

  // Emit tick to all subscribers
  const tick = {
    symbol: asset.symbol,
    price: asset.price,
    change24h: asset.change24h,
    high24h: asset.high24h,
    low24h: asset.low24h,
    time: Date.now()
  };

  marketEmitter.emit('tick', tick);
  return tick;
}

// ---------------------------------------------
// REALISTIC SIMULATED TICK GENERATOR (Stocks & Indian Market)
// ---------------------------------------------
export function startMarketSimulation() {
  connectBinanceStream();

  // Tick generator for non-crypto assets (every 1 second)
  setInterval(() => {
    ASSETS.forEach(asset => {
      // Skip crypto that is handled by Binance live stream
      if (asset.category === 'CRYPTO') return;

      const volatility = asset.price * 0.0008; // ~0.08% fluctuation per second
      const drift = (Math.random() - 0.495) * volatility;
      const newPrice = Math.max(asset.price + drift, 0.1);
      const newChange = asset.change24h + (drift > 0 ? 0.01 : -0.01);

      updateAssetPrice(asset.symbol, newPrice, newChange);
    });
  }, 1200);
}
