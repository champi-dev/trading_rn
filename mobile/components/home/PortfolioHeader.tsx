import React from 'react';
import { View, Text } from 'react-native';
import AnimatedNumber from '../ui/AnimatedNumber';
import PulsingDot from '../ui/PulsingDot';
import MiniSparkline from '../charts/MiniSparkline';
import { TrendUpIcon, TrendDownIcon } from '../ui/Icons';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface Props {
  totalValue: number;
  dayGainLoss: number;
  totalGainLossPercent: number;
}

export default function PortfolioHeader({ totalValue, dayGainLoss, totalGainLossPercent }: Props) {
  const isDayPositive = dayGainLoss >= 0;
  const isTotalPositive = totalGainLossPercent >= 0;
  const totalColor = isTotalPositive ? '#22C55E' : '#EF4444';
  const dayColor = isDayPositive ? '#22C55E' : '#EF4444';

  // Sparkline represents overall portfolio trajectory (total return direction)
  // Start from cost basis implied value, end at current value
  const startValue = totalValue / (1 + totalGainLossPercent / 100);
  const change = totalValue - startValue;
  const noiseScale = Math.abs(change) * 0.12;
  const sparkData = Array.from({ length: 24 }, (_, i) => {
    const progress = i / 23;
    // Smooth easing curve with subtle noise
    const eased = progress * progress * (3 - 2 * progress); // smoothstep
    const noise = Math.sin(i * 1.7) * noiseScale + Math.cos(i * 2.3) * noiseScale * 0.5;
    return startValue + change * eased + noise;
  });

  return (
    <View className="px-4 pt-6 pb-4">
      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-text-secondary text-sm">Total Portfolio Value</Text>
          <PulsingDot color="#22C55E" />
        </View>
        <View className="border rounded-full px-2.5 py-0.5" style={{ backgroundColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <Text className="text-xs font-bold" style={{ color: '#F59E0B', fontSize: 10 }}>Paper Trading</Text>
        </View>
      </View>
      <AnimatedNumber value={totalValue} />
      <MiniSparkline data={sparkData} width={140} height={28} color={totalColor} />

      {/* Total return badge */}
      <View className="flex-row items-center gap-2 mt-2">
        <View
          className="flex-row items-center self-start px-3 py-1 rounded-full gap-1"
          style={{ backgroundColor: isTotalPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}
        >
          {isTotalPositive ? <TrendUpIcon size={12} color={totalColor} /> : <TrendDownIcon size={12} color={totalColor} />}
          <Text className="text-sm font-semibold" style={{ color: totalColor, fontVariant: ['tabular-nums'] }}>
            {formatPercent(totalGainLossPercent)}
          </Text>
        </View>

        {/* Today's change */}
        <Text className="text-xs" style={{ color: dayColor, fontVariant: ['tabular-nums'] }}>
          Today {isDayPositive ? '+' : ''}{formatCurrency(dayGainLoss)}
        </Text>
      </View>
    </View>
  );
}
