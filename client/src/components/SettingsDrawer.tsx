import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Image
} from 'react-native';
import { useTrading } from '../context/TradingContext';

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOpenStreak: () => void;
  onOpenPaywall: () => void;
  onOpenOnboarding: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  visible,
  onClose,
  onOpenStreak,
  onOpenPaywall,
  onOpenOnboarding
}) => {
  const {
    account,
    activeMarket,
    switchMarket,
    claimBailout
  } = useTrading();

  const isGlobal = activeMarket === 'GLOBAL';
  const currencySymbol = isGlobal ? '$' : '₹';
  const cash = isGlobal ? (account?.globalCash || 100000) : (account?.indiaCash || 1000000);

  const handleResetPortfolio = () => {
    if (Platform.OS === 'web') {
      if (confirm('Reset your paper portfolio to initial virtual capital? All open demo positions will be cleared.')) {
        localStorage.clear();
        window.location.reload();
      }
    } else {
      Alert.alert(
        'Reset Paper Portfolio',
        'Are you sure you want to reset your paper portfolio to initial balance?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: () => {
              try {
                localStorage.clear();
                window.location.reload();
              } catch (e) {}
            }
          }
        ]
      );
    }
  };

  const handleBailout = () => {
    claimBailout();
    const bonus = isGlobal ? '$50,000' : '₹10,00,000';
    const msg = `Economic Bailout approved! +${bonus} virtual cash reload granted.`;
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('Bailout Received', msg);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
        <View style={styles.drawerCard}>
          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.profileRow}>
              <View style={styles.avatarCircle}>
                <Image
                  source={{ uri: '/images/app-icons-png/MenuIcons/Profile active.png' }}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.profileTextCol}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>Alpha Trader</Text>
                  <View style={styles.proPill}>
                    <Text style={styles.proPillText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.rankTitle}>
                  {account?.rankTitle || 'Day Trader'} · {account?.xp || 1300} XP
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Quick Balances */}
            <View style={styles.balanceBox}>
              <Text style={styles.balanceLabel}>ACTIVE TRADING CAPITAL</Text>
              <Text style={styles.balanceVal}>
                {currencySymbol}{cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.balanceSub}>100% Risk-Free Simulation</Text>
            </View>

            {/* Market & Region */}
            <Text style={styles.sectionHeader}>MARKET SELECTION</Text>
            <View style={styles.marketRow}>
              <TouchableOpacity
                style={[styles.marketOption, !isGlobal && styles.marketOptionActive]}
                onPress={() => {
                  switchMarket('INDIA');
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.marketOptionTitle, !isGlobal && styles.marketOptionTitleActive]}>
                  Indian Markets
                </Text>
                <Text style={styles.marketOptionSub}>BSE, NSE, Sensex & Nifty F&O (₹)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.marketOption, isGlobal && styles.marketOptionActive]}
                onPress={() => {
                  switchMarket('GLOBAL');
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.marketOptionTitle, isGlobal && styles.marketOptionTitleActive]}>
                  Global Markets
                </Text>
                <Text style={styles.marketOptionSub}>Binance Crypto, US Tech & FX ($)</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Tools */}
            <Text style={styles.sectionHeader}>TRADER PRIVILEGES & REWARDS</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenStreak();
              }}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: '/images/app-icons-png/Fire.png' }}
                style={styles.menuItemIcon}
                resizeMode="contain"
              />
              <View style={styles.menuItemCol}>
                <Text style={styles.menuItemTitle}>Daily Login Streak</Text>
                <Text style={styles.menuItemSub}>Claim bonus cash & boost trader XP</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleBailout}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: '/images/app-icons-png/Profile/Cash.png' }}
                style={styles.menuItemIcon}
                resizeMode="contain"
              />
              <View style={styles.menuItemCol}>
                <Text style={styles.menuItemTitle}>Emergency Economic Bailout</Text>
                <Text style={styles.menuItemSub}>Instant ₹10,00,000 / $50,000 reload</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenPaywall();
              }}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: '/images/app-icons-png/IAP/ProIcon.png' }}
                style={styles.menuItemIcon}
                resizeMode="contain"
              />
              <View style={styles.menuItemCol}>
                <Text style={styles.menuItemTitle}>MockBull PRO Privileges</Text>
                <Text style={styles.menuItemSub}>50x Max Leverage, Level 2 Depth & Ad-Free</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>

            {/* Preferences */}
            <Text style={styles.sectionHeader}>PREFERENCES & DATA</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenOnboarding();
              }}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: '/images/app-icons-png/School/SchoolProgressIcon.png' }}
                style={styles.menuItemIcon}
                resizeMode="contain"
              />
              <View style={styles.menuItemCol}>
                <Text style={styles.menuItemTitle}>Replay Onboarding Tour</Text>
                <Text style={styles.menuItemSub}>Review simulator guides & goals</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.dangerItem]}
              onPress={handleResetPortfolio}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemCol}>
                <Text style={styles.dangerItemTitle}>Reset Paper Portfolio</Text>
                <Text style={styles.menuItemSub}>Restore default cash balance & clear trades</Text>
              </View>
              <Text style={styles.dangerItemAction}>Reset</Text>
            </TouchableOpacity>

            {/* App Footer */}
            <View style={styles.appFooter}>
              <Text style={styles.appFooterTitle}>MockBull Simulator v2.4</Text>
              <Text style={styles.appFooterDesc}>
                100% Free Virtual Paper Trading · Built with TradingView · Zero Financial Risk
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    flexDirection: 'row'
  },
  backdropTouch: {
    flex: 1
  },
  drawerCard: {
    width: '82%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    height: '100%',
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#EAECF2',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 24 : 10
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#837CD2'
  },
  profileTextCol: {
    justifyContent: 'center'
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1D32'
  },
  proPill: {
    backgroundColor: '#837CD2',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6
  },
  proPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  rankTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeBtnText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '700'
  },
  scrollArea: {
    flex: 1
  },
  balanceBox: {
    backgroundColor: '#F8F9FD',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#837CD2',
    letterSpacing: 0.6
  },
  balanceVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E1D32',
    marginVertical: 4
  },
  balanceSub: {
    fontSize: 11,
    color: '#01CEA5',
    fontWeight: '700'
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 6
  },
  marketRow: {
    gap: 8,
    marginBottom: 18
  },
  marketOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#EAECF2'
  },
  marketOptionActive: {
    borderColor: '#837CD2',
    backgroundColor: '#F8F7FF'
  },
  marketOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563'
  },
  marketOptionTitleActive: {
    color: '#837CD2',
    fontWeight: '800'
  },
  marketOptionSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12
  },
  menuItemIcon: {
    width: 22,
    height: 22
  },
  menuItemCol: {
    flex: 1
  },
  menuItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1D32'
  },
  menuItemSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2
  },
  menuItemArrow: {
    fontSize: 14,
    color: '#837CD2',
    fontWeight: '800'
  },
  dangerItem: {
    marginTop: 4
  },
  dangerItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626'
  },
  dangerItemAction: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626'
  },
  appFooter: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 4
  },
  appFooterTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280'
  },
  appFooterDesc: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 8
  }
});
