import React, { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { HomeIcon, SearchIcon, PortfolioIcon, ProfileIcon } from '../../components/ui/Icons';

const TAB_ITEMS = [
  { name: 'index', label: 'Home', Icon: HomeIcon },
  { name: 'search', label: 'Search', Icon: SearchIcon },
  { name: 'portfolio', label: 'Portfolio', Icon: PortfolioIcon },
  { name: 'profile', label: 'Profile', Icon: ProfileIcon },
];

const SPRING_CONFIG = { damping: 15, stiffness: 150 };

function CustomTabBar({ state, descriptors, navigation }: any) {
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const tabLayouts = useRef<{ x: number; width: number }[]>([]);

  // Update indicator whenever the active tab changes
  useEffect(() => {
    const layout = tabLayouts.current[state.index];
    if (layout) {
      indicatorX.value = withSpring(layout.x + layout.width * 0.2, SPRING_CONFIG);
      indicatorW.value = withSpring(layout.width * 0.6, SPRING_CONFIG);
    }
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
  }));

  return (
    <View className="flex-row bg-bg-secondary border-t border-border-subtle relative" style={{ height: 82, paddingTop: 10, paddingBottom: 22 }}>
      <Animated.View
        className="absolute top-0 rounded-b-sm"
        style={[{ height: 3, backgroundColor: '#3B82F6' }, indicatorStyle]}
      />
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = TAB_ITEMS[index];
        const Icon = tab?.Icon;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={tab?.label}
            onPress={onPress}
            onLayout={(e) => {
              const { x, width } = e.nativeEvent.layout;
              tabLayouts.current[index] = { x, width };
              if (isFocused) {
                indicatorX.value = withSpring(x + width * 0.2, SPRING_CONFIG);
                indicatorW.value = withSpring(width * 0.6, SPRING_CONFIG);
              }
            }}
            className="flex-1 items-center justify-center gap-1"
          >
            {Icon && <Icon size={22} color={isFocused ? '#3B82F6' : '#52525B'} />}
            <Text className={`text-xs ${isFocused ? 'text-accent-blue font-semibold' : 'text-text-tertiary font-medium'}`}>
              {tab?.label || ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="portfolio" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
