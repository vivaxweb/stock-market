import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { ASSETS, marketEmitter, getCandleHistory, startMarketSimulation } from './services/marketData.js';
import { getOptionsChain } from './services/optionsChain.js';
import { 
  getUserAccount, 
  getPositions, 
  getTradeHistory, 
  createTrade, 
  closeTrade, 
  undoTrade, 
  setStops 
} from './services/orderEngine.js';
import { 
  LEADERBOARD_GLOBAL, 
  LEADERBOARD_INDIA, 
  claimDailyStreak, 
  claimBankruptcyBailout 
} from './services/gamification.js';
import { ACADEMY_LESSONS, ACADEMY_TRACKS } from './data/academyData.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '../../client/dist');

const app = express();
app.use(cors());
app.use(express.json());

const clientAssets = path.join(__dirname, '../../client/assets');
if (fs.existsSync(clientAssets)) {
  app.use('/images', express.static(clientAssets));
}

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

const PORT = process.env.PORT || 8080;
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Start real-time price generator & Binance crypto stream
startMarketSimulation();

// ---------------------------------------------
// REST API ENDPOINTS
// ---------------------------------------------
app.get('/api/status', (req, res) => {
  res.json({
    name: "MockBull API",
    status: "online",
    activeUsers: 1420,
    timestamp: Date.now()
  });
});

app.get('/api/assets', (req, res) => {
  const { market } = req.query;
  const filtered = market ? ASSETS.filter(a => a.market === market) : ASSETS;
  res.json(filtered);
});

app.get('/api/candles', (req, res) => {
  const symbol = req.query.symbol || "BTC/USD";
  const timeframe = req.query.timeframe || "5m";
  const bars = getCandleHistory(symbol, timeframe);
  res.json({ symbol, timeframe, bars });
});

app.get('/api/options-chain', (req, res) => {
  const symbol = req.query.symbol || "NIFTY 50";
  const chain = getOptionsChain(symbol);
  res.json(chain);
});

app.get('/api/academy', (req, res) => {
  res.json({ tracks: ACADEMY_TRACKS, lessons: ACADEMY_LESSONS });
});

app.get('/api/leaderboard', (req, res) => {
  const market = req.query.market || "GLOBAL";
  const list = market === "INDIA" ? LEADERBOARD_INDIA : LEADERBOARD_GLOBAL;
  const mapped = list.map(item => ({
    rank: item.rank,
    username: item.username,
    avatar: item.avatar,
    badge: item.isPro ? '⭐ PRO' : 'Trader',
    roi: item.returnPercentage,
    tradesWon: Math.round(item.totalTrades * (item.winRate / 100)),
    totalTrades: item.totalTrades,
    country: item.country
  }));
  res.json({
    market,
    leaderboard: mapped,
    userStanding: {
      rank: 42,
      topPercent: 8,
      roi: 34.5
    }
  });
});

app.get('/api/brokers', (req, res) => {
  const { market } = req.query;
  const brokers = market === 'INDIA' ? [
    { name: "Zerodha Kite", tag: "Most Popular Discount Broker", offer: "₹0 Equity Delivery Brokerage", cpaUrl: "https://zerodha.com/open-account?c=MOCKBULL" },
    { name: "Groww", tag: "Best for Beginners & Direct MF", offer: "Fast Account Opening & Clean UI", cpaUrl: "https://groww.in/open-demat-account?c=MOCKBULL" },
    { name: "Dhan", tag: "Best for F&O & Scalpers", offer: "TradingView Integration Built-in", cpaUrl: "https://dhan.co/?c=MOCKBULL" }
  ] : [
    { name: "Exness", tag: "Instant Withdrawals & 0% Spreads", offer: "Deposit Bonus up to $500", cpaUrl: "https://exness.com/a/mockbull" },
    { name: "easyMarkets", tag: "DealCancellation & Freeze Rate", offer: "Risk-Free First Trades", cpaUrl: "https://easymarkets.com/a/mockbull" },
    { name: "eToro", tag: "World's #1 Social CopyTrader", offer: "Copy the Top 50 Global Traders", cpaUrl: "https://etoro.com/a/mockbull" }
  ];
  res.json(brokers);
});

// ---------------------------------------------
// REAL-TIME WEBSOCKET PROTOCOL
// ---------------------------------------------
wss.on('connection', (ws) => {
  console.log('⚡ New client connected to WebSocket gateway');
  const subscribedSymbols = new Set(["BTC/USD", "NIFTY 50"]);

  // Handshake: send initial state snapshot
  ws.send(JSON.stringify({
    event: 'handshake',
    account: getUserAccount(),
    positions: getPositions(),
    assets: ASSETS,
    timestamp: Date.now()
  }));

  // Handle incoming client messages
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      switch (msg.event) {
        case 'subscribe':
          if (msg.symbol) subscribedSymbols.add(msg.symbol);
          break;

        case 'unsubscribe':
          if (msg.symbol) subscribedSymbols.delete(msg.symbol);
          break;

        case 'create_trade': {
          try {
            const pos = createTrade(msg.payload);
            ws.send(JSON.stringify({ event: 'trade_created', position: pos, account: getUserAccount() }));
            broadcastPositions();
          } catch (err) {
            ws.send(JSON.stringify({ event: 'error', message: err.message }));
          }
          break;
        }

        case 'close_trade': {
          try {
            const closed = closeTrade(msg.positionId);
            ws.send(JSON.stringify({ event: 'trade_closed', closed, account: getUserAccount() }));
            broadcastPositions();
          } catch (err) {
            ws.send(JSON.stringify({ event: 'error', message: err.message }));
          }
          break;
        }

        case 'undo_trade': {
          try {
            const res = undoTrade(msg.positionId);
            ws.send(JSON.stringify({ event: 'trade_undone', ...res, positionId: msg.positionId, account: getUserAccount() }));
            broadcastPositions();
          } catch (err) {
            ws.send(JSON.stringify({ event: 'error', message: err.message }));
          }
          break;
        }

        case 'set_stops': {
          try {
            const pos = setStops(msg.positionId, msg.stopLoss, msg.takeProfit);
            ws.send(JSON.stringify({ event: 'stops_updated', position: pos }));
            broadcastPositions();
          } catch (err) {
            ws.send(JSON.stringify({ event: 'error', message: err.message }));
          }
          break;
        }

        case 'claim_streak': {
          try {
            const result = claimDailyStreak();
            ws.send(JSON.stringify({ event: 'streak_claimed', ...result, account: getUserAccount() }));
          } catch (err) {
            ws.send(JSON.stringify({ event: 'error', message: err.message }));
          }
          break;
        }

        case 'claim_bailout': {
          try {
            const result = claimBankruptcyBailout(msg.market);
            ws.send(JSON.stringify({ event: 'bailout_claimed', ...result, account: getUserAccount() }));
          } catch (err) {
            ws.send(JSON.stringify({ event: 'error', message: err.message }));
          }
          break;
        }

        case 'ping':
          ws.send(JSON.stringify({ event: 'pong' }));
          break;
      }
    } catch (e) {
      console.log('WS parse error:', e.message);
    }
  });

  // Listen to live market ticks and stream to client
  const tickListener = (tick) => {
    if (ws.readyState === WebSocket.OPEN && subscribedSymbols.has(tick.symbol)) {
      ws.send(JSON.stringify({
        event: 'tick',
        tick
      }));
    }
  };

  marketEmitter.on('tick', tickListener);

  ws.on('close', () => {
    marketEmitter.removeListener('tick', tickListener);
  });
});

// Helper to broadcast active positions and equity updates
function broadcastPositions() {
  const payload = JSON.stringify({
    event: 'positions_update',
    positions: getPositions(),
    account: getUserAccount()
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Periodically broadcast positions updates (PnL refresh every 2s)
setInterval(() => {
  broadcastPositions();
}, 2000);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexHtml = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.send('MockBull Server Online.');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 MockBull Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket gateway active on ws://localhost:${PORT}`);
});
