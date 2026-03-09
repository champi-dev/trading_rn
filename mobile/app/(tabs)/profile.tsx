import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '../../stores/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { LogoutIcon, RefreshIcon } from '../../components/ui/Icons';
import { formatCurrency } from '../../utils/formatters';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Account',
      'This will reset your portfolio back to $100,000 and clear all holdings. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Coming Soon', 'Account reset will be available in a future update.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <View className="flex-1 p-4">
        <Text className="text-text-primary text-2xl font-extrabold mb-6">Profile</Text>

        <Animated.View entering={FadeInUp.duration(400)}>
          <GlassCard className="items-center py-8 mb-4">
            <View className="w-18 h-18 rounded-full justify-center items-center mb-4" style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}>
              <Text className="text-2xl font-extrabold" style={{ color: '#3B82F6' }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            <Text className="text-text-primary text-xl font-bold">{user?.username || 'User'}</Text>
            <Text className="text-text-secondary text-base mt-1">{user?.email}</Text>
            <View
              className="mt-2 px-4 py-1 rounded-full border"
              style={{ backgroundColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}
            >
              <Text className="text-xs font-bold" style={{ color: '#F59E0B' }}>Paper Trading</Text>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(50)}>
          <GlassCard className="mb-4" style={{ gap: 16 }}>
            <View className="flex-row justify-between items-center">
              <Text className="text-text-secondary text-base">Cash Balance</Text>
              <Text className="text-text-primary text-base font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
                {formatCurrency(user?.cash_balance || 0)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-text-secondary text-base">Starting Balance</Text>
              <Text className="text-text-primary text-base font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
                {formatCurrency(100000)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-text-secondary text-base">Member Since</Text>
              <Text className="text-text-primary text-base font-semibold">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '\u2014'}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-text-secondary text-base">Account Type</Text>
              <Text className="text-base font-semibold" style={{ color: '#F59E0B' }}>Paper Trading</Text>
            </View>
          </GlassCard>
        </Animated.View>

        <Pressable
          className="p-4 rounded-xl border items-center flex-row justify-center gap-2"
          style={{ borderColor: 'rgba(245,158,11,0.3)' }}
          onPress={handleReset}
          accessibilityLabel="Reset account"
        >
          <RefreshIcon size={18} color="#F59E0B" />
          <Text className="text-base font-semibold" style={{ color: '#F59E0B' }}>Reset Account</Text>
        </Pressable>

        <Pressable
          className="mt-4 p-4 rounded-xl items-center flex-row justify-center gap-2"
          style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}
          onPress={handleLogout}
          accessibilityLabel="Sign out"
        >
          <LogoutIcon size={18} color="#EF4444" />
          <Text className="text-base font-semibold" style={{ color: '#EF4444' }}>Sign Out</Text>
        </Pressable>

        <View className="items-center mt-8 gap-0.5">
          <Text className="text-text-tertiary text-sm">StockTrader v1.0.0</Text>
          <Text className="text-text-tertiary text-sm">Paper trading demo app</Text>
          <Text className="text-text-tertiary text-xs mt-1">Prices provided by Yahoo Finance</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
