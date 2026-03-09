import { useEffect, useRef } from 'react';
import { useSharedValue, withSpring, withSequence, withTiming, type SharedValue } from 'react-native-reanimated';

export function useAnimatedPrice(targetPrice: number): SharedValue<number> {
  const animatedValue = useSharedValue(targetPrice);

  useEffect(() => {
    animatedValue.value = withTiming(targetPrice, { duration: 600 });
  }, [targetPrice]);

  return animatedValue;
}

/**
 * Returns a scale shared value that flashes 1.05 then 1 when price changes.
 */
export function usePriceFlash(price: number): SharedValue<number> {
  const scale = useSharedValue(1);
  const prevPrice = useRef(price);

  useEffect(() => {
    if (price !== prevPrice.current) {
      scale.value = withSequence(
        withSpring(1.05, { damping: 15, stiffness: 150 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      prevPrice.current = price;
    }
  }, [price]);

  return scale;
}
