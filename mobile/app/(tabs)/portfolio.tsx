import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { usePortfolioHoldings, usePortfolioSummary, useTransactions } from '../../hooks/usePortfolio';
import HoldingCard from '../../components/portfolio/HoldingCard';
import AllocationChart from '../../components/portfolio/AllocationChart';
import PerformanceGraph from '../../components/portfolio/PerformanceGraph';
import GlassCard from '../../components/ui/GlassCard';
import ShimmerLoader from '../../components/ui/ShimmerLoader';
import { BriefcaseIcon } from '../../components/ui/Icons';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function PortfolioScreen() {
  const { data: holdings, isLoading: holdingsLoading, refetch: refetchHoldings } = usePortfolioHoldings();
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = usePortfolioSummary();
  const { data: txData } = useTransactions({ limit: 20 });
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeTab, setActiveTab] = useState<'holdings' | 'history'>('holdings');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchHoldings(), refetchSummary()]);
    setRefreshing(false);
  }, []);

  const isPositive = (summary?.totalGainLoss ?? 0) >= 0;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
      >
        <Text className="text-text-primary text-2xl font-extrabold px-4 pt-4">Portfolio</Text>

        <Animated.View entering={FadeInUp.duration(400)}>
          {summaryLoading ? (
            <ShimmerLoader height={120} style={{ margin: 16 }} />
          ) : summary ? (
            <GlassCard className="m-4" style={{ gap: 16 }}>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-text-secondary text-xs mb-0.5">Total Value</Text>
                  <Text className="text-text-primary text-xl font-extrabold" style={{ fontVariant: ['tabular-nums'] }}>
                    {formatCurrency(summary.totalValue)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-text-secondary text-xs mb-0.5">Total Return</Text>
                  <Text
                    className="text-base font-bold"
                    style={{ color: isPositive ? '#22C55E' : '#EF4444', fontVariant: ['tabular-nums'] }}
                  >
                    {formatCurrency(summary.totalGainLoss)} ({formatPercent(summary.totalGainLossPercent)})
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-text-secondary text-xs mb-0.5">Cash</Text>
                  <Text className="text-text-primary text-base font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
                    {formatCurrency(summary.cashBalance)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-text-secondary text-xs mb-0.5">Invested</Text>
                  <Text className="text-text-primary text-base font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
                    {formatCurrency(summary.investedValue)}
                  </Text>
                </View>
              </View>
            </GlassCard>
          ) : null}
        </Animated.View>

        {holdings && holdings.length > 0 && summary && (
          <Animated.View entering={FadeInUp.duration(400).delay(50)}>
            <AllocationChart holdings={holdings} totalValue={summary.investedValue || 1} />
          </Animated.View>
        )}

        {txData?.transactions && txData.transactions.length > 0 && summary && (
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <PerformanceGraph transactions={txData.transactions} startingBalance={100000} />
          </Animated.View>
        )}

        <View className="flex-row px-4 mt-4 gap-2">
          <Pressable
            className={`px-4 py-2 rounded-full ${activeTab === 'holdings' ? 'bg-accent-blue-dim' : 'bg-bg-tertiary'}`}
            onPress={() => setActiveTab('holdings')}
          >
            <Text className={`text-sm font-semibold ${activeTab === 'holdings' ? 'text-accent-blue' : 'text-text-secondary'}`}>Holdings</Text>
          </Pressable>
          <Pressable
            className={`px-4 py-2 rounded-full ${activeTab === 'history' ? 'bg-accent-blue-dim' : 'bg-bg-tertiary'}`}
            onPress={() => setActiveTab('history')}
          >
            <Text className={`text-sm font-semibold ${activeTab === 'history' ? 'text-accent-blue' : 'text-text-secondary'}`}>History</Text>
          </Pressable>
        </View>

        <View className="px-4 mt-4 pb-12">
          {activeTab === 'holdings' ? (
            holdingsLoading ? (
              <>
                <ShimmerLoader height={80} style={{ marginBottom: 8 }} />
                <ShimmerLoader height={80} style={{ marginBottom: 8 }} />
              </>
            ) : holdings && holdings.length > 0 ? (
              holdings.map((h: any) => (
                <HoldingCard
                  key={h.symbol}
                  symbol={h.symbol}
                  companyName={h.companyName}
                  shares={h.shares}
                  currentPrice={h.currentPrice}
                  marketValue={h.marketValue}
                  gainLoss={h.gainLoss}
                  gainLossPercent={h.gainLossPercent}
                />
              ))
            ) : (
              <View className="p-8 items-center bg-bg-tertiary rounded-2xl border border-border-subtle">
                <BriefcaseIcon size={32} color="#52525B" />
                <Text className="text-text-secondary text-base font-semibold mt-3">No holdings yet</Text>
                <Text className="text-text-tertiary text-sm mt-1">Buy your first stock to get started</Text>
              </View>
            )
          ) : (
            txData?.transactions && txData.transactions.length > 0 ? (
              txData.transactions.map((tx: any) => (
                <View key={tx.id} className="flex-row items-center py-3 border-b border-border-subtle gap-3">
                  <View
                    className="px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: tx.type === 'BUY' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}
                  >
                    <Text className="text-xs font-bold" style={{ color: tx.type === 'BUY' ? '#22C55E' : '#EF4444' }}>
                      {tx.type}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary text-base font-bold">{tx.symbol}</Text>
                    <Text className="text-text-tertiary text-xs">{new Date(tx.executed_at).toLocaleDateString()}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-text-primary text-base font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
                      {formatCurrency(tx.total_amount)}
                    </Text>
                    <Text className="text-text-secondary text-xs" style={{ fontVariant: ['tabular-nums'] }}>
                      {tx.shares} shares @ {formatCurrency(tx.price_per_share)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="p-8 items-center bg-bg-tertiary rounded-2xl border border-border-subtle">
                <Text className="text-text-secondary text-base font-semibold">No transactions yet</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
