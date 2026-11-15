import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useTrading, Position } from '../context/TradingContext';

export const PositionsList: React.FC = () => {
  const { positions, closeTrade, undoTrade, activeMarket, account } = useTrading();

  const isGlobal = activeMarket === 'GLOBAL';
  const currencySymbol = isGlobal ? '$' : '₹';

  const formatPrice = (val: number) => {
    return val.toLocaleString(isGlobal ? 'en-US' : 'en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleClose = (pos: Position) => {
    const isProfit = pos.pnl >= 0;
    const msg = `Close ${pos.symbol} ${pos.side} trade for ${isProfit ? '+' : ''}${currencySymbol}${formatPrice(pos.pnl)}?`;

    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        closeTrade(pos.id);
      }
    } else {
      Alert.alert(
        'Confirm Close Trade',
        msg,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Close Trade', style: isProfit ? 'default' : 'destructive', onPress: () => closeTrade(pos.id) }
        ]
      );
    }
  };

  const handleUndo = (pos: Position) => {
    const tokens = account?.undoTokens || 0;
    if (tokens <= 0) {
      const proMsg = 'You have 0 Trade Rewind Tokens left! Upgrade to PRO or claim daily streaks to get more rewind tokens.';
      if (Platform.OS === 'web') window.alert(proMsg);
      else Alert.alert('No Tokens Left', proMsg);
      return;
    }

    const msg = `Use 1 Rewind Token to cancel this ${pos.symbol} trade at $0 loss and refund ${currencySymbol}${formatPrice(pos.margin)} margin?`;
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        undoTrade(pos.id);
      }
    } else {
      Alert.alert(
        'Rewind Trade',
        msg,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Rewind Now', onPress: () => undoTrade(pos.id) }
        ]
      );
    }
  };

  if (!positions || positions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={{ uri: '/images/app-icons-png/Profile/Portfolio.png' }}
          style={{ width: 36, height: 36, marginBottom: 8 }}
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>No Open Positions</Text>
        <Text style={styles.emptySubtitle}>
          Select an asset above and tap BUY or SELL to open your first paper trade.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          ACTIVE POSITIONS ({positions.length})
        </Text>
        <View style={styles.tokenBadge}>
          <Text style={styles.tokenText}>
            ⏪ {account?.undoTokens || 0} Rewind Tokens
          </Text>
        </View>
      </View>

      {positions.map(pos => {
        const isUp = (pos.pnl || 0) >= 0;
        const pnlColor = isUp ? '#10B981' : '#EF4444';

        return (
          <View key={pos.id} style={styles.card}>
            {/* Top Row: Symbol, Side badge, Leverage, PnL */}
            <View style={styles.cardTopRow}>
              <View style={styles.symbolInfo}>
                <Text style={styles.symbolText}>{pos.symbol}</Text>
                <View style={[styles.sideBadge, pos.side === 'BUY' ? styles.sideBuy : styles.sideSell]}>
                  <Text style={styles.sideText}>{pos.side}</Text>
                </View>
                {pos.leverage > 1 && (
                  <View style={styles.leverageBadge}>
                    <Text style={styles.leverageBadgeText}>{pos.leverage}x</Text>
                  </View>
                )}
                {pos.isOption && (
                  <View style={styles.optionBadge}>
                    <Text style={styles.optionBadgeText}>F&O</Text>
                  </View>
                )}
              </View>

              <View style={styles.pnlContainer}>
                <Text style={[styles.pnlValue, { color: pnlColor }]}>
                  {isUp ? '+' : ''}{currencySymbol}{formatPrice(pos.pnl)}
                </Text>
                <Text style={[styles.pnlPercent, { color: pnlColor }]}>
                  {isUp ? '+' : ''}{(pos.pnlPercentage || 0).toFixed(2)}%
                </Text>
              </View>
            </View>

            {/* Price & Margin Details Grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Entry Price</Text>
                <Text style={styles.gridVal}>{currencySymbol}{formatPrice(pos.entryPrice)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Current Price</Text>
                <Text style={styles.gridVal}>{currencySymbol}{formatPrice(pos.currentPrice)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Margin</Text>
                <Text style={styles.gridVal}>{currencySymbol}{formatPrice(pos.margin)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Exposure</Text>
                <Text style={styles.gridVal}>{currencySymbol}{formatPrice(pos.amount * pos.leverage)}</Text>
              </View>
            </View>

            {/* Stop Loss & Take Profit Info if set */}
            {(pos.stopLoss || pos.takeProfit) && (
              <View style={styles.stopsRow}>
                {pos.stopLoss && (
                  <Text style={styles.stopText}>
                    SL: {currencySymbol}{formatPrice(pos.stopLoss)}
                  </Text>
                )}
                {pos.takeProfit && (
                  <Text style={styles.takeProfitText}>
                    TP: {currencySymbol}{formatPrice(pos.takeProfit)}
                  </Text>
                )}
              </View>
            )}

            {/* Action Buttons Row: Rewind / Undo and Close */}
            <View style={styles.actionRow}>
              {/* If trade is in loss, allow Rewind / Undo! */}
              {!isUp && (
                <TouchableOpacity
                  style={styles.undoBtn}
                  onPress={() => handleUndo(pos)}
                >
                  <Text style={styles.undoBtnText}>⏪ Rewind Trade</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.closeBtn, isUp ? styles.closeBtnGreen : styles.closeBtnNormal]}
                onPress={() => handleClose(pos)}
              >
                <Text style={styles.closeBtnText}>
                  {isUp ? 'Book Profit' : 'Close Position'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginBottom: 20
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  tokenBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155'
  },
  tokenText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700'
  },
  emptyContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    marginHorizontal: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 240
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  symbolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  symbolText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800'
  },
  sideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  sideBuy: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)'
  },
  sideSell: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)'
  },
  sideText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '800'
  },
  leverageBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4
  },
  leverageBadgeText: {
    color: '#F8FAFC',
    fontSize: 9,
    fontWeight: '700'
  },
  optionBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4
  },
  optionBadgeText: {
    color: '#C4B5FD',
    fontSize: 9,
    fontWeight: '700'
  },
  pnlContainer: {
    alignItems: 'flex-end'
  },
  pnlValue: {
    fontSize: 15,
    fontWeight: '800'
  },
  pnlPercent: {
    fontSize: 11,
    fontWeight: '700'
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#070A11',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8
  },
  gridItem: {
    alignItems: 'center'
  },
  gridLabel: {
    color: '#64748B',
    fontSize: 9,
    marginBottom: 2
  },
  gridVal: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600'
  },
  stopsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4
  },
  stopText: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: '600'
  },
  takeProfitText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '600'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  undoBtn: {
    flex: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8'
  },
  undoBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800'
  },
  closeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  closeBtnNormal: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155'
  },
  closeBtnGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981'
  },
  closeBtnText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700'
  }
});
