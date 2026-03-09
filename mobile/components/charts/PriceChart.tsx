import React, { useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { formatCurrency } from '../../utils/formatters';

interface PricePoint {
  date: string;
  close: number;
}

interface Props {
  data: PricePoint[];
  height?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PriceChart({ data, height = 220 }: Props) {
  const [crosshairPrice, setCrosshairPrice] = useState<number | null>(null);
  const [crosshairDate, setCrosshairDate] = useState<string | null>(null);
  const crosshairX = useSharedValue(-1);
  const crosshairOpacity = useSharedValue(0);

  if (!data || data.length < 2) {
    return (
      <View className="justify-center items-center" style={{ height }}>
        <Text className="text-text-secondary text-base">No chart data available</Text>
      </View>
    );
  }

  const chartWidth = SCREEN_WIDTH - 16 * 2;
  const padding = 2;
  const closePrices = data.map((d) => d.close);
  const min = Math.min(...closePrices);
  const max = Math.max(...closePrices);
  const range = max - min || 1;
  const isPositive = closePrices[closePrices.length - 1] >= closePrices[0];
  const lineColor = isPositive ? '#22C55E' : '#EF4444';

  const getX = (i: number) => (i / (data.length - 1)) * chartWidth;
  const getY = (val: number) => height - padding - ((val - min) / range) * (height - padding * 2);

  let linePath = `M ${getX(0)} ${getY(closePrices[0])}`;
  for (let i = 1; i < data.length; i++) {
    linePath += ` L ${getX(i)} ${getY(closePrices[i])}`;
  }
  const areaPath = `${linePath} L ${getX(data.length - 1)} ${height} L ${getX(0)} ${height} Z`;

  const updateCrosshair = (x: number) => {
    const idx = Math.round((x / chartWidth) * (data.length - 1));
    const clampedIdx = Math.max(0, Math.min(idx, data.length - 1));
    setCrosshairPrice(data[clampedIdx].close);
    setCrosshairDate(new Date(data[clampedIdx].date).toLocaleDateString());
    Haptics.selectionAsync();
  };

  const clearCrosshair = () => {
    setCrosshairPrice(null);
    setCrosshairDate(null);
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      crosshairX.value = e.x;
      crosshairOpacity.value = withTiming(1, { duration: 100 });
      runOnJS(updateCrosshair)(e.x);
    })
    .onUpdate((e) => {
      crosshairX.value = Math.max(0, Math.min(e.x, chartWidth));
      runOnJS(updateCrosshair)(e.x);
    })
    .onEnd(() => {
      crosshairOpacity.value = withTiming(0, { duration: 200 });
      runOnJS(clearCrosshair)();
    });

  const crosshairStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: crosshairX.value }],
    opacity: crosshairOpacity.value,
  }));

  const tooltipStyle = useAnimatedStyle(() => ({
    opacity: crosshairOpacity.value,
  }));

  return (
    <View className="justify-center items-center">
      <Animated.View className="items-center mb-2" style={[{ minHeight: 36 }, tooltipStyle]}>
        {crosshairPrice !== null && (
          <>
            <Text className="text-text-primary text-lg font-bold">{formatCurrency(crosshairPrice)}</Text>
            <Text className="text-text-secondary text-xs">{crosshairDate}</Text>
          </>
        )}
      </Animated.View>
      <GestureDetector gesture={pan}>
        <View style={{ height, width: chartWidth }}>
          <Svg width={chartWidth} height={height}>
            <Defs>
              <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={lineColor} stopOpacity="0.2" />
                <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path d={areaPath} fill="url(#areaGrad)" />
            <Path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} />
          </Svg>
          <Animated.View
            className="absolute top-0"
            style={[{ width: 1, height, backgroundColor: '#A1A1AA' }, crosshairStyle]}
          />
        </View>
      </GestureDetector>
    </View>
  );
}
