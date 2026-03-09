import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    if (!email || !username || !password) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    setLoading(true);
    try {
      await register(email, username, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg-primary justify-center px-6" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="items-center mb-12">
        <Text className="text-2xl font-extrabold text-text-primary">Create Account</Text>
        <Text className="text-base text-text-secondary mt-1">Start with $100,000 paper money</Text>
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

        <Text className="text-text-secondary text-sm mb-0.5 mt-2">Username</Text>
        <TextInput
          className="bg-bg-secondary rounded-xl p-4 text-text-primary text-base border border-border-subtle"
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a username"
          placeholderTextColor="#52525B"
          autoCapitalize="none"
        />

        <Text className="text-text-secondary text-sm mb-0.5 mt-2">Password</Text>
        <TextInput
          className="bg-bg-secondary rounded-xl p-4 text-text-primary text-base border border-border-subtle"
          value={password}
          onChangeText={setPassword}
          placeholder="Min 6 characters"
          placeholderTextColor="#52525B"
          secureTextEntry
        />

        <Pressable onPress={handleRegister} disabled={loading} className="mt-6">
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={{ borderRadius: 12, padding: 16, alignItems: 'center' }}
          >
            <Text className="text-white text-lg font-bold">{loading ? 'Creating...' : 'Create Account'}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-text-secondary text-center text-base">
            Already have an account? <Text className="text-accent-blue font-semibold">Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
