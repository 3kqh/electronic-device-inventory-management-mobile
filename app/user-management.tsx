import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/hooks/useApiData';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import type { RegisterData, User, UserRole } from '@/types/api';
import { filterEmployees, filterUsersByRole } from '@/utils/filters';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/utils/networkError';
import { canAccessAdmin } from '@/utils/permissions';
import { formatUserDisplay } from '@/utils/userUtils';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const ROLE_COLORS: Record<string, string> = {
  admin: '#EF4444',
  inventory_manager: '#3B82F6',
  staff: '#22C55E',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  inventory_manager: 'Inventory Manager',
  staff: 'Staff',
};

const ROLE_FILTERS = ['All', 'admin', 'inventory_manager', 'staff'] as const;

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`;
}

export default function UserManagementScreen() {
  const { user: authUser } = useAuth();
  const { data: users, loading, error, refetch } = useApiData<User[]>(() => userService.getAll());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Registration form state
  const [regForm, setRegForm] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'staff',
  });
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Route protection: redirect non-admin users to dashboard
  useEffect(() => {
    if (authUser && !canAccessAdmin(authUser.role)) {
      router.replace('/(tabs)');
    }
  }, [authUser]);

  // Filter users client-side: first by role, then by search query
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const byRole = filterUsersByRole(users, selectedRole);
    return filterEmployees(byRole, searchQuery);
  }, [users, selectedRole, searchQuery]);

  const handleRegister = async () => {
    if (!regForm.email || !regForm.password || !regForm.firstName || !regForm.lastName) {
      setRegError('All fields are required');
      return;
    }

    setRegistering(true);
    setRegError(null);
    try {
      await authService.register(regForm);
      setShowRegisterModal(false);
      setRegForm({ email: '', password: '', firstName: '', lastName: '', role: 'staff' });
      Alert.alert('Success', 'User registered successfully');
      refetch();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setRegError(apiError?.message ?? 'Failed to register user');
    } finally {
      setRegistering(false);
    }
  };

  const resetAndCloseModal = () => {
    setShowRegisterModal(false);
    setRegForm({ email: '', password: '', firstName: '', lastName: '', role: 'staff' });
    setRegError(null);
  };

  // Don't render content for non-admin users (redirect is in progress)
  if (authUser && !canAccessAdmin(authUser.role)) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primaryLight} />
      </View>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name={isNetworkError(error) ? 'cloud-offline-outline' : 'alert-circle-outline'} size={48} color={isNetworkError(error) ? AppColors.text.light : AppColors.status.retired} />
        <ThemedText style={styles.errorText}>{isNetworkError(error) ? NETWORK_ERROR_MESSAGE : error}</ThemedText>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <ThemedText style={styles.retryBtnText}>Thử lại</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      {/* Search + Add Button */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={AppColors.text.light} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={AppColors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search users"
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          accessibilityLabel="Add user"
          onPress={() => setShowRegisterModal(true)}
        >
          <Ionicons name="person-add-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Role Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {ROLE_FILTERS.map((r) => {
          const isActive = selectedRole === r;
          return (
            <TouchableOpacity
              key={r}
              style={[styles.filterChip, isActive && styles.filterActive]}
              onPress={() => setSelectedRole(r)}
            >
              <ThemedText style={[styles.filterText, isActive && styles.filterTextActive]}>
                {r === 'All' ? 'All' : ROLE_LABELS[r] ?? r}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* User List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={AppColors.text.light} />
            <ThemedText style={styles.emptyText}>No users found</ThemedText>
          </View>
        ) : (
          filteredUsers.map((user) => {
            const display = formatUserDisplay(user);
            const initials = getInitials(user.firstName, user.lastName);
            const roleColor = ROLE_COLORS[user.role] ?? '#6B7280';

            return (
              <View key={user._id} style={styles.userCard}>
                <View style={[styles.avatar, { backgroundColor: roleColor + '20' }]}>
                  <ThemedText style={[styles.avatarText, { color: roleColor }]}>{initials}</ThemedText>
                </View>
                <View style={styles.userInfo}>
                  <ThemedText style={styles.userName}>{display.fullName}</ThemedText>
                  <ThemedText style={styles.userEmail}>{display.email}</ThemedText>
                  <View style={styles.roleRow}>
                    <View style={[styles.roleBadge, { backgroundColor: roleColor + '15' }]}>
                      <ThemedText style={[styles.roleText, { color: roleColor }]}>
                        {ROLE_LABELS[display.role] ?? display.role}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                <View style={styles.userRight}>
                  <StatusBadge status={display.status} />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Register User Modal */}
      <Modal visible={showRegisterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Register New User</ThemedText>
              <TouchableOpacity onPress={resetAndCloseModal} accessibilityLabel="Close modal">
                <Ionicons name="close" size={24} color={AppColors.text.secondary} />
              </TouchableOpacity>
            </View>

            {regError && (
              <View style={styles.regErrorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={AppColors.status.retired} />
                <ThemedText style={styles.regErrorText}>{regError}</ThemedText>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedText style={styles.fieldLabel}>First Name</ThemedText>
              <TextInput
                style={styles.fieldInput}
                placeholder="First name"
                placeholderTextColor={AppColors.text.light}
                value={regForm.firstName}
                onChangeText={(v) => setRegForm((f) => ({ ...f, firstName: v }))}
                accessibilityLabel="First name"
              />

              <ThemedText style={styles.fieldLabel}>Last Name</ThemedText>
              <TextInput
                style={styles.fieldInput}
                placeholder="Last name"
                placeholderTextColor={AppColors.text.light}
                value={regForm.lastName}
                onChangeText={(v) => setRegForm((f) => ({ ...f, lastName: v }))}
                accessibilityLabel="Last name"
              />

              <ThemedText style={styles.fieldLabel}>Email</ThemedText>
              <TextInput
                style={styles.fieldInput}
                placeholder="email@company.com"
                placeholderTextColor={AppColors.text.light}
                value={regForm.email}
                onChangeText={(v) => setRegForm((f) => ({ ...f, email: v }))}
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="Email"
              />

              <ThemedText style={styles.fieldLabel}>Password</ThemedText>
              <TextInput
                style={styles.fieldInput}
                placeholder="Password"
                placeholderTextColor={AppColors.text.light}
                value={regForm.password}
                onChangeText={(v) => setRegForm((f) => ({ ...f, password: v }))}
                secureTextEntry
                accessibilityLabel="Password"
              />

              <ThemedText style={styles.fieldLabel}>Role</ThemedText>
              <View style={styles.roleSelector}>
                {(['staff', 'inventory_manager', 'admin'] as UserRole[]).map((role) => {
                  const isSelected = regForm.role === role;
                  return (
                    <TouchableOpacity
                      key={role}
                      style={[styles.roleSelectorChip, isSelected && styles.roleSelectorActive]}
                      onPress={() => setRegForm((f) => ({ ...f, role }))}
                    >
                      <ThemedText style={[styles.roleSelectorText, isSelected && styles.roleSelectorTextActive]}>
                        {ROLE_LABELS[role] ?? role}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.registerBtn, registering && styles.registerBtnDisabled]}
                onPress={handleRegister}
                disabled={registering}
                accessibilityRole="button"
              >
                {registering ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.registerBtnText}>Register User</ThemedText>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.bg.primary, padding: 20 },
  errorText: { fontSize: 15, color: AppColors.text.secondary, marginTop: 12, textAlign: 'center' },
  retryBtn: {
    marginTop: 16, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, backgroundColor: AppColors.primaryLight,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  searchRow: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 0 },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.bg.card, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: AppColors.bg.border, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: AppColors.text.primary },
  addBtn: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  filterScroll: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: AppColors.bg.card,
    borderWidth: 1, borderColor: AppColors.bg.border,
  },
  filterActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary },
  filterTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: AppColors.text.light, marginTop: 8 },
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.bg.card, borderRadius: 14,
    padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: AppColors.text.primary },
  userEmail: { fontSize: 12, color: AppColors.text.secondary, marginTop: 1 },
  roleRow: { flexDirection: 'row', marginTop: 4 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleText: { fontSize: 11, fontWeight: '600' },
  userRight: { alignItems: 'flex-end', gap: 8 },
  // Modal styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: AppColors.bg.primary, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text.primary },
  regErrorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: AppColors.status.retired + '12', borderRadius: 10,
    padding: 12, marginBottom: 12,
  },
  regErrorText: { fontSize: 13, color: AppColors.status.retired, flex: 1 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary, marginBottom: 6, marginTop: 12 },
  fieldInput: {
    backgroundColor: AppColors.bg.card, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: AppColors.text.primary,
    borderWidth: 1, borderColor: AppColors.bg.border,
  },
  roleSelector: { flexDirection: 'row', gap: 8, marginTop: 4 },
  roleSelectorChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: AppColors.bg.card, borderWidth: 1, borderColor: AppColors.bg.border,
    alignItems: 'center',
  },
  roleSelectorActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  roleSelectorText: { fontSize: 12, fontWeight: '600', color: AppColors.text.secondary },
  roleSelectorTextActive: { color: '#fff' },
  registerBtn: {
    marginTop: 24, marginBottom: 20, paddingVertical: 16, borderRadius: 14,
    backgroundColor: AppColors.primaryLight, alignItems: 'center',
  },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});