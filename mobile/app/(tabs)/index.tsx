import React, { useEffect, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { usePortfolioSummary } from '../../hooks/usePortfolio';
import { useMarketStore } from '../../stores/marketStore';
import PortfolioHeader from '../../components/home/PortfolioHeader';
import WatchlistSection from '../../components/home/WatchlistSection';
import TrendingStocks from '../../components/home/TrendingStocks';
import ShimmerLoader from '../../components/ui/ShimmerLoader';

export default function HomeScreen() {
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = usePortfolioSummary();
  const watchlist = useMarketStore((s) => s.watchlist);
  const trending = useMarketStore((s) => s.trending);
  const fetchWatchlist = useMarketStore((s) => s.fetchWatchlist);
  const fetchTrending = useMarketStore((s) => s.fetchTrending);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchTrending();
  }, []);

  // Refresh watchlist on focus + poll every 15s while screen is active
  useFocusEffect(
    useCallback(() => {
      fetchWatchlist();
      const interval = setInterval(() => {
        fetchWatchlist();
        fetchTrending();
      }, 15000);
      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), fetchWatchlist(), fetchTrending()]);
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
      >
        <Animated.View entering={FadeInUp.duration(400).delay(0)}>
          {summaryLoading ? (
            <ShimmerLoader height={100} style={{ margin: 16 }} />
          ) : summary ? (
            <PortfolioHeader
              totalValue={summary.totalValue}
              dayGainLoss={summary.dayGainLoss}
              totalGainLossPercent={summary.totalGainLossPercent}
            />
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(50)}>
          <WatchlistSection items={watchlist} />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(100)}>
          <TrendingStocks stocks={trending} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
