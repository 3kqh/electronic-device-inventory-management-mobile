import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { maintenanceService } from '@/services/maintenanceService';
import type { Device, MaintenanceRecord, User } from '@/types/api';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/utils/networkError';
import { canAccessAdmin } from '@/utils/permissions';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

function getUserName(user: User | string | undefined): string {
  if (!user) return '—';
  if (typeof user === 'string') return user;
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || '—';
}

function getDeviceInfo(device: Device | string | undefined): { name: string; tag: string } {
  if (!device) return { name: 'Unknown', tag: '' };
  if (typeof device === 'string') return { name: device, tag: '' };
  return { name: device.name ?? 'Unknown', tag: device.assetTag ?? '' };
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getTypeInfo(type: string): { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string } {
  switch (type) {
    case 'corrective':
      return { label: 'Corrective', icon: 'hammer-outline', color: '#DC2626', bg: '#FEE2E2' };
    case 'preventive':
      return { label: 'Preventive', icon: 'calendar-outline', color: '#4285F4', bg: '#E8F0FE' };
    default:
      return { label: 'Other', icon: 'search-outline', color: '#D97706', bg: '#FEF3C7' };
  }
}

export default function MaintenanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const canManage = user ? canAccessAdmin(user.role) : false;

  const [record, setRecord] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRecord = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getById(id);
      setRecord(data);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message ?? 'Failed to load maintenance record');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  const handleComplete = () => {
    Alert.alert('Complete Maintenance', 'Mark this maintenance as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          setActionLoading(true);
          try {
            await maintenanceService.completeMaintenance(id!, {});
            fetchRecord();
          } catch (err: unknown) {
            const apiErr = err as { message?: string };
            Alert.alert('Error', apiErr?.message ?? 'Failed to complete');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Maintenance', 'Are you sure you want to cancel this maintenance?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await maintenanceService.cancelMaintenance(id!);
            fetchRecord();
          } catch (err: unknown) {
            const apiErr = err as { message?: string };
            Alert.alert('Error', apiErr?.message ?? 'Failed to cancel');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primaryLight} />
      </View>
    );
  }

  if (error || !record) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={AppColors.text.light} />
        <ThemedText style={styles.errorText}>{isNetworkError(error ?? '') ? NETWORK_ERROR_MESSAGE : error}</ThemedText>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchRecord}>
          <ThemedText style={styles.retryBtnText}>Thử lại</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const device = getDeviceInfo(record.deviceId);
  const typeInfo = getTypeInfo(record.type);
  const isActive = record.status === 'scheduled' || record.status === 'in_progress';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hero Card */}
      <LinearGradient colors={['#2D1B69', '#4285F4']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={[styles.typeIconLg, { backgroundColor: typeInfo.bg }]}>
          <Ionicons name={typeInfo.icon} size={28} color={typeInfo.color} />
        </View>
        <ThemedText style={styles.heroName}>{device.name}</ThemedText>
        {device.tag ? <ThemedText style={styles.heroTag}>{device.tag} · {typeInfo.label}</ThemedText> : <ThemedText style={styles.heroTag}>{typeInfo.label}</ThemedText>}
        <View style={styles.heroStatus}>
          <StatusBadge status={record.status} />
        </View>
      </LinearGradient>

        {/* Details */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Details</ThemedText>
          <View style={styles.detailCard}>
            <DetailRow icon="calendar-outline" label="Scheduled Date" value={formatDate(record.scheduledDate)} />
            <DetailRow icon="checkmark-circle-outline" label="Completed Date" value={formatDate(record.completedDate)} />
            <DetailRow icon="cash-outline" label="Cost" value={record.cost > 0 ? `$${record.cost.toLocaleString()}` : '—'} />
            <DetailRow icon="person-outline" label="Requested By" value={getUserName(record.requestedBy)} />
            <DetailRow icon="construct-outline" label="Performed By" value={getUserName(record.performedBy)} />
            <DetailRow icon="time-outline" label="Created" value={formatDate(record.createdAt)} last />
          </View>
        </View>

        {/* Description */}
        {record.description ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Description</ThemedText>
            <View style={styles.textCard}>
              <ThemedText style={styles.textContent}>{record.description}</ThemedText>
            </View>
          </View>
        ) : null}

        {/* Notes */}
        {record.notes ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
            <View style={styles.textCard}>
              <ThemedText style={styles.textContent}>{record.notes}</ThemedText>
            </View>
          </View>
        ) : null}

        {/* Actions */}
        {canManage && isActive && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Actions</ThemedText>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.completeBtn]}
                onPress={handleComplete}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={18} color="#fff" />
                    <ThemedText style={styles.actionBtnText}>Complete</ThemedText>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={handleCancel}
                disabled={actionLoading}
              >
                <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                <ThemedText style={[styles.actionBtnText, { color: '#DC2626' }]}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
  );
}

function DetailRow({ icon, label, value, last }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon} size={16} color={AppColors.text.light} />
        <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      </View>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  content: { paddingBottom: 40 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 12 },
  errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: AppColors.primaryLight, borderRadius: 10 },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  // Hero
  hero: {
    alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  heroName: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 12 },
  heroTag: { fontSize: 14, color: '#C4A8E0', marginTop: 4 },
  heroStatus: { marginTop: 12 },
  typeIconLg: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  // Sections
  section: { marginBottom: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: AppColors.text.primary, marginBottom: 10, marginTop: 20 },
  // Detail card
  detailCard: {
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: AppColors.bg.border },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 14, color: AppColors.text.secondary },
  detailValue: { fontSize: 14, fontWeight: '600', color: AppColors.text.primary, maxWidth: '50%', textAlign: 'right' },
  // Text card
  textCard: {
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  textContent: { fontSize: 14, color: AppColors.text.secondary, lineHeight: 22 },
  // Actions
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
  },
  completeBtn: { backgroundColor: '#22C55E' },
  cancelBtn: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA' },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
