import React, { useState } from 'react';
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

interface GamificationHubProps {
  visible: boolean;
  onClose: () => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({ visible, onClose }) => {
  const { account, activeMarket, claimDailyStreak, claimBailout } = useTrading();
  const [claimedStreakToday, setClaimedStreakToday] = useState<boolean>(false);
  const [claimedBailoutToday, setClaimedBailoutToday] = useState<boolean>(false);

  const isGlobal = activeMarket === 'GLOBAL';
  const currencySymbol = isGlobal ? '$' : '₹';

  const streakDays = account?.streakDays || 1;
  const xp = account?.xp || 1250;
  const level = account?.level || 2;
  const userCash = isGlobal ? (account?.globalCash || 100000) : (account?.indiaCash || 1000000);

  const ranks = [
    { level: 1, title: 'Novice Bull', reqXp: 0, perk: 'Basic Spot Trading & 5x Leverage' },
    { level: 2, title: 'Apprentice Trader', reqXp: 500, perk: 'Access to Bull Academy & 10x Leverage' },
    { level: 3, title: 'Day Trader', reqXp: 1500, perk: 'Weekly Trading Cup & Options Trading' },
    { level: 4, title: 'Market Strategist', reqXp: 3500, perk: '20x Leverage & Advanced Analytics' },
    { level: 5, title: 'Hedge Fund Alpha', reqXp: 7500, perk: '50x Max Leverage & Level 2 Depth' }
  ];

  const handleClaimStreak = () => {
    claimDailyStreak();
    setClaimedStreakToday(true);
    const msg = `Streak Day ${streakDays} bonus claimed! Virtual cash and XP credited to your wallet.`;
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('Streak Reward', msg);
  };

  const handleClaimBailout = () => {
    claimBailout();
    setClaimedBailoutToday(true);
    const bonus = isGlobal ? '$50,000' : '₹10,00,000';
    const msg = `Economic Stimulus Bailout approved! +${bonus} added to your virtual wallet.`;
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('Bailout Granted', msg);
  };

  const isBailoutEligible = userCash < (isGlobal ? 5000 : 50000);

  const streakDaysList = [
    { day: 1, reward: isGlobal ? '+$200' : '+₹5K', done: streakDays >= 1 },
    { day: 2, reward: isGlobal ? '+$400' : '+₹10K', done: streakDays >= 2 },
    { day: 3, reward: isGlobal ? '+$600' : '+₹15K', done: streakDays >= 3 },
    { day: 4, reward: isGlobal ? '+$800' : '+₹20K', done: streakDays >= 4 },
    { day: 5, reward: isGlobal ? '+$1,000' : '+₹25K', done: streakDays >= 5 },
    { day: 6, reward: isGlobal ? '+$1,500' : '+₹35K', done: streakDays >= 6 },
    { day: 7, reward: isGlobal ? '+$3,000' : '+₹75K', done: streakDays >= 7, big: true }
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Image
                source={{ uri: '/images/app-icons-png/Profile/Badges.png' }}
                style={styles.headerIcon}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.title}>Trader Rewards Hub</Text>
                <Text style={styles.subTitle}>Daily Streaks, Bailouts & Career Progression</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* 1. Daily Login Streak Card */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>7-Day Login Streak</Text>
                  <Text style={styles.cardSub}>Trade consecutive days for compounding rewards</Text>
                </View>
                <View style={styles.streakBadge}>
                  <Image
                    source={{ uri: '/images/app-icons-png/Fire.png' }}
                    style={{ width: 14, height: 14, marginRight: 4 }}
                    resizeMode="contain"
                  />
                  <Text style={styles.streakText}>{streakDays} Days</Text>
                </View>
              </View>

              <View style={styles.daysRow}>
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
                      <View style={styles.checkCircleMini}>
                        <Text style={styles.checkMarkMini}>✓</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, claimedStreakToday && styles.actionBtnDone]}
                onPress={handleClaimStreak}
                disabled={claimedStreakToday}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>
                  {claimedStreakToday ? '✓ Bonus Claimed for Today' : `Claim Day ${streakDays} Bonus`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. Economic Stimulus Bailout Card */}
            <View style={[styles.sectionCard, isBailoutEligible && styles.cardBailoutActive]}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.bailoutTag}>BANKRUPTCY RECOVERY</Text>
                  <Text style={styles.cardTitle}>Emergency Economic Bailout</Text>
                  <Text style={styles.cardSub}>
                    Virtual portfolio running low? Instant zero-cost capital reload so you can continue training risk-free.
                  </Text>
                </View>
                <Image
                  source={{ uri: '/images/app-icons-png/Profile/Cash.png' }}
                  style={{ width: 34, height: 34 }}
                  resizeMode="contain"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.bailoutBtn,
                  !isBailoutEligible && styles.bailoutBtnDisabled,
                  claimedBailoutToday && styles.actionBtnDone
                ]}
                onPress={handleClaimBailout}
                disabled={!isBailoutEligible || claimedBailoutToday}
                activeOpacity={0.85}
              >
                <Text style={styles.bailoutBtnText}>
                  {claimedBailoutToday
                    ? '✓ Bailout Granted'
                    : (isBailoutEligible
                        ? `Claim Free ${isGlobal ? '$50,000' : '₹10,00,000'} Bailout`
                        : `Available When Cash < ${currencySymbol}${isGlobal ? '5,000' : '50,000'}`)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 3. Career Progression */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>Trader Career Ladder</Text>
                  <Text style={styles.cardSub}>Earn XP from profitable executions and lessons</Text>
                </View>
                <View style={styles.xpPill}>
                  <Text style={styles.xpPillText}>{xp} XP</Text>
                </View>
              </View>

              <View style={styles.ranksList}>
                {ranks.map((r) => {
                  const isUnlocked = level >= r.level;
                  const isCurrent = level === r.level;

                  return (
                    <View
                      key={r.level}
                      style={[
                        styles.rankRow,
                        isCurrent && styles.rankRowCurrent,
                        isUnlocked && styles.rankRowUnlocked
                      ]}
                    >
                      <View style={styles.rankNumBadge}>
                        <Text style={[styles.rankNumText, isUnlocked && styles.rankNumTextUnlocked]}>
                          L{r.level}
                        </Text>
                      </View>
                      <View style={styles.rankInfoCol}>
                        <View style={styles.rankTitleRow}>
                          <Text style={[styles.rankTitleText, isUnlocked && styles.rankTitleTextUnlocked]}>
                            {r.title}
                          </Text>
                          {isCurrent && (
                            <View style={styles.currentBadge}>
                              <Text style={styles.currentBadgeText}>CURRENT</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.rankPerkText}>{r.perk}</Text>
                      </View>
                      <View style={styles.rankCheckRight}>
                        <Text style={[styles.rankStatusCheck, isUnlocked && styles.textGreen]}>
                          {isUnlocked ? '✓' : `${r.reqXp} XP`}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
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
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAECF2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerIcon: {
    width: 32,
    height: 32
  },
  title: {
    color: '#1E1D32',
    fontSize: 18,
    fontWeight: '800'
  },
  subTitle: {
    color: '#6B7280',
    fontSize: 12,
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
    flexGrow: 0
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  cardBailoutActive: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBF7'
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1D32'
  },
  cardSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16
  },
  bailoutTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.6,
    marginBottom: 2
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA'
  },
  streakText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C'
  },
  daysRow: {
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
    borderColor: '#E5E7EB'
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
  checkCircleMini: {
    marginTop: 2
  },
  checkMarkMini: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669'
  },
  actionBtn: {
    backgroundColor: '#837CD2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  actionBtnDone: {
    backgroundColor: '#01CEA5'
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  bailoutBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  bailoutBtnDisabled: {
    backgroundColor: '#E5E7EB'
  },
  bailoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  xpPill: {
    backgroundColor: '#F3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E0FB'
  },
  xpPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#837CD2'
  },
  ranksList: {
    gap: 8,
    marginTop: 4
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F8F9FD',
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  rankRowUnlocked: {
    backgroundColor: '#FAFCFB',
    borderColor: '#E2F3EB'
  },
  rankRowCurrent: {
    borderColor: '#837CD2',
    backgroundColor: '#F8F7FF'
  },
  rankNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  rankNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280'
  },
  rankNumTextUnlocked: {
    color: '#837CD2'
  },
  rankInfoCol: {
    flex: 1
  },
  rankTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  rankTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1D32'
  },
  rankTitleTextUnlocked: {
    color: '#1E1D32'
  },
  currentBadge: {
    backgroundColor: '#837CD2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  rankPerkText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1
  },
  rankCheckRight: {
    marginLeft: 8
  },
  rankStatusCheck: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF'
  },
  textGreen: {
    color: '#01CEA5',
    fontWeight: '800'
  }
});
