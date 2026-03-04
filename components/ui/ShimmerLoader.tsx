import React, { useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export default function ShimmerLoader({ width = '100%', height = 20, style }: Props) {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(translateX.value, [-1, 1], [-200, 200]) },
    ],
  }));

  return (
    <Animated.View
      className="bg-bg-tertiary rounded-lg"
      style={[{ width: width as any, height, overflow: 'hidden' }, style]}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, { width: 400 }, animStyle]}>
        <LinearGradient
          colors={['#1C1C22', 'rgba(255,255,255,0.06)', '#1C1C22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </Animated.View>
  );
}
