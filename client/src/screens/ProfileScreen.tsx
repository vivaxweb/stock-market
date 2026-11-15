import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  Platform,
  Alert
} from 'react-native';
import { useTrading } from '../context/TradingContext';

interface ProfileScreenProps {
  onOpenPaywall?: () => void;
  onNavigateTrade?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenPaywall, onNavigateTrade }) => {
  const {
    activeMarket,
    account,
    claimDailyStreak,
    claimBailout
  } = useTrading();

  const streakDays = account?.streakDays || 5;
  const rewindTokens = account?.undoTokens || 5;
  const claimStreak = claimDailyStreak;
  const resetAccount = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
        window.location.reload();
      }
    } catch (e) {}
  };

  const [claimedToday, setClaimedToday] = useState<boolean>(false);
  const [bailoutClaimed, setBailoutClaimed] = useState<boolean>(false);

  const isGlobal = activeMarket === 'GLOBAL';
  const currencySymbol = isGlobal ? '$' : '₹';


  const handleClaimStreak = async () => {
    try {
      await claimStreak();
      setClaimedToday(true);
      const msg = isGlobal ? 'Claimed +$1,000 streak cash!' : 'Claimed +₹25,000 streak cash!';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Streak Reward', msg);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaimBailout = async () => {
    try {
      await claimBailout();
      setBailoutClaimed(true);
      const msg = isGlobal ? 'Emergency Bailout Received: +$50,000 reload!' : 'Emergency Bailout Received: +₹10,00,000 reload!';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Bailout Received', msg);
    } catch (e) {
      console.error(e);
    }
  };

  const streakDaysList = [
    { day: 1, reward: isGlobal ? '+$200' : '+₹5K', done: true },
    { day: 2, reward: isGlobal ? '+$400' : '+₹10K', done: true },
    { day: 3, reward: isGlobal ? '+$600' : '+₹15K', done: true },
    { day: 4, reward: isGlobal ? '+$800' : '+₹20K', done: true },
    { day: 5, reward: isGlobal ? '+$1,000' : '+₹25K', done: streakDays >= 5 },
    { day: 6, reward: isGlobal ? '+$1,500' : '+₹35K', done: streakDays >= 6 },
    { day: 7, reward: isGlobal ? '+$3,000' : '+₹75K', done: streakDays >= 7, big: true }
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarBox}>
              <Image
                source={{ uri: '/images/app-icons-png/MenuIcons/Profile active.png' }}
                style={styles.avatarImg}
                resizeMode="contain"
              />
            </View>
            <View style={styles.profileCol}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>Alpha Trader</Text>
                <View style={styles.proTag}>
                  <Text style={styles.proTagText}>PRO PASS</Text>
                </View>
              </View>
              <Text style={styles.profileSub}>Level 4 Market Strategist</Text>
              <Text style={styles.profileMemberSince}>Member since November 2026</Text>
            </View>
          </View>
        </View>

        {/* 4 Performance Metric Cards (2x2) */}
        <View style={styles.metricsGrid}>
          {/* Card 1: Win Rate */}
          <View style={styles.metricCard}>
            <Image
              source={{ uri: '/images/app-icons-png/Profile/Profitable.png' }}
              style={styles.metricIcon}
              resizeMode="contain"
            />
            <Text style={styles.metricVal}>68.4%</Text>
            <Text style={styles.metricLabel}>Win Rate</Text>
          </View>

          {/* Card 2: Total Trades */}
          <View style={styles.metricCard}>
            <Image
              source={{ uri: '/images/app-icons-png/Profile/Trades.png' }}
              style={styles.metricIcon}
              resizeMode="contain"
            />
            <Text style={styles.metricVal}>42</Text>
            <Text style={styles.metricLabel}>Total Trades</Text>
          </View>

          {/* Card 3: Net Profit */}
          <View style={styles.metricCard}>
            <Image
              source={{ uri: '/images/app-icons-png/Profile/Cash.png' }}
              style={styles.metricIcon}
              resizeMode="contain"
            />
            <Text style={[styles.metricVal, styles.greenVal]}>
              +{currencySymbol}{isGlobal ? '1,840' : '1,42,850'}
            </Text>
            <Text style={styles.metricLabel}>Realized Profit</Text>
          </View>

          {/* Card 4: Day Streak */}
          <View style={styles.metricCard}>
            <Image
              source={{ uri: '/images/app-icons-png/Profile/Badges.png' }}
              style={styles.metricIcon}
              resizeMode="contain"
            />
            <Text style={styles.metricVal}>{streakDays} Days</Text>
            <Text style={styles.metricLabel}>Login Streak</Text>
          </View>
        </View>

        {/* 7-Day Interactive Streak Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>7-Day Daily Streak</Text>
              <Text style={styles.sectionSubtitle}>Login daily to unlock exponential virtual cash</Text>
            </View>
            <View style={styles.streakCountBadge}>
              <Image
                source={{ uri: '/images/app-icons-png/Fire.png' }}
                style={{ width: 14, height: 14, marginRight: 4 }}
                resizeMode="contain"
              />
              <Text style={styles.streakCountText}>{streakDays} Days</Text>
            </View>
          </View>

          {/* 7 Day Calendar Row */}
          <View style={styles.streakDaysRow}>
            {streakDaysList.map((item) => (
              <View
                key={item.day}
                style={[
                  styles.dayBox,
                  item.done && styles.dayBoxDone,
                  item.big && styles.dayBoxBig
                ]}
              >
                <Text style={[styles.dayLabel, item.done && styles.dayLabelDone]}>
                  D{item.day}
                </Text>
                <Text style={[styles.dayRewardText, item.done && styles.dayRewardDone]}>
                  {item.reward}
                </Text>
                {item.done && (
                  <View style={styles.checkPill}>
                    <Text style={styles.checkPillMark}>✓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Claim Streak Button */}
          <TouchableOpacity
            style={[styles.claimStreakBtn, claimedToday && styles.claimStreakBtnDone]}
            onPress={handleClaimStreak}
            disabled={claimedToday}
            activeOpacity={0.8}
          >
            <Text style={styles.claimStreakBtnText}>
              {claimedToday ? '✓ Bonus Claimed for Today' : 'Claim Daily Reward (+Cash)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Economic Bailout Protection Card */}
        <View style={styles.bailoutCard}>
          <View style={styles.bailoutLeft}>
            <Text style={styles.bailoutTag}>BANKRUPTCY BAILOUT</Text>
            <Text style={styles.bailoutTitle}>
              Zero Out? Reload {currencySymbol}{isGlobal ? '50,000' : '10,00,000'}
            </Text>
            <Text style={styles.bailoutDesc}>
              Instant zero-cost replenishment to practice high-risk strategies risk-free.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bailoutBtn, bailoutClaimed && styles.bailoutBtnDone]}
            onPress={handleClaimBailout}
            disabled={bailoutClaimed}
            activeOpacity={0.8}
          >
            <Text style={styles.bailoutBtnText}>
              {bailoutClaimed ? 'Claimed' : 'Bailout'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* PRO Membership Banner Card */}
        <View style={styles.proPassCard}>
          <View style={styles.proPassHeader}>
            <Image
              source={{ uri: '/images/app-icons-png/IAP/ProIcon.png' }}
              style={styles.proPassIcon}
              resizeMode="contain"
            />
            <View style={styles.proPassCol}>
              <Text style={styles.proPassTitle}>MockBull PRO Active</Text>
              <Text style={styles.proPassSub}>All VIP Features Unlocked 100% Free</Text>
            </View>
          </View>

          <View style={styles.proFeaturesList}>
            <View style={styles.proFeatureRow}>
              <Text style={styles.proCheck}>✓</Text>
              <Text style={styles.proFeatureText}>Unlimited Rewind Tokens ({rewindTokens} available)</Text>
            </View>
            <View style={styles.proFeatureRow}>
              <Text style={styles.proCheck}>✓</Text>
              <Text style={styles.proFeatureText}>50x Max Leverage on BSE/NSE & Crypto</Text>
            </View>
            <View style={styles.proFeatureRow}>
              <Text style={styles.proCheck}>✓</Text>
              <Text style={styles.proFeatureText}>Level 2 Depth & Instant BSE Execution</Text>
            </View>
            <View style={styles.proFeatureRow}>
              <Text style={styles.proCheck}>✓</Text>
              <Text style={styles.proFeatureText}>Zero Ads & Priority Leaderboard Ranking</Text>
            </View>
          </View>

          {onOpenPaywall && (
            <TouchableOpacity
              style={styles.proPassButton}
              onPress={onOpenPaywall}
              activeOpacity={0.8}
            >
              <Text style={styles.proPassButtonText}>View PRO Privileges</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Reset / Danger Zone */}
        <View style={styles.dangerCard}>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              if (Platform.OS === 'web') {
                if (confirm('Reset your portfolio to initial capital?')) {
                  resetAccount();
                }
              } else {
                Alert.alert(
                  'Reset Account',
                  'Are you sure you want to reset your paper portfolio?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reset', style: 'destructive', onPress: () => resetAccount() }
                  ]
                );
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.resetBtnText}>Reset Paper Portfolio to Default</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#837CD2'
  },
  avatarImg: {
    width: 34,
    height: 34
  },
  profileCol: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E1D32'
  },
  proTag: {
    backgroundColor: '#837CD2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  proTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  profileSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280'
  },
  profileMemberSince: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  metricIcon: {
    width: 22,
    height: 22,
    marginBottom: 8
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1D32',
    marginBottom: 2
  },
  greenVal: {
    color: '#01CEA5'
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600'
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1D32'
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2
  },
  streakCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA'
  },
  streakCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C'
  },
  streakDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 4
  },
  dayBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FD',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative'
  },
  dayBoxDone: {
    backgroundColor: '#EDFAF5',
    borderColor: '#A7F3D0'
  },
  dayBoxBig: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBEB'
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 2
  },
  dayLabelDone: {
    color: '#01CEA5'
  },
  dayRewardText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563'
  },
  dayRewardDone: {
    color: '#059669'
  },
  checkPill: {
    marginTop: 2
  },
  checkPillMark: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669'
  },
  claimStreakBtn: {
    backgroundColor: '#837CD2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  claimStreakBtnDone: {
    backgroundColor: '#01CEA5'
  },
  claimStreakBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  bailoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7AA'
  },
  bailoutLeft: {
    flex: 1,
    paddingRight: 10
  },
  bailoutTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.6,
    marginBottom: 2
  },
  bailoutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1D32',
    marginBottom: 4
  },
  bailoutDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16
  },
  bailoutBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  bailoutBtnDone: {
    backgroundColor: '#9CA3AF'
  },
  bailoutBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  proPassCard: {
    backgroundColor: '#F3F2FD',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E0FB'
  },
  proPassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  proPassIcon: {
    width: 32,
    height: 32
  },
  proPassCol: {
    flex: 1
  },
  proPassTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1D32'
  },
  proPassSub: {
    fontSize: 11,
    color: '#6B7280'
  },
  proFeaturesList: {
    gap: 6,
    marginBottom: 14
  },
  proFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  proCheck: {
    fontSize: 12,
    fontWeight: '800',
    color: '#01CEA5'
  },
  proFeatureText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600'
  },
  proPassButton: {
    backgroundColor: '#837CD2',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  proPassButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  dangerCard: {
    marginBottom: 20
  },
  resetBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626'
  }
});
