import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import ShimmerLoader from '../../components/ui/ShimmerLoader';
import { SearchIcon } from '../../components/ui/Icons';
import { formatCurrency } from '../../utils/formatters';

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

const CATEGORIES = ['Tech', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial'];
const CATEGORY_SYMBOLS: Record<string, string[]> = {
  Tech: ['AAPL', 'GOOGL', 'MSFT', 'META', 'NVDA'],
  Healthcare: ['JNJ', 'UNH', 'PFE', 'ABBV', 'MRK'],
  Finance: ['JPM', 'BAC', 'GS', 'V', 'MA'],
  Energy: ['XOM', 'CVX', 'COP', 'SLB', 'EOG'],
  Consumer: ['AMZN', 'TSLA', 'WMT', 'HD', 'NKE'],
  Industrial: ['CAT', 'BA', 'HON', 'UPS', 'GE'],
};

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    setSelectedCategory(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(text), 300);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const { data } = await api.get(`/market/search?q=${encodeURIComponent(debouncedQuery)}`);
      return data.results as SearchResult[];
    },
    enabled: debouncedQuery.length > 0,
  });

  const { data: categoryQuotes, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return null;
      const symbols = CATEGORY_SYMBOLS[selectedCategory].join(',');
      const { data } = await api.get(`/market/batch?symbols=${symbols}`);
      return data.quotes;
    },
    enabled: !!selectedCategory,
  });

  const handleCategoryPress = (cat: string) => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedCategory(selectedCategory === cat ? null : cat);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <View className="px-4 pt-4">
        <Text className="text-text-primary text-2xl font-extrabold">Search</Text>
      </View>
      <View className="px-4 py-4">
        <TextInput
          className="bg-bg-secondary rounded-xl p-4 text-text-primary text-base border border-border-subtle"
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search stocks, ETFs..."
          placeholderTextColor="#52525B"
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search stocks"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-10 px-4 mb-2" contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            className={`px-4 py-1.5 rounded-full border ${
              selectedCategory === cat
                ? 'bg-accent-blue-dim border-accent-blue/40'
                : 'bg-bg-tertiary border-border-subtle'
            }`}
            onPress={() => handleCategoryPress(cat)}
          >
            <Text className={`text-sm font-semibold ${selectedCategory === cat ? 'text-accent-blue' : 'text-text-secondary'}`}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading && (
        <View className="pt-2">
          {[1, 2, 3, 4].map((i) => (
            <ShimmerLoader key={i} height={56} style={{ marginBottom: 8, marginHorizontal: 16 }} />
          ))}
        </View>
      )}

      {selectedCategory && !query && (
        <View className="px-4">
          {categoryLoading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <ShimmerLoader key={i} height={56} style={{ marginBottom: 8 }} />
            ))
          ) : categoryQuotes ? (
            CATEGORY_SYMBOLS[selectedCategory].map((sym) => {
              const q = categoryQuotes[sym];
              if (!q) return null;
              return (
                <Pressable key={sym} className="flex-row items-center py-3 border-b border-border-subtle gap-3" onPress={() => router.push(`/stock/${sym}`)}>
                  <View className="w-10 h-10 rounded-full bg-bg-tertiary justify-center items-center">
                    <Text className="text-lg font-bold text-accent-blue">{sym[0]}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary text-base font-bold">{sym}</Text>
                    <Text className="text-text-secondary text-sm" numberOfLines={1}>{q.name}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-text-primary text-base font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
                      {formatCurrency(q.price)}
                    </Text>
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: (q.changePercent ?? 0) >= 0 ? '#22C55E' : '#EF4444', fontVariant: ['tabular-nums'] }}
                    >
                      {(q.changePercent ?? 0) >= 0 ? '+' : ''}{(q.changePercent ?? 0).toFixed(2)}%
                    </Text>
                  </View>
                </Pressable>
              );
            })
          ) : null}
        </View>
      )}

      {!selectedCategory && (
        <FlatList
          data={data || []}
          keyExtractor={(item) => item.symbol}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <Pressable
              className="flex-row items-center py-3 border-b border-border-subtle gap-3"
              onPress={() => router.push(`/stock/${item.symbol}`)}
              accessibilityLabel={`${item.name} ${item.symbol}`}
            >
              <View className="w-10 h-10 rounded-full bg-bg-tertiary justify-center items-center">
                <Text className="text-lg font-bold text-accent-blue">{item.symbol[0]}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-base font-bold">{item.symbol}</Text>
                <Text className="text-text-secondary text-sm" numberOfLines={1}>{item.name}</Text>
              </View>
              <Text className="text-text-tertiary text-xs">{item.exchange}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            query.length > 0 && !isLoading ? (
              <View className="items-center py-12">
                <SearchIcon size={36} color="#52525B" />
                <Text className="text-text-secondary text-base font-semibold mt-3">No results for "{query}"</Text>
                <Text className="text-text-tertiary text-sm mt-1">Try a different search term</Text>
              </View>
            ) : !query && !selectedCategory ? (
              <View className="items-center py-12">
                <SearchIcon size={36} color="#52525B" />
                <Text className="text-text-secondary text-base font-semibold mt-3">Discover stocks</Text>
                <Text className="text-text-tertiary text-sm mt-1 text-center px-8">Search by name or symbol, or browse categories</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
