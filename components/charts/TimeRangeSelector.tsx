import React from 'react';
import { View, Text, Pressable } from 'react-native';

const RANGES = ['1d', '5d', '1mo', '3mo', '1y', '5y'] as const;
const LABELS: Record<string, string> = {
  '1d': '1D',
  '5d': '1W',
  '1mo': '1M',
  '3mo': '3M',
  '1y': '1Y',
  '5y': 'ALL',
};

interface Props {
  selected: string;
  onSelect: (range: string) => void;
}

export default function TimeRangeSelector({ selected, onSelect }: Props) {
  return (
    <View className="flex-row justify-around py-2">
      {RANGES.map((range) => (
        <Pressable
          key={range}
          className={`px-4 py-1.5 rounded-full ${selected === range ? 'bg-accent-blue-dim' : ''}`}
          onPress={() => onSelect(range)}
        >
          <Text className={`text-sm font-semibold ${selected === range ? 'text-accent-blue' : 'text-text-secondary'}`}>
            {LABELS[range]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
