import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Platform
} from 'react-native';
import { useTrading, Position, Asset } from '../context/TradingContext';
import { AssetIcon } from '../components/AssetIcon';

interface DashboardScreenProps {
  onNavigateTrade: (asset?: Asset) => void;
  onOpenStreak: () => void;
  onOpenAssetSelector?: () => void;
}

const MiniSparkline: React.FC<{ isPositive: boolean }> = ({ isPositive }) => {
  const strokeColor = isPositive ? '#01CEA5' : '#FF5A5F';
  const fillColor = isPositive ? 'rgba(1, 206, 165, 0.14)' : 'rgba(255, 90, 95, 0.14)';
  const strokePath = isPositive
    ? 'M 2,18 C 14,22 24,14 36,8 C 48,15 56,4 66,7'
    : 'M 2,6 C 14,10 24,5 36,16 C 48,12 56,22 66,20';
  const fillPath = `${strokePath} L 66,26 L 2,26 Z`;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.sparklineContainer}>
        <svg viewBox="0 0 68 26" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <path d={fillPath} fill={fillColor} />
          <path
            d={strokePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </View>
    );
  }
  return null;
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateTrade,
  onOpenStreak,
  onOpenAssetSelector
}) => {
  const {
    activeMarket,
    account,
    positions,
    assets,
    closeTrade,
    undoTrade
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');

  const isGlobal = activeMarket === 'GLOBAL';
  const currencySymbol = isGlobal ? '$' : '₹';
  const cash = isGlobal ? (account?.globalCash || 100000) : (account?.indiaCash || 1000000);
  const equity = isGlobal ? (account?.globalEquity || 100000) : (account?.indiaEquity || 1000000);
  const netProfit = equity - cash;

  const formatPrice = (val: number) => {
    return val.toLocaleString(isGlobal ? 'en-US' : 'en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Default sample trades if user has no positions yet (Matching Screen 2 parity)
  const defaultSamplePositions = isGlobal ? [
    {
      id: 'sample_btc',
      symbol: 'BTC/USD',
      name: 'Bitcoin',
      side: 'BUY',
      entryPrice: 64200,
      pnl: 520.00,
      pnlPercentage: 12.4
    },
    {
      id: 'sample_aapl',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      side: 'BUY',
      entryPrice: 228.40,
      pnl: 285.50,
      pnlPercentage: 6.8
    },
    {
      id: 'sample_eth',
      symbol: 'ETH/USD',
      name: 'Ethereum',
      side: 'BUY',
      entryPrice: 2640,
      pnl: 194.20,
      pnlPercentage: 8.5
    }
  ] : [
    {
      id: 'sample_nifty',
      symbol: 'NIFTY 50 24200 CE',
      name: 'NIFTY 50 24200 CE',
      side: 'BUY',
      entryPrice: 130,
      pnl: 4250.00,
      pnlPercentage: 22.8
    },
    {
      id: 'sample_ril',
      symbol: 'RELIANCE',
      name: 'Reliance Industries',
      side: 'BUY',
      entryPrice: 2740,
      pnl: 1850.00,
      pnlPercentage: 5.4
    },
    {
      id: 'sample_hdfc',
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd',
      side: 'BUY',
      entryPrice: 1720,
      pnl: 940.00,
      pnlPercentage: 3.8
    }
  ];

  // Closed trade history records
  const closedHistory = [
    {
      id: 'h_1',
      symbol: isGlobal ? 'BTC/USD' : 'NIFTY 50 24200 CE',
      name: isGlobal ? 'Bitcoin' : 'NIFTY 50 24200 CE',
      side: 'BUY',
      entryPrice: isGlobal ? 62400 : 115,
      pnl: isGlobal ? 420.50 : 3850.00,
      pnlPercent: 14.2,
      date: 'Yesterday'
    },
    {
      id: 'h_2',
      symbol: isGlobal ? 'TSLA' : 'RELIANCE',
      name: isGlobal ? 'Tesla Inc' : 'Reliance Industries',
      side: 'BUY',
      entryPrice: isGlobal ? 254.80 : 2780,
      pnl: isGlobal ? -125.00 : -1420.00,
      pnlPercent: -4.5,
      date: '2 days ago'
    },
    {
      id: 'h_3',
      symbol: isGlobal ? 'AAPL' : 'HDFCBANK',
      name: isGlobal ? 'Apple Inc.' : 'HDFC Bank Ltd',
      side: 'BUY',
      entryPrice: isGlobal ? 218.50 : 1690,
      pnl: isGlobal ? 310.20 : 2100.00,
      pnlPercent: 8.9,
      date: '3 days ago'
    }
  ];

  // Display value for Weekly Performance
  const displayWeeklyProfit = netProfit !== 0 ? netProfit : (isGlobal ? 4250.80 : 34850.00);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 0. Clean Search Prompt Bar (Groww & Zerodha Kite Parity) */}
      {onOpenAssetSelector && (
        <TouchableOpacity
          style={styles.searchPromptBar}
          onPress={onOpenAssetSelector}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: '/images/app-icons-png/SearchGray.png' }}
            style={styles.searchPromptIcon}
            resizeMode="contain"
          />
          <Text style={styles.searchPromptText}>
            {isGlobal
              ? 'Search 50+ instruments (AAPL, NVDA, BTC, Gold)...'
              : 'Search 50+ stocks & indices (NIFTY, Reliance, Tata)...'}
          </Text>
          <View style={styles.searchPromptBadge}>
            <Text style={styles.searchPromptBadgeText}>{assets.length}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* 1. Hero Card: Three Investeers 'Weekly Performance' (Concept 2 Parity) */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>✦ WEEKLY PERFORMANCE</Text>
          </View>
          <Text style={styles.heroEquityBadge}>
            Equity: {currencySymbol}{formatPrice(equity)}
          </Text>
        </View>

        <Text style={styles.heroBalance}>
          +{currencySymbol}{formatPrice(Math.abs(displayWeeklyProfit))}
        </Text>

        <View style={styles.heroStatsRow}>
          <Text style={styles.heroStatItem}>Win Rate: 74%</Text>
          <Text style={styles.heroStatDot}>•</Text>
          <Text style={styles.heroStatItem}>Trades: 28</Text>
          <Text style={styles.heroStatDot}>•</Text>
          <Text style={styles.heroStatItem}>Best: +42.8%</Text>
        </View>

        {/* Smooth Undulating SVG Wave Curve */}
        <View style={styles.waveContainer}>
          {Platform.OS === 'web' ? (
            <svg viewBox="0 0 320 70" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              {/* Wave Area Fill */}
              <path
                d="M 0,45 C 50,60 90,20 150,38 C 210,56 260,15 320,30 L 320,70 L 0,70 Z"
                fill="url(#waveGrad)"
              />
              {/* Wave Stroke Line */}
              <path
                d="M 0,45 C 50,60 90,20 150,38 C 210,56 260,15 320,30"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <View style={styles.waveBarGroup}>
              {[18, 26, 22, 34, 30, 42, 38, 48, 54, 50, 62, 58, 70, 78].map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveColumn,
                    {
                      height: h,
                      backgroundColor: i === 13 ? '#01CEA5' : 'rgba(255, 255, 255, 0.45)'
                    }
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Streak Notification Banner */}
        <TouchableOpacity style={styles.heroStreakStrip} onPress={onOpenStreak} activeOpacity={0.8}>
          <Image
            source={{ uri: '/images/app-icons-png/Fire.png' }}
            style={{ width: 16, height: 16 }}
            resizeMode="contain"
          />
          <Text style={styles.heroStreakText}>
            Day {account?.streakDays || 1} Streak active. Claim today's bonus!
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Segmented Trades Switcher (Open Trades vs Closed History) */}
      <View style={styles.tradesSection}>
        <View style={styles.segmentedTabRow}>
          <TouchableOpacity
            style={[styles.segmentedTab, activeTab === 'open' && styles.segmentedTabActive]}
            onPress={() => setActiveTab('open')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentedTabText, activeTab === 'open' && styles.segmentedTabTextActive]}>
              Open Trades {positions.length > 0 ? `(${positions.length})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentedTab, activeTab === 'history' && styles.segmentedTabActive]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentedTabText, activeTab === 'history' && styles.segmentedTabTextActive]}>
              Closed History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Open Trades List */}
        {activeTab === 'open' && (
          <View style={styles.tradesList}>
            {positions.length > 0 ? (
              // Live active positions
              positions.map((pos: Position) => {
                const isProfit = (pos.pnl || 0) >= 0;
                return (
                  <View key={pos.id} style={styles.tradeCard}>
                    <View style={styles.tradeCardTopRow}>
                      <View style={styles.tradeLeft}>
                        <AssetIcon symbol={pos.symbol} size={42} />
                        <View style={styles.tradeNameCol}>
                          <Text style={styles.tradeAssetName}>
                            {(!pos.assetName || pos.assetName.includes('undefined'))
                              ? (pos.symbol?.includes('undefined') ? 'NIFTY 50 24200 CE' : pos.symbol)
                              : pos.assetName}
                          </Text>
                          <Text style={styles.tradeAssetSymbol}>{pos.symbol}</Text>
                        </View>
                      </View>

                      <MiniSparkline isPositive={isProfit} />

                      <View style={styles.tradeRight}>
                        <Text style={styles.tradeExecutionText}>
                          {pos.side === 'BUY' ? 'Buy' : 'Sell'} @ {formatPrice(pos.entryPrice)}
                        </Text>
                        <Text style={[styles.tradePnlValue, isProfit ? styles.textGreen : styles.textRed]}>
                          {isProfit ? '+' : ''}{(pos.pnlPercentage || 0).toFixed(1)}% ({currencySymbol}{formatPrice(Math.abs(pos.pnl || 0))})
                        </Text>
                      </View>
                    </View>

                    {/* Inline Quick Action Controls */}
                    <View style={styles.cardActionRow}>
                      <TouchableOpacity
                        style={styles.closeActionBtn}
                        onPress={() => closeTrade(pos.id)}
                      >
                        <Text style={styles.closeActionText}>Close Trade</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.undoActionBtn}
                        onPress={() => undoTrade(pos.id)}
                      >
                        <Text style={styles.undoActionText}>Undo Token ({(account?.undoTokens || 0)})</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              // Sample positions from Screen 2 to match mockup aesthetic
              defaultSamplePositions.map(sample => (
                <View key={sample.id} style={styles.tradeCard}>
                  <View style={styles.tradeCardTopRow}>
                    <View style={styles.tradeLeft}>
                      <AssetIcon symbol={sample.symbol} size={42} />
                      <View style={styles.tradeNameCol}>
                        <Text style={styles.tradeAssetName}>{sample.name}</Text>
                        <Text style={styles.tradeAssetSymbol}>{sample.symbol}</Text>
                      </View>
                    </View>

                    <MiniSparkline isPositive={sample.pnl >= 0} />

                    <View style={styles.tradeRight}>
                      <Text style={styles.tradeExecutionText}>
                        Buy @ {formatPrice(sample.entryPrice)}
                      </Text>
                      <Text style={[styles.tradePnlValue, styles.textGreen]}>
                        +{sample.pnlPercentage}% ({currencySymbol}{formatPrice(sample.pnl)})
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActionRow}>
                    <TouchableOpacity
                      style={styles.tradeNowActionBtn}
                      onPress={() => onNavigateTrade()}
                    >
                      <Text style={styles.tradeNowActionText}>Trade Live →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Closed History List */}
        {activeTab === 'history' && (
          <View style={styles.tradesList}>
            {closedHistory.map(item => {
              const isProfit = item.pnl >= 0;
              return (
                <View key={item.id} style={styles.tradeCard}>
                  <View style={styles.tradeCardTopRow}>
                    <View style={styles.tradeLeft}>
                      <AssetIcon symbol={item.symbol} size={42} />
                      <View style={styles.tradeNameCol}>
                        <Text style={styles.tradeAssetName}>{item.name}</Text>
                        <Text style={styles.tradeAssetSymbol}>{item.date}</Text>
                      </View>
                    </View>

                    <MiniSparkline isPositive={isProfit} />

                    <View style={styles.tradeRight}>
                      <Text style={styles.tradeExecutionText}>
                        Buy @ {formatPrice(item.entryPrice)}
                      </Text>
                      <Text style={[styles.tradePnlValue, isProfit ? styles.textGreen : styles.textRed]}>
                        {isProfit ? '+' : ''}{item.pnlPercent}% ({currencySymbol}{formatPrice(Math.abs(item.pnl))})
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* 3. Top Market Movers (Clean White Cards) */}
      <View style={styles.moversSection}>
        <View style={styles.moversHeaderRow}>
          <Text style={styles.moversTitle}>Top Market Movers</Text>
          {onOpenAssetSelector && (
            <TouchableOpacity style={styles.viewAllPill} onPress={onOpenAssetSelector} activeOpacity={0.8}>
              <Text style={styles.viewAllText}>Search &amp; All ({assets.length}) →</Text>
            </TouchableOpacity>
          )}
        </View>
        {assets.slice(0, 5).map((asset: Asset) => {
          const isProfit = (asset.change24h || 0) >= 0;
          return (
            <TouchableOpacity
              key={asset.symbol}
              style={styles.moverRow}
              onPress={() => onNavigateTrade(asset)}
              activeOpacity={0.8}
            >
              <View style={styles.moverLeft}>
                <AssetIcon symbol={asset.symbol} size={36} />
                <View style={styles.moverNameCol}>
                  <Text style={styles.moverSymbol}>{asset.symbol}</Text>
                  <Text style={styles.moverName}>{asset.name}</Text>
                </View>
              </View>
              <View style={styles.moverRight}>
                <Text style={styles.moverPrice}>
                  {currencySymbol}{formatPrice(asset.price)}
                </Text>
                <View style={[styles.moverBadge, isProfit ? styles.badgeGreen : styles.badgeRed]}>
                  <Text style={[styles.moverBadgeText, isProfit ? styles.textGreen : styles.textRed]}>
                    {isProfit ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD'
  },
  scrollContent: {
    paddingBottom: 48
  },
  searchPromptBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 0,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  searchPromptIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
    tintColor: '#7871C4'
  },
  searchPromptText: {
    flex: 1,
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600'
  },
  searchPromptBadge: {
    backgroundColor: '#F0F2F8',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  searchPromptBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7871C4'
  },
  heroCard: {
    backgroundColor: '#837CD2',
    margin: 16,
    borderRadius: 20,
    padding: 22,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#837CD2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  heroPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 8
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  heroEquityBadge: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11.5,
    fontWeight: '700'
  },
  heroSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3
  },
  heroBalance: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6
  },
  heroStatItem: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 11.5,
    fontWeight: '600'
  },
  heroStatDot: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 10
  },
  heroAccount: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2
  },
  sparklineContainer: {
    width: 68,
    height: 26,
    marginHorizontal: 4,
    justifyContent: 'center'
  },
  waveContainer: {
    height: 70,
    marginTop: 12,
    justifyContent: 'flex-end'
  },
  waveBarGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 4
  },
  waveColumn: {
    width: 14,
    borderRadius: 4
  },
  heroStreakStrip: {
    marginTop: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  heroStreakText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  tradesSection: {
    paddingHorizontal: 16,
    marginBottom: 16
  },
  segmentedTabRow: {
    flexDirection: 'row',
    backgroundColor: '#ECEEF6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  segmentedTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  segmentedTabText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600'
  },
  segmentedTabTextActive: {
    color: '#1E1D32',
    fontWeight: '800'
  },
  tradesList: {
    gap: 12
  },
  tradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1
  },
  tradeCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  tradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  tradeNameCol: {
    gap: 2
  },
  tradeAssetName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700'
  },
  tradeAssetSymbol: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500'
  },
  tradeRight: {
    alignItems: 'flex-end',
    gap: 3
  },
  tradeExecutionText: {
    color: '#1E1D32',
    fontSize: 14,
    fontWeight: '700'
  },
  tradePnlValue: {
    fontSize: 13,
    fontWeight: '700'
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F8'
  },
  closeActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF5A5F',
    backgroundColor: '#FFF5F5'
  },
  closeActionText: {
    color: '#FF5A5F',
    fontSize: 11,
    fontWeight: '700'
  },
  undoActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#837CD2',
    backgroundColor: '#F7F6FE'
  },
  undoActionText: {
    color: '#837CD2',
    fontSize: 11,
    fontWeight: '700'
  },
  tradeNowActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6
  },
  tradeNowActionText: {
    color: '#7871C4',
    fontSize: 12,
    fontWeight: '700'
  },
  moversSection: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  moversHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  moversTitle: {
    color: '#1E1D32',
    fontSize: 16,
    fontWeight: '800'
  },
  viewAllPill: {
    backgroundColor: '#F3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  viewAllText: {
    color: '#837CD2',
    fontSize: 11,
    fontWeight: '800'
  },
  moverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAECF2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1
  },
  moverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  moverNameCol: {
    gap: 2
  },
  moverSymbol: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800'
  },
  moverName: {
    color: '#6B7280',
    fontSize: 12
  },
  moverRight: {
    alignItems: 'flex-end',
    gap: 3
  },
  moverPrice: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700'
  },
  moverBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  badgeGreen: {
    backgroundColor: '#ECFDF5'
  },
  badgeRed: {
    backgroundColor: '#FEF2F2'
  },
  moverBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  textGreen: {
    color: '#01CEA5'
  },
  textRed: {
    color: '#FF5A5F'
  }
});
