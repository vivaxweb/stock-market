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

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ visible, onClose }) => {
  const { account } = useTrading();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly' | 'lifetime'>('annual');
  const [wheelSpinning, setWheelSpinning] = useState<boolean>(false);
  const [discountWon, setDiscountWon] = useState<number | null>(null);

  const perks = [
    { title: 'Unlimited Trade Rewinds', desc: 'Undo any losing trade instantly with zero paper capital loss' },
    { title: '50x Max Leverage', desc: 'Unlock maximum margin exposure on BSE, NSE & crypto assets' },
    { title: 'Institutional Level 2 Depth', desc: 'View live order book bid/ask volume and F&O Greeks' },
    { title: '100% Ad-Free Experience', desc: 'Zero interruptions or video interstitials between trades' },
    { title: 'VIP Golden Cup Badge', desc: 'Stand out on the global and national weekly championships' }
  ];

  const plans = [
    { id: 'monthly', title: 'Monthly', price: '$7.99', sub: '/month', badge: '' },
    { id: 'annual', title: 'Annual', price: '$39.99', sub: '/year ($3.33/mo)', badge: 'SAVE 58%' },
    { id: 'lifetime', title: 'Lifetime', price: '$79.99', sub: 'one-time VIP pass', badge: 'LIFETIME' }
  ];

  const handleSpinWheel = () => {
    if (wheelSpinning || discountWon) return;
    setWheelSpinning(true);

    setTimeout(() => {
      setWheelSpinning(false);
      setDiscountWon(70);
      const msg = 'Congratulations! You unlocked a 70% VIP Lifetime Discount! Annual plan reduced to $11.99/year.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Lucky Spin Winner', msg);
    }, 1200);
  };

  const handlePurchase = () => {
    const planName = selectedPlan.toUpperCase();
    const finalPrice = discountWon ? '$11.99' : (selectedPlan === 'annual' ? '$39.99' : (selectedPlan === 'monthly' ? '$7.99' : '$79.99'));

    const msg = `Simulating Free App Store Unlock for ${planName} Plan (${finalPrice}). PRO Membership is now 100% active!`;
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('PRO Activated', msg);

    if (account) {
      account.isPro = true;
      account.undoTokens = 999;
      account.allowedLeverage = 50;
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.proTitleRow}>
              <Image
                source={{ uri: '/images/app-icons-png/IAP/ProIcon.png' }}
                style={styles.proHeaderIcon}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.title}>MockBull <Text style={styles.purpleText}>PRO</Text></Text>
                <Text style={styles.subTitle}>Institutional-Grade Paper Trading Privileges</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Gamified Discount Banner */}
            <View style={styles.wheelBanner}>
              <View style={styles.wheelLeft}>
                <Text style={styles.wheelTitle}>
                  {discountWon ? '70% VIP Discount Applied!' : 'VIP Lucky Discount Wheel'}
                </Text>
                <Text style={styles.wheelSub}>
                  {discountWon ? 'Annual pass reduced to $11.99/yr' : 'Spin to unlock up to 80% OFF Pro'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.spinBtn, (wheelSpinning || discountWon !== null) && styles.spinBtnDisabled]}
                onPress={handleSpinWheel}
                disabled={wheelSpinning || discountWon !== null}
                activeOpacity={0.8}
              >
                <Text style={styles.spinBtnText}>
                  {wheelSpinning ? 'SPINNING...' : (discountWon ? 'CLAIMED' : 'SPIN')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Perks List */}
            <View style={styles.perksList}>
              <Text style={styles.perksSectionTitle}>PRO VIP PRIVILEGES</Text>
              {perks.map((p, i) => (
                <View key={i} style={styles.perkRow}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                  <View style={styles.perkTextCol}>
                    <Text style={styles.perkTitle}>{p.title}</Text>
                    <Text style={styles.perkDesc}>{p.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Plan Selector */}
            <View style={styles.plansContainer}>
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                const displayPrice = (discountWon && p.id === 'annual') ? '$11.99' : p.price;

                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.planCard, isSelected && styles.planCardActive]}
                    onPress={() => setSelectedPlan(p.id as any)}
                    activeOpacity={0.8}
                  >
                    {p.badge !== '' && (
                      <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>
                          {discountWon && p.id === 'annual' ? '70% OFF' : p.badge}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.planTitle, isSelected && styles.planTitleActive]}>
                      {p.title}
                    </Text>
                    <Text style={[styles.planPrice, isSelected && styles.planPriceActive]}>
                      {displayPrice}
                    </Text>
                    <Text style={styles.planSub}>{p.sub}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Purchase Action Button */}
            <TouchableOpacity
              style={styles.purchaseBtn}
              onPress={handlePurchase}
              activeOpacity={0.85}
            >
              <Text style={styles.purchaseBtnText}>
                Unlock PRO Pass Now (Free)
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimerText}>
              100% Free Paper Trading Simulation · No Real Payment Required
            </Text>
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
  proTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  proHeaderIcon: {
    width: 32,
    height: 32
  },
  title: {
    color: '#1E1D32',
    fontSize: 18,
    fontWeight: '800'
  },
  purpleText: {
    color: '#837CD2'
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
  wheelBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F2FD',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E0FB'
  },
  wheelLeft: {
    flex: 1,
    paddingRight: 10
  },
  wheelTitle: {
    color: '#837CD2',
    fontSize: 14,
    fontWeight: '800'
  },
  wheelSub: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2
  },
  spinBtn: {
    backgroundColor: '#837CD2',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10
  },
  spinBtnDisabled: {
    backgroundColor: '#01CEA5'
  },
  spinBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  perksList: {
    backgroundColor: '#F8F9FD',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAECF2',
    gap: 12
  },
  perksSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#837CD2',
    letterSpacing: 0.8,
    marginBottom: 2
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EDFAF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 1
  },
  checkMark: {
    fontSize: 11,
    fontWeight: '900',
    color: '#01CEA5'
  },
  perkTextCol: {
    flex: 1
  },
  perkTitle: {
    color: '#1E1D32',
    fontSize: 13,
    fontWeight: '700'
  },
  perkDesc: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18
  },
  planCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EAECF2',
    position: 'relative'
  },
  planCardActive: {
    borderColor: '#837CD2',
    backgroundColor: '#F8F7FF'
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#837CD2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  planTitle: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4
  },
  planTitleActive: {
    color: '#837CD2'
  },
  planPrice: {
    color: '#1E1D32',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4
  },
  planPriceActive: {
    color: '#1E1D32'
  },
  planSub: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center'
  },
  purchaseBtn: {
    backgroundColor: '#837CD2',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8
  },
  purchaseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  disclaimerText: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 12
  }
});
