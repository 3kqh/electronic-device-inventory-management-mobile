import { GradientHeader } from '@/components/gradient-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import { maintenanceService } from '@/services/maintenanceService';
import type { MaintenanceRecord, MaintenanceRequestData, MaintenanceType } from '@/types/api';
import { countByStatus } from '@/utils/maintenanceUtils';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/utils/networkError';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const MAINTENANCE_TYPES: { label: string; value: MaintenanceType }[] = [
  { label: 'Preventive', value: 'preventive' },
  { label: 'Corrective', value: 'corrective' },
  { label: 'Other', value: 'other' },
];

function getTypeIcon(type: string): { name: keyof typeof Ionicons.glyphMap; bg: string; color: string } {
  switch (type) {
    case 'corrective':
      return { name: 'hammer-outline', bg: '#FEE2E2', color: '#DC2626' };
    case 'preventive':
      return { name: 'calendar-outline', bg: '#DBEAFE', color: '#2563EB' };
    default:
      return { name: 'search-outline', bg: '#FEF3C7', color: '#D97706' };
  }
}

function getDeviceName(record: MaintenanceRecord): string {
  if (typeof record.deviceId === 'object' && record.deviceId !== null) {
    return record.deviceId.name ?? 'Unknown Device';
  }
  return String(record.deviceId);
}

function getDeviceTag(record: MaintenanceRecord): string {
  if (typeof record.deviceId === 'object' && record.deviceId !== null) {
    return record.deviceId.assetTag ?? '';
  }
  return '';
}

export default function MaintenanceScreen() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form modal state
  const [showForm, setShowForm] = useState(false);
  const [formDeviceId, setFormDeviceId] = useState('');
  const [formType, setFormType] = useState<MaintenanceType>('preventive');
  const [formScheduledDate, setFormScheduledDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getAll();
      setRecords(data);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message ?? 'Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const statusCounts = countByStatus(records);

  const resetForm = () => {
    setFormDeviceId('');
    setFormType('preventive');
    setFormScheduledDate('');
    setFormDescription('');
    setFormNotes('');
    setFormError(null);
  };

  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmitRequest = async () => {
    setFormError(null);

    if (!formDeviceId.trim()) {
      setFormError('Device ID is required');
      return;
    }
    if (!formScheduledDate.trim()) {
      setFormError('Scheduled date is required');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Description is required');
      return;
    }

    const requestData: MaintenanceRequestData = {
      deviceId: formDeviceId.trim(),
      type: formType,
      scheduledDate: formScheduledDate.trim(),
      description: formDescription.trim(),
      notes: formNotes.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await maintenanceService.requestMaintenance(requestData);
      handleCloseForm();
      Alert.alert('Success', 'Maintenance request created successfully');
      fetchRecords();
    } catch (err: unknown) {
      const apiError = err as { message?: string; errors?: string[] };
      const errorMsg = apiError?.errors?.join(', ') ?? apiError?.message ?? 'Failed to create maintenance request';
      setFormError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Maintenance" subtitle="Track repairs & schedules" />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primaryLight} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={AppColors.text.light} />
          <ThemedText style={styles.errorText}>{isNetworkError(error) ? NETWORK_ERROR_MESSAGE : error}</ThemedText>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchRecords}>
            <ThemedText style={styles.retryBtnText}>Thử lại</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.statsRow}>
            <StatCard icon="time-outline" label="Pending" value={statusCounts.pending} color="#F59E0B" />
            <StatCard icon="checkmark-done-outline" label="Completed" value={statusCounts.completed} color="#22C55E" />
            <StatCard icon="calendar-outline" label="Scheduled" value={statusCounts.scheduled} color={AppColors.primaryLight} />
          </View>

          <ThemedText style={styles.sectionTitle}>Maintenance Records</ThemedText>

          {records.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="construct-outline" size={48} color={AppColors.text.light} />
              <ThemedText style={styles.emptyText}>No maintenance records found</ThemedText>
            </View>
          ) : (
            records.map((r) => {
              const typeInfo = getTypeIcon(r.type);
              const deviceName = getDeviceName(r);
              const deviceTag = getDeviceTag(r);
              const displayDate = r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : '—';

              return (
                <TouchableOpacity key={r._id} style={styles.card} activeOpacity={0.7}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardLeft}>
                      <View style={[styles.typeIcon, { backgroundColor: typeInfo.bg }]}>
                        <Ionicons name={typeInfo.name} size={18} color={typeInfo.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.deviceName}>{deviceName}</ThemedText>
                        <ThemedText style={styles.deviceTag}>
                          {deviceTag ? `${deviceTag} · ` : ''}{r.type}
                        </ThemedText>
                      </View>
                    </View>
                    <StatusBadge status={r.status} />
                  </View>
                  {r.description ? (
                    <ThemedText style={styles.descriptionText} numberOfLines={2}>{r.description}</ThemedText>
                  ) : null}
                  <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                      <Ionicons name="calendar-outline" size={13} color={AppColors.text.light} />
                      <ThemedText style={styles.footerText}>{displayDate}</ThemedText>
                    </View>
                    {r.cost > 0 && (
                      <View style={styles.footerItem}>
                        <Ionicons name="cash-outline" size={13} color={AppColors.text.light} />
                        <ThemedText style={styles.footerText}>${r.cost.toLocaleString()}</ThemedText>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} accessibilityLabel="Add maintenance record" onPress={handleOpenForm}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Maintenance Request Form Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>New Maintenance Request</ThemedText>
              <TouchableOpacity onPress={handleCloseForm} hitSlop={8}>
                <Ionicons name="close" size={24} color={AppColors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              {formError && (
                <View style={styles.formErrorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <ThemedText style={styles.formErrorText}>{formError}</ThemedText>
                </View>
              )}

              <ThemedText style={styles.fieldLabel}>Device ID *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter device ID"
                placeholderTextColor={AppColors.text.light}
                value={formDeviceId}
                onChangeText={setFormDeviceId}
                editable={!submitting}
              />

              <ThemedText style={styles.fieldLabel}>Type *</ThemedText>
              <View style={styles.typeRow}>
                {MAINTENANCE_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.typeChip, formType === t.value && styles.typeChipActive]}
                    onPress={() => setFormType(t.value)}
                    disabled={submitting}
                  >
                    <ThemedText style={[styles.typeChipText, formType === t.value && styles.typeChipTextActive]}>
                      {t.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedText style={styles.fieldLabel}>Scheduled Date *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={AppColors.text.light}
                value={formScheduledDate}
                onChangeText={setFormScheduledDate}
                editable={!submitting}
              />

              <ThemedText style={styles.fieldLabel}>Description *</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the maintenance needed"
                placeholderTextColor={AppColors.text.light}
                value={formDescription}
                onChangeText={setFormDescription}
                multiline
                numberOfLines={3}
                editable={!submitting}
              />

              <ThemedText style={styles.fieldLabel}>Notes (optional)</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes"
                placeholderTextColor={AppColors.text.light}
                value={formNotes}
                onChangeText={setFormNotes}
                multiline
                numberOfLines={2}
                editable={!submitting}
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmitRequest}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={styles.submitBtnText}>Submit Request</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text.primary, marginBottom: 14 },
  card: {
    backgroundColor: AppColors.bg.card, borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  typeIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  deviceName: { fontSize: 15, fontWeight: '600', color: AppColors.text.primary },
  deviceTag: { fontSize: 12, color: AppColors.text.secondary, marginTop: 2 },
  descriptionText: { fontSize: 13, color: AppColors.text.secondary, marginTop: 8 },
  cardFooter: {
    flexDirection: 'row', gap: 20, marginTop: 12,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: AppColors.bg.border,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: AppColors.text.light },
  fab: {
    position: 'absolute', bottom: 100, right: 20,
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  centerContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20, gap: 12,
  },
  errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: AppColors.primaryLight, borderRadius: 10,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, color: AppColors.text.light, textAlign: 'center' },
  // Modal styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: AppColors.bg.primary,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 34,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: AppColors.text.primary },
  formScroll: { marginBottom: 16 },
  formErrorContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEE2E2', padding: 12, borderRadius: 10, marginBottom: 16,
  },
  formErrorText: { fontSize: 13, color: '#DC2626', flex: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: AppColors.text.primary, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: AppColors.bg.input, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: AppColors.text.primary,
    borderWidth: 1, borderColor: AppColors.bg.border,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: AppColors.bg.card,
    borderWidth: 1, borderColor: AppColors.bg.border,
  },
  typeChipActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  typeChipText: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary },
  typeChipTextActive: { color: '#FFFFFF' },
  submitBtn: {
    backgroundColor: AppColors.primaryLight, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
