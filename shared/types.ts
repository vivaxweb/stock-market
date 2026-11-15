export type Market = 'GLOBAL' | 'INDIA';

export type AssetCategory = 'STOCK' | 'CRYPTO' | 'FOREX' | 'INDEX' | 'OPTION';

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  market: Market;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: string;
  baseCurrency: 'USD' | 'INR';
  isOptionChainAvailable?: boolean;
}

export interface OptionContract {
  symbol: string;           // e.g. "NIFTY24DEC25000CE"
  underlying: string;       // "NIFTY50"
  strikePrice: number;      // 25000
  optionType: 'CE' | 'PE';  // Call or Put
  expiry: string;           // "26 Dec 2024"
  premium: number;          // Current premium price
  change: number;
  delta: number;
  theta: number;
  iv: number;               // Implied Volatility %
  lotSize: number;          // e.g. 25 for Nifty, 15 for BankNifty
}

export type OrderSide = 'BUY' | 'SELL';

export interface Position {
  id: string;
  symbol: string;
  assetName: string;
  category: AssetCategory;
  market: Market;
  side: OrderSide;
  entryPrice: number;
  currentPrice: number;
  amount: number;           // Investment amount in base currency (USD or INR)
  quantity: number;         // Shares / contracts / coins
  leverage: number;         // 1x, 2x, 5x, 10x, 20x, 50x
  margin: number;           // amount / leverage
  liquidationPrice?: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  pnl: number;
  pnlPercentage: number;
  openedAt: number;
  isOption?: boolean;
  optionContract?: OptionContract;
}

export interface UserAccount {
  id: string;
  username: string;
  avatar: string;
  isPro: boolean;
  activeMarket: Market;
  // Balances
  globalCash: number;       // USD ($100,000 default)
  indiaCash: number;        // INR (₹10,00,000 default)
  globalEquity: number;
  indiaEquity: number;
  // Gamification & Retention
  xp: number;
  level: number;
  rankTitle: string;
  streakDays: number;
  lastLoginDate: string;    // YYYY-MM-DD
  streakClaimedToday: boolean;
  undoTokens: number;
  allowedLeverage: number;  // Max leverage unlocked
}

export interface CandlestickBar {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  country: string;
  returnPercentage: number;
  totalTrades: number;
  winRate: number;
  isPro: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AcademyLesson {
  id: string;
  title: string;
  track: 'BASICS' | 'PATTERNS' | 'INDICATORS' | 'OPTIONS' | 'PSYCHOLOGY';
  summary: string;
  readTime: string;
  cards: {
    heading: string;
    body: string;
    highlight?: string;
  }[];
  quiz: QuizQuestion[];
  rewardCash: number;
  rewardXP: number;
}
