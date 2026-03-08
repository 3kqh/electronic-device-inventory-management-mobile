import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AppColors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const BlueTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: AppColors.primary,
    background: AppColors.bg.primary,
    card: AppColors.bg.card,
    border: AppColors.bg.border,
  },
};

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.bg.primary }}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : BlueTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="device-details" options={{ presentation: 'card', headerShown: true, title: 'Device Details', headerTintColor: AppColors.primary }} />
        <Stack.Screen name="device-form" options={{ presentation: 'modal', headerShown: true, title: 'Add Device', headerTintColor: AppColors.primary }} />
        <Stack.Screen name="assignment" options={{ presentation: 'modal', headerShown: true, title: 'Assignment', headerTintColor: AppColors.primary }} />
        <Stack.Screen name="user-management" options={{ presentation: 'card', headerShown: true, title: 'User Management', headerTintColor: AppColors.primary }} />
        <Stack.Screen name="system-settings" options={{ presentation: 'card', headerShown: true, title: 'System Settings', headerTintColor: AppColors.primary }} />
      </Stack>
      {!isAuthenticated && <Redirect href="/login" />}
      {isAuthenticated && <Redirect href="/(tabs)" />}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
