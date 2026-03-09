import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@test.com');
    setPassword('password123');
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg-primary justify-center px-6" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="items-center mb-12">
        <Text className="text-4xl font-extrabold text-text-primary tracking-tight">StockTrader</Text>
        <Text className="text-sm text-accent-gold mt-1 font-semibold">Paper Trading</Text>
      </View>

      <View className="gap-2">
        <Text className="text-text-secondary text-sm mb-0.5 mt-2">Email</Text>
        <TextInput
          className="bg-bg-secondary rounded-xl p-4 text-text-primary text-base border border-border-subtle"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#52525B"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text className="text-text-secondary text-sm mb-0.5 mt-2">Password</Text>
        <TextInput
          className="bg-bg-secondary rounded-xl p-4 text-text-primary text-base border border-border-subtle"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor="#52525B"
          secureTextEntry
        />

        <Pressable onPress={handleLogin} disabled={loading} className="mt-6">
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={{ borderRadius: 12, padding: 16, alignItems: 'center' }}
          >
            <Text className="text-white text-lg font-bold">{loading ? 'Signing in...' : 'Sign In'}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable className="items-center py-4" onPress={fillDemo}>
          <Text className="text-accent-gold text-base font-semibold">Use Demo Account</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/register')}>
          <Text className="text-text-secondary text-center text-base">
            Don't have an account? <Text className="text-accent-blue font-semibold">Sign Up</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
