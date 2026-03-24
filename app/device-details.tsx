import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import { assignmentService } from '@/services/assignmentService';
import { deviceService } from '@/services/deviceService';
import { maintenanceService } from '@/services/maintenanceService';
import type { Assignment, Device, DeviceCategory, MaintenanceRecord } from '@/types/api';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/utils/networkError';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

function getCategoryName(device: Device): string {
  if (typeof device.categoryId === 'object' && device.categoryId !== null) {
    return (device.categoryId as DeviceCategory).name;
  }
  return 'Device';
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatCurrency(value: number | undefined | null): string {
  if (value == null) return 'N/A';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getUserName(user: { firstName?: string; lastName?: string; email?: string } | string | undefined): string {
  if (!user) return 'Unknown';
  if (typeof user === 'string') return user;
  const first = user.firstName ?? '';
  const last = user.lastName ?? '';
  return `${first} ${last}`.trim() || user.email || 'Unknown';
}

function buildSpecs(device: Device): Array<{ label: string; value: string }> {
  const specs: Array<{ label: string; value: string }> = [
    { label: 'Serial Number', value: device.serialNumber || 'N/A' },
    { label: 'Model', value: device.model || 'N/A' },
    { label: 'Manufacturer', value: device.manufacturer || 'N/A' },
    { label: 'Condition', value: device.condition ? device.condition.charAt(0).toUpperCase() + device.condition.slice(1) : 'N/A' },
    { label: 'Purchase Date', value: formatDate(device.purchaseDate) },
    { label: 'Purchase Price', value: formatCurrency(device.purchasePrice) },
    { label: 'Current Value', value: formatCurrency(device.currentValue) },
    { label: 'Salvage Value', value: formatCurrency(device.salvageValue) },
  ];

  // Add dynamic specifications from the specifications object
  if (device.specifications && typeof device.specifications === 'object') {
    for (const [key, val] of Object.entries(device.specifications)) {
      if (val != null && val !== '') {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
        specs.push({ label, value: String(val) });
      }
    }
  }

  return specs;
}

interface HistoryItem {
  action: string;
  date: string;
  icon: 'person-outline' | 'construct-outline' | 'shield-outline' | 'swap-horizontal-outline' | 'return-down-back-outline';
}

function buildHistory(assignments: Assignment[], maintenance: MaintenanceRecord[]): HistoryItem[] {
  const items: HistoryItem[] = [];

  for (const a of assignments) {
    const userName = getUserName(
      typeof a.assignedTo?.userId === 'object' ? a.assignedTo.userId as { firstName?: string; lastName?: string; email?: string } : undefined,
    );
    const label = a.status === 'returned'
      ? `Returned by ${userName}`
      : `Assigned to ${userName}`;
    items.push({
      action: label,
      date: a.assignmentDate || a.createdAt,
      icon: a.status === 'returned' ? 'return-down-back-outline' : 'person-outline',
    });
  }

  for (const m of maintenance) {
    const statusLabel = m.status === 'completed' ? 'completed' : m.status === 'scheduled' ? 'scheduled' : m.status;
    items.push({
      action: `Maintenance ${statusLabel}: ${m.description || m.type}`,
      date: m.completedDate || m.scheduledDate || m.createdAt,
      icon: 'construct-outline',
    });
  }

  // Sort by date descending
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return items;
}

function getCurrentAssignment(assignments: Assignment[]): Assignment | null {
  return assignments.find((a) => a.status === 'active' || a.status === 'acknowledged') ?? null;
}

export default function DeviceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [device, setDevice] = useState<Device | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setError('Device ID is missing');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [deviceData, assignmentData, maintenanceData] = await Promise.all([
        deviceService.getById(id),
        assignmentService.getHistory(id),
        maintenanceService.getHistory(id),
      ]);
      setDevice(deviceData);
      setAssignments(assignmentData);
      setMaintenanceRecords(maintenanceData);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message ?? 'Failed to load device details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primaryLight} />
      </View>
    );
  }

  if (error || !device) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={AppColors.text.light} />
        <ThemedText style={styles.errorText}>{isNetworkError(error) ? NETWORK_ERROR_MESSAGE : (error ?? 'Device not found')}</ThemedText>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <ThemedText style={styles.retryBtnText}>Thử lại</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const specs = buildSpecs(device);
  const history = buildHistory(assignments, maintenanceRecords);
  const currentAssignment = getCurrentAssignment(assignments);
  const categoryName = getCategoryName(device);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hero Card */}
      <LinearGradient colors={['#2D1B69', '#4285F4']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.heroIcon}>
          <Ionicons name="laptop-outline" size={36} color="#fff" />
        </View>
        <ThemedText style={styles.heroName}>{device.name}</ThemedText>
        <ThemedText style={styles.heroTag}>{device.assetTag} · {categoryName}</ThemedText>
        <View style={styles.heroStatus}>
          <StatusBadge status={device.status} size="md" />
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.actions}>
        {[
          { icon: 'swap-horizontal-outline' as const, label: 'Assign' },
          { icon: 'construct-outline' as const, label: 'Maintain' },
          { icon: 'print-outline' as const, label: 'Label' },
          { icon: 'create-outline' as const, label: 'Edit' },
        ].map((a, i) => (
          <TouchableOpacity
            key={i}
            style={styles.actionBtn}
            onPress={
              a.label === 'Assign'
                ? () => router.push({ pathname: '/assignment', params: { deviceId: id } })
                : a.label === 'Edit'
                  ? () => router.push({ pathname: '/device-form', params: { id: device._id } })
                  : undefined
            }
          >
            <View style={styles.actionIcon}>
              <Ionicons name={a.icon} size={20} color={AppColors.primaryLight} />
            </View>
            <ThemedText style={styles.actionLabel}>{a.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Assignment Info */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Current Assignment</ThemedText>
        {currentAssignment ? (
          <View style={styles.assignCard}>
            <View style={styles.assignAvatar}>
              <ThemedText style={styles.avatarText}>
                {getInitials(getUserName(
                  typeof currentAssignment.assignedTo?.userId === 'object'
                    ? currentAssignment.assignedTo.userId as { firstName?: string; lastName?: string; email?: string }
                    : undefined,
                ))}
              </ThemedText>
            </View>
            <View style={styles.assignInfo}>
              <ThemedText style={styles.assignName}>
                {getUserName(
                  typeof currentAssignment.assignedTo?.userId === 'object'
                    ? currentAssignment.assignedTo.userId as { firstName?: string; lastName?: string; email?: string }
                    : undefined,
                )}
              </ThemedText>
              <ThemedText style={styles.assignDept}>
                Since {formatDate(currentAssignment.assignmentDate)}
              </ThemedText>
            </View>
            <StatusBadge status={currentAssignment.status} />
          </View>
        ) : (
          <View style={styles.assignCard}>
            <ThemedText style={styles.noAssignment}>No active assignment</ThemedText>
          </View>
        )}
      </View>

      {/* Warranty */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Warranty</ThemedText>
        <View style={styles.warrantyCard}>
          <View style={styles.warrantyRow}>
            <ThemedText style={styles.warrantyLabel}>Purchase Date</ThemedText>
            <ThemedText style={styles.warrantyValue}>{formatDate(device.purchaseDate)}</ThemedText>
          </View>
          <View style={styles.warrantyRow}>
            <ThemedText style={styles.warrantyLabel}>Condition</ThemedText>
            <ThemedText style={styles.warrantyValue}>
              {device.condition ? device.condition.charAt(0).toUpperCase() + device.condition.slice(1) : 'N/A'}
            </ThemedText>
          </View>
          <View style={styles.warrantyRow}>
            <ThemedText style={styles.warrantyLabel}>Current Value</ThemedText>
            <ThemedText style={styles.warrantyValue}>{formatCurrency(device.currentValue)}</ThemedText>
          </View>
        </View>
      </View>

      {/* Specifications */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Specifications</ThemedText>
        <View style={styles.specsCard}>
          {specs.map((s, i) => (
            <View key={i} style={[styles.specRow, i < specs.length - 1 && styles.specBorder]}>
              <ThemedText style={styles.specLabel}>{s.label}</ThemedText>
              <ThemedText style={styles.specValue}>{s.value}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* History */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>History</ThemedText>
        {history.length > 0 ? (
          history.map((h, i) => (
            <View key={i} style={styles.historyRow}>
              <View style={styles.historyDot}>
                <Ionicons name={h.icon} size={14} color={AppColors.primaryLight} />
              </View>
              <View style={styles.historyContent}>
                <ThemedText style={styles.historyAction}>{h.action}</ThemedText>
                <ThemedText style={styles.historyDate}>{formatDate(h.date)}</ThemedText>
              </View>
            </View>
          ))
        ) : (
          <ThemedText style={styles.noHistory}>No history records</ThemedText>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  content: { paddingBottom: 40 },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 12,
    backgroundColor: AppColors.bg.primary,
  },
  errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: AppColors.primaryLight, borderRadius: 10,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  hero: { alignItems: 'center', padding: 28, margin: 16, borderRadius: 20 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  heroName: { fontSize: 22, fontWeight: '700', color: '#fff' },
  heroTag: { fontSize: 14, color: '#C4A8E0', marginTop: 4 },
  heroStatus: { marginTop: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginTop: 20 },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: AppColors.primaryLight + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: 12, color: AppColors.text.secondary, fontWeight: '500' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: AppColors.text.primary, marginBottom: 10 },
  assignCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  assignAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: AppColors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  assignInfo: { flex: 1 },
  assignName: { fontSize: 15, fontWeight: '600', color: AppColors.text.primary },
  assignDept: { fontSize: 12, color: AppColors.text.secondary, marginTop: 2 },
  noAssignment: { fontSize: 14, color: AppColors.text.light, fontStyle: 'italic' },
  warrantyCard: {
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  warrantyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  warrantyLabel: { fontSize: 13, color: AppColors.text.secondary },
  warrantyValue: { fontSize: 13, fontWeight: '600', color: AppColors.text.primary },
  specsCard: {
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  specBorder: { borderBottomWidth: 1, borderBottomColor: AppColors.bg.border },
  specLabel: { fontSize: 13, color: AppColors.text.secondary },
  specValue: { fontSize: 13, fontWeight: '600', color: AppColors.text.primary, textAlign: 'right', flex: 1, marginLeft: 16 },
  historyRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  historyDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: AppColors.primaryLight + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  historyContent: { flex: 1 },
  historyAction: { fontSize: 14, fontWeight: '500', color: AppColors.text.primary },
  historyDate: { fontSize: 12, color: AppColors.text.light, marginTop: 2 },
  noHistory: { fontSize: 14, color: AppColors.text.light, fontStyle: 'italic' },
});
