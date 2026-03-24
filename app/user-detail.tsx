import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import type { User, UserRole } from '@/types/api';
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

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  admin: { color: '#EF4444', bg: '#FEE2E2' },
  inventory_manager: { color: '#4285F4', bg: '#E8F0FE' },
  staff: { color: '#22C55E', bg: '#DCFCE7' },
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  inventory_manager: 'Inventory Manager',
  staff: 'Staff',
};

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const isAdmin = authUser ? canAccessAdmin(authUser.role) : false;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getById(id);
      setUser(data);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message ?? 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleDeactivate = () => {
    if (!user) return;
    Alert.alert(
      'Deactivate User',
      `Are you sure you want to deactivate ${user.firstName} ${user.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await userService.deactivate(user._id);
              fetchUser();
              Alert.alert('Success', 'User deactivated successfully');
            } catch (err: unknown) {
              const apiErr = err as { message?: string };
              Alert.alert('Error', apiErr?.message ?? 'Failed to deactivate user');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (!user || user.role === newRole) return;
    Alert.alert(
      'Change Role',
      `Change role to ${ROLE_LABELS[newRole]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setActionLoading(true);
            try {
              await userService.assignRole(user._id, newRole);
              fetchUser();
              Alert.alert('Success', 'Role updated successfully');
            } catch (err: unknown) {
              const apiErr = err as { message?: string };
              Alert.alert('Error', apiErr?.message ?? 'Failed to update role');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primaryLight} />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={AppColors.text.light} />
        <ThemedText style={styles.errorText}>
          {isNetworkError(error ?? '') ? NETWORK_ERROR_MESSAGE : error}
        </ThemedText>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchUser}>
          <ThemedText style={styles.retryBtnText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const roleInfo = ROLE_COLORS[user.role] ?? { color: '#6B7280', bg: '#F3F4F6' };
  const initials = `${(user.firstName?.[0] ?? '').toUpperCase()}${(user.lastName?.[0] ?? '').toUpperCase()}`;
  const department = typeof user.departmentId === 'object' && user.departmentId
    ? (user.departmentId as { name: string }).name
    : '—';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient colors={['#2D1B69', '#4285F4']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={[styles.avatarLg, { backgroundColor: roleInfo.bg }]}>
          <ThemedText style={[styles.avatarText, { color: roleInfo.color }]}>{initials}</ThemedText>
        </View>
        <ThemedText style={styles.heroName}>{user.firstName} {user.lastName}</ThemedText>
        <ThemedText style={styles.heroEmail}>{user.email}</ThemedText>
        <View style={styles.heroBadges}>
          <View style={[styles.roleBadge, { backgroundColor: roleInfo.color + '20' }]}>
            <ThemedText style={[styles.roleBadgeText, { color: roleInfo.color }]}>
              {ROLE_LABELS[user.role] ?? user.role}
            </ThemedText>
          </View>
          <StatusBadge status={user.status} />
        </View>
      </LinearGradient>

      {/* Account Info */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account Information</ThemedText>
        <View style={styles.detailCard}>
          <DetailRow icon="mail-outline" label="Email" value={user.email} />
          <DetailRow icon="shield-outline" label="Role" value={ROLE_LABELS[user.role] ?? user.role} />
          <DetailRow icon="business-outline" label="Department" value={department} />
          <DetailRow icon="ellipse-outline" label="Status" value={user.status === 'active' ? 'Active' : 'Inactive'} />
          <DetailRow icon="log-in-outline" label="Last Login" value={formatDateTime(user.lastLogin)} />
          <DetailRow icon="time-outline" label="Created" value={formatDate(user.createdAt)} last />
        </View>
      </View>

      {/* Admin Actions */}
      {isAdmin && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Role Management</ThemedText>
          <View style={styles.roleSelector}>
            {(['staff', 'inventory_manager', 'admin'] as UserRole[]).map((role) => {
              const isSelected = user.role === role;
              return (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleChip, isSelected && styles.roleChipActive]}
                  onPress={() => handleRoleChange(role)}
                  disabled={actionLoading || isSelected}
                >
                  <ThemedText style={[styles.roleChipText, isSelected && styles.roleChipTextActive]}>
                    {ROLE_LABELS[role]}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {user.status === 'active' && (
            <TouchableOpacity
              style={styles.deactivateBtn}
              onPress={handleDeactivate}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <Ionicons name="person-remove-outline" size={18} color="#DC2626" />
                  <ThemedText style={styles.deactivateBtnText}>Deactivate User</ThemedText>
                </>
              )}
            </TouchableOpacity>
          )}
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
  avatarLg: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '700' },
  heroName: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 12 },
  heroEmail: { fontSize: 14, color: '#C4A8E0', marginTop: 4 },
  heroBadges: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  roleBadgeText: { fontSize: 12, fontWeight: '700' },
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
  // Role selector
  roleSelector: { flexDirection: 'row', gap: 8 },
  roleChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: AppColors.bg.card, borderWidth: 1, borderColor: AppColors.bg.border,
    alignItems: 'center',
  },
  roleChipActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  roleChipText: { fontSize: 12, fontWeight: '600', color: AppColors.text.secondary },
  roleChipTextActive: { color: '#fff' },
  // Deactivate
  deactivateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 16, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA',
  },
  deactivateBtnText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});
