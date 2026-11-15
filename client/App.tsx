import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { TradingProvider, useTrading } from './src/context/TradingContext';
import { Header } from './src/components/Header';
import { AssetBar } from './src/components/AssetBar';
import { TradingViewChart } from './src/components/TradingViewChart';
import { OrderPanel } from './src/components/OrderPanel';
import { WalletCard } from './src/components/WalletCard';
import { AssetSelector } from './src/components/AssetSelector';
import { OptionsChainModal } from './src/components/OptionsChainModal';
import { AcademyModal } from './src/components/AcademyModal';
import { GamificationHub } from './src/components/GamificationHub';
import { LeaderboardModal } from './src/components/LeaderboardModal';
import { PaywallModal } from './src/components/PaywallModal';
import { OnboardingModal } from './src/components/OnboardingModal';
import { SettingsDrawer } from './src/components/SettingsDrawer';

// Dedicated Full Mobile Screens
import { DashboardScreen } from './src/screens/DashboardScreen';
import { AcademyScreen } from './src/screens/AcademyScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

type TabType = 'dashboard' | 'trade' | 'academy' | 'leaderboard' | 'pro';

function MainApp() {
  const {
    activeMarket,
    selectedAsset,
    setSelectedAsset,
    hasCompletedOnboarding,
    completeOnboarding
  } = useTrading();

  // Navigation tab state: 'dashboard' (Home), 'trade', 'academy' (School), 'leaderboard' (Cup), 'pro' (Profile)
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = window.location.search;
        if (search.includes('tab=trade')) return 'trade';
        if (search.includes('tab=academy') || search.includes('tab=school')) return 'academy';
        if (search.includes('tab=leaderboard') || search.includes('tab=cup')) return 'leaderboard';
        if (search.includes('tab=pro') || search.includes('tab=profile')) return 'pro';
        if (search.includes('tab=dashboard') || search.includes('tab=home')) return 'dashboard';
      }
    } catch (e) {}
    return 'dashboard';
  });

  // Smooth Tab Transition Animation
  const tabFadeAnim = useRef(new Animated.Value(1)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;

  // Modals visibility
  const [showAssetSelector, setShowAssetSelector] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = window.location.search;
        if (search.includes('open_search=true') || search.includes('open_assets=true')) return true;
      }
    } catch (e) {}
    return false;
  });
  const [showOptionsChain, setShowOptionsChain] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search.includes('open_options=true')) return true;
    } catch (e) {}
    return false;
  });
  const [showAcademy, setShowAcademy] = useState<boolean>(false);
  const [showStreakModal, setShowStreakModal] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search.includes('open_streak=true')) return true;
    } catch (e) {}
    return false;
  });
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search.includes('open_paywall=true')) return true;
    } catch (e) {}
    return false;
  });
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search.includes('open_drawer=true')) return true;
    } catch (e) {}
    return false;
  });
  const [forceShowOnboarding, setForceShowOnboarding] = useState<boolean>(false);

  // Switch tab with smooth native-like slide/fade
  const handleTabSwitch = (newTab: TabType) => {
    if (newTab === activeTab) return;
    
    // Quick micro-animation
    Animated.parallel([
      Animated.timing(tabFadeAnim, {
        toValue: 0.2,
        duration: 90,
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.timing(tabSlideAnim, {
        toValue: 8,
        duration: 90,
        useNativeDriver: Platform.OS !== 'web'
      })
    ]).start(() => {
      setActiveTab(newTab);
      tabSlideAnim.setValue(-8);
      Animated.parallel([
        Animated.timing(tabFadeAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(tabSlideAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start();
    });
  };

  return (
    <View style={styles.outerBackdrop}>
      <SafeAreaView style={styles.phoneFrame}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Simulated Mobile Status Bar (Visible on Web Desktop Shell) */}
        {Platform.OS === 'web' && (
          <View style={styles.simulatedStatusBar}>
            <Text style={styles.statusBarTime}>9:41</Text>
            <View style={styles.dynamicIslandNotch} />
            <View style={styles.statusBarIcons}>
              {/* Cellular Signal Bars */}
              <View style={styles.signalBars}>
                <View style={[styles.bar, { height: 4 }]} />
                <View style={[styles.bar, { height: 6 }]} />
                <View style={[styles.bar, { height: 8 }]} />
                <View style={[styles.bar, { height: 10 }]} />
              </View>
              <Text style={styles.statusBar5G}>5G</Text>
              {/* Battery Icon */}
              <View style={styles.batteryShell}>
                <View style={styles.batteryLevel} />
              </View>
            </View>
          </View>
        )}

        <View style={styles.appContainer}>
          {/* Top Universal App Header */}
          <Header
            compact={activeTab === 'trade'}
            onOpenStreak={() => setShowStreakModal(true)}
            onOpenPaywall={() => setShowPaywall(true)}
            onOpenMenu={() => setShowSettingsDrawer(true)}
          />

          {/* Main Content Area with Animated Mobile Screen Transitions */}
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: tabFadeAnim,
                transform: [{ translateY: tabSlideAnim }]
              }
            ]}
          >
            {/* 1. Home / Dashboard Screen */}
            {activeTab === 'dashboard' && (
              <DashboardScreen
                onNavigateTrade={(asset) => {
                  if (asset) setSelectedAsset(asset);
                  handleTabSwitch('trade');
                }}
                onOpenStreak={() => setShowStreakModal(true)}
                onOpenAssetSelector={() => setShowAssetSelector(true)}
              />
            )}

            {/* 2. Trade Terminal Screen (Real TradingView + AssetBar + OrderPanel) */}
            {activeTab === 'trade' && (
              <ScrollView
                style={styles.tradeScrollView}
                contentContainerStyle={styles.tradeScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <WalletCard />
                <AssetBar onOpenAssetSelector={() => setShowAssetSelector(true)} />
                <TradingViewChart onOpenAssetSelector={() => setShowAssetSelector(true)} />
                <OrderPanel onOpenOptionsChain={() => setShowOptionsChain(true)} />
              </ScrollView>
            )}

            {/* 3. School / Academy Full Screen */}
            {activeTab === 'academy' && (
              <AcademyScreen onNavigateTrade={() => handleTabSwitch('trade')} />
            )}

            {/* 4. Cup / Leaderboard Full Screen */}
            {activeTab === 'leaderboard' && (
              <LeaderboardScreen onOpenTrade={() => handleTabSwitch('trade')} />
            )}

            {/* 5. PRO / Profile Full Screen */}
            {activeTab === 'pro' && (
              <ProfileScreen
                onOpenPaywall={() => setShowPaywall(true)}
                onNavigateTrade={() => handleTabSwitch('trade')}
              />
            )}
          </Animated.View>

          {/* Bottom Navigation Bar - Authentic Three Investeers Screen 2 Parity */}
          <View style={styles.bottomNav}>
            {/* Tab 1: Home */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => handleTabSwitch('dashboard')}
              activeOpacity={0.8}
            >
              {activeTab === 'dashboard' && <View style={styles.activeIndicatorLine} />}
              <Image
                source={{
                  uri:
                    activeTab === 'dashboard'
                      ? '/images/app-icons-png/MenuIcons/Dashboard active.png'
                      : '/images/app-icons-png/MenuIcons/Dashboard inactive.png'
                }}
                style={styles.navIcon}
                resizeMode="contain"
              />
              <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>
                Home
              </Text>
            </TouchableOpacity>

            {/* Tab 2: Trade */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => handleTabSwitch('trade')}
              activeOpacity={0.8}
            >
              {activeTab === 'trade' && <View style={styles.activeIndicatorLine} />}
              <Image
                source={{
                  uri:
                    activeTab === 'trade'
                      ? '/images/app-icons-png/MenuIcons/Trade active.png'
                      : '/images/app-icons-png/MenuIcons/Trade inactive.png'
                }}
                style={styles.navIcon}
                resizeMode="contain"
              />
              <Text style={[styles.navText, activeTab === 'trade' && styles.navTextActive]}>
                Trade
              </Text>
            </TouchableOpacity>

            {/* Tab 3: School */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => handleTabSwitch('academy')}
              activeOpacity={0.8}
            >
              {activeTab === 'academy' && <View style={styles.activeIndicatorLine} />}
              <Image
                source={{
                  uri:
                    activeTab === 'academy'
                      ? '/images/app-icons-png/MenuIcons/School active new.png'
                      : '/images/app-icons-png/MenuIcons/School inactive new.png'
                }}
                style={styles.navIcon}
                resizeMode="contain"
              />
              <Text style={[styles.navText, activeTab === 'academy' && styles.navTextActive]}>
                School
              </Text>
            </TouchableOpacity>

            {/* Tab 4: Cup */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => handleTabSwitch('leaderboard')}
              activeOpacity={0.8}
            >
              {activeTab === 'leaderboard' && <View style={styles.activeIndicatorLine} />}
              <Image
                source={{
                  uri:
                    activeTab === 'leaderboard'
                      ? '/images/app-icons-png/MenuIcons/Leaderboard active.png'
                      : '/images/app-icons-png/MenuIcons/Leaderboard inactive.png'
                }}
                style={styles.navIcon}
                resizeMode="contain"
              />
              <Text style={[styles.navText, activeTab === 'leaderboard' && styles.navTextActive]}>
                Cup
              </Text>
            </TouchableOpacity>

            {/* Tab 5: PRO / Profile */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => handleTabSwitch('pro')}
              activeOpacity={0.8}
            >
              {activeTab === 'pro' && <View style={styles.activeIndicatorLine} />}
              <Image
                source={{
                  uri:
                    activeTab === 'pro'
                      ? '/images/app-icons-png/MenuIcons/Profile active.png'
                      : '/images/app-icons-png/MenuIcons/Profile inactive.png'
                }}
                style={styles.navIcon}
                resizeMode="contain"
              />
              <Text style={[styles.navText, activeTab === 'pro' && styles.navTextActive]}>
                PRO
              </Text>
            </TouchableOpacity>
          </View>

          {/* Simulated Mobile Home Gesture Bar */}
          {Platform.OS === 'web' && (
            <View style={styles.homeIndicatorWrapper}>
              <View style={styles.homeIndicatorPill} />
            </View>
          )}

          {/* Modals & Overlays */}
          <OnboardingModal
            visible={!hasCompletedOnboarding || forceShowOnboarding}
            onFinish={(profile) => {
              setForceShowOnboarding(false);
              completeOnboarding(profile);
            }}
          />

          <SettingsDrawer
            visible={showSettingsDrawer}
            onClose={() => setShowSettingsDrawer(false)}
            onOpenStreak={() => setShowStreakModal(true)}
            onOpenPaywall={() => setShowPaywall(true)}
            onOpenOnboarding={() => setForceShowOnboarding(true)}
          />

          <OptionsChainModal
            visible={showOptionsChain}
            onClose={() => setShowOptionsChain(false)}
            initialSymbol={selectedAsset?.category === 'INDEX' ? selectedAsset.symbol : 'NIFTY 50'}
          />

          <AcademyModal
            visible={showAcademy}
            onClose={() => setShowAcademy(false)}
          />

          <GamificationHub
            visible={showStreakModal}
            onClose={() => setShowStreakModal(false)}
          />

          <LeaderboardModal
            visible={showLeaderboard}
            onClose={() => setShowLeaderboard(false)}
          />

          <PaywallModal
            visible={showPaywall}
            onClose={() => setShowPaywall(false)}
          />

          <AssetSelector
            visible={showAssetSelector}
            onClose={() => setShowAssetSelector(false)}
            onSelectOptionChain={(asset) => {
              if (asset) setSelectedAsset(asset);
              setShowOptionsChain(true);
            }}
            onNavigateTrade={(asset) => {
              if (asset) setSelectedAsset(asset);
              handleTabSwitch('trade');
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <TradingProvider>
      <MainApp />
    </TradingProvider>
  );
}

const styles = StyleSheet.create({
  outerBackdrop: {
    flex: 1,
    backgroundColor: '#0D0C15',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? {
          height: '100vh',
          width: '100vw',
          overflow: 'hidden'
        }
      : {})
  },
  phoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          height: '100%',
          maxHeight: 920,
          borderRadius: 36,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          marginVertical: 'auto'
        }
      : {})
  },
  simulatedStatusBar: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  statusBarTime: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1D32',
    letterSpacing: -0.2
  },
  dynamicIslandNotch: {
    width: 90,
    height: 18,
    backgroundColor: '#0F172A',
    borderRadius: 10
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
    height: 10
  },
  bar: {
    width: 2.5,
    backgroundColor: '#1E1D32',
    borderRadius: 1
  },
  statusBar5G: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E1D32',
    marginRight: 2
  },
  batteryShell: {
    width: 20,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#1E1D32',
    padding: 1,
    justifyContent: 'center'
  },
  batteryLevel: {
    width: 14,
    height: '100%',
    backgroundColor: '#1E1D32',
    borderRadius: 1.5
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#F8F9FD'
  },
  contentContainer: {
    flex: 1
  },
  tradeScrollView: {
    flex: 1
  },
  tradeScrollContent: {
    paddingBottom: 24
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAECF2',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative'
  },
  activeIndicatorLine: {
    position: 'absolute',
    top: -8,
    width: 32,
    height: 3,
    backgroundColor: '#7871C4',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2
  },
  navIcon: {
    width: 22,
    height: 22,
    marginBottom: 4
  },
  navText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600'
  },
  navTextActive: {
    color: '#7871C4',
    fontWeight: '800'
  },
  homeIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingBottom: 6,
    paddingTop: 2
  },
  homeIndicatorPill: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB'
  }
});
