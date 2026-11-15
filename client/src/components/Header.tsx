import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTrading } from '../context/TradingContext';

interface HeaderProps {
  onOpenStreak: () => void;
  onOpenPaywall: () => void;
  onOpenMenu?: () => void;
  compact?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStreak,
  onOpenPaywall,
  onOpenMenu,
  compact = false
}) => {
  const { activeMarket, switchMarket, account, connected } = useTrading();

  const isGlobal = activeMarket === 'GLOBAL';
  const currencySymbol = isGlobal ? '$' : '₹';
  const cash = isGlobal ? (account?.globalCash || 100000) : (account?.indiaCash || 1000000);
  const equity = isGlobal ? (account?.globalEquity || 100000) : (account?.indiaEquity || 1000000);

  const formatMoney = (val: number) => {
    return val.toLocaleString(isGlobal ? 'en-US' : 'en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        {/* Left: Brand Icon & Title */}
        <View style={styles.brandContainer}>
          <TouchableOpacity onPress={onOpenMenu} activeOpacity={0.7} style={styles.burgerTouch}>
            <Image
              source={{ uri: '/images/burgerBlack30@3x.png' }}
              style={styles.burgerIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.brandTitle}>
            MOCK<Text style={styles.brandHighlight}>BULL</Text>
          </Text>
          <View style={[styles.statusDot, { backgroundColor: connected ? '#01CEA5' : '#FF5A5F' }]} />
        </View>

        {/* Dual Market Switcher Pill Toggle */}
        <View style={styles.marketToggle}>
          <TouchableOpacity
            style={[styles.marketBtn, isGlobal && styles.marketBtnActive]}
            onPress={() => switchMarket('GLOBAL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.marketText, isGlobal && styles.marketTextActive]}>Global</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.marketBtn, !isGlobal && styles.marketBtnActive]}
            onPress={() => switchMarket('INDIA')}
            activeOpacity={0.8}
          >
            <Text style={[styles.marketText, !isGlobal && styles.marketTextActive]}>India</Text>
          </TouchableOpacity>
        </View>


        {/* Badges: Streak & PRO */}
        <View style={styles.badges}>
          <TouchableOpacity style={styles.streakBadge} onPress={onOpenStreak} activeOpacity={0.8}>
            <Image
              source={{ uri: '/images/app-icons-png/Fire.png' }}
              style={styles.streakIcon}
              resizeMode="contain"
            />
            <Text style={styles.streakText}>{account?.streakDays || 1}d</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.proBadge} onPress={onOpenPaywall} activeOpacity={0.8}>
            <View style={[styles.proDot, { backgroundColor: account?.isPro ? '#01CEA5' : '#FF5A5F' }]} />
            <Text style={styles.proText}>PRO</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Balance Summary Header Bar - Hidden in compact mode to eliminate clutter */}
      {!compact && (
        <View style={styles.balanceCard}>
          <View style={styles.balanceCol}>
            <Text style={styles.balanceLabel}>VIRTUAL BALANCE</Text>
            <Text style={styles.balanceValue}>
              {currencySymbol}{formatMoney(cash)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.balanceCol}>
            <Text style={styles.balanceLabel}>PORTFOLIO EQUITY</Text>
            <Text style={[styles.balanceValue, equity >= cash ? styles.textGreen : styles.textRed]}>
              {currencySymbol}{formatMoney(equity)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rankCol}>
            <Text style={styles.balanceLabel}>RANK</Text>
            <Text style={styles.rankValue}>{account?.rankTitle || 'Day Trader'}</Text>
            <Text style={styles.xpText}>{account?.xp || 1250} XP</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF2'
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  burgerTouch: {
    padding: 4
  },
  burgerIcon: {
    width: 20,
    height: 20,
    tintColor: '#1E1D32'
  },
  brandTitle: {
    color: '#1E1D32',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  brandHighlight: {
    color: '#7871C4'
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  marketToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F8',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  marketBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  marketBtnActive: {
    backgroundColor: '#7871C4'
  },
  marketText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700'
  },
  marketTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 4
  },
  streakIcon: {
    width: 14,
    height: 14
  },
  streakText: {
    color: '#C2410C',
    fontSize: 11,
    fontWeight: '700'
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6
  },
  proDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  proText: {
    color: '#1E1D32',
    fontSize: 11,
    fontWeight: '800'
  },
  compactCashBadge: {
    backgroundColor: '#F0F2F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  compactCashText: {
    color: '#1E1D32',
    fontSize: 12,
    fontWeight: '800'
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FD',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  balanceCol: {
    flex: 1
  },
  rankCol: {
    alignItems: 'flex-end',
    minWidth: 80
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#EAECF2',
    marginHorizontal: 10
  },
  balanceLabel: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  balanceValue: {
    color: '#1E1D32',
    fontSize: 14,
    fontWeight: '800'
  },
  rankValue: {
    color: '#1E1D32',
    fontSize: 12,
    fontWeight: '800'
  },
  xpText: {
    color: '#7871C4',
    fontSize: 10,
    fontWeight: '700'
  },
  textGreen: {
    color: '#01CEA5'
  },
  textRed: {
    color: '#FF5A5F'
  }
});
