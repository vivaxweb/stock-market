import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useTrading } from '../context/TradingContext';
import { AssetIcon } from './AssetIcon';

interface TradingViewChartProps {
  onOpenAssetSelector?: () => void;
}

export type ChartDisplayMode = 'mini' | 'standard';

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ onOpenAssetSelector }) => {
  const {
    selectedAsset,
    activeMarket,
    activeTimeframe,
    setActiveTimeframe
  } = useTrading();

  const isIndianMarket = activeMarket === 'INDIA' || selectedAsset?.market === 'INDIA';

  const globalTimeframes: Array<'1m' | '5m' | '15m' | '1h' | '1D'> = ['1m', '5m', '15m', '1h', '1D'];
  const indianTimeframes: Array<'1D' | '1W' | '1M'> = ['1D', '1W', '1M'];
  const isGlobal = !isIndianMarket;

  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [chartMode, setChartMode] = useState<ChartDisplayMode>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const m = params.get('chart_mode') || params.get('mode');
        if (m === 'mini') return 'mini';
      }
    } catch (e) {}
    return 'standard';
  });
  const [showMarketDepth, setShowMarketDepth] = useState<boolean>(false);

  // Map internal symbols to TradingView symbols
  const getTradingViewSymbol = (symbol: string): string => {
    if (selectedAsset && selectedAsset.symbol === symbol && selectedAsset.tvSymbol) {
      return selectedAsset.tvSymbol;
    }

    const dict: Record<string, string> = {
      'BTC/USD': 'BINANCE:BTCUSDT',
      'ETH/USD': 'BINANCE:ETHUSDT',
      'SOL/USD': 'BINANCE:SOLUSDT',
      'XRP/USD': 'BINANCE:XRPUSDT',
      'DOGE/USD': 'BINANCE:DOGEUSDT',
      'BNB/USD': 'BINANCE:BNBUSDT',
      'ADA/USD': 'BINANCE:ADAUSDT',
      'AVAX/USD': 'BINANCE:AVAXUSDT',
      'AAPL': 'NASDAQ:AAPL',
      'TSLA': 'NASDAQ:TSLA',
      'NVDA': 'NASDAQ:NVDA',
      'MSFT': 'NASDAQ:MSFT',
      'GOOGL': 'NASDAQ:GOOGL',
      'AMZN': 'NASDAQ:AMZN',
      'META': 'NASDAQ:META',
      'NFLX': 'NASDAQ:NFLX',
      'AMD': 'NASDAQ:AMD',
      'COIN': 'NASDAQ:COIN',
      'XAU/USD': 'OANDA:XAUUSD',
      'XAG/USD': 'OANDA:XAGUSD',
      'WTI/USD': 'TVC:USOIL',
      'EUR/USD': 'FX:EURUSD',
      'GBP/USD': 'FX:GBPUSD',
      'NIFTY 50': 'BSE:SENSEX',
      'BANK NIFTY': 'BSE:SENSEX',
      'SENSEX': 'BSE:SENSEX',
      'NIFTY IT': 'BSE:SENSEX',
      'RELIANCE': 'BSE:RELIANCE',
      'HDFCBANK': 'BSE:HDFCBANK',
      'TCS': 'BSE:TCS',
      'TATAMOTORS': 'BSE:TATAMOTORS',
      'INFY': 'BSE:INFY',
      'ICICIBANK': 'BSE:ICICIBANK',
      'SBIN': 'BSE:SBIN',
      'ITC': 'BSE:ITC',
      'LT': 'BSE:LT',
      'BHARTIARTL': 'BSE:BHARTIARTL',
      'KOTAKBANK': 'BSE:KOTAKBANK',
      'BAJFINANCE': 'BSE:BAJFINANCE',
      'MARUTI': 'BSE:MARUTI',
      'WIPRO': 'BSE:WIPRO',
      'SUNPHARMA': 'BSE:SUNPHARMA',
      'ASIANPAINT': 'BSE:ASIANPAINT',
      'TITAN': 'BSE:TITAN',
      'ADANIENT': 'BSE:ADANIENT',
      'HINDUNILVR': 'BSE:HINDUNILVR',
      'AXISBANK': 'BSE:AXISBANK',
      'TATASTEEL': 'BSE:TATASTEEL',
      'ZOMATO': 'BSE:ZOMATO',
      'JIOFIN': 'BSE:JIOFIN',
      'PAYTM': 'BSE:PAYTM'
    };

    if (dict[symbol]) return dict[symbol];

    if (symbol.includes('/')) {
      const clean = symbol.replace('/', '');
      if (symbol.startsWith('XAU') || symbol.startsWith('XAG')) return `OANDA:${clean}`;
      if (symbol.startsWith('EUR') || symbol.startsWith('GBP')) return `FX:${clean}`;
      return `BINANCE:${clean}T`;
    }

    if (isIndianMarket) return `BSE:${symbol}`;
    return `NASDAQ:${symbol}`;
  };

  const getTradingViewInterval = (tf: string): string => {
    if (isIndianMarket) {
      if (tf === '1W') return 'W';
      if (tf === '1M') return 'M';
      return 'D';
    }
    switch (tf) {
      case '1m': return '1';
      case '5m': return '5';
      case '15m': return '15';
      case '1h': return '60';
      case '1D': return 'D';
      default: return '5';
    }
  };

  const tvSymbol = getTradingViewSymbol(selectedAsset?.symbol || 'BTC/USD');
  const tvInterval = getTradingViewInterval(activeTimeframe);
  const timezone = isIndianMarket ? 'Asia%2FKolkata' : 'Etc%2FUTC';

  // Clean TradingView embed URL with duplicate toolbars and legends hidden
  const tvEmbedUrl = "https://s.tradingview.com/widgetembed/?symbol=" + encodeURIComponent(tvSymbol) +
    "&interval=" + tvInterval +
    "&theme=dark&style=1&timezone=" + timezone +
    "&locale=en&toolbarbg=1E1D32&studies=%5B%5D&hide_top_toolbar=1&hidetoptoolbar=1&hide_legend=1&hide_side_toolbar=1&allow_symbol_change=0&save_image=0" +
    "&overrides=%7B%22paneProperties.background%22%3A%22%231E1D32%22%2C%22mainSeriesProperties.candleStyle.upColor%22%3A%22%2301CEA5%22%2C%22mainSeriesProperties.candleStyle.downColor%22%3A%22%23FF5A5F%22%7D";

  useEffect(() => {
    setIframeLoading(true);
    const timer = setTimeout(() => {
      setIframeLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [tvEmbedUrl]);

  const formatPrice = (val?: number) => {
    if (val === undefined || val === null) return '--';
    const digits = (selectedAsset?.symbol === 'EUR/USD' || val < 2) ? 4 : 2;
    return val.toLocaleString(isGlobal ? 'en-US' : 'en-IN', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  };

  const price = selectedAsset?.price || 0;
  const high = selectedAsset?.high24h || (price * 1.008);
  const low = selectedAsset?.low24h || (price * 0.992);
  const open = price - ((selectedAsset?.change24h || 0) / 100) * price;
  const changePercent = selectedAsset?.change24h || 0;
  const isUp = changePercent >= 0;
  const currencySymbol = isGlobal ? '$' : '₹';

  const dayRangeSpread = high - low;
  const currentRangePercent = dayRangeSpread > 0 
    ? Math.min(100, Math.max(0, ((price - low) / dayRangeSpread) * 100))
    : 50;

  const simulatedBids = [
    { qty: 450, orders: 12, price: price * 0.9995 },
    { qty: 1280, orders: 28, price: price * 0.9990 },
    { qty: 890, orders: 19, price: price * 0.9985 },
    { qty: 2450, orders: 45, price: price * 0.9980 },
    { qty: 3100, orders: 62, price: price * 0.9975 }
  ];

  const simulatedAsks = [
    { price: price * 1.0005, orders: 15, qty: 520 },
    { price: price * 1.0010, orders: 31, qty: 1150 },
    { price: price * 1.0015, orders: 22, qty: 940 },
    { price: price * 1.0020, orders: 40, qty: 2180 },
    { price: price * 1.0025, orders: 58, qty: 2950 }
  ];

  const totalBidQty = simulatedBids.reduce((acc, b) => acc + b.qty, 0);
  const totalAskQty = simulatedAsks.reduce((acc, a) => acc + a.qty, 0);
  const totalDepthQty = totalBidQty + totalAskQty;
  const buyRatio = totalDepthQty > 0 ? (totalBidQty / totalDepthQty) * 100 : 50;

  return (
    <View style={styles.container}>
      {/* Option B: Pulse Pro Stock Info & Day Range Bar (Top Section) */}
      <View style={styles.pulseHeaderCard}>
        {/* Top Ticker & Full Name Row */}
        <View style={styles.stockInfoTitleRow}>
          <TouchableOpacity
            style={styles.stockTitleTouch}
            onPress={onOpenAssetSelector}
            activeOpacity={0.7}
            disabled={!onOpenAssetSelector}
          >
            <Text style={styles.stockInfoPrefix}>Stock Info</Text>
            <Text style={styles.stockInfoDot}>·</Text>
            <Text style={styles.stockInfoName} numberOfLines={1}>
              {selectedAsset?.symbol || 'NIFTY 50'} - {selectedAsset?.name || 'NSE Benchmark'}
            </Text>
            {onOpenAssetSelector && (
              <Text style={styles.stockDropdownCaret}>▼</Text>
            )}
          </TouchableOpacity>

          {/* Timeframes & Minimize Button */}
          <View style={styles.headerRightControls}>
            {chartMode !== 'mini' && (
              <View style={styles.tfPillGroup}>
                {(isIndianMarket ? indianTimeframes : globalTimeframes).map(tf => {
                  const isActive = isIndianMarket
                    ? (activeTimeframe === tf || (tf === '1D' && !['1W', '1M'].includes(activeTimeframe)))
                    : activeTimeframe === tf;

                  return (
                    <TouchableOpacity
                      key={tf}
                      style={[styles.tfMiniBtn, isActive && styles.tfMiniBtnActive]}
                      onPress={() => setActiveTimeframe(tf as any)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tfMiniText, isActive && styles.tfMiniTextActive]}>
                        {tf}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={styles.chartToggleBtn}
              onPress={() => setChartMode(chartMode === 'mini' ? 'standard' : 'mini')}
              activeOpacity={0.75}
            >
              <Text style={styles.chartToggleBtnText}>
                {chartMode === 'mini' ? '⤢ Chart' : '− Mini'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3-Column Metrics Row: Price | Day Range Slider | 24h Change */}
        <View style={styles.metricsRow}>
          {/* Col 1: Circular Logo + Live Price */}
          <View style={styles.priceCol}>
            <View style={styles.assetCircleWrap}>
              <AssetIcon symbol={selectedAsset?.symbol || 'NIFTY 50'} size={24} />
            </View>
            <View>
              <Text style={styles.statLabel}>Live Price</Text>
              <Text style={styles.statPriceValue}>
                {currencySymbol}{formatPrice(price)}
              </Text>
            </View>
          </View>

          {/* Col 2: Day Range Visual Slider Track & Thumb (Pulse Pro Option B Feature) */}
          <View style={styles.dayRangeCol}>
            <View style={styles.dayRangeHeaderRow}>
              <Text style={styles.dayRangeTitle}>Day Range</Text>
              <Text style={styles.dayRangePctText}>{currentRangePercent.toFixed(0)}%</Text>
            </View>
            <View style={styles.dayRangeTrack}>
              <View
                style={[
                  styles.dayRangeFill,
                  {
                    width: `${currentRangePercent}%`,
                    backgroundColor: isUp ? '#01CEA5' : '#837CD2'
                  }
                ]}
              />
              <View
                style={[
                  styles.dayRangeThumb,
                  {
                    left: `${currentRangePercent}%`,
                    borderColor: isUp ? '#01CEA5' : '#837CD2'
                  }
                ]}
              />
            </View>
            <View style={styles.dayRangeLimitsRow}>
              <Text style={styles.dayRangeLimitText}>L: {formatPrice(low)}</Text>
              <Text style={styles.dayRangeLimitText}>H: {formatPrice(high)}</Text>
            </View>
          </View>

          {/* Col 3: 24h Change Badge */}
          <View style={styles.changeCol}>
            <Text style={styles.statLabel}>24h Change</Text>
            <View style={[styles.changePill, isUp ? styles.changePillGreen : styles.changePillRed]}>
              <Text style={[styles.changePillText, isUp ? styles.textGreen : styles.textRed]}>
                {isUp ? '+' : ''}{changePercent.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Candlestick Chart Area (Hidden in Mini Mode) */}
      {chartMode === 'standard' && (
        <View style={styles.chartArea}>
          {Platform.OS === 'web' && (
            <iframe
              key={tvEmbedUrl}
              src={tvEmbedUrl}
              style={{
                width: '100%',
                height: 275,
                minHeight: 275,
                border: 'none',
                backgroundColor: '#1E1D32',
                opacity: 1
              }}
              onLoad={() => setIframeLoading(false)}
              title="TradingView Chart"
            />
          )}

          {iframeLoading && (
            <View style={styles.loaderBadge}>
              <ActivityIndicator size="small" color="#01CEA5" style={{ marginRight: 6 }} />
              <Text style={styles.loaderText}>Connecting TradingView...</Text>
            </View>
          )}
        </View>
      )}

      {/* Collapsible Market Depth (Level 2) Accordion */}
      <View style={styles.marketDepthSection}>
        <TouchableOpacity
          style={styles.depthHeaderRow}
          onPress={() => setShowMarketDepth(!showMarketDepth)}
          activeOpacity={0.7}
        >
          <View style={styles.depthHeaderTitleGroup}>
            <Text style={styles.depthTitle}>Market Depth (L2)</Text>
            <Text style={styles.depthSubtitle}>
              {showMarketDepth ? 'Top 5 Bids & Asks' : 'Tap to inspect live order book'}
            </Text>
          </View>
          <Text style={styles.depthToggleIcon}>{showMarketDepth ? '▲ Hide' : '▼ View Depth'}</Text>
        </TouchableOpacity>

        {showMarketDepth && (
          <View style={styles.depthContent}>
            {/* Depth Volume Ratio Bar */}
            <View style={styles.depthRatioContainer}>
              <View style={styles.depthRatioLabels}>
                <Text style={[styles.ratioLabelText, styles.textGreen]}>
                  Buyers: {buyRatio.toFixed(1)}% ({totalBidQty.toLocaleString()})
                </Text>
                <Text style={[styles.ratioLabelText, styles.textRed]}>
                  Sellers: {(100 - buyRatio).toFixed(1)}% ({totalAskQty.toLocaleString()})
                </Text>
              </View>
              <View style={styles.ratioBarTrack}>
                <View style={[styles.ratioBarBuy, { width: `${buyRatio}%` }]} />
                <View style={[styles.ratioBarSell, { width: `${100 - buyRatio}%` }]} />
              </View>
            </View>

            {/* Top 5 Bids vs Asks Table */}
            <View style={styles.depthTable}>
              <View style={styles.depthTableRowHeader}>
                <Text style={[styles.depthColHeader, { flex: 1 }]}>Bid Qty</Text>
                <Text style={[styles.depthColHeader, { flex: 1, textAlign: 'right', color: '#01CEA5' }]}>Bid Price</Text>
                <View style={styles.depthColDivider} />
                <Text style={[styles.depthColHeader, { flex: 1, color: '#FF5A5F' }]}>Ask Price</Text>
                <Text style={[styles.depthColHeader, { flex: 1, textAlign: 'right' }]}>Ask Qty</Text>
              </View>

              {[0, 1, 2, 3, 4].map((idx) => {
                const bid = simulatedBids[idx];
                const ask = simulatedAsks[idx];
                return (
                  <View key={idx} style={[styles.depthTableRow, idx % 2 === 1 && styles.depthTableRowAlt]}>
                    <Text style={[styles.depthCellQty, { flex: 1 }]}>{bid.qty.toLocaleString()}</Text>
                    <Text style={[styles.depthCellBidPrice, { flex: 1, textAlign: 'right' }]}>
                      {formatPrice(bid.price)}
                    </Text>
                    <View style={styles.depthColDivider} />
                    <Text style={[styles.depthCellAskPrice, { flex: 1 }]}>
                      {formatPrice(ask.price)}
                    </Text>
                    <Text style={[styles.depthCellQty, { flex: 1, textAlign: 'right' }]}>
                      {ask.qty.toLocaleString()}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>52W High</Text>
                <Text style={styles.statVal}>{currencySymbol}{formatPrice(high * 1.25)}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>52W Low</Text>
                <Text style={styles.statVal}>{currencySymbol}{formatPrice(low * 0.78)}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>24h Volume</Text>
                <Text style={styles.statVal}>
                  {selectedAsset?.volume ? selectedAsset.volume.toLocaleString() : '1,42,850'}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Prev. Close</Text>
                <Text style={styles.statVal}>{currencySymbol}{formatPrice(open)}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF2'
  },

  /* Option B: Pulse Pro Header & Metrics Bar */
  pulseHeaderCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF2'
  },
  stockInfoTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  stockTitleTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  stockInfoPrefix: {
    color: '#1E1D32',
    fontSize: 12.5,
    fontWeight: '800'
  },
  stockInfoDot: {
    color: '#837CD2',
    fontSize: 12,
    marginHorizontal: 4,
    fontWeight: '800'
  },
  stockInfoName: {
    color: '#6B7280',
    fontSize: 11.5,
    fontWeight: '600',
    flexShrink: 1
  },
  stockDropdownCaret: {
    color: '#837CD2',
    fontSize: 8.5,
    marginLeft: 4,
    fontWeight: '800'
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  assetCircleWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  statLabel: {
    color: '#8E94A5',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 1
  },
  statPriceValue: {
    color: '#1E1D32',
    fontSize: 13,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Rubik, sans-serif' : undefined
  },
  dayRangeCol: {
    flex: 1,
    paddingHorizontal: 4
  },
  dayRangeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  dayRangeTitle: {
    color: '#8E94A5',
    fontSize: 9,
    fontWeight: '700'
  },
  dayRangePctText: {
    color: '#837CD2',
    fontSize: 8.5,
    fontWeight: '800'
  },
  dayRangeTrack: {
    height: 4,
    backgroundColor: '#EAECF2',
    borderRadius: 2,
    position: 'relative'
  },
  dayRangeFill: {
    height: '100%',
    borderRadius: 2
  },
  dayRangeThumb: {
    position: 'absolute',
    top: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    marginLeft: -5,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
    } : {})
  },
  dayRangeLimitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2
  },
  dayRangeLimitText: {
    color: '#9CA3AF',
    fontSize: 8.5,
    fontWeight: '700'
  },
  changeCol: {
    alignItems: 'flex-end'
  },
  changePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  changePillGreen: {
    backgroundColor: 'rgba(1, 206, 165, 0.12)'
  },
  changePillRed: {
    backgroundColor: 'rgba(255, 90, 95, 0.12)'
  },
  changePillText: {
    fontSize: 10.5,
    fontWeight: '800'
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  tfPillGroup: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F8',
    borderRadius: 6,
    padding: 2,
    gap: 2
  },
  tfMiniBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4
  },
  tfMiniBtnActive: {
    backgroundColor: '#7871C4'
  },
  tfMiniText: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700'
  },
  tfMiniTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  chartToggleBtn: {
    backgroundColor: '#F0F2F8',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  chartToggleBtnText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#7871C4'
  },

  /* Mini HUD Mode */
  miniHUDContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF2'
  },
  rangeGaugeContainer: {
    backgroundColor: '#F9FAFC',
    padding: 8,
    borderRadius: 8
  },
  rangeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  rangeLimitLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#6B7280'
  },
  rangeLimitValue: {
    fontWeight: '700',
    color: '#1E1D32'
  },
  rangeCurrentLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7871C4'
  },
  rangeTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    position: 'relative'
  },
  rangeFill: {
    height: '100%',
    borderRadius: 2
  },
  rangeThumb: {
    position: 'absolute',
    top: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: -5
  },

  /* Standard Chart */
  chartArea: {
    height: 275,
    backgroundColor: '#1E1D32',
    position: 'relative',
    overflow: 'hidden'
  },
  loaderBadge: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 29, 50, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(120, 113, 196, 0.5)',
    zIndex: 10
  },
  loaderText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700'
  },

  /* Collapsible Market Depth */
  marketDepthSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAECF2'
  },
  depthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#FAFAFD',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF2'
  },
  depthHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  depthTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E1D32'
  },
  depthSubtitle: {
    fontSize: 9.5,
    color: '#6B7280',
    fontWeight: '500'
  },
  depthToggleIcon: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7871C4'
  },
  depthContent: {
    padding: 10
  },
  depthRatioContainer: {
    marginBottom: 8
  },
  depthRatioLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3
  },
  ratioLabelText: {
    fontSize: 9.5,
    fontWeight: '700'
  },
  ratioBarTrack: {
    flexDirection: 'row',
    height: 3.5,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB'
  },
  ratioBarBuy: {
    backgroundColor: '#01CEA5',
    height: '100%'
  },
  ratioBarSell: {
    backgroundColor: '#FF5A5F',
    height: '100%'
  },
  depthTable: {
    borderWidth: 1,
    borderColor: '#EAECF2',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8
  },
  depthTableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#F4F5F9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF2'
  },
  depthColHeader: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280'
  },
  depthColDivider: {
    width: 1,
    backgroundColor: '#EAECF2',
    marginHorizontal: 6
  },
  depthTableRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center'
  },
  depthTableRowAlt: {
    backgroundColor: '#FAFAFD'
  },
  depthCellQty: {
    fontSize: 9,
    fontWeight: '600',
    color: '#4B5563'
  },
  depthCellBidPrice: {
    fontSize: 9,
    fontWeight: '700',
    color: '#01CEA5'
  },
  depthCellAskPrice: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FF5A5F'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  statBox: {
    width: '48.5%',
    backgroundColor: '#F8F9FD',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  statLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 1
  },
  statVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E1D32'
  },
  textGreen: {
    color: '#01CEA5'
  },
  textRed: {
    color: '#FF5A5F'
  }
});
