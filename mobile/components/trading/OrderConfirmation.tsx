import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn, ZoomIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CheckIcon } from '../ui/Icons';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  type: 'BUY' | 'SELL';
  symbol: string;
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  onDone: () => void;
}

function ConfettiParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => i);
  const confettiColors = ['#22C55E', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];

  return (
    <View className="absolute items-center justify-center" style={{ width: 200, height: 200 }}>
      {particles.map((i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 60 + (i % 3) * 20;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const color = confettiColors[i % confettiColors.length];
        const size = 4 + (i % 3) * 2;

        return (
          <Animated.View
            key={i}
            entering={FadeInUp.delay(200 + i * 50).duration(400)}
            className="absolute"
            style={{
              backgroundColor: color,
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [{ translateX: x }, { translateY: y }],
            }}
          />
        );
      })}
    </View>
  );
}

export default function OrderConfirmation({ type, symbol, shares, pricePerShare, totalAmount, onDone }: Props) {
  const isBuy = type === 'BUY';

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <View className="items-center p-8 gap-4">
      <View className="items-center justify-center" style={{ width: 200, height: 200 }}>
        <ConfettiParticles />
        <Animated.View
          entering={ZoomIn.duration(400)}
          className="w-18 h-18 rounded-full bg-accent-green-dim justify-center items-center"
        >
          <CheckIcon size={36} color="#22C55E" />
        </Animated.View>
      </View>

      <Animated.Text entering={FadeIn.delay(200)} className="text-text-primary text-xl font-extrabold">
        Order Executed
      </Animated.Text>

      <Animated.View entering={FadeIn.delay(300)} className="items-center gap-1">
        <Text className="text-text-primary text-base font-semibold">
          {isBuy ? 'Bought' : 'Sold'} {shares} {shares === 1 ? 'share' : 'shares'} of {symbol}
        </Text>
        <Text className="text-text-secondary text-base">@ {formatCurrency(pricePerShare)}</Text>
        <Text className="text-text-primary text-lg font-bold mt-2" style={{ fontVariant: ['tabular-nums'] }}>
          Total: {formatCurrency(totalAmount)}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(500)}>
        <Pressable className="bg-accent-blue px-12 py-4 rounded-full mt-4" onPress={onDone} accessibilityLabel="Done">
          <Text className="text-white text-base font-bold">Done</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
