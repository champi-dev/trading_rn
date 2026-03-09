import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import AnimatedCard from '../ui/AnimatedCard';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface Props {
  symbol: string;
  companyName: string;
  shares: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export default function HoldingCard({ symbol, companyName, shares, currentPrice, marketValue, gainLoss, gainLossPercent }: Props) {
  const isPositive = gainLoss >= 0;
  const changeColor = isPositive ? '#22C55E' : '#EF4444';

  return (
    <AnimatedCard onPress={() => router.push(`/stock/${symbol}`)} className="mb-2">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}>
            <Text className="text-lg font-bold" style={{ color: '#3B82F6' }}>{symbol[0]}</Text>
          </View>
          <View>
            <Text className="text-text-primary text-base font-bold">{symbol}</Text>
            <Text className="text-text-secondary text-xs" numberOfLines={1} style={{ maxWidth: 100 }}>{companyName}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-text-primary text-base font-bold" style={{ fontVariant: ['tabular-nums'] }}>
            {formatCurrency(marketValue)}
          </Text>
          <Text className="text-sm font-semibold" style={{ color: changeColor, fontVariant: ['tabular-nums'] }}>
            {formatPercent(gainLossPercent)} ({formatCurrency(gainLoss)})
          </Text>
        </View>
      </View>
      <View className="mt-2 pt-2 border-t border-border-subtle">
        <Text className="text-text-secondary text-xs">{shares} shares @ {formatCurrency(currentPrice)}</Text>
      </View>
    </AnimatedCard>
  );
}
