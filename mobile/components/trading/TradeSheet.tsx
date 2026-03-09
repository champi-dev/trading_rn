import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  FadeIn,
} from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useStockQuote } from '../../hooks/useStockQuote';
import QuantitySelector from './QuantitySelector';
import OrderConfirmation from './OrderConfirmation';
import SwipeButton from '../ui/SwipeButton';
import { CloseIcon } from '../ui/Icons';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  visible: boolean;
  onClose: () => void;
  symbol: string;
  name: string;
  currentPrice: number;
  type: 'BUY' | 'SELL';
  maxShares?: number;
  cashBalance?: number;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function TradeSheet({ visible, onClose, symbol, name, currentPrice, type, maxShares, cashBalance }: Props) {
  const [shares, setShares] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const queryClient = useQueryClient();
  const isBuy = type === 'BUY';

  const { data: liveQuote } = useStockQuote(symbol);
  const price = liveQuote?.price ?? currentPrice;
  const estimatedCost = shares * price;

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      overlayOpacity.value = withSpring(1, { damping: 20, stiffness: 200 });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, { damping: 20, stiffness: 200 });
      overlayOpacity.value = withSpring(0, { damping: 20, stiffness: 200 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 120) {
        translateY.value = withSpring(SCREEN_HEIGHT, { damping: 20, stiffness: 200 });
        overlayOpacity.value = withSpring(0, { damping: 20, stiffness: 200 });
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const handleClose = () => {
    setResult(null);
    setShares(1);
    onClose();
  };

  const handleTrade = async () => {
    setLoading(true);
    try {
      const endpoint = isBuy ? '/trade/buy' : '/trade/sell';
      const { data } = await api.post(endpoint, { symbol, shares });
      setResult(data.transaction);
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['quote', symbol] });
    } catch (err: any) {
      Alert.alert('Trade Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    handleClose();
  };

  const maxAffordable = isBuy && cashBalance ? Math.floor(cashBalance / price) : undefined;

  if (!visible) return null;

  return (
    <View className="absolute inset-0" pointerEvents="box-none">
      <Animated.View className="absolute inset-0 bg-black/60" style={overlayStyle}>
        <Pressable className="absolute inset-0" onPress={handleClose} />
      </Animated.View>
      <GestureDetector gesture={dragGesture}>
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-bg-secondary rounded-t-3xl px-4 pb-12"
          style={[{ minHeight: 480 }, sheetStyle]}
        >
          <View className="w-10 h-1 rounded-full bg-text-tertiary self-center mt-2 mb-4" />

          {result ? (
            <OrderConfirmation
              type={result.type}
              symbol={result.symbol}
              shares={result.shares}
              pricePerShare={result.pricePerShare}
              totalAmount={result.totalAmount}
              onDone={handleDone}
            />
          ) : (
            <>
              <View className="flex-row justify-between items-center">
                <Text className="text-text-primary text-xl font-extrabold">{isBuy ? 'Buy' : 'Sell'} {symbol}</Text>
                <Pressable onPress={handleClose} accessibilityLabel="Close trade sheet" className="p-2">
                  <CloseIcon size={22} color="#A1A1AA" />
                </Pressable>
              </View>
              <Text className="text-text-secondary text-base mt-1">{name}</Text>
              <Text className="text-text-primary text-3xl font-extrabold mt-2" style={{ fontVariant: ['tabular-nums'] }}>
                {formatCurrency(price)}
              </Text>

              <View className="my-8">
                <QuantitySelector
                  value={shares}
                  onChange={setShares}
                  max={isBuy ? maxAffordable : maxShares}
                />
              </View>

              <View className="gap-2 mb-6 p-4 bg-bg-tertiary rounded-xl">
                <View className="flex-row justify-between">
                  <Text className="text-text-secondary text-base">Estimated {isBuy ? 'Cost' : 'Credit'}</Text>
                  <Text className="text-text-primary text-base font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
                    {formatCurrency(estimatedCost)}
                  </Text>
                </View>
                {isBuy && cashBalance !== undefined && (
                  <View className="flex-row justify-between">
                    <Text className="text-text-secondary text-base">Cash Available</Text>
                    <Text className="text-text-primary text-base font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
                      {formatCurrency(cashBalance)}
                    </Text>
                  </View>
                )}
                {!isBuy && maxShares !== undefined && (
                  <View className="flex-row justify-between">
                    <Text className="text-text-secondary text-base">Shares Owned</Text>
                    <Text className="text-text-primary text-base font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
                      {maxShares}
                    </Text>
                  </View>
                )}
              </View>

              <View className="px-2">
                <SwipeButton
                  label={loading ? 'Processing...' : `Swipe to ${isBuy ? 'Buy' : 'Sell'}`}
                  onComplete={handleTrade}
                  color={isBuy ? '#22C55E' : '#EF4444'}
                />
              </View>
            </>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
