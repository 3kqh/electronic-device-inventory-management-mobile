import { DeviceCard } from '@/components/device-card';
import { GradientHeader } from '@/components/gradient-header';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/hooks/useApiData';
import { deviceService } from '@/services/deviceService';
import { maintenanceService } from '@/services/maintenanceService';
import { reportService } from '@/services/reportService';
import type { Device, DeviceCategory, DeviceStatus, MaintenanceRecord, PaginatedResponse, WarrantyAlert } from '@/types/api';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/utils/networkError';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

function formatNumber(n: number): string {
  return n >= 1000 ? n.toLocaleString() : String(n);
}

function getCategoryName(device: Device): string {
  if (typeof device.categoryId === 'object' && device.categoryId !== null) {
    return (device.categoryId as DeviceCategory).name;
  }
  return 'Device';
}

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  const {
    data: devicesResponse,
    loading: devicesLoading,
    error: devicesError,
    refetch: refetchDevices,
  } = useApiData<PaginatedResponse<Device>>(() => deviceService.getAll());

  const {
    data: warrantyAlerts,
    loading: alertsLoading,
    error: alertsError,
    refetch: refetchAlerts,
  } = useApiData<WarrantyAlert[]>(() => reportService.getWarrantyAlerts());

  const {
    data: upcomingMaintenance,
    loading: maintenanceLoading,
    error: maintenanceError,
    refetch: refetchMaintenance,
  } = useApiData<MaintenanceRecord[]>(() => maintenanceService.getUpcoming());

  // Calculate stats from device data
  const devices = devicesResponse?.data ?? [];
  const totalDevices = devicesResponse?.pagination?.total ?? 0;
  const statusCounts = devices.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    {} as Record<DeviceStatus, number>,
  );

  // Build alerts list from real data
  const alerts: Array<{ icon: 'warning-outline' | 'build-outline' | 'alert-circle-outline'; text: string; color: string }> = [];
  if (warrantyAlerts && warrantyAlerts.length > 0) {
    alerts.push({
      icon: 'warning-outline',
      text: `${warrantyAlerts.length} warranty${warrantyAlerts.length > 1 ? ' alerts' : ' alert'} expiring soon`,
      color: '#F59E0B',
    });
  }
  if (upcomingMaintenance && upcomingMaintenance.length > 0) {
    alerts.push({
      icon: 'build-outline',
      text: `${upcomingMaintenance.length} upcoming maintenance${upcomingMaintenance.length > 1 ? ' tasks' : ' task'}`,
      color: '#4285F4',
    });
  }

  const recentDevices = devices.slice(0, 5);

  const subtitle = user
    ? `Welcome back, ${user.firstName} (${user.role})`
    : 'Welcome back';

  return (
    <View style={styles.container}>
      <GradientHeader title="Dashboard" subtitle={subtitle}>
        <View style={styles.headerActions}>
          {/* <TouchableOpacity style={styles.headerBtn} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            {alerts.length > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{alerts.length}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} accessibilityLabel="Scan barcode">
            <Ionicons name="scan-outline" size={20} color="#fff" />
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.headerBtn}
            accessibilityLabel="Logout"
            onPress={() => Alert.alert('Log out', 'Are you sure to log out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: () => logout() },
            ])}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </GradientHeader>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        {devicesLoading ? (
          <ActivityIndicator size="large" color={AppColors.primaryLight} style={styles.loader} />
        ) : devicesError ? (
          <View style={styles.errorContainer}>
            <Ionicons name={isNetworkError(devicesError) ? 'cloud-offline-outline' : 'alert-circle-outline'} size={32} color={AppColors.text.light} />
            <ThemedText style={styles.errorText}>{isNetworkError(devicesError) ? NETWORK_ERROR_MESSAGE : devicesError}</ThemedText>
            <TouchableOpacity style={styles.retryBtn} onPress={refetchDevices}>
              <ThemedText style={styles.retryText}>Thử lại</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <StatCard icon="cube-outline" label="Total Devices" value={formatNumber(totalDevices)} gradient={AppColors.gradient.primary} />
              <StatCard icon="checkmark-circle-outline" label="Available" value={formatNumber(statusCounts.available || 0)} color="#22C55E" />
            </View>
            <View style={styles.statsRow}>
              <StatCard icon="person-outline" label="Assigned" value={formatNumber(statusCounts.assigned || 0)} color="#8B5CF6" />
              <StatCard icon="construct-outline" label="In Maintenance" value={formatNumber(statusCounts.in_maintenance || 0)} color="#F59E0B" />
            </View>
          </>
        )}

        {/* Alerts */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Alerts</ThemedText>
          {alertsLoading || maintenanceLoading ? (
            <ActivityIndicator size="small" color={AppColors.primaryLight} style={styles.loader} />
          ) : alertsError ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{isNetworkError(alertsError) ? NETWORK_ERROR_MESSAGE : alertsError}</ThemedText>
              <TouchableOpacity style={styles.retryBtn} onPress={refetchAlerts}>
                <ThemedText style={styles.retryText}>Thử lại</ThemedText>
              </TouchableOpacity>
            </View>
          ) : maintenanceError ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{isNetworkError(maintenanceError) ? NETWORK_ERROR_MESSAGE : maintenanceError}</ThemedText>
              <TouchableOpacity style={styles.retryBtn} onPress={refetchMaintenance}>
                <ThemedText style={styles.retryText}>Thử lại</ThemedText>
              </TouchableOpacity>
            </View>
          ) : alerts.length === 0 ? (
            <ThemedText style={styles.emptyText}>No alerts at this time</ThemedText>
          ) : (
            alerts.map((alert, i) => (
              <View key={i} style={styles.alertRow}>
                <View style={[styles.alertIcon, { backgroundColor: alert.color + '15' }]}>
                  <Ionicons name={alert.icon} size={18} color={alert.color} />
                </View>
                <ThemedText style={styles.alertText}>{alert.text}</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={AppColors.text.light} />
              </View>
            ))
          )}
        </View>

        {/* Recent Devices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Devices</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/devices')}>
              <ThemedText style={styles.seeAll}>See All</ThemedText>
            </TouchableOpacity>
          </View>
          {devicesLoading ? (
            <ActivityIndicator size="small" color={AppColors.primaryLight} style={styles.loader} />
          ) : devicesError ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{isNetworkError(devicesError) ? NETWORK_ERROR_MESSAGE : devicesError}</ThemedText>
              <TouchableOpacity style={styles.retryBtn} onPress={refetchDevices}>
                <ThemedText style={styles.retryText}>Thử lại</ThemedText>
              </TouchableOpacity>
            </View>
          ) : recentDevices.length === 0 ? (
            <ThemedText style={styles.emptyText}>No devices found</ThemedText>
          ) : (
            recentDevices.map((device) => (
              <DeviceCard
                key={device._id}
                name={device.name}
                assetTag={device.assetTag}
                category={getCategoryName(device)}
                status={device.status}
                onPress={() => router.push({ pathname: '/device-details', params: { id: device._id } })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  headerActions: { flexDirection: 'row', gap: 10, position: 'absolute', right: 20, top: 50 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#EF4444', borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text.primary, marginBottom: 12 },
  seeAll: { fontSize: 13, color: AppColors.primaryLight, fontWeight: '600' },
  alertRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.bg.card, borderRadius: 12,
    padding: 14, marginBottom: 8, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  alertIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  alertText: { flex: 1, fontSize: 13, color: AppColors.text.secondary },
  loader: { marginVertical: 20 },
  errorContainer: { alignItems: 'center', paddingVertical: 16 },
  errorText: { fontSize: 13, color: '#EF4444', marginBottom: 8, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: AppColors.primaryLight, borderRadius: 8,
  },
  retryText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  emptyText: { fontSize: 13, color: AppColors.text.light, textAlign: 'center', paddingVertical: 12 },
});
