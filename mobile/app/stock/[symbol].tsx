import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeInUp, useAnimatedStyle } from 'react-native-reanimated';
import { useStockQuote, useStockHistory } from '../../hooks/useStockQuote';
import { usePortfolioHoldings, usePortfolioSummary } from '../../hooks/usePortfolio';
import { useMarketStore } from '../../stores/marketStore';
import { usePriceFlash } from '../../hooks/useAnimatedPrice';
import PriceChart from '../../components/charts/PriceChart';
import TimeRangeSelector from '../../components/charts/TimeRangeSelector';
import TradeSheet from '../../components/trading/TradeSheet';
import GlassCard from '../../components/ui/GlassCard';
import ShimmerLoader from '../../components/ui/ShimmerLoader';
import PulsingDot from '../../components/ui/PulsingDot';
import { ArrowLeftIcon, StarIcon } from '../../components/ui/Icons';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const [range, setRange] = useState('1mo');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL' | null>(null);

  const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol);
  const { data: historyData, isLoading: historyLoading } = useStockHistory(symbol, range);
  const { data: holdings } = usePortfolioHoldings();
  const { data: summary } = usePortfolioSummary();
  const watchlist = useMarketStore((s) => s.watchlist);
  const addToWatchlist = useMarketStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useMarketStore((s) => s.removeFromWatchlist);

  const holding = holdings?.find((h: any) => h.symbol === symbol);
  const isWatched = watchlist.some((w) => w.symbol === symbol);
  const isPositive = (quote?.changePercent ?? 0) >= 0;
  const changeColor = isPositive ? '#22C55E' : '#EF4444';

  const priceScale = usePriceFlash(quote?.price ?? 0);
  const priceAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: priceScale.value }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-2">
          <Pressable onPress={() => router.back()} className="p-2" accessibilityLabel="Go back">
            <ArrowLeftIcon size={24} color="#3B82F6" />
          </Pressable>
          <View className="flex-row items-center gap-1">
            <PulsingDot color="#22C55E" size={6} />
            <Text className="text-xs font-bold mr-2" style={{ color: '#22C55E' }}>LIVE</Text>
            <Pressable
              onPress={() => isWatched ? removeFromWatchlist(symbol) : addToWatchlist(symbol)}
              accessibilityLabel={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
              className="p-2"
            >
              <StarIcon size={24} color={isWatched ? '#F59E0B' : '#52525B'} filled={isWatched} />
            </Pressable>
          </View>
        </View>

        {quoteLoading ? (
          <ShimmerLoader height={80} style={{ margin: 16 }} />
        ) : quote ? (
          <Animated.View entering={FadeInUp.duration(400)} className="px-4 pb-4">
            <Text className="text-text-primary text-xl font-extrabold">{quote.name}</Text>
            <Text className="text-text-secondary text-sm mt-0.5">{quote.symbol}</Text>
            <Animated.Text
              className="text-hero font-extrabold mt-2"
              style={[{ color: changeColor, letterSpacing: -1.5, fontVariant: ['tabular-nums'] }, priceAnimStyle]}
              accessibilityLabel={`Price ${formatCurrency(quote.price)}`}
            >
              {formatCurrency(quote.price)}
            </Animated.Text>
            <View
              className="self-start px-3 py-1 rounded-full mt-2"
              style={{ backgroundColor: isPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}
            >
              <Text className="text-sm font-semibold" style={{ color: changeColor, fontVariant: ['tabular-nums'] }}>
                {isPositive ? '\u25B2' : '\u25BC'} {formatCurrency(Math.abs(quote.change))} ({formatPercent(quote.changePercent)})
              </Text>
            </View>
          </Animated.View>
        ) : null}

        {/* Chart */}
        <Animated.View entering={FadeInUp.duration(400).delay(50)} className="px-4 mt-4">
          {historyLoading ? (
            <ShimmerLoader height={220} />
          ) : historyData ? (
            <PriceChart data={historyData} />
          ) : null}
          <TimeRangeSelector selected={range} onSelect={setRange} />
        </Animated.View>

        {/* Stats Grid */}
        {quote && (
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <GlassCard className="m-4">
              <View className="flex-row flex-wrap">
                <StatItem label="Open" value={formatCurrency(quote.open)} />
                <StatItem label="High" value={formatCurrency(quote.high)} />
                <StatItem label="Low" value={formatCurrency(quote.low)} />
                <StatItem label="Volume" value={formatNumber(quote.volume)} />
                <StatItem label="Mkt Cap" value={quote.marketCap ? formatNumber(quote.marketCap) : '\u2014'} />
                <StatItem label="P/E" value={quote.pe ? quote.pe.toFixed(2) : '\u2014'} />
                <StatItem label="52W High" value={quote.week52High ? formatCurrency(quote.week52High) : '\u2014'} />
                <StatItem label="52W Low" value={quote.week52Low ? formatCurrency(quote.week52Low) : '\u2014'} />
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Position */}
        {holding && (
          <Animated.View entering={FadeInUp.duration(400).delay(150)}>
            <GlassCard className="mx-4 mb-4">
              <Text className="text-text-primary text-lg font-bold mb-4">Your Position</Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-text-secondary text-xs">Shares</Text>
                  <Text className="text-text-primary text-base font-semibold mt-0.5" style={{ fontVariant: ['tabular-nums'] }}>
                    {holding.shares}
                  </Text>
                </View>
                <View>
                  <Text className="text-text-secondary text-xs">Avg Cost</Text>
                  <Text className="text-text-primary text-base font-semibold mt-0.5" style={{ fontVariant: ['tabular-nums'] }}>
                    {formatCurrency(holding.avgCost)}
                  </Text>
                </View>
                <View>
                  <Text className="text-text-secondary text-xs">Market Value</Text>
                  <Text className="text-text-primary text-base font-semibold mt-0.5" style={{ fontVariant: ['tabular-nums'] }}>
                    {formatCurrency(holding.marketValue)}
                  </Text>
                </View>
                <View>
                  <Text className="text-text-secondary text-xs">P&L</Text>
                  <Text
                    className="text-base font-semibold mt-0.5"
                    style={{ color: holding.gainLoss >= 0 ? '#22C55E' : '#EF4444', fontVariant: ['tabular-nums'] }}
                  >
                    {formatCurrency(holding.gainLoss)}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Trade Buttons */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)} className="flex-row gap-4 px-4 pb-12 mt-4">
          <Pressable
            className="flex-1 py-4 rounded-xl items-center"
            style={{ backgroundColor: '#22C55E' }}
            onPress={() => setTradeType('BUY')}
            accessibilityLabel="Buy stock"
          >
            <Text className="text-white text-lg font-extrabold">Buy</Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-4 rounded-xl items-center ${!holding ? 'opacity-40' : ''}`}
            style={{ backgroundColor: holding ? '#EF4444' : '#1C1C22' }}
            onPress={() => holding && setTradeType('SELL')}
            disabled={!holding}
            accessibilityLabel="Sell stock"
          >
            <Text className={`text-lg font-extrabold ${holding ? 'text-white' : 'text-text-tertiary'}`}>Sell</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {tradeType && quote && (
        <TradeSheet
          visible={!!tradeType}
          onClose={() => setTradeType(null)}
          symbol={symbol}
          name={quote.name}
          currentPrice={quote.price}
          type={tradeType}
          maxShares={holding?.shares}
          cashBalance={summary?.cashBalance}
        />
      )}
    </SafeAreaView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 py-2" accessibilityLabel={`${label}: ${value}`}>
      <Text className="text-text-secondary text-xs">{label}</Text>
      <Text className="text-text-primary text-base font-semibold mt-0.5" style={{ fontVariant: ['tabular-nums'] }}>{value}</Text>
    </View>
  );
}
