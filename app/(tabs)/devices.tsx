import { DeviceCard } from '@/components/device-card';
import { GradientHeader } from '@/components/gradient-header';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { deviceService } from '@/services/deviceService';
import type { Device, DeviceCategory, DeviceStatus, PaginatedResponse } from '@/types/api';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/utils/networkError';
import { canCRUDDevices } from '@/utils/permissions';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const FILTERS = ['All', 'Available', 'Assigned', 'Maintenance', 'Retired'] as const;

const FILTER_STATUS_MAP: Record<string, DeviceStatus> = {
  Available: 'available',
  Assigned: 'assigned',
  Maintenance: 'in_maintenance',
  Retired: 'retired',
};

function getCategoryName(device: Device): string {
  if (typeof device.categoryId === 'object' && device.categoryId !== null) {
    return (device.categoryId as DeviceCategory).name;
  }
  return 'Device';
}

export default function DevicesScreen() {
  const { user } = useAuth();

  const [devices, setDevices] = useState<Device[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch devices based on current filter and search state
  const fetchDevices = useCallback(async (query: string, filter: string) => {
    setLoading(true);
    setError(null);
    try {
      if (query.trim()) {
        const results = await deviceService.search(query.trim());
        setDevices(results);
        setTotalCount(results.length);
      } else if (filter !== 'All') {
        const status = FILTER_STATUS_MAP[filter];
        if (status) {
          const results = await deviceService.filter(status);
          setDevices(results);
          setTotalCount(results.length);
        }
      } else {
        const response: PaginatedResponse<Device> = await deviceService.getAll();
        setDevices(response.data);
        setTotalCount(response.pagination.total);
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message ?? 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDevices('', 'All');
  }, [fetchDevices]);

  // Handle search with 300ms debounce
  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        fetchDevices(text, activeFilter);
      }, 300);
    },
    [activeFilter, fetchDevices],
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Handle filter change
  const handleFilterPress = useCallback(
    (filter: string) => {
      setActiveFilter(filter);
      // Clear debounce and fetch immediately with new filter
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      fetchDevices(searchQuery, filter);
    },
    [searchQuery, fetchDevices],
  );

  // Retry handler
  const handleRetry = useCallback(() => {
    fetchDevices(searchQuery, activeFilter);
  }, [searchQuery, activeFilter, fetchDevices]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDevices(searchQuery, activeFilter);
    setRefreshing(false);
  }, [searchQuery, activeFilter, fetchDevices]);

  const showFab = user ? canCRUDDevices(user.role) : false;
  const subtitle = `${totalCount.toLocaleString()} total devices`;

  return (
    <View style={styles.container}>
      <GradientHeader title="Devices" subtitle={subtitle} rightElement={
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn} activeOpacity={0.7}>
          {refreshing ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="refresh-outline" size={22} color="#fff" />}
        </TouchableOpacity>
      }>
        <SearchBar
          placeholder="Search by name, tag, serial..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </GradientHeader>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterActive]}
              onPress={() => handleFilterPress(f)}
            >
              <ThemedText style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primaryLight} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={AppColors.text.light} />
          <ThemedText style={styles.errorText}>{isNetworkError(error) ? NETWORK_ERROR_MESSAGE : error}</ThemedText>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
            <ThemedText style={styles.retryBtnText}>Thử lại</ThemedText>
          </TouchableOpacity>
        </View>
      ) : devices.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={48} color={AppColors.text.light} />
          <ThemedText style={styles.emptyText}>No devices found</ThemedText>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item: device }) => (
            <DeviceCard
              name={device.name}
              assetTag={device.assetTag}
              category={getCategoryName(device)}
              status={device.status}
              onPress={() => router.push({ pathname: '/device-details', params: { id: device._id } })}
            />
          )}
        />
      )}

      {showFab && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/device-form')} activeOpacity={0.8} accessibilityLabel="Add new device">
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  filterRow: { paddingVertical: 12 },
  filterScroll: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: AppColors.bg.card,
    borderWidth: 1, borderColor: AppColors.bg.border,
  },
  filterActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterText: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary },
  filterTextActive: { color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: AppColors.primaryLight, borderRadius: 10,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  emptyText: { fontSize: 14, color: AppColors.text.light, textAlign: 'center' },
  fab: {
    position: 'absolute', bottom: 100, right: 20,
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
});
