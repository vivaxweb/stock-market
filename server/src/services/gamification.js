import { getUserAccount } from './orderEngine.js';

export const LEADERBOARD_GLOBAL = [
  { rank: 1, username: "CryptoWhale_99", avatar: "🐋", country: "US", returnPercentage: 248.5, totalTrades: 84, winRate: 78, isPro: true },
  { rank: 2, username: "SatoshiDream", avatar: "⚡", country: "DE", returnPercentage: 184.2, totalTrades: 62, winRate: 72, isPro: true },
  { rank: 3, username: "WallStreet_Wolf", avatar: "🐺", country: "GB", returnPercentage: 142.8, totalTrades: 110, winRate: 65, isPro: false },
  { rank: 4, username: "AlphaBull_Trader", avatar: "🐂", country: "IN", returnPercentage: 98.4, totalTrades: 45, winRate: 68, isPro: false },
  { rank: 5, username: "SwingQueen", avatar: "👑", country: "SG", returnPercentage: 86.1, totalTrades: 38, winRate: 61, isPro: false }
];

export const LEADERBOARD_INDIA = [
  { rank: 1, username: "NiftyNinja_Rohit", avatar: "🥷", country: "IN", returnPercentage: 312.4, totalTrades: 128, winRate: 81, isPro: true },
  { rank: 2, username: "BankNiftyKing", avatar: "👑", country: "IN", returnPercentage: 224.0, totalTrades: 94, winRate: 74, isPro: true },
  { rank: 3, username: "DalalStreetBull", avatar: "🐂", country: "IN", returnPercentage: 178.6, totalTrades: 73, winRate: 69, isPro: false },
  { rank: 4, username: "AlphaBull_Trader", avatar: "🎯", country: "IN", returnPercentage: 112.5, totalTrades: 45, winRate: 68, isPro: false },
  { rank: 5, username: "OptionBuyer_Raj", avatar: "🚀", country: "IN", returnPercentage: 94.2, totalTrades: 52, winRate: 63, isPro: false }
];

export function claimDailyStreak() {
  const account = getUserAccount();
  if (account.streakClaimedToday) {
    throw new Error("Daily streak already claimed today! Come back tomorrow.");
  }

  account.streakDays += 1;
  account.streakClaimedToday = true;

  // Rewards scale with streak
  const cashBonusUSD = 1000 + (account.streakDays * 250);
  const cashBonusINR = 10000 + (account.streakDays * 2500);
  const xpReward = 100 * account.streakDays;

  account.globalCash += cashBonusUSD;
  account.indiaCash += cashBonusINR;
  account.xp += xpReward;

  // Award an Undo token on day 3 and day 7
  if (account.streakDays % 3 === 0) {
    account.undoTokens += 1;
  }

  checkLevelUp(account);

  return {
    success: true,
    streakDays: account.streakDays,
    cashBonusUSD,
    cashBonusINR,
    xpReward,
    undoTokens: account.undoTokens
  };
}

export function claimBankruptcyBailout(market = 'GLOBAL') {
  const account = getUserAccount();
  const threshold = market === 'GLOBAL' ? 1000 : 10000;
  const cashField = market === 'GLOBAL' ? 'globalCash' : 'indiaCash';

  if (account[cashField] > threshold) {
    throw new Error("Your balance is healthy. Bailouts are reserved for traders under the threshold!");
  }

  // Inject fresh bankroll
  const bailoutAmount = market === 'GLOBAL' ? 25000 : 250000;
  account[cashField] += bailoutAmount;
  account.undoTokens += 1;

  return {
    success: true,
    market,
    bailoutAmount,
    newBalance: account[cashField]
  };
}

function checkLevelUp(account) {
  const levels = [
    { level: 1, minXP: 0, title: "Rookie Trader", maxLeverage: 5 },
    { level: 2, minXP: 500, title: "Apprentice", maxLeverage: 10 },
    { level: 3, minXP: 1200, title: "Day Trader", maxLeverage: 20 },
    { level: 4, minXP: 2500, title: "Prop Trader", maxLeverage: 30 },
    { level: 5, minXP: 5000, title: "Market Wizard", maxLeverage: 50 }
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (account.xp >= levels[i].minXP) {
      account.level = levels[i].level;
      account.rankTitle = levels[i].title;
      account.allowedLeverage = levels[i].maxLeverage;
      break;
    }
  }
}
