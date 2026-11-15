import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
  ScrollView,
  Platform
} from 'react-native';

export interface OnboardingProfile {
  market: 'INDIA' | 'GLOBAL';
  primaryAsset: string;
  experienceLevel: 'beginner' | 'basics' | 'intermediate' | 'advanced';
  primaryGoal: 'wealth' | 'income' | 'learn' | 'practice';
  initialCash: number;
}

interface OnboardingModalProps {
  visible: boolean;
  onFinish: (profile: OnboardingProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ visible, onFinish }) => {
  const [step, setStep] = useState<number>(1);
  const [market, setMarket] = useState<'INDIA' | 'GLOBAL'>('INDIA');
  const [assetInterest, setAssetInterest] = useState<string>('indian_fno');
  const [experience, setExperience] = useState<'beginner' | 'basics' | 'intermediate' | 'advanced'>('beginner');
  const [goal, setGoal] = useState<'wealth' | 'income' | 'learn' | 'practice'>('learn');
  const [claimed, setClaimed] = useState<boolean>(false);

  const totalSteps = 6;
  const isIndia = market === 'INDIA';
  const currencySymbol = isIndia ? '₹' : '$';
  const startingCapital = isIndia ? 1000000 : 100000;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    let primaryAsset = 'NIFTY 50';
    if (!isIndia) {
      if (assetInterest === 'crypto') primaryAsset = 'BTC/USD';
      else if (assetInterest === 'forex') primaryAsset = 'EUR/USD';
      else primaryAsset = 'AAPL';
    } else {
      if (assetInterest === 'indian_stocks') primaryAsset = 'RELIANCE';
      else primaryAsset = 'NIFTY 50';
    }

    onFinish({
      market,
      primaryAsset,
      experienceLevel: experience,
      primaryGoal: goal,
      initialCash: startingCapital
    });
  };

  const formatMoney = (val: number) => {
    return val.toLocaleString(isIndia ? 'en-IN' : 'en-US');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Top Bar: Progress Indicator & Back */}
        <View style={styles.topBar}>
          {step > 1 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Image
                source={{ uri: '/images/app-icons-png/Back.png' }}
                style={{ width: 18, height: 18 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>

          <Text style={styles.stepCounterText}>{step}/{totalSteps}</Text>
        </View>

        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollInner}>
          {/* STEP 1: Welcome & Value Proposition */}
          {step === 1 && (
            <View style={styles.stepCard}>
              <Image
                source={{ uri: '/images/app-icons-png/WelcomeCharacter.png' }}
                style={styles.characterImg}
                resizeMode="contain"
              />
              <Text style={styles.title}>Learn Trading Without Risk</Text>
              <Text style={styles.subtitle}>
                Practice stock, crypto, and derivatives trading with real-time market data and zero financial risk.
              </Text>

              <View style={styles.featureList}>
                <View style={styles.featureRow}>
                  <Image source={{ uri: '/images/app-icons-png/WhiteCheck.png' }} style={styles.checkIcon} />
                  <Text style={styles.featureText}>Real-time TradingView Candlestick Charts</Text>
                </View>
                <View style={styles.featureRow}>
                  <Image source={{ uri: '/images/app-icons-png/WhiteCheck.png' }} style={styles.checkIcon} />
                  <Text style={styles.featureText}>Dual Markets: India (NSE/BSE) & Global (US/Crypto)</Text>
                </View>
                <View style={styles.featureRow}>
                  <Image source={{ uri: '/images/app-icons-png/WhiteCheck.png' }} style={styles.checkIcon} />
                  <Text style={styles.featureText}>Trade Rewind Token: Undo losing trades safely</Text>
                </View>
              </View>
            </View>
          )}

          {/* STEP 2: Location & Primary Market Selection */}
          {step === 2 && (
            <View style={styles.stepCard}>
              <Text style={styles.title}>Choose Your Primary Market</Text>
              <Text style={styles.subtitle}>
                We customize your starting capital, default instruments, and currency based on your region.
              </Text>

              <TouchableOpacity
                style={[styles.selectCard, isIndia && styles.selectCardActive]}
                onPress={() => setMarket('INDIA')}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.flagBadge, { borderColor: '#F97316' }]}>
                    <Text style={styles.flagBadgeText}>IN</Text>
                  </View>
                  <View style={styles.cardTextCol}>
                    <Text style={styles.cardTitle}>Indian Markets (NSE / BSE)</Text>
                    <Text style={styles.cardDesc}>
                      Trade Nifty 50, Bank Nifty F&O Options, and Bluechip Stocks with ₹10,00,000 virtual capital.
                    </Text>
                  </View>
                </View>
                <View style={styles.capitalTag}>
                  <Text style={styles.capitalTagText}>₹10,00,000 Virtual Capital</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.selectCard, !isIndia && styles.selectCardActive]}
                onPress={() => setMarket('GLOBAL')}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.flagBadge, { borderColor: '#3B82F6' }]}>
                    <Text style={styles.flagBadgeText}>US</Text>
                  </View>
                  <View style={styles.cardTextCol}>
                    <Text style={styles.cardTitle}>Global Markets</Text>
                    <Text style={styles.cardDesc}>
                      Trade Bitcoin, Ethereum, US Tech Stocks (Apple, Tesla, Nvidia) & Forex with $100,000.
                    </Text>
                  </View>
                </View>
                <View style={styles.capitalTag}>
                  <Text style={styles.capitalTagText}>$100,000 Virtual Capital</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Asset Class Customization */}
          {step === 3 && (
            <View style={styles.stepCard}>
              <Text style={styles.title}>What do you want to trade?</Text>
              <Text style={styles.subtitle}>
                We will curate your primary watchlist based on your favorite asset class.
              </Text>

              {isIndia ? (
                <>
                  <TouchableOpacity
                    style={[styles.optionRow, assetInterest === 'indian_fno' && styles.optionRowActive]}
                    onPress={() => setAssetInterest('indian_fno')}
                  >
                    <View style={styles.optionTextCol}>
                      <Text style={styles.optionTitle}>Indian F&O Derivatives</Text>
                      <Text style={styles.optionDesc}>Nifty 50 & Bank Nifty Options Chain with live Greeks</Text>
                    </View>
                    <View style={[styles.radioCircle, assetInterest === 'indian_fno' && styles.radioActive]} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.optionRow, assetInterest === 'indian_stocks' && styles.optionRowActive]}
                    onPress={() => setAssetInterest('indian_stocks')}
                  >
                    <View style={styles.optionTextCol}>
                      <Text style={styles.optionTitle}>Indian Bluechip Stocks</Text>
                      <Text style={styles.optionDesc}>Reliance, HDFC Bank, TCS, Tata Motors</Text>
                    </View>
                    <View style={[styles.radioCircle, assetInterest === 'indian_stocks' && styles.radioActive]} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.optionRow, assetInterest === 'crypto' && styles.optionRowActive]}
                    onPress={() => setAssetInterest('crypto')}
                  >
                    <View style={styles.optionTextCol}>
                      <Text style={styles.optionTitle}>Cryptocurrencies</Text>
                      <Text style={styles.optionDesc}>Bitcoin (BTC), Ethereum (ETH), Solana (SOL)</Text>
                    </View>
                    <View style={[styles.radioCircle, assetInterest === 'crypto' && styles.radioActive]} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.optionRow, assetInterest === 'us_stocks' && styles.optionRowActive]}
                    onPress={() => setAssetInterest('us_stocks')}
                  >
                    <View style={styles.optionTextCol}>
                      <Text style={styles.optionTitle}>US Tech Stocks</Text>
                      <Text style={styles.optionDesc}>Apple, Tesla, Nvidia, Amazon</Text>
                    </View>
                    <View style={[styles.radioCircle, assetInterest === 'us_stocks' && styles.radioActive]} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.optionRow, assetInterest === 'forex' && styles.optionRowActive]}
                    onPress={() => setAssetInterest('forex')}
                  >
                    <View style={styles.optionTextCol}>
                      <Text style={styles.optionTitle}>Forex & Commodities</Text>
                      <Text style={styles.optionDesc}>Gold (XAU/USD), EUR/USD</Text>
                    </View>
                    <View style={[styles.radioCircle, assetInterest === 'forex' && styles.radioActive]} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* STEP 4: Trading Experience Level */}
          {step === 4 && (
            <View style={styles.stepCard}>
              <Text style={styles.title}>Your Experience Level</Text>
              <Text style={styles.subtitle}>
                We calibrate educational prompts and leverage presets to match your skill.
              </Text>

              {[
                { id: 'beginner', title: 'Complete Beginner', desc: 'New to stock market & candlestick charts' },
                { id: 'basics', title: 'Know the Basics', desc: 'Placed a few trades, familiar with Buy & Sell' },
                { id: 'intermediate', title: 'Active Trader', desc: 'Understand leverage, stop-losses & indicators' },
                { id: 'advanced', title: 'Experienced Trader', desc: 'Mastering options Greeks & risk management' }
              ].map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.optionRow, experience === item.id && styles.optionRowActive]}
                  onPress={() => setExperience(item.id as any)}
                >
                  <View style={styles.optionTextCol}>
                    <Text style={styles.optionTitle}>{item.title}</Text>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </View>
                  <View style={[styles.radioCircle, experience === item.id && styles.radioActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* STEP 5: Primary Goal */}
          {step === 5 && (
            <View style={styles.stepCard}>
              <Text style={styles.title}>What is your main goal?</Text>
              <Text style={styles.subtitle}>
                Let us know what you want to achieve with MockBull.
              </Text>

              {[
                { id: 'wealth', title: 'Build Long-Term Wealth', desc: 'Learn disciplined compounding and position sizing' },
                { id: 'income', title: 'Consistent Monthly Returns', desc: 'Practice intraday trading setups and momentum' },
                { id: 'learn', title: 'Understand Technical Analysis', desc: 'Learn chart patterns and volume indicators' },
                { id: 'practice', title: 'Test High-Leverage Strategies', desc: 'Experiment with zero financial risk' }
              ].map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.optionRow, goal === item.id && styles.optionRowActive]}
                  onPress={() => setGoal(item.id as any)}
                >
                  <View style={styles.optionTextCol}>
                    <Text style={styles.optionTitle}>{item.title}</Text>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </View>
                  <View style={[styles.radioCircle, goal === item.id && styles.radioActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* STEP 6: Claim Virtual Capital & Launch */}
          {step === 6 && (
            <View style={styles.stepCard}>
              <Image
                source={{ uri: '/images/app-icons-png/party-popper.png' }}
                style={styles.popperImg}
                resizeMode="contain"
              />
              <Text style={styles.title}>Your Portfolio is Ready!</Text>
              <Text style={styles.subtitle}>
                Based on your preferences, we've set up your trading account for {isIndia ? 'Indian Markets' : 'Global Markets'}.
              </Text>

              <View style={styles.claimHeroBox}>
                <Text style={styles.claimSub}>Virtual Paper Trading Capital</Text>
                <Text style={styles.claimAmount}>
                  {currencySymbol}{formatMoney(startingCapital)}
                </Text>
                <Text style={styles.claimNote}>
                  100% Risk-Free • Real-Time Market Data • 2 Rewind Tokens Included
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Continue Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>
              {step === totalSteps ? 'Claim Capital & Start Trading' : 'Continue'}
            </Text>
            <Image
              source={{ uri: '/images/app-icons-png/Onboarding/OnboardingArrow.png' }}
              style={styles.arrowIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1D32',
    maxWidth: Platform.OS === 'web' ? 680 : undefined,
    width: '100%',
    alignSelf: 'center'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#35334f'
  },
  backBtn: {
    padding: 6
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#2F2D48',
    borderRadius: 3,
    marginHorizontal: 16,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7871C4',
    borderRadius: 3
  },
  stepCounterText: {
    color: '#8E8BA7',
    fontSize: 12,
    fontWeight: '700'
  },
  contentScroll: {
    flex: 1
  },
  scrollInner: {
    padding: 20
  },
  stepCard: {
    alignItems: 'center'
  },
  characterImg: {
    width: 140,
    height: 140,
    marginBottom: 16
  },
  popperImg: {
    width: 90,
    height: 90,
    marginBottom: 16
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    color: '#8E8BA7',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8
  },
  featureList: {
    width: '100%',
    backgroundColor: '#2F2D48',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#35334f'
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  checkIcon: {
    width: 16,
    height: 16,
    tintColor: '#00D8AD'
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1
  },
  selectCard: {
    width: '100%',
    backgroundColor: '#2F2D48',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#35334f'
  },
  selectCardActive: {
    borderColor: '#7871C4',
    backgroundColor: '#26243A'
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  flagBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E1D32',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  flagBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900'
  },
  cardTextCol: {
    flex: 1
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  cardDesc: {
    color: '#8E8BA7',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2
  },
  capitalTag: {
    backgroundColor: 'rgba(120, 113, 196, 0.15)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 12,
    alignSelf: 'flex-start'
  },
  capitalTagText: {
    color: '#A4A0DD',
    fontSize: 11,
    fontWeight: '800'
  },
  optionRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2F2D48',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#35334f'
  },
  optionRowActive: {
    borderColor: '#7871C4',
    backgroundColor: '#26243A'
  },
  optionTextCol: {
    flex: 1,
    paddingRight: 10
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  optionDesc: {
    color: '#8E8BA7',
    fontSize: 11,
    marginTop: 2
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4A4866'
  },
  radioActive: {
    borderColor: '#7871C4',
    backgroundColor: '#7871C4'
  },
  claimHeroBox: {
    width: '100%',
    backgroundColor: '#837CD2',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 8
  },
  claimSub: {
    color: '#E0DEFD',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  claimAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 8
  },
  claimNote: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.85
  },
  bottomBar: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#35334f'
  },
  continueBtn: {
    backgroundColor: '#00D8AD',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  continueBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800'
  },
  arrowIcon: {
    width: 12,
    height: 12,
    tintColor: '#000000'
  }
});
