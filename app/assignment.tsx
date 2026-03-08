import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import { assignmentService } from '@/services/assignmentService';
import { deviceService } from '@/services/deviceService';
import { userService } from '@/services/userService';
import type { Device, User } from '@/types/api';
import { filterEmployees } from '@/utils/filters';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/utils/networkError';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`;
}

export default function AssignmentScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();

  const [device, setDevice] = useState<Device | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!deviceId) {
      setError('Device ID is missing');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [deviceData, usersData] = await Promise.all([
        deviceService.getById(deviceId),
        userService.getAll(),
      ]);
      setDevice(deviceData);
      setUsers(usersData);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = filterEmployees(users, searchQuery);

  const handleAssign = async () => {
    if (!deviceId || !selectedUserId) return;

    setSubmitting(true);
    setError(null);
    try {
      await assignmentService.assign({
        deviceId,
        userId: selectedUserId,
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', 'Device assigned successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message ?? 'Failed to assign device');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primaryLight} />
      </View>
    );
  }

  // Show full-screen error with retry when initial data load fails and no device data
  if (error && !device) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={AppColors.text.light} />
        <ThemedText style={styles.loadErrorText}>{isNetworkError(error) ? NETWORK_ERROR_MESSAGE : error}</ThemedText>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <ThemedText style={styles.retryBtnText}>Thử lại</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Device Info */}
      <View style={styles.deviceCard}>
        <View style={styles.deviceIcon}>
          <Ionicons name="laptop-outline" size={24} color={AppColors.primaryLight} />
        </View>
        <View style={styles.deviceInfo}>
          <ThemedText style={styles.deviceName}>{device?.name ?? 'Unknown Device'}</ThemedText>
          <ThemedText style={styles.deviceTag}>{device?.assetTag ?? ''} · {device?.status ?? ''}</ThemedText>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
          <ThemedText style={styles.errorBannerText}>{isNetworkError(error) ? NETWORK_ERROR_MESSAGE : error}</ThemedText>
        </View>
      )}

      {/* Assignment Type */}
      <ThemedText style={styles.sectionTitle}>Assign To</ThemedText>
      <View style={styles.typeRow}>
        <TouchableOpacity style={[styles.typeBtn, styles.typeBtnActive]}>
          <Ionicons name="person-outline" size={20} color="#fff" />
          <ThemedText style={styles.typeBtnTextActive}>Employee</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.typeBtn}>
          <Ionicons name="business-outline" size={20} color={AppColors.text.secondary} />
          <ThemedText style={styles.typeBtnText}>Department</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Search Employee */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={AppColors.text.light} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search employees..."
          placeholderTextColor={AppColors.text.light}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search employees"
        />
      </View>

      {/* Employee List */}
      {filteredUsers.map((user) => {
        const isSelected = selectedUserId === user._id;
        const initials = getInitials(user.firstName, user.lastName);
        const deptName = user.departmentId?.name ?? 'No Department';

        return (
          <TouchableOpacity
            key={user._id}
            style={[styles.empCard, isSelected && styles.empCardSelected]}
            onPress={() => setSelectedUserId(user._id)}
          >
            <View style={[styles.empAvatar, isSelected && styles.empAvatarSelected]}>
              <ThemedText style={[styles.empInitials, isSelected && { color: '#fff' }]}>{initials}</ThemedText>
            </View>
            <View style={styles.empInfo}>
              <ThemedText style={styles.empName}>{user.firstName} {user.lastName}</ThemedText>
              <ThemedText style={styles.empDept}>{deptName}</ThemedText>
            </View>
            {isSelected && <Ionicons name="checkmark-circle" size={22} color={AppColors.primaryLight} />}
          </TouchableOpacity>
        );
      })}

      {filteredUsers.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>No employees found</ThemedText>
        </View>
      )}

      {/* Notes */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Assignment Notes</ThemedText>
        <TextInput
          style={styles.notesInput}
          placeholder="Optional notes..."
          placeholderTextColor={AppColors.text.light}
          multiline
          value={notes}
          onChangeText={setNotes}
          accessibilityLabel="Assignment notes"
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, (!selectedUserId || submitting) && styles.submitBtnDisabled]}
        onPress={handleAssign}
        activeOpacity={0.8}
        accessibilityRole="button"
        disabled={!selectedUserId || submitting}
      >
        <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="swap-horizontal-outline" size={20} color="#fff" />
              <ThemedText style={styles.submitText}>Assign Device</ThemedText>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  content: { padding: 20, paddingBottom: 40 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.bg.primary, gap: 12 },
  loadErrorText: { fontSize: 14, color: '#EF4444', textAlign: 'center', paddingHorizontal: 20 },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: AppColors.primaryLight, borderRadius: 10,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  deviceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 16,
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  deviceIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: AppColors.primaryLight + '12',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 16, fontWeight: '600', color: AppColors.text.primary },
  deviceTag: { fontSize: 13, color: AppColors.text.secondary, marginTop: 2 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EF4444' + '12', borderRadius: 10,
    padding: 12, marginBottom: 16,
  },
  errorBannerText: { fontSize: 13, color: '#EF4444', flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: AppColors.text.primary, marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
    backgroundColor: AppColors.bg.card, borderWidth: 1, borderColor: AppColors.bg.border,
  },
  typeBtnActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: AppColors.text.secondary },
  typeBtnTextActive: { fontSize: 14, fontWeight: '600', color: '#fff' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.bg.card, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: AppColors.bg.border,
    gap: 8, marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 15, color: AppColors.text.primary },
  empCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.bg.card, borderRadius: 12,
    padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: AppColors.bg.border,
  },
  empCardSelected: { borderColor: AppColors.primaryLight, backgroundColor: AppColors.primaryLight + '08' },
  empAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: AppColors.bg.input,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  empAvatarSelected: { backgroundColor: AppColors.primaryLight },
  empInitials: { fontSize: 14, fontWeight: '700', color: AppColors.text.secondary },
  empInfo: { flex: 1 },
  empName: { fontSize: 14, fontWeight: '600', color: AppColors.text.primary },
  empDept: { fontSize: 12, color: AppColors.text.secondary, marginTop: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 14, color: AppColors.text.light },
  field: { marginTop: 18 },
  label: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary, marginBottom: 6 },
  notesInput: {
    backgroundColor: AppColors.bg.card, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: AppColors.text.primary,
    borderWidth: 1, borderColor: AppColors.bg.border,
    minHeight: 80, textAlignVertical: 'top',
  },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 24 },
  submitBtnDisabled: { opacity: 0.6 },
  submitGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 8,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
