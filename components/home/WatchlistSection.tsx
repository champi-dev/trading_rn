import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import AnimatedCard from '../ui/AnimatedCard';
import MiniSparkline from '../charts/MiniSparkline';
import { StarIcon } from '../ui/Icons';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface Props {
  items: WatchlistItem[];
}

function generateSparkline(price: number, changePercent: number): number[] {
  const points: number[] = [];
  const start = price / (1 + changePercent / 100);
  const change = price - start;
  // Noise must be small relative to the trend so the direction reads correctly
  const noiseScale = Math.abs(change) * 0.15;
  for (let i = 0; i < 20; i++) {
    const progress = i / 19;
    const noise = (Math.sin(i * 2.5) + Math.cos(i * 1.7) * 0.6) * noiseScale;
    points.push(start + change * progress + noise);
  }
  return points;
}

export default function WatchlistSection({ items }: Props) {
  if (items.length === 0) {
    return (
      <View className="px-4 mt-6">
        <Text className="text-text-primary text-xl font-bold mb-4">Watchlist</Text>
        <View className="p-8 items-center bg-bg-tertiary rounded-2xl border border-border-subtle">
          <StarIcon size={32} color="#52525B" />
          <Text className="text-text-secondary text-base font-semibold mt-3">No stocks in your watchlist</Text>
          <Text className="text-text-tertiary text-sm mt-1">Search and add stocks to track them here</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mt-6">
      <Text className="text-text-primary text-xl font-bold mb-4">Watchlist</Text>
      {items.map((item) => {
        const isPositive = item.changePercent >= 0;
        const sparkData = generateSparkline(item.price, item.changePercent);
        return (
          <AnimatedCard key={item.symbol} onPress={() => router.push(`/stock/${item.symbol}`)} className="mb-2">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}>
                  <Text className="text-lg font-bold" style={{ color: '#3B82F6' }}>{item.symbol[0]}</Text>
                </View>
                <View>
                  <Text className="text-text-primary text-base font-bold">{item.symbol}</Text>
                  <Text className="text-text-secondary text-xs" numberOfLines={1} style={{ maxWidth: 100 }}>{item.name}</Text>
                </View>
              </View>
              <View className="mx-2">
                <MiniSparkline data={sparkData} width={56} height={24} />
              </View>
              <View className="items-end">
                <Text className="text-text-primary text-base font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
                  {formatCurrency(item.price)}
                </Text>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isPositive ? '#22C55E' : '#EF4444', fontVariant: ['tabular-nums'] }}
                >
                  {formatPercent(item.changePercent)}
                </Text>
              </View>
            </View>
          </AnimatedCard>
        );
      })}
    </View>
  );
}
