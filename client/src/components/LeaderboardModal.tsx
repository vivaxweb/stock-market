import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { useTrading } from '../context/TradingContext';

interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  badge: string;
  roi: number;
  tradesWon: number;
  totalTrades: number;
  country: string;
}

interface LeaderboardModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ visible, onClose }) => {
  const { activeMarket } = useTrading();
  const [marketTab, setMarketTab] = useState<'GLOBAL' | 'INDIA'>(activeMarket);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userStanding, setUserStanding] = useState<any>(null);

  const HTTP_URL = 'http://localhost:8080';

  useEffect(() => {
    if (visible) {
      fetchLeaderboard(marketTab);
    }
  }, [visible, marketTab]);

  const fetchLeaderboard = async (mkt: string) => {
    try {
      const res = await fetch(`${HTTP_URL}/api/leaderboard?market=${mkt}`);
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
        setUserStanding(data.userStanding);
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard', e);
    }
  };

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1: return '#1';
      case 2: return '#2';
      case 3: return '#3';
      default: return `#${rank}`;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Weekly Trading Cup</Text>
                <View style={styles.prizeBadge}>
                  <Text style={styles.prizeBadgeText}>Prize Pool: {marketTab === 'GLOBAL' ? '$50,000' : '₹5,00,000'}</Text>
                </View>
              </View>
              <Text style={styles.subTitle}>Resets every Sunday at 00:00 UTC</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Market Tab Selector */}
          <View style={styles.marketTabs}>
            <TouchableOpacity
              style={[styles.marketTab, marketTab === 'GLOBAL' && styles.marketTabActive]}
              onPress={() => setMarketTab('GLOBAL')}
            >
              <Text style={[styles.marketTabText, marketTab === 'GLOBAL' && styles.textWhite]}>
                Global League (USD)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.marketTab, marketTab === 'INDIA' && styles.marketTabActive]}
              onPress={() => setMarketTab('INDIA')}
            >
              <Text style={[styles.marketTabText, marketTab === 'INDIA' && styles.textWhite]}>
                Indian Championship (INR)
              </Text>
            </TouchableOpacity>
          </View>

          {/* User's Standing Banner */}
          {userStanding && (
            <View style={styles.userBanner}>
              <View style={styles.userBannerLeft}>
                <Text style={styles.userBannerRank}>Your Rank: #{userStanding.rank}</Text>
                <Text style={styles.userBannerSub}>Top {userStanding.topPercent}% of all traders</Text>
              </View>
              <View style={styles.userBannerRight}>
                <Text style={styles.userBannerRoi}>+{userStanding.roi}%</Text>
                <Text style={styles.userBannerLabel}>Weekly ROI</Text>
              </View>
            </View>
          )}

          {/* Leaderboard List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {leaderboard.map(item => {
              const winRate = item.totalTrades > 0 ? Math.round((item.tradesWon / item.totalTrades) * 100) : 0;

              return (
                <View key={item.rank} style={[styles.rankCard, item.rank <= 3 && styles.podiumCard]}>
                  <View style={styles.medalCol}>
                    <Text style={styles.medalText}>{getRankMedal(item.rank)}</Text>
                  </View>

                  <Text style={styles.avatarText}>{item.avatar}</Text>

                  <View style={styles.traderDetails}>
                    <View style={styles.traderNameRow}>
                      <Text style={styles.traderName}>{item.username}</Text>
                      <Text style={styles.badgeTag}>{item.badge}</Text>
                    </View>
                    <Text style={styles.traderStats}>
                      Win Rate: {winRate}% ({item.tradesWon}/{item.totalTrades})
                    </Text>
                  </View>

                  <View style={styles.roiCol}>
                    <Text style={styles.roiText}>+{item.roi}%</Text>
                    <Text style={styles.roiLabel}>ROI</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '85%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800'
  },
  prizeBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F59E0B'
  },
  prizeBadgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700'
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2
  },
  closeBtn: {
    padding: 8
  },
  closeBtnText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700'
  },
  marketTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  marketTab: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  marketTabActive: {
    backgroundColor: '#3B82F6'
  },
  marketTabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700'
  },
  textWhite: {
    color: '#FFFFFF'
  },
  userBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#38BDF8'
  },
  userBannerLeft: {},
  userBannerRank: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '800'
  },
  userBannerSub: {
    color: '#94A3B8',
    fontSize: 10
  },
  userBannerRight: {
    alignItems: 'flex-end'
  },
  userBannerRoi: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '800'
  },
  userBannerLabel: {
    color: '#64748B',
    fontSize: 9
  },
  list: {
    flex: 1
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  podiumCard: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.05)'
  },
  medalCol: {
    width: 35,
    alignItems: 'center'
  },
  medalText: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '800'
  },
  avatarText: {
    fontSize: 22,
    marginRight: 10
  },
  traderDetails: {
    flex: 1
  },
  traderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2
  },
  traderName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700'
  },
  badgeTag: {
    backgroundColor: '#334155',
    color: '#94A3B8',
    fontSize: 9,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4
  },
  traderStats: {
    color: '#64748B',
    fontSize: 10
  },
  roiCol: {
    alignItems: 'flex-end'
  },
  roiText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '800'
  },
  roiLabel: {
    color: '#64748B',
    fontSize: 9
  }
});
