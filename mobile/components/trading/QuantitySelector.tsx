import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PlusIcon, MinusIcon } from '../ui/Icons';

interface Props {
  value: number;
  onChange: (val: number) => void;
  max?: number;
}

export default function QuantitySelector({ value, onChange, max }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animateValue = () => {
    scale.value = withSpring(1.1, { damping: 10, stiffness: 300 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    }, 100);
  };

  const decrease = () => {
    if (value > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateValue();
      onChange(value - 1);
    }
  };

  const increase = () => {
    if (!max || value < max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateValue();
      onChange(value + 1);
    }
  };

  return (
    <View className="flex-row items-center justify-center gap-6">
      <Pressable
        className="w-13 h-13 rounded-full bg-bg-tertiary justify-center items-center border border-border-subtle"
        onPress={decrease}
        accessibilityLabel="Decrease quantity"
      >
        <MinusIcon size={20} color="#FAFAFA" />
      </Pressable>
      <Animated.View className="items-center" style={[{ minWidth: 80 }, animatedStyle]}>
        <Text className="text-text-primary text-hero font-extrabold tracking-tight" style={{ fontVariant: ['tabular-nums'] }}>
          {value}
        </Text>
        <Text className="text-text-secondary text-xs mt-0.5">shares</Text>
      </Animated.View>
      <Pressable
        className="w-13 h-13 rounded-full bg-bg-tertiary justify-center items-center border border-border-subtle"
        onPress={increase}
        accessibilityLabel="Increase quantity"
      >
        <PlusIcon size={20} color="#FAFAFA" />
      </Pressable>
    </View>
  );
}
