import { ASSETS, marketEmitter } from './marketData.js';

// In-memory state for user positions and account
let userAccount = {
  id: "user_trader_1",
  username: "AlphaBull_Trader",
  avatar: "🐂",
  isPro: false,
  activeMarket: "GLOBAL",
  globalCash: 100000.00,
  indiaCash: 1000000.00,
  globalEquity: 100000.00,
  indiaEquity: 1000000.00,
  xp: 1250,
  level: 3,
  rankTitle: "Day Trader",
  streakDays: 4,
  lastLoginDate: new Date().toISOString().split('T')[0],
  streakClaimedToday: false,
  undoTokens: 2,
  allowedLeverage: 10
};

// In-memory list of open and closed positions
let positions = [];
let tradeHistory = [];

export function getUserAccount() {
  calculateEquities();
  return { ...userAccount };
}

export function getPositions() {
  return [...positions];
}

export function getTradeHistory() {
  return [...tradeHistory];
}

// Recalculate cash + unrealized PnL = Equity
function calculateEquities() {
  let globalUnrealized = 0;
  let indiaUnrealized = 0;

  positions.forEach(pos => {
    if (pos.market === 'GLOBAL') {
      globalUnrealized += pos.pnl;
    } else {
      indiaUnrealized += pos.pnl;
    }
  });

  userAccount.globalEquity = parseFloat((userAccount.globalCash + globalUnrealized).toFixed(2));
  userAccount.indiaEquity = parseFloat((userAccount.indiaCash + indiaUnrealized).toFixed(2));
}

// ---------------------------------------------
// CREATE TRADE
// ---------------------------------------------
export function createTrade({ symbol, side, amount, leverage = 1, stopLoss = null, takeProfit = null, isOption = false, optionContract = null }) {
  let asset = ASSETS.find(a => a.symbol === symbol);
  let price = asset ? asset.price : 100;
  let market = asset ? asset.market : (symbol.includes('NIFTY') ? 'INDIA' : 'GLOBAL');
  let assetName = asset ? asset.name : symbol;

  if (isOption && optionContract) {
    price = optionContract.premium || 100;
    const optUnderlying = optionContract.symbol || optionContract.underlying || symbol || 'NIFTY 50';
    assetName = `${optUnderlying} ${optionContract.strikePrice || ''} (${optionContract.optionType || 'CE'})`.trim();
    market = 'INDIA';
  }

  // Check available cash
  const cashField = market === 'GLOBAL' ? 'globalCash' : 'indiaCash';
  if (userAccount[cashField] < amount) {
    throw new Error(`Insufficient ${market === 'GLOBAL' ? '$' : '₹'} cash balance.`);
  }

  // Deduct margin from cash
  const margin = amount / leverage;
  userAccount[cashField] -= amount;

  const quantity = parseFloat((amount / price).toFixed(4));
  const newPosition = {
    id: "pos_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    symbol,
    assetName,
    category: isOption ? 'OPTION' : (asset ? asset.category : 'STOCK'),
    market,
    side: side.toUpperCase(),
    entryPrice: price,
    currentPrice: price,
    amount,
    quantity,
    leverage,
    margin,
    stopLoss: stopLoss ? parseFloat(stopLoss) : null,
    takeProfit: takeProfit ? parseFloat(takeProfit) : null,
    pnl: 0,
    pnlPercentage: 0,
    openedAt: Date.now(),
    isOption,
    optionContract
  };

  positions.unshift(newPosition);
  calculateEquities();

  // Award XP for taking a trade
  userAccount.xp += 25;

  return newPosition;
}

// ---------------------------------------------
// CLOSE TRADE
// ---------------------------------------------
export function closeTrade(positionId) {
  const index = positions.findIndex(p => p.id === positionId);
  if (index === -1) {
    throw new Error("Position not found.");
  }

  const pos = positions[index];
  const cashField = pos.market === 'GLOBAL' ? 'globalCash' : 'indiaCash';

  // Return original invested amount + realized PnL to user cash
  const totalReturn = pos.amount + pos.pnl;
  userAccount[cashField] += Math.max(totalReturn, 0);

  // Archive to trade history
  const closedRecord = {
    ...pos,
    closedAt: Date.now(),
    finalPnL: pos.pnl,
    finalPnLPercentage: pos.pnlPercentage
  };
  tradeHistory.unshift(closedRecord);
  positions.splice(index, 1);

  calculateEquities();

  return closedRecord;
}

// ---------------------------------------------
// UNDO / REWIND TRADE
// ---------------------------------------------
export function undoTrade(positionId) {
  const index = positions.findIndex(p => p.id === positionId);
  if (index === -1) {
    throw new Error("Position not found or already closed.");
  }

  if (userAccount.undoTokens <= 0 && !userAccount.isPro) {
    userAccount.undoTokens = 2;
  }

  const pos = positions[index];
  const cashField = pos.market === 'GLOBAL' ? 'globalCash' : 'indiaCash';

  // Completely refund original amount
  userAccount[cashField] += pos.amount;

  if (!userAccount.isPro) {
    userAccount.undoTokens -= 1;
  }

  positions.splice(index, 1);
  calculateEquities();

  return { success: true, refundedAmount: pos.amount, remainingTokens: userAccount.undoTokens };
}

// ---------------------------------------------
// SET STOPS (Stop-Loss / Take-Profit)
// ---------------------------------------------
export function setStops(positionId, stopLoss, takeProfit) {
  const pos = positions.find(p => p.id === positionId);
  if (!pos) throw new Error("Position not found");

  pos.stopLoss = stopLoss ? parseFloat(stopLoss) : null;
  pos.takeProfit = takeProfit ? parseFloat(takeProfit) : null;

  return pos;
}

// ---------------------------------------------
// LIVE TICK EVALUATION (PnL + SL/TP Trigger)
// ---------------------------------------------
marketEmitter.on('tick', ({ symbol, price }) => {
  let changed = false;

  positions.forEach(pos => {
    if (pos.symbol === symbol) {
      pos.currentPrice = price;
      const diff = pos.side === 'BUY' ? (price - pos.entryPrice) : (pos.entryPrice - price);
      pos.pnl = parseFloat((diff * pos.quantity * pos.leverage).toFixed(2));
      pos.pnlPercentage = parseFloat(((pos.pnl / pos.amount) * 100).toFixed(2));
      changed = true;

      // Auto-trigger Stop-Loss
      if (pos.stopLoss) {
        if (pos.side === 'BUY' && price <= pos.stopLoss) {
          closeTrade(pos.id);
        } else if (pos.side === 'SELL' && price >= pos.stopLoss) {
          closeTrade(pos.id);
        }
      }

      // Auto-trigger Take-Profit
      if (pos.takeProfit) {
        if (pos.side === 'BUY' && price >= pos.takeProfit) {
          closeTrade(pos.id);
        } else if (pos.side === 'SELL' && price <= pos.takeProfit) {
          closeTrade(pos.id);
        }
      }
    }
  });

  if (changed) {
    calculateEquities();
  }
});
