import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppColors } from '@/constants/theme';
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

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
