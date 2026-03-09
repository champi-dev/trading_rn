import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ArrowRightIcon } from './Icons';

interface Props {
  label: string;
  onComplete: () => void;
  color?: string;
}

const THUMB_SIZE = 56;
const TRACK_PADDING = 4;

export default function SwipeButton({ label, onComplete, color = '#22C55E' }: Props) {
  const translateX = useSharedValue(0);
  const maxSlide = Dimensions.get('window').width - 16 * 2 - THUMB_SIZE - TRACK_PADDING * 2;

  const triggerComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.max(0, Math.min(e.translationX, maxSlide));
    })
    .onEnd(() => {
      if (translateX.value > maxSlide * 0.8) {
        translateX.value = withSpring(maxSlide);
        runOnJS(triggerComplete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      className="rounded-full bg-bg-tertiary justify-center items-center border"
      style={{
        height: THUMB_SIZE + TRACK_PADDING * 2,
        borderColor: color + '40',
        paddingHorizontal: TRACK_PADDING,
      }}
    >
      <Text className="text-text-secondary text-base font-semibold absolute">{label}</Text>
      <GestureDetector gesture={pan}>
        <Animated.View
          className="justify-center items-center absolute"
          style={[
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: color,
              left: TRACK_PADDING,
            },
            thumbStyle,
          ]}
        >
          <ArrowRightIcon size={22} color="#fff" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
