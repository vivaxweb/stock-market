import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Image,
  Platform,
  Alert,
  PanResponder,
  Animated,
  LayoutChangeEvent
} from 'react-native';
import { useTrading, Position } from '../context/TradingContext';

interface OrderPanelProps {
  onOpenOptionsChain?: () => void;
}

interface SwipeToTradeSliderProps {
  side: 'BUY' | 'SELL';
  symbol: string;
  onExecute: () => void;
  disabled?: boolean;
}

const SwipeToTradeSlider: React.FC<SwipeToTradeSliderProps> = ({
  side,
  symbol,
  onExecute,
  disabled
}) => {
  const [trackWidth, setTrackWidth] = useState<number>(300);
  const thumbWidth = 50;
  const maxSlide = Math.max(0, trackWidth - thumbWidth - 8);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const isExecuting = React.useRef<boolean>(false);

  const isBuy = side === 'BUY';
  const themeColor = isBuy ? '#01CEA5' : '#FF5A5F';
  const trackBg = isBuy ? '#E6FAF5' : '#FEE2E2';
  const trackBorder = isBuy ? '#A7F3D0' : '#FECACA';

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gestureState) => !disabled && Math.abs(gestureState.dx) > 4,
      onPanResponderMove: (_, gestureState) => {
        if (disabled || isExecuting.current) return;
        const boundedX = Math.max(0, Math.min(maxSlide, gestureState.dx));
        slideAnim.setValue(boundedX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (disabled || isExecuting.current) return;
        if (gestureState.dx >= maxSlide * 0.6) {
          isExecuting.current = true;
          Animated.timing(slideAnim, {
            toValue: maxSlide,
            duration: 150,
            useNativeDriver: false
          }).start(() => {
            onExecute();
            setTimeout(() => {
              isExecuting.current = false;
              slideAnim.setValue(0);
            }, 600);
          });
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 8
          }).start();
        }
      }
    })
  ).current;

  const handleTap = () => {
    if (disabled || isExecuting.current) return;
    isExecuting.current = true;
    Animated.timing(slideAnim, {
      toValue: maxSlide,
      duration: 180,
      useNativeDriver: false
    }).start(() => {
      onExecute();
      setTimeout(() => {
        isExecuting.current = false;
        slideAnim.setValue(0);
      }, 600);
    });
  };

  return (
    <View
      style={[
        styles.sliderTrack,
        { backgroundColor: trackBg, borderColor: trackBorder },
        disabled && styles.sliderTrackDisabled
      ]}
      onLayout={(e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setTrackWidth(w);
      }}
    >
      <TouchableOpacity
        style={styles.sliderTrackCenter}
        onPress={handleTap}
        activeOpacity={0.8}
      >
        <Text style={[styles.sliderTrackText, { color: themeColor }]}>
          SWIPE TO CONFIRM {side} »
        </Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.sliderThumb,
          {
            backgroundColor: themeColor,
            transform: [{ translateX: slideAnim }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={handleTap}
          style={styles.sliderThumbInner}
          activeOpacity={0.9}
        >
          <Text style={styles.sliderThumbArrow}>→</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export const OrderPanel: React.FC<OrderPanelProps> = ({ onOpenOptionsChain }) => {
  const {
    selectedAsset,
    activeMarket,
    account,
    positions,
    createTrade,
    closeTrade,
    undoTrade,
    setStops
  } = useTrading();

  const isGlobal = activeMarket === 'GLOBAL';
  const currencySymbol = isGlobal ? '$' : '₹';
  const availableCash = isGlobal ? (account?.globalCash || 100000) : (account?.indiaCash || 1000000);

  // Check if there is an active trade for the currently selected asset
  const activeTradeForAsset = positions.find(
    p => p.symbol === selectedAsset?.symbol || (p.isOption && p.symbol.startsWith(selectedAsset?.symbol || ''))
  );

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return window.location.search.includes('open_order=true');
      }
    } catch (e) {}
    return false;
  });
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');

  // Amount & leverage
  const defaultAmounts = isGlobal ? [100, 500, 1000, 5000] : [5000, 25000, 100000, 500000];
  const [amount, setAmount] = useState<number>(defaultAmounts[1]);
  const [customAmountText, setCustomAmountText] = useState<string>(String(defaultAmounts[1]));
  const [selectedAllocationPct, setSelectedAllocationPct] = useState<number | null>(null);
  const [leverage, setLeverage] = useState<number>(1);
  const [slPercent, setSlPercent] = useState<number | null>(null);
  const [tpPercent, setTpPercent] = useState<number | null>(null);

  // Stops editing modal
  const [stopsModalVisible, setStopsModalVisible] = useState<boolean>(false);

  const leverages = [1, 5, 10, 20, 50];

  const handleOpenDrawer = (side: 'BUY' | 'SELL') => {
    setTradeSide(side);
    setDrawerVisible(true);
  };

  const handleExecuteTrade = () => {
    if (!selectedAsset) return;

    const amt = parseFloat(customAmountText) || amount;
    if (amt <= 0) {
      alert('Please enter a valid trade amount.');
      return;
    }

    if (amt > availableCash) {
      alert('Insufficient virtual cash balance for this order.');
      return;
    }

    const currentPrice = selectedAsset.price;
    let stopLossPrice = undefined;
    let takeProfitPrice = undefined;

    if (slPercent !== null) {
      stopLossPrice = tradeSide === 'BUY'
        ? currentPrice * (1 - slPercent / 100)
        : currentPrice * (1 + slPercent / 100);
    }

    if (tpPercent !== null) {
      takeProfitPrice = tradeSide === 'BUY'
        ? currentPrice * (1 + tpPercent / 100)
        : currentPrice * (1 - tpPercent / 100);
    }

    createTrade({
      symbol: selectedAsset.symbol,
      assetName: selectedAsset.name,
      category: selectedAsset.category,
      market: activeMarket,
      side: tradeSide,
      amount: amt,
      leverage,
      stopLoss: stopLossPrice,
      takeProfit: takeProfitPrice
    });

    setDrawerVisible(false);
  };

  const handleSaveStops = () => {
    if (!activeTradeForAsset || !selectedAsset) return;

    const currentPrice = selectedAsset.price;
    let sl = undefined;
    let tp = undefined;

    if (slPercent !== null) {
      sl = activeTradeForAsset.side === 'BUY'
        ? currentPrice * (1 - slPercent / 100)
        : currentPrice * (1 + slPercent / 100);
    }

    if (tpPercent !== null) {
      tp = activeTradeForAsset.side === 'BUY'
        ? currentPrice * (1 + tpPercent / 100)
        : currentPrice * (1 - tpPercent / 100);
    }

    setStops(activeTradeForAsset.id, sl, tp);
    setStopsModalVisible(false);
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString(isGlobal ? 'en-US' : 'en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  const totalExposure = (parseFloat(customAmountText) || amount) * leverage;
  const isIndianIndex = selectedAsset?.category === 'INDEX';

  return (
    <View style={styles.container}>
      {/* If active trade exists for this symbol: morph into In-Trade Controls */}
      {activeTradeForAsset ? (
        <View style={styles.inTradeBar}>
          {/* Stops Button */}
          <TouchableOpacity
            style={[styles.inTradeBtn, styles.stopsBtn]}
            onPress={() => setStopsModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.stopsBtnText}>Stops</Text>
          </TouchableOpacity>

          {/* Undo Trade (Rewind Token) Button */}
          <TouchableOpacity
            style={[styles.inTradeBtn, styles.undoBtn]}
            onPress={() => undoTrade(activeTradeForAsset.id)}
            activeOpacity={0.8}
          >
            <View style={styles.undoBadge}>
              <Text style={styles.undoBadgeText}>{account?.undoTokens || 0}</Text>
            </View>
            <Text style={styles.undoBtnText}>Undo</Text>
          </TouchableOpacity>

          {/* Close Position Button with Live PnL */}
          <TouchableOpacity
            style={[styles.inTradeBtn, styles.closeBtn]}
            onPress={() => closeTrade(activeTradeForAsset.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.closeBtnText}>
              Close ({(activeTradeForAsset.pnl || 0) >= 0 ? '+' : ''}{currencySymbol}{formatPrice(activeTradeForAsset.pnl || 0)})
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Option B: Pulse Pro Controls: Leverage Multiplier & SL / TP Quick Selectors */}
          <View style={styles.pulseControlsRow}>
            {/* Leverage Multiplier Chips */}
            <View style={styles.pulseLeverageCol}>
              <Text style={styles.pulseControlLabel}>Leverage</Text>
              <View style={styles.pulseChipsRow}>
                {leverages.map(lev => (
                  <TouchableOpacity
                    key={lev}
                    style={[styles.pulseChip, leverage === lev && styles.pulseChipActive]}
                    onPress={() => setLeverage(lev)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pulseChipText, leverage === lev && styles.pulseChipTextActive]}>
                      {lev}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quick SL & TP Inputs */}
            <View style={styles.pulseRiskCol}>
              <View style={styles.pulseRiskItem}>
                <Text style={styles.pulseControlLabel}>SL</Text>
                <TouchableOpacity
                  style={[styles.pulseRiskInput, slPercent !== null && styles.pulseRiskInputActiveSL]}
                  onPress={() => {
                    const next = slPercent === null ? 5 : slPercent === 5 ? 10 : slPercent === 10 ? 20 : null;
                    setSlPercent(next);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pulseRiskInputText, slPercent !== null && styles.pulseRiskInputTextActiveSL]}>
                    {slPercent !== null ? `-${slPercent}%` : 'SL'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.pulseRiskItem}>
                <Text style={styles.pulseControlLabel}>TP</Text>
                <TouchableOpacity
                  style={[styles.pulseRiskInput, tpPercent !== null && styles.pulseRiskInputActiveTP]}
                  onPress={() => {
                    const next = tpPercent === null ? 10 : tpPercent === 10 ? 25 : tpPercent === 25 ? 50 : null;
                    setTpPercent(next);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pulseRiskInputText, tpPercent !== null && styles.pulseRiskInputTextActiveTP]}>
                    {tpPercent !== null ? `+${tpPercent}%` : 'TP'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Option B Dual Action Buttons: BUY (Emerald Glow) & SELL (Coral Glow) */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.buyBtn]}
              onPress={() => handleOpenDrawer('BUY')}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: '/images/app-icons-png/Chart/BuyIcon.png' }}
                style={styles.actionIcon}
                resizeMode="contain"
              />
              <View style={styles.actionBtnCol}>
                <Text style={styles.actionBtnSide}>BUY</Text>
                <Text style={styles.actionBtnPrice}>{currencySymbol}{formatPrice(selectedAsset?.price || 0)}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.sellBtn]}
              onPress={() => handleOpenDrawer('SELL')}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: '/images/app-icons-png/Chart/SellIcon.png' }}
                style={styles.actionIcon}
                resizeMode="contain"
              />
              <View style={styles.actionBtnCol}>
                <Text style={styles.actionBtnSide}>SELL</Text>
                <Text style={styles.actionBtnPrice}>{currencySymbol}{formatPrice(selectedAsset?.price || 0)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Prominent F&O Option Chain Launcher for NIFTY / BANKNIFTY */}
      {isIndianIndex && onOpenOptionsChain && (
        <TouchableOpacity
          style={styles.optionsChainLink}
          onPress={onOpenOptionsChain}
          activeOpacity={0.7}
        >
          <Text style={styles.optionsChainText}>
            Open {selectedAsset?.symbol} F&O Options Chain (Calls & Puts) →
          </Text>
        </TouchableOpacity>
      )}

      {/* Slide-Up Order Execution Drawer (Clean White Modal) */}
      <Modal
        visible={drawerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.drawerContainer}>
            {/* Drawer Handle */}
            <View style={styles.drawerHandle} />

            {/* Header with Title and Close X */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerHeaderTop}>
                <View style={[styles.orderSideBadge, tradeSide === 'BUY' ? styles.orderSideBadgeBuy : styles.orderSideBadgeSell]}>
                  <Text style={[styles.orderSideBadgeText, tradeSide === 'BUY' ? styles.orderSideBadgeTextBuy : styles.orderSideBadgeTextSell]}>
                    MARKET {tradeSide}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.drawerCloseX}
                  onPress={() => setDrawerVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.drawerCloseXText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.drawerTitle}>
                {selectedAsset?.name} ({selectedAsset?.symbol})
              </Text>
              <Text style={styles.drawerSubtitle}>
                Market Price: {currencySymbol}{formatPrice(selectedAsset?.price || 0)} · Available: {currencySymbol}{formatPrice(availableCash)}
              </Text>
            </View>

            {/* Percentage Balance Allocation Chips (Concept 5 Parity) */}
            <View style={styles.allocationSection}>
              <Text style={styles.sectionLabel}>Capital Allocation</Text>
              <View style={styles.allocationRow}>
                {[25, 50, 75, 100].map(pct => {
                  const targetVal = Math.floor(availableCash * (pct / 100));
                  const isSelected = selectedAllocationPct === pct;
                  return (
                    <TouchableOpacity
                      key={pct}
                      style={[styles.allocationChip, isSelected && styles.allocationChipActive]}
                      onPress={() => {
                        setSelectedAllocationPct(pct);
                        setAmount(targetVal);
                        setCustomAmountText(String(targetVal));
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.allocationChipText, isSelected && styles.allocationChipTextActive]}>
                        {pct === 100 ? 'MAX' : `${pct}%`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Preset Amount Chips */}
            <Text style={styles.sectionLabel}>Preset Margin Amount</Text>
            <View style={styles.chipRow}>
              {defaultAmounts.map(val => (
                <TouchableOpacity
                  key={val}
                  style={[styles.chip, amount === val && selectedAllocationPct === null && styles.chipActive]}
                  onPress={() => {
                    setSelectedAllocationPct(null);
                    setAmount(val);
                    setCustomAmountText(String(val));
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, amount === val && selectedAllocationPct === null && styles.chipTextActive]}>
                    {currencySymbol}{val >= 1000 ? (val / 1000) + 'k' : val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Amount Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>{currencySymbol}</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={customAmountText}
                onChangeText={(text) => {
                  setSelectedAllocationPct(null);
                  setCustomAmountText(text);
                  const parsed = parseFloat(text);
                  if (!isNaN(parsed)) setAmount(parsed);
                }}
                placeholder="Enter custom amount"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Leverage Multiplier Chips */}
            <Text style={styles.sectionLabel}>Leverage Multiplier</Text>
            <View style={styles.chipRow}>
              {leverages.map(lev => (
                <TouchableOpacity
                  key={lev}
                  style={[styles.chip, leverage === lev && styles.chipActive]}
                  onPress={() => setLeverage(lev)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, leverage === lev && styles.chipTextActive]}>
                    {lev}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stop Loss & Take Profit Target Pickers with Live Calculations */}
            <Text style={styles.sectionLabel}>Risk Management (Optional)</Text>
            <View style={styles.slTpRow}>
              <View style={styles.slTpCol}>
                <View style={styles.slTpTitleRow}>
                  <Text style={styles.slTpTitle}>Stop Loss</Text>
                  {slPercent !== null && (
                    <Text style={styles.slTpCalcText}>
                      -{currencySymbol}{formatPrice(totalExposure * (slPercent / 100))}
                    </Text>
                  )}
                </View>
                <View style={styles.chipRowSmall}>
                  {[5, 10, 20].map(pct => (
                    <TouchableOpacity
                      key={pct}
                      style={[styles.chipSmall, slPercent === pct && styles.chipSmallActiveSL]}
                      onPress={() => setSlPercent(slPercent === pct ? null : pct)}
                    >
                      <Text style={[styles.chipSmallText, slPercent === pct && styles.chipSmallTextActiveSL]}>
                        -{pct}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.slTpCol}>
                <View style={styles.slTpTitleRow}>
                  <Text style={styles.slTpTitle}>Take Profit</Text>
                  {tpPercent !== null && (
                    <Text style={styles.tpTpCalcText}>
                      +{currencySymbol}{formatPrice(totalExposure * (tpPercent / 100))}
                    </Text>
                  )}
                </View>
                <View style={styles.chipRowSmall}>
                  {[10, 25, 50].map(pct => (
                    <TouchableOpacity
                      key={pct}
                      style={[styles.chipSmall, tpPercent === pct && styles.chipSmallActiveTP]}
                      onPress={() => setTpPercent(tpPercent === pct ? null : pct)}
                    >
                      <Text style={[styles.chipSmallText, tpPercent === pct && styles.chipSmallTextActiveTP]}>
                        +{pct}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Trade Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Exposure:</Text>
                <Text style={styles.summaryValue}>{currencySymbol}{formatPrice(totalExposure)} ({leverage}x)</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Margin Required:</Text>
                <Text style={[styles.summaryValue, (parseFloat(customAmountText) || amount) > availableCash && styles.insufficientText]}>
                  {currencySymbol}{formatPrice(parseFloat(customAmountText) || amount)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Available Cash:</Text>
                <Text style={styles.summaryValue}>{currencySymbol}{formatPrice(availableCash)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Brokerage & Charges:</Text>
                <Text style={[styles.summaryValue, { color: '#01CEA5' }]}>Free (₹0 Paper Trade)</Text>
              </View>
              {(parseFloat(customAmountText) || amount) > availableCash && (
                <View style={styles.insufficientBanner}>
                  <Text style={styles.insufficientBannerText}>
                    Insufficient virtual cash balance for this order.
                  </Text>
                </View>
              )}
            </View>

            {/* Tactile Swipe-to-Trade Slider with Cancel */}
            <View style={styles.drawerSwipeRow}>
              <TouchableOpacity
                style={styles.cancelBtnSmall}
                onPress={() => setDrawerVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnSmallText}>Cancel</Text>
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <SwipeToTradeSlider
                  side={tradeSide}
                  symbol={selectedAsset?.symbol || ''}
                  onExecute={handleExecuteTrade}
                  disabled={(parseFloat(customAmountText) || amount) > availableCash}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Risk Limits / Stops Modal */}
      <Modal
        visible={stopsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStopsModalVisible(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.stopsDialog}>
            <Text style={styles.stopsDialogTitle}>Set Risk Limits</Text>
            <Text style={styles.stopsDialogSub}>
              Active Position: {activeTradeForAsset?.symbol} ({activeTradeForAsset?.side})
            </Text>

            <Text style={styles.sectionLabel}>Stop Loss (% loss limit)</Text>
            <View style={styles.chipRow}>
              {[5, 10, 20, 50].map(pct => (
                <TouchableOpacity
                  key={pct}
                  style={[styles.chip, slPercent === pct && styles.chipActive]}
                  onPress={() => setSlPercent(slPercent === pct ? null : pct)}
                >
                  <Text style={[styles.chipText, slPercent === pct && styles.chipTextActive]}>-{pct}%</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Take Profit (% profit target)</Text>
            <View style={styles.chipRow}>
              {[10, 25, 50, 100].map(pct => (
                <TouchableOpacity
                  key={pct}
                  style={[styles.chip, tpPercent === pct && styles.chipActive]}
                  onPress={() => setTpPercent(tpPercent === pct ? null : pct)}
                >
                  <Text style={[styles.chipText, tpPercent === pct && styles.chipTextActive]}>+{pct}%</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dialogBtnRow}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                onPress={() => setStopsModalVisible(false)}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogSaveBtn}
                onPress={handleSaveStops}
              >
                <Text style={styles.dialogSaveText}>Save Stops</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF2'
  },
  /* Option B: Pulse Pro Controls Row */
  pulseControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 12
  },
  pulseLeverageCol: {
    flex: 1
  },
  pulseControlLabel: {
    color: '#8E94A5',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 4
  },
  pulseChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  pulseChip: {
    flex: 1,
    height: 30,
    borderRadius: 7,
    backgroundColor: '#F8F9FD',
    borderWidth: 1,
    borderColor: '#EAECF2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pulseChipActive: {
    backgroundColor: '#837CD2',
    borderColor: '#837CD2',
    shadowColor: '#837CD2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(131, 124, 210, 0.35)'
    } : {})
  },
  pulseChipText: {
    color: '#4B5563',
    fontSize: 10.5,
    fontWeight: '700'
  },
  pulseChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  pulseRiskCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  pulseRiskItem: {
    width: 48
  },
  pulseRiskInput: {
    height: 30,
    borderRadius: 7,
    backgroundColor: '#F8F9FD',
    borderWidth: 1,
    borderColor: '#EAECF2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pulseRiskInputActiveSL: {
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
    borderColor: '#FF5A5F'
  },
  pulseRiskInputActiveTP: {
    backgroundColor: 'rgba(1, 206, 165, 0.1)',
    borderColor: '#01CEA5'
  },
  pulseRiskInputText: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700'
  },
  pulseRiskInputTextActiveSL: {
    color: '#FF5A5F',
    fontWeight: '800'
  },
  pulseRiskInputTextActiveTP: {
    color: '#01CEA5',
    fontWeight: '800'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  actionBtnCol: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionBtnSide: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  actionBtnPrice: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: -0.2
  },
  sellBtn: {
    backgroundColor: '#FF5A5F',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 8px 24px rgba(255, 90, 95, 0.42)'
    } : {})
  },
  buyBtn: {
    backgroundColor: '#01CEA5',
    shadowColor: '#01CEA5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 8px 24px rgba(1, 206, 165, 0.42)'
    } : {})
  },
  actionIcon: {
    width: 16,
    height: 16,
    marginRight: 8
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'Rubik, sans-serif' : undefined
  },
  inTradeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  inTradeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stopsBtn: {
    borderWidth: 1.5,
    borderColor: '#837CD2',
    backgroundColor: '#F8F7FF'
  },
  stopsBtnText: {
    color: '#837CD2',
    fontSize: 14,
    fontWeight: '700'
  },
  undoBtn: {
    borderWidth: 1.5,
    borderColor: '#837CD2',
    backgroundColor: '#F8F7FF',
    position: 'relative'
  },
  undoBtnText: {
    color: '#837CD2',
    fontSize: 14,
    fontWeight: '700'
  },
  undoBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#7871C4',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  undoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  closeBtn: {
    backgroundColor: '#FF5A5F'
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  optionsChainLink: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center'
  },
  optionsChainText: {
    color: '#7871C4',
    fontSize: 13,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end'
  },
  drawerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
    borderTopWidth: 1,
    borderTopColor: '#EAECF2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8
  },
  drawerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16
  },
  drawerHeader: {
    marginBottom: 16
  },
  drawerTitle: {
    color: '#1E1D32',
    fontSize: 18,
    fontWeight: '800'
  },
  drawerSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4
  },
  sectionLabel: {
    color: '#1E1D32',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F0F2F8',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  chipActive: {
    backgroundColor: '#7871C4',
    borderColor: '#7871C4'
  },
  chipText: {
    color: '#1E1D32',
    fontSize: 12,
    fontWeight: '700'
  },
  chipTextActive: {
    color: '#FFFFFF'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    marginVertical: 4
  },
  inputPrefix: {
    color: '#1E1D32',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 6
  },
  amountInput: {
    flex: 1,
    height: 42,
    color: '#1E1D32',
    fontSize: 14,
    fontWeight: '600'
  },
  slTpRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4
  },
  slTpCol: {
    flex: 1
  },
  slTpTitle: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4
  },
  chipRowSmall: {
    flexDirection: 'row',
    gap: 4
  },
  chipSmall: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#F0F2F8',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  chipSmallActive: {
    backgroundColor: '#7871C4',
    borderColor: '#7871C4'
  },
  chipSmallText: {
    color: '#1E1D32',
    fontSize: 11,
    fontWeight: '700'
  },
  chipSmallTextActive: {
    color: '#FFFFFF'
  },
  summaryCard: {
    backgroundColor: '#F8F9FD',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#EAECF2',
    gap: 6
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600'
  },
  summaryValue: {
    color: '#1E1D32',
    fontSize: 13,
    fontWeight: '800'
  },
  insufficientText: {
    color: '#FF5A5F'
  },
  insufficientBanner: {
    marginTop: 6,
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  insufficientBannerText: {
    color: '#FF5A5F',
    fontSize: 10,
    fontWeight: '700'
  },
  drawerHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  orderSideBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  orderSideBadgeBuy: {
    backgroundColor: 'rgba(1, 206, 165, 0.12)'
  },
  orderSideBadgeSell: {
    backgroundColor: 'rgba(255, 90, 95, 0.12)'
  },
  orderSideBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  orderSideBadgeTextBuy: {
    color: '#01CEA5'
  },
  orderSideBadgeTextSell: {
    color: '#FF5A5F'
  },
  drawerCloseX: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  drawerCloseXText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280'
  },
  allocationSection: {
    marginBottom: 6
  },
  allocationRow: {
    flexDirection: 'row',
    gap: 8
  },
  allocationChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F8F9FD',
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  allocationChipActive: {
    backgroundColor: '#F0EFFE',
    borderColor: '#837CD2',
    borderWidth: 1.5
  },
  allocationChipText: {
    color: '#4B5563',
    fontSize: 11.5,
    fontWeight: '700'
  },
  allocationChipTextActive: {
    color: '#837CD2',
    fontWeight: '800'
  },
  slTpTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  slTpCalcText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF5A5F'
  },
  tpTpCalcText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#01CEA5'
  },
  chipSmallActiveSL: {
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    borderColor: '#FF5A5F',
    borderWidth: 1.5
  },
  chipSmallTextActiveSL: {
    color: '#FF5A5F',
    fontWeight: '800'
  },
  chipSmallActiveTP: {
    backgroundColor: 'rgba(1, 206, 165, 0.12)',
    borderColor: '#01CEA5',
    borderWidth: 1.5
  },
  chipSmallTextActiveTP: {
    color: '#01CEA5',
    fontWeight: '800'
  },
  drawerSwipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18
  },
  cancelBtnSmall: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelBtnSmallText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700'
  },
  sliderTrack: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 3
  },
  sliderTrackDisabled: {
    opacity: 0.5
  },
  sliderTrackCenter: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  sliderTrackText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  sliderThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4
  },
  sliderThumbInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sliderThumbArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900'
  },
  drawerBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6'
  },
  cancelBtnText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700'
  },
  executeBtn: {
    flex: 2,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  executeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  stopsDialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAECF2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8
  },
  stopsDialogTitle: {
    color: '#1E1D32',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4
  },
  stopsDialogSub: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 12
  },
  dialogBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18
  },
  dialogCancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6'
  },
  dialogCancelText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700'
  },
  dialogSaveBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7871C4'
  },
  dialogSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
