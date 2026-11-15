import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface AssetIconProps {
  symbol: string;
  size?: number;
}

export const AssetIcon: React.FC<AssetIconProps> = ({ symbol, size = 32 }) => {
  const [imgError, setImgError] = useState(false);

  const cleanSymbol = symbol.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const imageUri = '/images/icons/' + cleanSymbol + '.png';

  const getFallbackConfig = (sym: string) => {
    const s = sym.toUpperCase();
    if (s.includes('NIFTY') && !s.includes('BANK')) {
      return { text: 'N50', bg: '#1E293B', border: '#F97316', textColor: '#F8FAFC' };
    }
    if (s.includes('BANKNIFTY') || (s.includes('BANK') && s.includes('NIFTY'))) {
      return { text: 'BN', bg: '#1E293B', border: '#3B82F6', textColor: '#F8FAFC' };
    }
    if (s.includes('SENSEX')) {
      return { text: 'BSX', bg: '#1E293B', border: '#8B5CF6', textColor: '#F8FAFC' };
    }
    if (s.includes('RELIANCE')) {
      return { text: 'RIL', bg: '#0F172A', border: '#6366F1', textColor: '#F8FAFC' };
    }
    if (s.includes('HDFC')) {
      return { text: 'HDFC', bg: '#0F172A', border: '#2563EB', textColor: '#F8FAFC' };
    }
    if (s.includes('TCS')) {
      return { text: 'TCS', bg: '#0F172A', border: '#8B5CF6', textColor: '#F8FAFC' };
    }
    if (s.includes('TATAMOTORS') || s.includes('TATA MOTORS')) {
      return { text: 'TATA', bg: '#0F172A', border: '#06B6D4', textColor: '#F8FAFC' };
    }
    if (s.includes('TATASTEEL') || s.includes('STEEL')) {
      return { text: 'TSL', bg: '#1E293B', border: '#64748B', textColor: '#F8FAFC' };
    }
    if (s.includes('INFY') || s.includes('INFOSYS')) {
      return { text: 'INFY', bg: '#003366', border: '#38BDF8', textColor: '#FFFFFF' };
    }
    if (s.includes('ICICI')) {
      return { text: 'ICICI', bg: '#831843', border: '#FB923C', textColor: '#FFFFFF' };
    }
    if (s.includes('SBIN') || s.includes('STATE BANK')) {
      return { text: 'SBI', bg: '#002B49', border: '#0284C7', textColor: '#FFFFFF' };
    }
    if (s.includes('ITC')) {
      return { text: 'ITC', bg: '#292524', border: '#EAB308', textColor: '#FFFFFF' };
    }
    if (s === 'LT' || s.includes('LARSEN')) {
      return { text: 'L&T', bg: '#1E3A8A', border: '#60A5FA', textColor: '#FFFFFF' };
    }
    if (s.includes('BHARTI') || s.includes('AIRTEL')) {
      return { text: 'AIR', bg: '#7F1D1D', border: '#EF4444', textColor: '#FFFFFF' };
    }
    if (s.includes('KOTAK')) {
      return { text: 'KOT', bg: '#991B1B', border: '#DC2626', textColor: '#FFFFFF' };
    }
    if (s.includes('BAJAJ') || s.includes('BAJFINANCE')) {
      return { text: 'BAJ', bg: '#1E3A8A', border: '#3B82F6', textColor: '#FFFFFF' };
    }
    if (s.includes('MARUTI')) {
      return { text: 'MSI', bg: '#1F2937', border: '#3B82F6', textColor: '#FFFFFF' };
    }
    if (s.includes('WIPRO')) {
      return { text: 'WIP', bg: '#312E81', border: '#818CF8', textColor: '#FFFFFF' };
    }
    if (s.includes('SUNPHARMA') || s.includes('SUN')) {
      return { text: 'SUN', bg: '#9A3412', border: '#FB923C', textColor: '#FFFFFF' };
    }
    if (s.includes('ASIAN')) {
      return { text: 'APL', bg: '#9F1239', border: '#F43F5E', textColor: '#FFFFFF' };
    }
    if (s.includes('TITAN')) {
      return { text: 'TTN', bg: '#18181B', border: '#F59E0B', textColor: '#FFFFFF' };
    }
    if (s.includes('ADANI')) {
      return { text: 'ADN', bg: '#1E293B', border: '#10B981', textColor: '#FFFFFF' };
    }
    if (s.includes('HINDUNILVR') || s.includes('UNILEVER')) {
      return { text: 'HUL', bg: '#0C4A6E', border: '#38BDF8', textColor: '#FFFFFF' };
    }
    if (s.includes('AXIS')) {
      return { text: 'AXIS', bg: '#831843', border: '#EC4899', textColor: '#FFFFFF' };
    }
    if (s.includes('ZOMATO')) {
      return { text: 'ZOM', bg: '#991B1B', border: '#EF4444', textColor: '#FFFFFF' };
    }
    if (s.includes('JIO')) {
      return { text: 'JIO', bg: '#0369A1', border: '#38BDF8', textColor: '#FFFFFF' };
    }
    if (s.includes('PAYTM')) {
      return { text: 'PTM', bg: '#002E6E', border: '#0284C7', textColor: '#FFFFFF' };
    }
    if (s.includes('MSFT')) {
      return { text: 'MSFT', bg: '#0F172A', border: '#00A4EF', textColor: '#FFFFFF' };
    }
    if (s.includes('GOOG')) {
      return { text: 'GOOG', bg: '#1E293B', border: '#EA4335', textColor: '#FFFFFF' };
    }
    if (s.includes('AMZN')) {
      return { text: 'AMZN', bg: '#1E293B', border: '#FF9900', textColor: '#FFFFFF' };
    }
    if (s.includes('META')) {
      return { text: 'META', bg: '#0F172A', border: '#0668E1', textColor: '#FFFFFF' };
    }
    if (s.includes('NFLX')) {
      return { text: 'NFLX', bg: '#18181B', border: '#E50914', textColor: '#FFFFFF' };
    }
    if (s.includes('AMD')) {
      return { text: 'AMD', bg: '#18181B', border: '#00E676', textColor: '#FFFFFF' };
    }
    if (s.includes('COIN')) {
      return { text: 'COIN', bg: '#0F172A', border: '#1652F0', textColor: '#FFFFFF' };
    }
    if (s.includes('XRP')) {
      return { text: 'XRP', bg: '#18181B', border: '#008CE7', textColor: '#FFFFFF' };
    }
    if (s.includes('DOGE')) {
      return { text: 'DOGE', bg: '#1E293B', border: '#C2A633', textColor: '#FFFFFF' };
    }
    if (s.includes('BNB')) {
      return { text: 'BNB', bg: '#18181B', border: '#F3BA2F', textColor: '#FFFFFF' };
    }
    if (s.includes('ADA')) {
      return { text: 'ADA', bg: '#0F172A', border: '#0033AD', textColor: '#FFFFFF' };
    }
    if (s.includes('AVAX')) {
      return { text: 'AVAX', bg: '#18181B', border: '#E84142', textColor: '#FFFFFF' };
    }
    if (s.includes('XAG')) {
      return { text: 'AG', bg: '#1E293B', border: '#C0C0C0', textColor: '#FFFFFF' };
    }
    if (s.includes('WTI') || s.includes('OIL')) {
      return { text: 'OIL', bg: '#1C1917', border: '#D97706', textColor: '#FFFFFF' };
    }
    if (s.includes('GBP')) {
      return { text: 'GBP', bg: '#1E1B4B', border: '#818CF8', textColor: '#FFFFFF' };
    }
    if (s.includes('CE') || s.includes('PE')) {
      return { text: s.includes('CE') ? 'CE' : 'PE', bg: '#1E1D32', border: s.includes('CE') ? '#00D8AD' : '#FF5A5F', textColor: '#FFFFFF' };
    }
    return { text: cleanSymbol.slice(0, 4).toUpperCase(), bg: '#2F2D48', border: '#7871C4', textColor: '#FFFFFF' };
  };

  const isKnownBundled = ['btcusd', 'ethusd', 'solusd', 'aapl', 'tsla', 'nvda', 'xauusd', 'eurusd'].includes(cleanSymbol);

  if (isKnownBundled && !imgError) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="contain"
        onError={() => setImgError(true)}
      />
    );
  }

  const fb = getFallbackConfig(symbol);
  const fontSize = size > 30 ? Math.floor(size * 0.35) : Math.floor(size * 0.4);

  return (
    <View
      style={[
        styles.fallbackCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: fb.bg,
          borderColor: fb.border,
          borderWidth: 1.5
        }
      ]}
    >
      <Text style={[styles.fallbackText, { fontSize, color: fb.textColor }]}>
        {fb.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: '800',
    letterSpacing: -0.5,
  }
});
