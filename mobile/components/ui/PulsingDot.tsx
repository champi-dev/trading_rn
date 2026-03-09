import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

interface Props {
  color?: string;
  size?: number;
}

export default function PulsingDot({ color = '#22C55E', size = 8 }: Props) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.3, { duration: 1000 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
        animStyle,
      ]}
    />
  );
}
