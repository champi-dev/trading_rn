import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const loadToken = useAuthStore((s) => s.loadToken);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    loadToken();
  }, []);

  if (isLoading) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1 bg-bg-primary">
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#09090B' },
              animation: 'fade',
            }}
          />
        </AuthGate>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
