import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  ActivityIndicator
} from 'react-native';
import { useTrading } from '../context/TradingContext';

interface LeaderboardScreenProps {
  onOpenTrade?: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = () => {
  const { activeMarket } = useTrading();
  const [selectedLeague, setSelectedLeague] = useState<'GLOBAL' | 'INDIA'>(
    activeMarket === 'GLOBAL' ? 'GLOBAL' : 'INDIA'
  );
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedLeague]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/gamification/leaderboard?market=${selectedLeague}`);
      const data = await res.json();
      if (data.leaderboard && data.leaderboard.length > 0) {
        setLeaderboardData(data.leaderboard);
      } else {
        setLeaderboardData(getDefaultData(selectedLeague));
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard', e);
      setLeaderboardData(getDefaultData(selectedLeague));
    } finally {
      setLoading(false);
    }
  };

  const getDefaultData = (league: 'GLOBAL' | 'INDIA') => {
    if (league === 'INDIA') {
      return [
        { rank: 1, name: 'Aarav Sharma', roi: '+142.8%', trades: 84, winRate: '78%', avatar: 'IN' },
        { rank: 2, name: 'Priya Patel', roi: '+118.4%', trades: 62, winRate: '74%', avatar: 'IN' },
        { rank: 3, name: 'Rohan Verma', roi: '+96.2%', trades: 51, winRate: '70%', avatar: 'IN' },
        { rank: 4, name: 'Vikram Malhotra', roi: '+84.1%', trades: 44, winRate: '68%', avatar: 'IN' },
        { rank: 5, name: 'Ananya Iyer', roi: '+72.6%', trades: 39, winRate: '67%', avatar: 'IN' },
        { rank: 6, name: 'Siddharth Rao', roi: '+65.3%', trades: 36, winRate: '64%', avatar: 'IN' },
        { rank: 7, name: 'Kavita Joshi', roi: '+58.9%', trades: 28, winRate: '62%', avatar: 'IN' },
        { rank: 8, name: 'Rahul Singhania', roi: '+52.4%', trades: 31, winRate: '61%', avatar: 'IN' },
        { rank: 9, name: 'Deepak Mehta', roi: '+47.8%', trades: 25, winRate: '60%', avatar: 'IN' },
        { rank: 10, name: 'Neha Kapoor', roi: '+44.2%', trades: 22, winRate: '59%', avatar: 'IN' }
      ];
    }
    return [
      { rank: 1, name: 'Satoshi_Whale', roi: '+214.6%', trades: 112, winRate: '82%', avatar: 'GL' },
      { rank: 2, name: 'Alex_Vanderbilt', roi: '+178.2%', trades: 94, winRate: '77%', avatar: 'US' },
      { rank: 3, name: 'Elena_Rostova', roi: '+135.0%', trades: 73, winRate: '73%', avatar: 'UK' },
      { rank: 4, name: 'Kenji_Sato', roi: '+98.4%', trades: 56, winRate: '69%', avatar: 'JP' },
      { rank: 5, name: 'Lucas_Silva', roi: '+84.7%', trades: 48, winRate: '66%', avatar: 'BR' },
      { rank: 6, name: 'Chloe_Dubois', roi: '+76.1%', trades: 41, winRate: '65%', avatar: 'FR' },
      { rank: 7, name: 'Marcus_Berg', roi: '+68.5%', trades: 37, winRate: '63%', avatar: 'DE' },
      { rank: 8, name: 'Liam_Smith', roi: '+59.2%', trades: 33, winRate: '61%', avatar: 'AU' },
      { rank: 9, name: 'Chen_Wei', roi: '+53.8%', trades: 29, winRate: '60%', avatar: 'SG' },
      { rank: 10, name: 'Mateo_Alvarez', roi: '+48.0%', trades: 26, winRate: '58%', avatar: 'ES' }
    ];
  };

  const top1 = leaderboardData[0];
  const top2 = leaderboardData[1];
  const top3 = leaderboardData[2];
  const restTraders = leaderboardData.slice(3);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.screenHeader}>
          <View>
            <Text style={styles.screenTitle}>Trading Cup</Text>
            <Text style={styles.screenSubtitle}>Weekly Global & National Championships</Text>
          </View>
          <View style={styles.cupIconPill}>
            <Image
              source={{ uri: '/images/app-icons-png/Profile/Cup.png' }}
              style={styles.cupIcon}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Prize Pool Hero Card */}
        <View style={styles.prizeCard}>
          <View style={styles.prizeLeftCol}>
            <Text style={styles.prizeTag}>SEASON 12 TOURNAMENT</Text>
            <Text style={styles.prizeAmount}>
              {selectedLeague === 'INDIA' ? '₹5,00,000' : '$10,000'}
            </Text>
            <Text style={styles.prizeSubtext}>Total Virtual Cash & Trophy Pool</Text>
          </View>
          <View style={styles.timerBadge}>
            <Text style={styles.timerLabel}>ENDS IN</Text>
            <Text style={styles.timerVal}>2d 14h</Text>
          </View>
        </View>

        {/* League Switcher */}
        <View style={styles.leagueSwitch}>
          <TouchableOpacity
            style={[styles.leagueBtn, selectedLeague === 'INDIA' && styles.leagueBtnActive]}
            onPress={() => setSelectedLeague('INDIA')}
            activeOpacity={0.8}
          >
            <Text style={[styles.leagueBtnText, selectedLeague === 'INDIA' && styles.leagueBtnTextActive]}>
              Indian Championship
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.leagueBtn, selectedLeague === 'GLOBAL' && styles.leagueBtnActive]}
            onPress={() => setSelectedLeague('GLOBAL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.leagueBtnText, selectedLeague === 'GLOBAL' && styles.leagueBtnTextActive]}>
              Global League
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#837CD2" />
            <Text style={styles.loadingText}>Loading Tournament Standings...</Text>
          </View>
        ) : (
          <>
            {/* Top 3 Podium */}
            <View style={styles.podiumContainer}>
              {/* Rank 2 - Silver (Left) */}
              {top2 && (
                <View style={[styles.podiumCol, styles.podiumSilverCol]}>
                  <View style={styles.podiumAvatarWrap}>
                    <View style={[styles.podiumAvatar, styles.avatarSilver]}>
                      <Text style={styles.avatarLetter}>
                        {top2.name ? top2.name.substring(0, 2).toUpperCase() : 'P2'}
                      </Text>
                    </View>
                    <View style={[styles.medalBadge, styles.medalBadgeSilver]}>
                      <Text style={styles.medalBadgeText}>2</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top2.name}
                  </Text>
                  <Text style={styles.podiumRoi}>{top2.roi}</Text>
                  <View style={[styles.podiumStand, styles.standSilver]}>
                    <Text style={styles.standNum}>2</Text>
                  </View>
                </View>
              )}

              {/* Rank 1 - Gold (Center, Taller) */}
              {top1 && (
                <View style={[styles.podiumCol, styles.podiumGoldCol]}>
                  <View style={styles.podiumAvatarWrap}>
                    <View style={[styles.podiumAvatar, styles.avatarGold]}>
                      <Text style={styles.avatarLetter}>
                        {top1.name ? top1.name.substring(0, 2).toUpperCase() : 'P1'}
                      </Text>
                    </View>
                    <View style={[styles.medalBadge, styles.medalBadgeGold]}>
                      <Image
                        source={{ uri: '/images/app-icons-png/Profile/Cup.png' }}
                        style={{ width: 14, height: 14 }}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                  <Text style={styles.podiumNameGold} numberOfLines={1}>
                    {top1.name}
                  </Text>
                  <Text style={styles.podiumRoiGold}>{top1.roi}</Text>
                  <View style={[styles.podiumStand, styles.standGold]}>
                    <Text style={styles.standNumGold}>1</Text>
                  </View>
                </View>
              )}

              {/* Rank 3 - Bronze (Right) */}
              {top3 && (
                <View style={[styles.podiumCol, styles.podiumBronzeCol]}>
                  <View style={styles.podiumAvatarWrap}>
                    <View style={[styles.podiumAvatar, styles.avatarBronze]}>
                      <Text style={styles.avatarLetter}>
                        {top3.name ? top3.name.substring(0, 2).toUpperCase() : 'P3'}
                      </Text>
                    </View>
                    <View style={[styles.medalBadge, styles.medalBadgeBronze]}>
                      <Text style={styles.medalBadgeText}>3</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top3.name}
                  </Text>
                  <Text style={styles.podiumRoi}>{top3.roi}</Text>
                  <View style={[styles.podiumStand, styles.standBronze]}>
                    <Text style={styles.standNum}>3</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Pinned User Standing Card */}
            <View style={styles.userStandingCard}>
              <View style={styles.userStandingLeft}>
                <View style={styles.userRankPill}>
                  <Text style={styles.userRankPillText}>#14</Text>
                </View>
                <View>
                  <Text style={styles.userStandingTitle}>You (Alpha Trader)</Text>
                  <Text style={styles.userStandingTrades}>18 Trades • 64% Win Rate</Text>
                </View>
              </View>
              <View style={styles.userStandingRight}>
                <Text style={styles.userStandingRoi}>+42.8%</Text>
                <Text style={styles.userStandingRoiLabel}>ROI</Text>
              </View>
            </View>

            {/* Full Ranked List */}
            <View style={styles.rankingListCard}>
              <Text style={styles.rankingListHeader}>Tournament Ranks (4 - 10)</Text>
              {restTraders.map((trader) => (
                <View key={trader.rank} style={styles.traderRow}>
                  <View style={styles.rankNumBox}>
                    <Text style={styles.rankNumText}>{trader.rank}</Text>
                  </View>
                  <View style={styles.traderAvatarSmall}>
                    <Text style={styles.traderAvatarInitials}>
                      {trader.name ? trader.name.charAt(0) : 'T'}
                    </Text>
                  </View>
                  <View style={styles.traderInfoCol}>
                    <Text style={styles.traderNameText}>{trader.name}</Text>
                    <Text style={styles.traderSubText}>
                      {trader.trades} trades • Win Rate {trader.winRate}
                    </Text>
                  </View>
                  <View style={styles.traderRoiBadge}>
                    <Text style={styles.traderRoiText}>{trader.roi}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
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
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1D32',
    letterSpacing: -0.3
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  cupIconPill: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cupIcon: {
    width: 22,
    height: 22
  },
  prizeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1D32',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#1E1D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3
  },
  prizeLeftCol: {
    flex: 1
  },
  prizeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#837CD2',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  prizeAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5
  },
  prizeSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2
  },
  timerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  timerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF'
  },
  timerVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#01CEA5',
    marginTop: 2
  },
  leagueSwitch: {
    flexDirection: 'row',
    backgroundColor: '#EEF0F8',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    gap: 4
  },
  leagueBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  leagueBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  leagueBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280'
  },
  leagueBtnTextActive: {
    fontWeight: '800',
    color: '#1E1D32'
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280'
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginBottom: 20,
    gap: 8
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center'
  },
  podiumSilverCol: {
    paddingTop: 24
  },
  podiumGoldCol: {
    paddingTop: 0
  },
  podiumBronzeCol: {
    paddingTop: 36
  },
  podiumAvatarWrap: {
    position: 'relative',
    marginBottom: 6
  },
  podiumAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2
  },
  avatarSilver: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1'
  },
  avatarGold: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B'
  },
  avatarBronze: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FDBA74'
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1D32'
  },
  medalBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  medalBadgeGold: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    width: 24,
    height: 24,
    borderRadius: 12
  },
  medalBadgeSilver: {
    backgroundColor: '#E2E8F0',
    borderColor: '#94A3B8'
  },
  medalBadgeBronze: {
    backgroundColor: '#FFEDD5',
    borderColor: '#F97316'
  },
  medalBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1E1D32'
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E1D32',
    marginBottom: 2,
    maxWidth: 90,
    textAlign: 'center'
  },
  podiumNameGold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1D32',
    marginBottom: 2,
    maxWidth: 100,
    textAlign: 'center'
  },
  podiumRoi: {
    fontSize: 12,
    fontWeight: '800',
    color: '#01CEA5',
    marginBottom: 8
  },
  podiumRoiGold: {
    fontSize: 14,
    fontWeight: '900',
    color: '#01CEA5',
    marginBottom: 8
  },
  podiumStand: {
    width: '100%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 3,
    borderLeftWidth: 1,
    borderRightWidth: 1
  },
  standSilver: {
    height: 82,
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderTopColor: '#94A3B8'
  },
  standGold: {
    height: 110,
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderTopColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  standBronze: {
    height: 66,
    backgroundColor: '#FFEDD5',
    borderColor: '#FED7AA',
    borderTopColor: '#F97316'
  },
  standNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#64748B'
  },
  standNumGold: {
    fontSize: 30,
    fontWeight: '900',
    color: '#D97706'
  },
  userStandingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#837CD2',
    shadowColor: '#837CD2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  userStandingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  userRankPill: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#837CD2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userRankPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  userStandingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1D32'
  },
  userStandingTrades: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2
  },
  userStandingRight: {
    alignItems: 'flex-end'
  },
  userStandingRoi: {
    fontSize: 16,
    fontWeight: '800',
    color: '#01CEA5'
  },
  userStandingRoiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF'
  },
  rankingListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  rankingListHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1D32',
    marginBottom: 14
  },
  traderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  rankNumBox: {
    width: 26,
    alignItems: 'center',
    marginRight: 8
  },
  rankNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF'
  },
  traderAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  traderAvatarInitials: {
    fontSize: 12,
    fontWeight: '800',
    color: '#837CD2'
  },
  traderInfoCol: {
    flex: 1
  },
  traderNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1D32'
  },
  traderSubText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2
  },
  traderRoiBadge: {
    backgroundColor: '#EDFAF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  traderRoiText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#01CEA5'
  }
});
