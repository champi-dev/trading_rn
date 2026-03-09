import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { TrendUpIcon, TrendDownIcon } from '../ui/Icons';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

interface Props {
  stocks: TrendingStock[];
}

export default function TrendingStocks({ stocks }: Props) {
  if (stocks.length === 0) return null;

  return (
    <View className="px-4 mt-6 mb-12">
      <Text className="text-text-primary text-xl font-bold mb-4">Trending</Text>
      {stocks.slice(0, 8).map((stock, index) => {
        const isPositive = stock.changePercent >= 0;
        return (
          <Pressable
            key={stock.symbol}
            className="flex-row items-center py-3 border-b border-border-subtle"
            onPress={() => router.push(`/stock/${stock.symbol}`)}
          >
            <Text className="text-text-tertiary text-base font-bold" style={{ width: 28 }}>{index + 1}</Text>
            <View className="flex-1">
              <Text className="text-text-primary text-base font-bold">{stock.symbol}</Text>
              <Text className="text-text-secondary text-xs" numberOfLines={1}>{stock.name}</Text>
            </View>
            <View className="items-end gap-1">
              <Text className="text-text-primary text-base font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
                {formatCurrency(stock.price)}
              </Text>
              <View
                className="px-2 py-0.5 rounded-md flex-row items-center gap-1"
                style={{ backgroundColor: isPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}
              >
                {isPositive ? <TrendUpIcon size={10} /> : <TrendDownIcon size={10} />}
                <Text className="text-xs font-semibold" style={{ color: isPositive ? '#22C55E' : '#EF4444' }}>
                  {formatPercent(stock.changePercent)}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
