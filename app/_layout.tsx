import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useEffect } from 'react';
import { getNetworkInfo, testNetworkConnectivity } from '@/utils/networkConfig';

const queryClient = new QueryClient();

export default function RootLayout() {
  useFrameworkReady();
  
  useEffect(() => {
    // Debug network configuration on app start
    getNetworkInfo();
    testNetworkConnectivity();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </QueryClientProvider>
  );
}