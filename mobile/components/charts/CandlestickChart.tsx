import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Props {
  data: Candle[];
  height?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CandlestickChart({ data, height = 220 }: Props) {
  if (!data || data.length < 2) {
    return (
      <View className="justify-center items-center" style={{ height }}>
        <Text className="text-text-secondary text-base">No chart data available</Text>
      </View>
    );
  }

  const chartWidth = SCREEN_WIDTH - 16 * 2;
  const padding = 4;
  const allPrices = data.flatMap((d) => [d.high, d.low]);
  const min = Math.min(...allPrices);
  const max = Math.max(...allPrices);
  const range = max - min || 1;

  const candleWidth = Math.max(2, (chartWidth / data.length) * 0.6);
  const gap = chartWidth / data.length;

  const getY = (val: number) => padding + (1 - (val - min) / range) * (height - padding * 2);

  return (
    <View className="justify-center items-center">
      <Svg width={chartWidth} height={height}>
        {data.map((d, i) => {
          const x = i * gap + gap / 2;
          const isGreen = d.close >= d.open;
          const color = isGreen ? '#22C55E' : '#EF4444';
          const bodyTop = getY(Math.max(d.open, d.close));
          const bodyBottom = getY(Math.min(d.open, d.close));
          const bodyHeight = Math.max(1, bodyBottom - bodyTop);

          return (
            <React.Fragment key={i}>
              <Line x1={x} y1={getY(d.high)} x2={x} y2={getY(d.low)} stroke={color} strokeWidth={1} />
              <Rect x={x - candleWidth / 2} y={bodyTop} width={candleWidth} height={bodyHeight} fill={color} />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
