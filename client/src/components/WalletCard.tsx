import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTrading } from '../context/TradingContext';

export const WalletCard: React.FC = () => {
  const { activeMarket, account, positions } = useTrading();

  const isGlobal = activeMarket === 'GLOBAL';
  const currencySymbol = isGlobal ? '$' : '₹';
  const cash = isGlobal ? (account?.globalCash || 100000) : (account?.indiaCash || 1000000);
  const equity = isGlobal ? (account?.globalEquity || 100000) : (account?.indiaEquity || 1000000);

  const formatMoney = (val: number) => {
    return val.toLocaleString(isGlobal ? 'en-US' : 'en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + (p.pnl || 0), 0);
  const isPnlPositive = totalUnrealizedPnl >= 0;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.gradientCard}>
        {/* Subtle decorative wave / ring graphic */}
        <View style={styles.accentWaveBackground} />

        {/* Top Header Row */}
        <View style={styles.topRow}>
          <Text style={styles.walletLabel}>WALLET BALANCE</Text>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusPillText}>VIRTUAL MARGIN</Text>
          </View>
        </View>

        {/* Main Balance Display */}
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount}>
            {currencySymbol}{formatMoney(cash)}
          </Text>
        </View>

        {/* Bottom Metrics Row */}
        <View style={styles.bottomRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Portfolio Equity</Text>
            <Text style={styles.metricValue}>
              {currencySymbol}{formatMoney(equity)}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Live Unrealized P&L</Text>
            <Text style={[styles.metricValue, isPnlPositive ? styles.pnlPositive : styles.pnlNegative]}>
              {isPnlPositive ? '+' : ''}{currencySymbol}{formatMoney(totalUnrealizedPnl)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF'
  },
  gradientCard: {
    backgroundColor: '#7871C4',
    ...(Platform.OS === 'web' ? {
      backgroundImage: 'linear-gradient(135deg, #837CD2 0%, #685ECC 100%)',
      boxShadow: '0 8px 24px rgba(131, 124, 210, 0.28)'
    } : {}),
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#837CD2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4
  },
  accentWaveBackground: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  walletLabel: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#01CEA5'
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  balanceRow: {
    marginVertical: 2
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'web' ? 'Rubik, sans-serif' : undefined
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)'
  },
  metricItem: {
    flex: 1
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 9.5,
    fontWeight: '600',
    marginBottom: 1
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  pnlPositive: {
    color: '#5CFFD4'
  },
  pnlNegative: {
    color: '#FFA1A4'
  }
});
