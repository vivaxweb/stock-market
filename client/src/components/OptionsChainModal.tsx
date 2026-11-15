import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTrading } from '../context/TradingContext';

interface StrikeRow {
  strike: number;
  call: {
    symbol: string;
    type: 'CE';
    price: number;
    change: number;
    iv: number;
    delta: number;
    theta: number;
    oi: number;
  };
  put: {
    symbol: string;
    type: 'PE';
    price: number;
    change: number;
    iv: number;
    delta: number;
    theta: number;
    oi: number;
  };
}

interface OptionsChainResponse {
  underlying: string;
  spotPrice: number;
  lotSize: number;
  expiry: string;
  strikes: StrikeRow[];
}

interface OptionsChainModalProps {
  visible: boolean;
  onClose: () => void;
  initialSymbol?: string;
}

export const OptionsChainModal: React.FC<OptionsChainModalProps> = ({
  visible,
  onClose,
  initialSymbol = 'NIFTY 50'
}) => {
  const { createTrade, account } = useTrading();
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [chainData, setChainData] = useState<OptionsChainResponse>(() => {
    // Generate initial instant state for NIFTY 50 so UI is never blank
    const spot = 24225;
    const strikes: StrikeRow[] = [];
    for (let i = -6; i <= 6; i++) {
      const strike = 24200 + i * 50;
      strikes.push({
        strike,
        call: {
          symbol: `NIFTY24DEC${strike}CE`,
          type: 'CE',
          price: Math.max(15, parseFloat((280 - i * 35).toFixed(1))),
          change: 1.4,
          iv: 14.8,
          delta: 0.52,
          theta: -6.4,
          oi: 48000
        },
        put: {
          symbol: `NIFTY24DEC${strike}PE`,
          type: 'PE',
          price: Math.max(15, parseFloat((180 + i * 32).toFixed(1))),
          change: -0.8,
          iv: 15.2,
          delta: -0.48,
          theta: -6.1,
          oi: 52000
        }
      });
    }
    return {
      underlying: 'NIFTY 50',
      spotPrice: spot,
      lotSize: 25,
      expiry: '26-DEC-2024',
      strikes
    };
  });
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState<{
    symbol: string;
    strike: number;
    type: 'CE' | 'PE';
    price: number;
    lotSize: number;
    delta: number;
  } | null>({
    symbol: 'NIFTY24DEC24200CE',
    strike: 24200,
    type: 'CE',
    price: 280.0,
    lotSize: 25,
    delta: 0.52
  });
  const [lots, setLots] = useState<number>(1);

  const HTTP_URL = typeof window !== 'undefined' ? (window.location.origin.includes(':8080') ? '' : 'http://localhost:8080') : 'http://localhost:8080';

  useEffect(() => {
    if (visible) {
      fetchChain(symbol);
    }
  }, [visible, symbol]);

  const fetchChain = async (sym: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${HTTP_URL}/api/options-chain?symbol=${encodeURIComponent(sym)}`);
      const data = await res.json();
      if (data && data.strikes && Array.isArray(data.strikes)) {
        const normalizedStrikes: StrikeRow[] = data.strikes.map((s: any) => ({
          strike: s.strikePrice ?? s.strike ?? 24000,
          call: {
            symbol: s.call?.symbol || `${sym}CE`,
            type: s.call?.optionType || s.call?.type || 'CE',
            price: Number(s.call?.premium ?? s.call?.price ?? 100),
            change: Number(s.call?.change || 0),
            iv: Number(s.call?.iv || 15),
            delta: Number(s.call?.delta || 0.5),
            theta: Number(s.call?.theta || -5),
            oi: Number(s.call?.oi || 45000)
          },
          put: {
            symbol: s.put?.symbol || `${sym}PE`,
            type: s.put?.optionType || s.put?.type || 'PE',
            price: Number(s.put?.premium ?? s.put?.price ?? 100),
            change: Number(s.put?.change || 0),
            iv: Number(s.put?.iv || 15),
            delta: Number(s.put?.delta || -0.5),
            theta: Number(s.put?.theta || -5),
            oi: Number(s.put?.oi || 45000)
          }
        }));

        const lotSz = data.lotSize || (sym === 'BANK NIFTY' ? 15 : 25);
        const spot = data.spotPrice || 24200;

        setChainData({
          underlying: data.underlying || sym,
          spotPrice: spot,
          lotSize: lotSz,
          expiry: data.expiry || '26-DEC-2024',
          strikes: normalizedStrikes
        });

        // Set or update active selection to ATM
        const atm = normalizedStrikes.find(s => Math.abs(s.strike - spot) <= 50) || normalizedStrikes[Math.floor(normalizedStrikes.length / 2)];
        if (atm) {
          setSelectedContract({
            symbol: atm.call.symbol,
            strike: atm.strike,
            type: 'CE',
            price: atm.call.price,
            lotSize: lotSz,
            delta: atm.call.delta
          });
        }
      }
    } catch (e) {
      console.error('Failed to load options chain', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContract = (strike: number, side: 'CE' | 'PE') => {
    if (!chainData) return;
    const targetRow = chainData.strikes.find(s => s.strike === strike);
    if (!targetRow) return;

    const opt = side === 'CE' ? targetRow.call : targetRow.put;
    setSelectedContract({
      symbol: opt.symbol,
      strike: targetRow.strike,
      type: side,
      price: opt.price,
      lotSize: chainData.lotSize,
      delta: opt.delta
    });
  };

  const handleExecuteOptionTrade = () => {
    if (!selectedContract || !chainData) return;

    const quantity = lots * selectedContract.lotSize;
    const totalCost = parseFloat((selectedContract.price * quantity).toFixed(2));
    const cash = account?.indiaCash || 1000000;

    if (totalCost > cash) {
      const msg = 'Insufficient INR paper cash to purchase this option contract.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Order Error', msg);
      return;
    }

    try {
      createTrade({
        symbol: selectedContract.symbol,
        side: 'BUY',
        amount: totalCost,
        leverage: 1,
        isOption: true,
        optionContract: {
          underlying: chainData.underlying,
          symbol: selectedContract.symbol,
          strikePrice: selectedContract.strike,
          optionType: selectedContract.type,
          premium: selectedContract.price,
          lotSize: selectedContract.lotSize,
          expiry: chainData.expiry
        }
      });

      const successMsg = `Bought ${lots} lot(s) (${quantity} qty) of ${selectedContract.symbol} for ₹${totalCost.toLocaleString()}!`;
      if (Platform.OS === 'web') alert(successMsg);
      else Alert.alert('Option Order Executed', successMsg);

      setSelectedContract(null);
      onClose();
    } catch (e: any) {
      alert(e.message || 'Trade execution failed');
    }
  };

  const spot = chainData?.spotPrice || 24200;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.title}>F&O Options Chain</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>BSE / NSE</Text>
                </View>
              </View>
              <Text style={styles.subTitle}>
                Spot: ₹{spot.toLocaleString()} · Expiry: {chainData?.expiry || 'Weekly'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Underlying Index Switcher */}
          <View style={styles.indexTabs}>
            {['NIFTY 50', 'BANK NIFTY', 'SENSEX'].map((idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.indexTab, symbol === idx && styles.indexTabActive]}
                onPress={() => setSymbol(idx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.indexTabText, symbol === idx && styles.indexTabTextActive]}>
                  {idx}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#837CD2" />
              <Text style={styles.loadingText}>Loading Strike Ladder & Greeks...</Text>
            </View>
          ) : (
            <View style={styles.chainTableContainer}>
              {/* Table Column Headers */}
              <View style={styles.tableHeader}>
                <View style={styles.colCall}>
                  <Text style={styles.headerCallText}>CALLS (CE)</Text>
                  <View style={styles.subHeaderRow}>
                    <Text style={styles.subColHeader}>LTP</Text>
                    <Text style={styles.subColHeader}>OI</Text>
                  </View>
                </View>
                <View style={styles.colStrike}>
                  <Text style={styles.headerStrikeText}>STRIKE</Text>
                </View>
                <View style={styles.colPut}>
                  <Text style={styles.headerPutText}>PUTS (PE)</Text>
                  <View style={styles.subHeaderRow}>
                    <Text style={styles.subColHeader}>LTP</Text>
                    <Text style={styles.subColHeader}>OI</Text>
                  </View>
                </View>
              </View>

              {/* Strikes Rows */}
              <ScrollView style={styles.strikesScroll} showsVerticalScrollIndicator={false}>
                {chainData?.strikes.map((row) => {
                  const isAtm = Math.abs(row.strike - spot) <= 50;
                  const isCallSelected = selectedContract?.strike === row.strike && selectedContract.type === 'CE';
                  const isPutSelected = selectedContract?.strike === row.strike && selectedContract.type === 'PE';

                  return (
                    <View key={row.strike} style={[styles.tableRow, isAtm && styles.atmRow]}>
                      {/* Call Option Cell */}
                      <TouchableOpacity
                        style={[styles.callCell, isCallSelected && styles.cellSelectedCall]}
                        onPress={() => handleSelectContract(row.strike, 'CE')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.priceText, styles.callPrice]}>
                          ₹{row.call.price.toFixed(1)}
                        </Text>
                        <Text style={styles.oiText}>{(row.call.oi / 1000).toFixed(0)}k</Text>
                      </TouchableOpacity>

                      {/* Strike Center Cell */}
                      <View style={[styles.strikeCell, isAtm && styles.strikeAtm]}>
                        <Text style={[styles.strikeText, isAtm && styles.strikeTextAtm]}>
                          {row.strike}
                        </Text>
                      </View>

                      {/* Put Option Cell */}
                      <TouchableOpacity
                        style={[styles.putCell, isPutSelected && styles.cellSelectedPut]}
                        onPress={() => handleSelectContract(row.strike, 'PE')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.priceText, styles.putPrice]}>
                          ₹{row.put.price.toFixed(1)}
                        </Text>
                        <Text style={styles.oiText}>{(row.put.oi / 1000).toFixed(0)}k</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Bottom Execution Drawer (When a strike contract is selected) */}
          {selectedContract && (
            <View style={styles.orderDrawer}>
              <View style={styles.drawerTop}>
                <View>
                  <Text style={styles.drawerContractName}>
                    {selectedContract.symbol}
                  </Text>
                  <Text style={styles.drawerContractSub}>
                    Premium: ₹{selectedContract.price.toFixed(2)} · Delta: {selectedContract.delta}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedContract(null)}>
                  <Text style={styles.drawerClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.lotRow}>
                <Text style={styles.lotLabel}>Lot Size: {selectedContract.lotSize} Qty</Text>
                <View style={styles.lotControls}>
                  <TouchableOpacity
                    style={styles.lotBtn}
                    onPress={() => setLots(Math.max(1, lots - 1))}
                  >
                    <Text style={styles.lotBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.lotsCount}>{lots} Lot{lots > 1 ? 's' : ''}</Text>
                  <TouchableOpacity
                    style={styles.lotBtn}
                    onPress={() => setLots(lots + 1)}
                  >
                    <Text style={styles.lotBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Margin Required:</Text>
                <Text style={styles.totalValue}>
                  ₹{(selectedContract.price * lots * selectedContract.lotSize).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.executeBtn,
                  selectedContract.type === 'CE' ? styles.executeCallBtn : styles.executePutBtn
                ]}
                onPress={handleExecuteOptionTrade}
                activeOpacity={0.85}
              >
                <Text style={styles.executeBtnText}>
                  Buy {selectedContract.type === 'CE' ? 'Call' : 'Put'} ({lots * selectedContract.lotSize} Qty)
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    height: '92%',
    padding: 18,
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
    marginBottom: 14
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    color: '#1E1D32',
    fontSize: 18,
    fontWeight: '800'
  },
  badge: {
    backgroundColor: '#F3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  badgeText: {
    color: '#837CD2',
    fontSize: 10,
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
  indexTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  indexTab: {
    flex: 1,
    backgroundColor: '#F8F9FD',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  indexTabActive: {
    backgroundColor: '#837CD2',
    borderColor: '#837CD2'
  },
  indexTabText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700'
  },
  indexTabTextActive: {
    color: '#FFFFFF'
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
  chainTableContainer: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF2',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FD',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF2',
    paddingVertical: 6
  },
  colCall: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#EAECF2'
  },
  colStrike: {
    width: 74,
    alignItems: 'center',
    justifyContent: 'center'
  },
  colPut: {
    flex: 1,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#EAECF2'
  },
  headerCallText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#01CEA5'
  },
  headerStrikeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280'
  },
  headerPutText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF4D6A'
  },
  subHeaderRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: 2
  },
  subColHeader: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF'
  },
  strikesScroll: {
    flex: 1
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  atmRow: {
    backgroundColor: '#FFFDF0'
  },
  callCell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6'
  },
  cellSelectedCall: {
    backgroundColor: '#EDFAF5'
  },
  putCell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#F3F4F6'
  },
  cellSelectedPut: {
    backgroundColor: '#FFF1F3'
  },
  strikeCell: {
    width: 74,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8F9FD'
  },
  strikeAtm: {
    backgroundColor: '#FEF3C7'
  },
  strikeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E1D32'
  },
  strikeTextAtm: {
    color: '#D97706'
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700'
  },
  callPrice: {
    color: '#059669'
  },
  putPrice: {
    color: '#DC2626'
  },
  oiText: {
    fontSize: 10,
    color: '#9CA3AF'
  },
  orderDrawer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#837CD2',
    paddingTop: 12,
    marginTop: 10
  },
  drawerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  drawerContractName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1D32'
  },
  drawerContractSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2
  },
  drawerClose: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '700',
    padding: 4
  },
  lotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  lotLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600'
  },
  lotControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  lotBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F0F2F8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lotBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1D32'
  },
  lotsCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1D32'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600'
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1D32'
  },
  executeBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  executeCallBtn: {
    backgroundColor: '#01CEA5'
  },
  executePutBtn: {
    backgroundColor: '#FF4D6A'
  },
  executeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});
