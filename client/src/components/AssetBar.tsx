import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { useTrading, Asset } from '../context/TradingContext';
import { AssetIcon } from './AssetIcon';

interface AssetBarProps {
  onOpenAssetSelector?: () => void;
}

export const AssetBar: React.FC<AssetBarProps> = ({ onOpenAssetSelector }) => {
  const { assets, selectedAsset, setSelectedAsset, positions } = useTrading();

  const getAssetBadge = (symbol: string) => {
    const pos = positions.find(p => p.symbol === symbol || (p.isOption && p.symbol.startsWith(symbol)));
    if (!pos) return null;
    return (pos.pnl || 0) >= 0 ? 'up' : 'down';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {assets.map((asset: Asset) => {
          const isSelected = selectedAsset?.symbol === asset.symbol;
          const tradeBadge = getAssetBadge(asset.symbol);

          return (
            <TouchableOpacity
              key={asset.symbol}
              style={[
                styles.assetCircleItem,
                isSelected && styles.assetCircleActive
              ]}
              onPress={() => setSelectedAsset(asset)}
              activeOpacity={0.8}
            >
              <View style={[styles.circleBadge, isSelected && styles.circleBadgeActive]}>
                <AssetIcon symbol={asset.symbol} size={24} />

                {/* Trade Profit/Loss badge indicator - Authentic Three Investeers badge */}
                {tradeBadge && (
                  <View style={styles.tradeStatusBadge}>
                    <Image
                      source={{ uri: tradeBadge === 'up' ? '/images/app-icons-png/TradeUp.png' : '/images/app-icons-png/TradeDown.png' }}
                      style={{ width: 14, height: 14 }}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>

              <Text style={[styles.symbolLabel, isSelected && styles.symbolLabelActive]} numberOfLines={1}>
                {asset.symbol.split('/')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}

        {onOpenAssetSelector && (
          <TouchableOpacity style={styles.searchPill} onPress={onOpenAssetSelector} activeOpacity={0.8}>
            <Image
              source={{ uri: '/images/app-icons-png/SearchGray.png' }}
              style={{ width: 14, height: 14, marginRight: 4 }}
              resizeMode="contain"
            />
            <Text style={styles.searchText}>All</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF2'
  },
  scrollContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8
  },
  assetCircleItem: {
    alignItems: 'center',
    width: 46
  },
  assetCircleActive: {
    transform: [{ scale: 1.05 }]
  },
  circleBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#EAECF2',
    position: 'relative'
  },
  circleBadgeActive: {
    borderColor: '#7871C4',
    backgroundColor: '#F5F4FF'
  },
  tradeStatusBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  symbolLabel: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center'
  },
  symbolLabelActive: {
    color: '#1E1D32',
    fontWeight: '800'
  },
  searchPill: {
    backgroundColor: '#F0F2F8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECF2',
    marginLeft: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchText: {
    color: '#1E1D32',
    fontSize: 10,
    fontWeight: '700'
  }
});
