import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Image
} from 'react-native';
import { useTrading, Asset } from '../context/TradingContext';
import { AssetIcon } from './AssetIcon';

interface AssetSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectOptionChain?: (asset: Asset) => void;
  onNavigateTrade?: (asset: Asset) => void;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  visible,
  onClose,
  onSelectOptionChain,
  onNavigateTrade
}) => {
  const { assets, selectedAsset, setSelectedAsset, activeMarket, switchMarket } = useTrading();
  const [modalMarket, setModalMarket] = useState<'INDIA' | 'GLOBAL'>(activeMarket);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.get('q') || params.get('search') || '';
      }
    } catch (e) {}
    return '';
  });

  // Sync modalMarket if activeMarket changes while closed
  React.useEffect(() => {
    setModalMarket(activeMarket);
  }, [activeMarket, visible]);

  if (!visible) return null;

  const isGlobal = modalMarket === 'GLOBAL';
  const currencySymbol = isGlobal ? '$' : '₹';

  const categories = isGlobal
    ? ['ALL', 'STOCK', 'CRYPTO', 'FOREX']
    : ['ALL', 'STOCK', 'INDEX'];

  // Trending Hot Tickers for Instant Tap Search
  const trendingIndian = [
    { label: 'NIFTY 50', tag: 'HOT', query: 'NIFTY 50' },
    { label: 'BANK NIFTY', tag: 'HOT', query: 'BANK NIFTY' },
    { label: 'RELIANCE', tag: 'POPULAR', query: 'RELIANCE' },
    { label: 'TATAMOTORS', tag: 'HOT', query: 'TATAMOTORS' },
    { label: 'TCS', tag: 'TECH', query: 'TCS' },
    { label: 'ZOMATO', tag: 'ACTIVE', query: 'ZOMATO' }
  ];

  const trendingGlobal = [
    { label: 'BTC/USD', tag: 'HOT', query: 'BTC/USD' },
    { label: 'NVDA', tag: 'POPULAR', query: 'NVDA' },
    { label: 'AAPL', tag: 'TECH', query: 'AAPL' },
    { label: 'TSLA', tag: 'ACTIVE', query: 'TSLA' },
    { label: 'ETH/USD', tag: 'CRYPTO', query: 'ETH/USD' },
    { label: 'XAU/USD', tag: 'GOLD', query: 'XAU' }
  ];

  const currentTrending = isGlobal ? trendingGlobal : trendingIndian;

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // 1. Market filter
      if (asset.market !== modalMarket) return false;

      // 2. Category filter
      if (filterCategory !== 'ALL' && asset.category !== filterCategory) return false;

      // 3. Search filter (multi-field: symbol, name, category)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesSym = asset.symbol.toLowerCase().includes(q);
        const matchesName = asset.name.toLowerCase().includes(q);
        const matchesCat = asset.category.toLowerCase().includes(q);
        return matchesSym || matchesName || matchesCat;
      }

      return true;
    });
  }, [assets, modalMarket, filterCategory, search]);

  const formatPrice = (price: number) => {
    const digits = (price < 2) ? 4 : 2;
    return price.toLocaleString(isGlobal ? 'en-US' : 'en-IN', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  };

  const handleSelectAsset = (asset: Asset) => {
    if (asset.market !== activeMarket) {
      switchMarket(asset.market);
    }
    setSelectedAsset(asset);
    if (onNavigateTrade) {
      onNavigateTrade(asset);
    }
    onClose();
  };

  const getExchangeBadge = (asset: Asset) => {
    if (asset.category === 'INDEX') return 'INDEX';
    if (asset.category === 'CRYPTO') return 'BINANCE';
    if (asset.category === 'FOREX') return 'GLOBAL FX';
    if (asset.market === 'INDIA') return 'BSE / NSE';
    return 'NASDAQ';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.sheetTitle}>Markets &amp; Assets</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{filteredAssets.length} Available</Text>
                </View>
              </View>
              <Text style={styles.sheetSubtitle}>
                Trade BSE/NSE equities, Global tech stocks, Crypto &amp; Forex
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Market Switcher Tabs */}
          <View style={styles.marketSwitcher}>
            <TouchableOpacity
              style={[styles.marketPill, !isGlobal && styles.marketPillActive]}
              onPress={() => {
                setModalMarket('INDIA');
                setFilterCategory('ALL');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.marketPillText, !isGlobal && styles.marketPillTextActive]}>
                Indian Markets (BSE / NSE)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.marketPill, isGlobal && styles.marketPillActive]}
              onPress={() => {
                setModalMarket('GLOBAL');
                setFilterCategory('ALL');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.marketPillText, isGlobal && styles.marketPillTextActive]}>
                Global (US Tech &amp; Crypto)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Clean Elevated Search Input Bar */}
          <View style={styles.searchRow}>
            <Image
              source={{ uri: '/images/app-icons-png/SearchGray.png' }}
              style={styles.searchIcon}
              resizeMode="contain"
            />
            <TextInput
              style={styles.searchInput}
              placeholder={isGlobal ? "Search NVDA, Apple, Bitcoin, Gold..." : "Search Reliance, Tata, Nifty, Infosys..."}
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoFocus={false}
              clearButtonMode="while-editing"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchBtn} activeOpacity={0.7}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Trending Searches Quick-Tap Tags (Groww & Kite Style) */}
          <View style={styles.trendingContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingScroll}
            >
              <Text style={styles.trendingLabel}>Trending:</Text>
              {currentTrending.map(item => {
                const isSelected = search.toLowerCase() === item.query.toLowerCase();
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.trendingChip, isSelected && styles.trendingChipActive]}
                    onPress={() => setSearch(isSelected ? '' : item.query)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.chipTagBadge}>
                      <Text style={styles.chipTagText}>{item.tag}</Text>
                    </View>
                    <Text style={[styles.trendingChipText, isSelected && styles.trendingChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Category Filter Pills */}
          <View style={styles.categoryScrollContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, filterCategory === cat && styles.categoryPillActive]}
                  onPress={() => setFilterCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryText, filterCategory === cat && styles.categoryTextActive]}>
                    {cat === 'ALL' ? 'All Instruments' : cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Results Summary Subheader */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsHeaderText}>
              {search.trim() ? `Search results for "${search}"` : `Top ${modalMarket === 'INDIA' ? 'Indian' : 'Global'} Instruments`}
            </Text>
            <Text style={styles.resultsHeaderCount}>
              {filteredAssets.length} found
            </Text>
          </View>

          {/* Assets List */}
          <ScrollView
            style={styles.assetsList}
            contentContainerStyle={styles.assetsListContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredAssets.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No matching instruments</Text>
                <Text style={styles.emptySubText}>
                  No instruments found matching "${search}" in ${modalMarket === 'INDIA' ? 'Indian Markets' : 'Global Markets'}.
                </Text>
                <TouchableOpacity
                  style={styles.clearFiltersBtn}
                  onPress={() => {
                    setSearch('');
                    setFilterCategory('ALL');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredAssets.map(asset => {
                const isSelected = selectedAsset?.symbol === asset.symbol;
                const isUp = (asset.change24h || 0) >= 0;
                const isIndex = asset.category === 'INDEX';

                return (
                  <TouchableOpacity
                    key={asset.symbol}
                    style={[styles.assetRow, isSelected && styles.assetRowSelected]}
                    onPress={() => handleSelectAsset(asset)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.assetLeft}>
                      <AssetIcon symbol={asset.symbol} size={42} />
                      <View style={styles.nameCol}>
                        <View style={styles.symbolBadgeRow}>
                          <Text style={styles.symbolText}>{asset.symbol}</Text>
                          <View style={styles.exchangeBadge}>
                            <Text style={styles.exchangeBadgeText}>{getExchangeBadge(asset)}</Text>
                          </View>
                        </View>
                        <Text style={styles.nameText} numberOfLines={1}>{asset.name}</Text>
                      </View>
                    </View>

                    <View style={styles.assetRight}>
                      <Text style={styles.priceText}>
                        {currencySymbol}{formatPrice(asset.price)}
                      </Text>
                      <View style={styles.rightBadgeRow}>
                        <View style={[styles.changeBadge, isUp ? styles.badgeGreen : styles.badgeRed]}>
                          <Text style={[styles.changeText, isUp ? styles.textGreen : styles.textRed]}>
                            {isUp ? '+' : ''}{(asset.change24h || 0).toFixed(2)}%
                          </Text>
                        </View>
                        <View style={styles.tradeActionPill}>
                          <Text style={styles.tradeActionText}>Trade →</Text>
                        </View>
                      </View>
                      {isIndex && onSelectOptionChain && (
                        <TouchableOpacity
                          style={styles.optionsChainPill}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            onSelectOptionChain(asset);
                            onClose();
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.optionsChainPillText}>F&amp;O Options</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    maxHeight: '90%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF2'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1D32',
    letterSpacing: -0.3
  },
  countBadge: {
    backgroundColor: 'rgba(131, 124, 210, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7871C4'
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeBtnText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700'
  },
  marketSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: '#F0F2F8',
    borderRadius: 10,
    padding: 3,
    gap: 4
  },
  marketPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  marketPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2
  },
  marketPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280'
  },
  marketPillTextActive: {
    color: '#7871C4',
    fontWeight: '800'
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 12,
    backgroundColor: '#F8F9FD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#7871C4'
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E1D32',
    fontWeight: '600',
    outlineStyle: 'none' as any,
    padding: 0
  },
  clearSearchBtn: {
    padding: 4
  },
  clearSearchText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '700'
  },

  /* Trending Chips */
  trendingContainer: {
    height: 38,
    marginTop: 8
  },
  trendingScroll: {
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 6
  },
  trendingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginRight: 2
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F2F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  trendingChipActive: {
    backgroundColor: 'rgba(120, 113, 196, 0.15)',
    borderColor: '#7871C4'
  },
  chipTagBadge: {
    backgroundColor: '#7871C4',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3
  },
  chipTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  trendingChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563'
  },
  trendingChipTextActive: {
    color: '#7871C4',
    fontWeight: '800'
  },

  /* Category Scroll */
  categoryScrollContainer: {
    height: 44,
    marginTop: 4
  },
  categoryScroll: {
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 6
  },
  categoryPill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#F0F2F8',
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryPillActive: {
    backgroundColor: '#7871C4'
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280'
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },

  /* Results Header */
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F8',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F8',
    backgroundColor: '#FAFAFD'
  },
  resultsHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280'
  },
  resultsHeaderCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7871C4'
  },

  /* Asset List */
  assetsList: {
    flex: 1
  },
  assetsListContent: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    paddingBottom: 40,
    gap: 8
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1D32',
    marginBottom: 6
  },
  emptySubText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18
  },
  clearFiltersBtn: {
    backgroundColor: '#7871C4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECF2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  assetRowSelected: {
    borderColor: '#7871C4',
    backgroundColor: '#FBFBFF',
    borderWidth: 1.5
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 6
  },
  nameCol: {
    flex: 1,
    gap: 2
  },
  symbolBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  symbolText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1D32'
  },
  exchangeBadge: {
    backgroundColor: '#F0F2F8',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3
  },
  exchangeBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#6B7280'
  },
  nameText: {
    fontSize: 10.5,
    color: '#6B7280',
    fontWeight: '500'
  },
  assetRight: {
    alignItems: 'flex-end',
    gap: 3
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1D32'
  },
  rightBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  changeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4
  },
  badgeGreen: {
    backgroundColor: 'rgba(1, 206, 165, 0.12)'
  },
  badgeRed: {
    backgroundColor: 'rgba(255, 90, 95, 0.12)'
  },
  changeText: {
    fontSize: 9.5,
    fontWeight: '800'
  },
  tradeActionPill: {
    backgroundColor: '#F0F2F8',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4
  },
  tradeActionText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#7871C4'
  },
  optionsChainPill: {
    backgroundColor: 'rgba(131, 124, 210, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2
  },
  optionsChainPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7871C4'
  },
  textGreen: {
    color: '#01CEA5'
  },
  textRed: {
    color: '#FF5A5F'
  }
});
