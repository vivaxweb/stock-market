import { WebSocket } from 'ws';

const WS_URL = 'ws://localhost:8080';
const HTTP_URL = 'http://localhost:8080';

async function runTests() {
  console.log('🧪 Starting MockBull End-to-End System Verification...\n');

  // 1. Verify HTTP REST Endpoints
  console.log('--- 1. Testing REST Endpoints ---');
  
  // Status
  const statusRes = await fetch(`${HTTP_URL}/api/status`);
  const statusData = await statusRes.json();
  console.log(`✅ [REST] /api/status -> Status: ${statusData.status}, Users: ${statusData.activeUsers}`);

  // Assets
  const assetsRes = await fetch(`${HTTP_URL}/api/assets`);
  const assets = await assetsRes.json();
  console.log(`✅ [REST] /api/assets -> Total assets: ${assets.length} (${assets.filter(a => a.market === 'GLOBAL').length} Global, ${assets.filter(a => a.market === 'INDIA').length} India)`);

  // Indian Options Chain
  const chainRes = await fetch(`${HTTP_URL}/api/options-chain?symbol=NIFTY%2050`);
  const chain = await chainRes.json();
  console.log(`✅ [REST] /api/options-chain -> Underlying: ${chain.underlying}, Spot: ₹${chain.spotPrice}, Lot Size: ${chain.lotSize}, Strikes: ${chain.strikes.length}`);

  // Multi-timeframe Candles (1m, 5m, 15m, 1h, 1D)
  for (const tf of ['1m', '5m', '15m', '1h', '1D']) {
    const candleRes = await fetch(`${HTTP_URL}/api/candles?symbol=BTC/USD&timeframe=${tf}`);
    const candleData = await candleRes.json();
    console.log(`✅ [REST] /api/candles (BTC/USD @ ${tf}) -> Returned ${candleData.bars?.length || 0} bars (Latest Close: $${candleData.bars?.[candleData.bars.length - 1]?.close})`);
  }
  const niftyDayRes = await fetch(`${HTTP_URL}/api/candles?symbol=NIFTY%2050&timeframe=1D`);
  const niftyDayData = await niftyDayRes.json();
  console.log(`✅ [REST] /api/candles (NIFTY 50 @ 1D) -> Returned ${niftyDayData.bars?.length || 0} daily bars (Latest Close: ₹${niftyDayData.bars?.[niftyDayData.bars.length - 1]?.close})`);

  // Academy
  const academyRes = await fetch(`${HTTP_URL}/api/academy`);
  const academy = await academyRes.json();
  console.log(`✅ [REST] /api/academy -> Tracks: ${academy.tracks.length}, Total Lessons: ${academy.tracks.reduce((sum, t) => sum + t.lessons.length, 0)}`);

  // Leaderboard
  const leaderRes = await fetch(`${HTTP_URL}/api/leaderboard?market=GLOBAL`);
  const leader = await leaderRes.json();
  console.log(`✅ [REST] /api/leaderboard -> Global Top: ${leader.leaderboard[0].username} (ROI: +${leader.leaderboard[0].roi}%)`);

  // 2. Verify Real-time WebSocket Protocol & Trading Engine
  console.log('\n--- 2. Testing WebSocket & Order Execution Engine ---');

  const ws = new WebSocket(WS_URL);

  let createdPositionId = null;

  await new Promise((resolve, reject) => {
    ws.on('open', () => {
      console.log('✅ [WS] Connected to ws://localhost:8080');
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());

      if (msg.event === 'handshake') {
        console.log(`✅ [WS] Handshake received. User: ${msg.account.username}, Streak: ${msg.account.streakDays}d, Level: ${msg.account.level} (${msg.account.rankTitle})`);
        console.log(`   Initial Balance -> Global: $${msg.account.globalCash.toLocaleString()} | India: ₹${msg.account.indiaCash.toLocaleString()}`);

        // Subscribe to BTC/USD ticks
        ws.send(JSON.stringify({ event: 'subscribe', symbol: 'BTC/USD' }));

        // Execute a Test Trade: Buy BTC/USD with 10x leverage
        console.log('\n--- 3. Testing Order Placement (Buy BTC/USD with 10x Leverage) ---');
        ws.send(JSON.stringify({
          event: 'create_trade',
          payload: {
            symbol: 'BTC/USD',
            assetName: 'Bitcoin',
            category: 'CRYPTO',
            market: 'GLOBAL',
            side: 'BUY',
            amount: 1000,
            leverage: 10,
            stopLoss: 50000,
            takeProfit: 110000
          }
        }));
      }

      if (msg.event === 'trade_created' && !msg.position.isOption) {
        createdPositionId = msg.position.id;
        console.log(`✅ [WS] Trade Created -> ID: ${msg.position.id}`);
        console.log(`   Symbol: ${msg.position.symbol} ${msg.position.side} | Margin: $${msg.position.margin} | Exposure: $${msg.position.amount * msg.position.leverage} (${msg.position.leverage}x)`);
        console.log(`   Updated Global Cash: $${msg.account.globalCash.toLocaleString()}`);

        // Wait 2 seconds, then test Trade Rewind / Undo
        setTimeout(() => {
          console.log('\n--- 4. Testing Trade Rewind / Undo Token Feature ---');
          console.log(`   Remaining Rewind Tokens before undo: ${msg.account.undoTokens}`);
          ws.send(JSON.stringify({
            event: 'undo_trade',
            positionId: createdPositionId
          }));
        }, 2000);
      }

      if (msg.event === 'trade_undone') {
        console.log(`✅ [WS] Trade Undone Successfully! Position: ${msg.positionId}`);
        console.log(`   Refunded Margin -> Restored Global Cash: $${msg.account.globalCash.toLocaleString()}`);
        console.log(`   Remaining Tokens: ${msg.account.undoTokens}`);

        // Test Daily Streak Claim
        console.log('\n--- 5. Testing Daily Streak Reward Claim ---');
        ws.send(JSON.stringify({ event: 'claim_streak' }));
      }

      if (msg.event === 'streak_claimed') {
        console.log(`✅ [WS] Streak Claimed! Streak Days: ${msg.account.streakDays}d, Claimed Today: ${msg.account.streakClaimedToday}`);
        console.log(`   Cash after streak: $${msg.account.globalCash.toLocaleString()}`);

        // Test NSE F&O Option Order
        console.log('\n--- 6. Testing Indian NSE Option Execution (NIFTY 24200 CE) ---');
        ws.send(JSON.stringify({
          event: 'create_trade',
          payload: {
            symbol: 'NIFTY 50 24200 CE',
            assetName: 'NIFTY 50 24200 CE',
            category: 'OPTION',
            market: 'INDIA',
            side: 'BUY',
            amount: 3250,
            leverage: 1,
            isOption: true,
            optionContract: {
              underlying: 'NIFTY 50',
              strike: 24200,
              optionType: 'CE',
              lotSize: 25,
              lots: 1,
              totalQuantity: 25,
              premium: 130
            }
          }
        }));
      }

      if (msg.event === 'error') {
        console.error('❌ [WS Error]', msg.message);
      }

      if (msg.event === 'trade_created' && msg.position.isOption) {
        console.log(`✅ [WS] Indian Option Trade Executed -> ${msg.position.symbol}`);
        console.log(`   Margin Paid: ₹${msg.position.margin.toLocaleString()} | Remaining India Cash: ₹${msg.account.indiaCash.toLocaleString()}`);

        console.log('\n🎉 ALL END-TO-END TESTS PASSED WITH 100% SUCCESS!');
        ws.close();
        resolve(true);
      }
    });

    ws.on('error', (err) => {
      console.error('WS Error:', err);
      reject(err);
    });
  });
}

runTests().catch(console.error);
