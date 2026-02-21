import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const USERS = [
  { name: 'Admin User', email: 'admin@company.com', role: 'Admin', status: 'active', initials: 'AU' },
  { name: 'John Doe', email: 'john@company.com', role: 'Inventory Manager', status: 'active', initials: 'JD' },
  { name: 'Jane Smith', email: 'jane@company.com', role: 'Staff', status: 'active', initials: 'JS' },
  { name: 'Bob Wilson', email: 'bob@company.com', role: 'Staff', status: 'active', initials: 'BW' },
  { name: 'Alice Brown', email: 'alice@company.com', role: 'Inventory Manager', status: 'active', initials: 'AB' },
  { name: 'Tom Harris', email: 'tom@company.com', role: 'Staff', status: 'retired', initials: 'TH' },
];

const ROLE_COLORS: Record<string, string> = {
  Admin: '#EF4444',
  'Inventory Manager': '#3B82F6',
  Staff: '#22C55E',
};

export default function UserManagementScreen() {
  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={AppColors.text.light} />
          <ThemedText style={styles.searchPlaceholder}>Search users...</ThemedText>
        </View>
        <TouchableOpacity style={styles.addBtn} accessibilityLabel="Add user">
          <Ionicons name="person-add-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Role Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {['All', 'Admin', 'Inventory Manager', 'Staff'].map((r, i) => (
          <TouchableOpacity key={r} style={[styles.filterChip, i === 0 && styles.filterActive]}>
            <ThemedText style={[styles.filterText, i === 0 && styles.filterTextActive]}>{r}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {USERS.map((user, i) => (
          <TouchableOpacity key={i} style={styles.userCard} activeOpacity={0.7}>
            <View style={[styles.avatar, { backgroundColor: ROLE_COLORS[user.role] + '20' }]}>
              <ThemedText style={[styles.avatarText, { color: ROLE_COLORS[user.role] }]}>{user.initials}</ThemedText>
            </View>
            <View style={styles.userInfo}>
              <ThemedText style={styles.userName}>{user.name}</ThemedText>
              <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
              <View style={styles.roleRow}>
                <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[user.role] + '15' }]}>
                  <ThemedText style={[styles.roleText, { color: ROLE_COLORS[user.role] }]}>{user.role}</ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.userRight}>
              <StatusBadge status={user.status} />
              <Ionicons name="ellipsis-vertical" size={16} color={AppColors.text.light} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  searchRow: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 0 },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.bg.card, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: AppColors.bg.border, gap: 8,
  },
  searchPlaceholder: { fontSize: 15, color: AppColors.text.light },
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
});
