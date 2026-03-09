import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function MiniSparkline({ data, width = 60, height = 24, color }: Props) {
  if (!data || data.length < 2) return <View style={{ width, height }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const isPositive = data[data.length - 1] >= data[0];
  const lineColor = color || (isPositive ? '#22C55E' : '#EF4444');

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={lineColor} strokeWidth={1.5} />
    </Svg>
  );
}
