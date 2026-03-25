import { GradientHeader } from '@/components/gradient-header';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/hooks/useApiData';
import { userService } from '@/services/userService';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/utils/networkError';
import { canAccessAdmin } from '@/utils/permissions';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const MENU_ITEMS: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string; route: string; badge?: string }[] = [
  { icon: 'people-outline' as const, title: 'User Management', desc: 'Manage users & roles', route: '/user-management' as const },
  { icon: 'settings-outline' as const, title: 'System Settings', desc: 'Configure system preferences', route: '/system-settings' as const },
  { icon: 'layers-outline' as const, title: 'Device Categories', desc: 'Manage categories & custom fields', route: '/category-management' as const },
  { icon: 'location-outline' as const, title: 'Locations', desc: 'Buildings, floors & rooms', route: '/location-management' as const },
  { icon: 'business-outline' as const, title: 'Departments', desc: 'Organizational structure', route: '/department' as const },
  { icon: 'document-text-outline' as const, title: 'Audit Trail', desc: 'View system activity logs', route: '/audit-logs' as const },
  { icon: 'person-circle-outline' as const, title: 'Profile', desc: 'View & update your profile', route: '/profile' as const },
  { icon: 'shield-checkmark-outline' as const, title: 'Warranty Management', desc: 'Track device warranties', route: '/warranty' as const },
  { icon: 'trending-down-outline' as const, title: 'Depreciation', desc: 'Asset depreciation rules & values', route: '/depreciation' as const },
];

const RECENT_AUDIT = [
  { action: 'Device assigned', user: 'admin@company.com', time: '2 min ago', icon: 'swap-horizontal-outline' as const },
  { action: 'User created', user: 'admin@company.com', time: '15 min ago', icon: 'person-add-outline' as const },
  { action: 'Settings updated', user: 'admin@company.com', time: '1 hour ago', icon: 'settings-outline' as const },
];

export default function AdminScreen() {
  const { user, logout } = useAuth();

  // Permission check: staff cannot access admin features
  if (!user || !canAccessAdmin(user.role)) {
    return (
      <View style={styles.container}>
        <GradientHeader title="Admin Panel" subtitle="System administration" />
        <View style={styles.deniedContainer}>
          <View style={styles.deniedIconWrapper}>
            <Ionicons name="lock-closed" size={48} color={AppColors.text.light} />
          </View>
          <ThemedText style={styles.deniedTitle}>Không đủ quyền truy cập</ThemedText>
          <ThemedText style={styles.deniedMessage}>
            Bạn không có quyền truy cập trang quản trị. Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
          </ThemedText>
        </View>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  // Fetch real user count for admin/inventory_manager
  const { data: users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useApiData(() => userService.getAll());

  const totalUsers = users ? users.length : 0;
  const activeUsers = users ? users.filter(u => u.status === 'active').length : 0;
  const lockedUsers = users ? users.filter(u => u.status === 'inactive').length : 0;

  return (
    <View style={styles.container}>
      <GradientHeader title="Admin Panel" subtitle="System administration" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          {usersLoading ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="small" color={AppColors.primaryLight} />
            </View>
          ) : usersError ? (
            <View style={styles.statsError}>
              <Ionicons name="cloud-offline-outline" size={24} color={AppColors.text.light} />
              <ThemedText style={styles.statsErrorText}>{isNetworkError(usersError) ? NETWORK_ERROR_MESSAGE : usersError}</ThemedText>
              <TouchableOpacity style={styles.statsRetryBtn} onPress={refetchUsers}>
                <ThemedText style={styles.statsRetryText}>Thử lại</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <StatCard icon="people-outline" label="Users" value={String(totalUsers)} gradient={AppColors.gradient.primary} />
              <StatCard icon="shield-checkmark-outline" label="Active" value={String(activeUsers)} color="#22C55E" />
              <StatCard icon="ban-outline" label="Locked" value={String(lockedUsers)} color="#EF4444" />
            </>
          )}
        </View>

        <ThemedText style={styles.sectionTitle}>Administration</ThemedText>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuCard} activeOpacity={0.7} onPress={() => router.push(item.route as never)}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={22} color={AppColors.primaryLight} />
            </View>
            <View style={styles.menuContent}>
              <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.menuDesc}>{item.desc}</ThemedText>
            </View>
            <View style={styles.menuRight}>
              {item.badge && (
                <View style={styles.menuBadge}>
                  <ThemedText style={styles.menuBadgeText}>{item.badge}</ThemedText>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color={AppColors.text.light} />
            </View>
          </TouchableOpacity>
        ))}

        <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
        {RECENT_AUDIT.map((a, i) => (
          <View key={i} style={styles.auditRow}>
            <View style={styles.auditIcon}>
              <Ionicons name={a.icon} size={16} color={AppColors.primaryLight} />
            </View>
            <View style={styles.auditContent}>
              <ThemedText style={styles.auditAction}>{a.action}</ThemedText>
              <ThemedText style={styles.auditMeta}>{a.user}</ThemedText>
            </View>
            <ThemedText style={styles.auditTime}>{a.time}</ThemedText>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <ThemedText style={styles.logoutText}>Log out</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statsLoading: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  statsError: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  statsErrorText: { fontSize: 13, color: '#EF4444', textAlign: 'center' },
  statsRetryBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: AppColors.primaryLight, borderRadius: 8,
  },
  statsRetryText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text.primary, marginBottom: 14 },
  menuCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.bg.card, borderRadius: 14,
    padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  menuIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: AppColors.primaryLight + '12',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: AppColors.text.primary },
  menuDesc: { fontSize: 12, color: AppColors.text.secondary, marginTop: 2 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadge: {
    backgroundColor: AppColors.primaryLight + '15',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  menuBadgeText: { fontSize: 11, fontWeight: '600', color: AppColors.primaryLight },
  auditRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: AppColors.bg.border,
    gap: 12,
  },
  auditIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: AppColors.primaryLight + '10',
    alignItems: 'center', justifyContent: 'center',
  },
  auditContent: { flex: 1 },
  auditAction: { fontSize: 14, fontWeight: '500', color: AppColors.text.primary },
  auditMeta: { fontSize: 12, color: AppColors.text.secondary, marginTop: 1 },
  auditTime: { fontSize: 11, color: AppColors.text.light },
  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 24, paddingVertical: 16, borderRadius: 14,
    backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#DC2626' },
  deniedContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40,
  },
  deniedIconWrapper: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: AppColors.bg.input,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  deniedTitle: {
    fontSize: 18, fontWeight: '700', color: AppColors.text.primary,
    marginBottom: 8, textAlign: 'center',
  },
  deniedMessage: {
    fontSize: 14, color: AppColors.text.secondary,
    textAlign: 'center', lineHeight: 20,
  },
});
