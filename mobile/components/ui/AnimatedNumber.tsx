import React, { useEffect } from 'react';
import { TextInput, type TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface Props {
  value: number;
  prefix?: string;
  style?: TextStyle;
  decimals?: number;
}

export default function AnimatedNumber({ value, prefix = '$', style, decimals = 2 }: Props) {
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration: 600 });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    const v = animatedValue.value;
    return {
      text: `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
    } as any;
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      className="text-text-primary text-hero font-bold tracking-tighter p-0"
      style={[{ fontVariant: ['tabular-nums'] }, style]}
      animatedProps={animatedProps}
    />
  );
}
