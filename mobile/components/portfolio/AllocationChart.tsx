import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withDelay } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Holding {
  symbol: string;
  marketValue: number;
}

interface Props {
  holdings: Holding[];
  totalValue: number;
}

const CHART_COLORS = ['#3B82F6', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#EC4899'];

function AnimatedSegment({ cx, cy, radius, strokeWidth, color, dash, offset, circumference, index }: any) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(index * 100, withTiming(1, { duration: 600 }));
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${dash * progress.value} ${circumference - dash * progress.value}`,
  }));

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={radius}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeDashoffset={-offset}
      strokeLinecap="round"
      rotation={-90}
      origin={`${cx}, ${cy}`}
      animatedProps={animatedProps}
    />
  );
}

export default function AllocationChart({ holdings, totalValue }: Props) {
  if (holdings.length === 0) return null;

  const size = 140;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = holdings.map((h, i) => {
    const pct = h.marketValue / totalValue;
    const dash = pct * circumference;
    const seg = { ...h, pct, dash, offset, color: CHART_COLORS[i % CHART_COLORS.length] };
    offset += dash;
    return seg;
  });

  return (
    <View className="flex-row items-center gap-6 p-4">
      <Svg width={size} height={size}>
        {segments.map((seg, i) => (
          <AnimatedSegment
            key={seg.symbol}
            cx={size / 2}
            cy={size / 2}
            radius={radius}
            strokeWidth={strokeWidth}
            color={seg.color}
            dash={seg.dash}
            offset={seg.offset}
            circumference={circumference}
            index={i}
          />
        ))}
      </Svg>
      <View className="flex-1 gap-1.5">
        {segments.slice(0, 6).map((seg) => (
          <View key={seg.symbol} className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <Text className="text-text-secondary text-sm" style={{ fontVariant: ['tabular-nums'] }}>
              {seg.symbol} {(seg.pct * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
