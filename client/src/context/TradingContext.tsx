import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface Asset {
  symbol: string;
  name: string;
  category: 'STOCK' | 'CRYPTO' | 'FOREX' | 'INDEX' | 'OPTION';
  market: 'GLOBAL' | 'INDIA';
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: string;
  baseCurrency: 'USD' | 'INR';
  isOptionChainAvailable?: boolean;
  tvSymbol?: string;
}

export interface Position {
  id: string;
  symbol: string;
  assetName: string;
  category: string;
  market: 'GLOBAL' | 'INDIA';
  side: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  amount: number;
  quantity: number;
  leverage: number;
  margin: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  pnl: number;
  pnlPercentage: number;
  openedAt: number;
  isOption?: boolean;
  optionContract?: any;
}

export interface UserAccount {
  id: string;
  username: string;
  avatar: string;
  isPro: boolean;
  activeMarket: 'GLOBAL' | 'INDIA';
  globalCash: number;
  indiaCash: number;
  globalEquity: number;
  indiaEquity: number;
  xp: number;
  level: number;
  rankTitle: string;
  streakDays: number;
  lastLoginDate: string;
  streakClaimedToday: boolean;
  undoTokens: number;
  allowedLeverage: number;
}

interface TradingContextType {
  activeMarket: 'GLOBAL' | 'INDIA';
  switchMarket: (market: 'GLOBAL' | 'INDIA') => void;
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset) => void;
  assets: Asset[];
  positions: Position[];
  account: UserAccount | null;
  connected: boolean;
  candles: any[];
  activeTimeframe: '1m' | '5m' | '15m' | '1h' | '1D';
  setActiveTimeframe: (tf: '1m' | '5m' | '15m' | '1h' | '1D') => void;
  loadCandles: (symbol?: string, timeframe?: string) => Promise<void>;
  createTrade: (payload: any) => void;
  closeTrade: (positionId: string) => void;
  undoTrade: (positionId: string) => void;
  setStops: (positionId: string, stopLoss?: number, takeProfit?: number) => void;
  claimDailyStreak: () => void;
  claimBailout: () => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (profile: any) => void;
}

const TradingContext = createContext<TradingContextType | null>(null);

const WS_URL = 'ws://localhost:8080';
const HTTP_URL = 'http://localhost:8080';

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMarket, setActiveMarket] = useState<'GLOBAL' | 'INDIA'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = window.location.search.toLowerCase();
        if (search.includes('market=india') || search.includes('open_options=true')) return 'INDIA';
        if (search.includes('market=global')) return 'GLOBAL';
        if (window.localStorage) {
          const savedMkt = window.localStorage.getItem('active_market');
          if (savedMkt === 'INDIA' || savedMkt === 'GLOBAL') return savedMkt;
          const savedProf = window.localStorage.getItem('onboarding_profile');
          if (savedProf) {
            const parsed = JSON.parse(savedProf);
            if (parsed.market === 'INDIA' || parsed.market === 'GLOBAL') return parsed.market;
          }
        }
      }
    } catch (e) {}
    return 'INDIA';
  });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [connected, setConnected] = useState(false);
  const [candles, setCandles] = useState<any[]>([]);
  const [activeTimeframe, setActiveTimeframeState] = useState<'1m' | '5m' | '15m' | '1h' | '1D'>('5m');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = window.location.search;
        if (search.includes('no_onboarding=true') || search.includes('open_options=true') || search.includes('open_paywall=true') || search.includes('open_drawer=true') || search.includes('open_streak=true') || search.includes('open_search=true') || search.includes('open_assets=true') || search.includes('tab=')) return true;
        return window.localStorage?.getItem('onboarding_completed') === 'true';
      }
    } catch (e) {
      return false;
    }
  });

  const wsRef = useRef<WebSocket | null>(null);
  const selectedAssetRef = useRef<Asset | null>(null);
  const activeMarketRef = useRef<'GLOBAL' | 'INDIA'>(activeMarket);

  useEffect(() => {
    selectedAssetRef.current = selectedAsset;
  }, [selectedAsset]);

  useEffect(() => {
    activeMarketRef.current = activeMarket;
  }, [activeMarket]);

  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const connectWS = () => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.event) {
            case 'handshake':
              setAccount(msg.account);
              setPositions(msg.positions || []);
              if (msg.assets && msg.assets.length > 0) {
                setAssets(msg.assets);
                const currentMkt = activeMarketRef.current;
                const marketAssets = msg.assets.filter((a: Asset) => a.market === currentMkt);
                const target = marketAssets.length > 0 ? marketAssets[0] : msg.assets[0];
                setSelectedAsset(target);
                selectedAssetRef.current = target;
                loadCandles(target.symbol, activeTimeframe);
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ event: 'subscribe', symbol: target.symbol }));
                }
              }
              break;

            case 'tick': {
              const tick = msg.tick;
              setAssets(prev => prev.map(a => a.symbol === tick.symbol ? {
                ...a,
                price: tick.price,
                change24h: tick.change24h,
                high24h: tick.high24h || a.high24h,
                low24h: tick.low24h || a.low24h
              } : a));

              setSelectedAsset(prev => {
                if (prev && prev.symbol === tick.symbol) {
                  return {
                    ...prev,
                    price: tick.price,
                    change24h: tick.change24h,
                    high24h: tick.high24h || Math.max(prev.high24h || tick.price, tick.price),
                    low24h: tick.low24h || Math.min(prev.low24h || tick.price, tick.price)
                  };
                }
                return prev;
              });

              // Dynamically update latest candle in chart ONLY if tick belongs to selected asset
              if (selectedAssetRef.current && selectedAssetRef.current.symbol === tick.symbol) {
                setCandles(prev => {
                  if (!prev || prev.length === 0) return prev;
                  const lastIdx = prev.length - 1;
                  const last = { ...prev[lastIdx] };
                  last.high = Math.max(last.high, tick.price);
                  last.low = Math.min(last.low, tick.price);
                  last.close = tick.price;
                  const updated = [...prev];
                  updated[lastIdx] = last;
                  return updated;
                });
              }
              break;
            }

            case 'positions_update':
              setPositions(msg.positions || []);
              if (msg.account) setAccount(msg.account);
              break;

            case 'trade_created':
              setPositions(prev => [msg.position, ...prev]);
              if (msg.account) setAccount(msg.account);
              break;

            case 'trade_closed':
              setPositions(prev => prev.filter(p => p.id !== msg.closed.id));
              if (msg.account) setAccount(msg.account);
              break;

            case 'trade_undone':
              setPositions(prev => prev.filter(p => p.id !== msg.positionId));
              if (msg.account) setAccount(msg.account);
              break;

            case 'streak_claimed':
            case 'bailout_claimed':
              if (msg.account) setAccount(msg.account);
              break;

            case 'error':
              alert(msg.message || 'An error occurred');
              break;
          }
        } catch (e) {
          console.log('WS msg error', e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        setTimeout(connectWS, 3000);
      };
    } catch (e) {
      setTimeout(connectWS, 3000);
    }
  };

  const loadCandles = async (symbol?: string, timeframe?: string) => {
    const sym = symbol || selectedAsset?.symbol || (activeMarket === 'INDIA' ? 'NIFTY 50' : 'BTC/USD');
    const tf = timeframe || activeTimeframe;
    try {
      const res = await fetch(`${HTTP_URL}/api/candles?symbol=${encodeURIComponent(sym)}&timeframe=${tf}`);
      const data = await res.json();
      if (data.bars) {
        setCandles(data.bars);
      }
    } catch (e) {
      console.log('Failed to fetch candles', e);
    }
  };

  const setActiveTimeframe = (tf: '1m' | '5m' | '15m' | '1h' | '1D') => {
    setActiveTimeframeState(tf);
    loadCandles(selectedAsset?.symbol, tf);
  };

  const switchMarket = (market: 'GLOBAL' | 'INDIA') => {
    setActiveMarket(market);
    activeMarketRef.current = market;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('active_market', market);
      }
    } catch (e) {}

    const available = assets.filter(a => a.market === market);
    if (available.length > 0) {
      setSelectedAsset(available[0]);
      selectedAssetRef.current = available[0];
      loadCandles(available[0].symbol, activeTimeframe);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: 'subscribe', symbol: available[0].symbol }));
      }
    }
  };

  const completeOnboarding = (profile: any) => {
    const market = profile.market || 'GLOBAL';
    setActiveMarket(market);
    activeMarketRef.current = market;
    setHasCompletedOnboarding(true);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('onboarding_completed', 'true');
        window.localStorage.setItem('onboarding_profile', JSON.stringify(profile));
        window.localStorage.setItem('active_market', market);
      }
    } catch (e) {}

    const targetAsset = assets.find(a => a.symbol === profile.primaryAsset) ||
      assets.find(a => a.market === market);

    if (targetAsset) {
      setSelectedAsset(targetAsset);
      selectedAssetRef.current = targetAsset;
      loadCandles(targetAsset.symbol, activeTimeframe);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: 'subscribe', symbol: targetAsset.symbol }));
      }
    }
  };

  const createTrade = (payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'create_trade',
        payload
      }));
    }
  };

  const closeTrade = (positionId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'close_trade',
        positionId
      }));
    }
  };

  const undoTrade = (positionId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'undo_trade',
        positionId
      }));
    }
  };

  const setStops = (positionId: string, stopLoss?: number, takeProfit?: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'set_stops',
        positionId,
        stopLoss,
        takeProfit
      }));
    }
  };

  const claimDailyStreak = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'claim_streak' }));
    }
  };

  const claimBailout = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'claim_bailout', market: activeMarket }));
    }
  };

  return (
    <TradingContext.Provider
      value={{
        activeMarket,
        switchMarket,
        selectedAsset,
        setSelectedAsset: (asset) => {
          setSelectedAsset(asset);
          selectedAssetRef.current = asset;
          loadCandles(asset.symbol, activeTimeframe);
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ event: 'subscribe', symbol: asset.symbol }));
          }
        },
        assets: assets.filter(a => a.market === activeMarket),
        positions: positions.filter(p => p.market === activeMarket),
        account,
        connected,
        candles,
        activeTimeframe,
        setActiveTimeframe,
        loadCandles,
        createTrade,
        closeTrade,
        undoTrade,
        setStops,
        claimDailyStreak,
        claimBailout,
        hasCompletedOnboarding,
        completeOnboarding
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) throw new Error('useTrading must be used within TradingProvider');
  return context;
};
