import { DeviceCard } from '@/components/device-card';
import { GradientHeader } from '@/components/gradient-header';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const RECENT_DEVICES = [
  { name: 'MacBook Pro 16"', assetTag: 'DEV-001', category: 'Laptop', status: 'assigned', assignedTo: 'John Doe' },
  { name: 'Dell Monitor 27"', assetTag: 'DEV-042', category: 'Monitor', status: 'available' },
  { name: 'iPhone 15 Pro', assetTag: 'DEV-108', category: 'Phone', status: 'in_maintenance' },
];

const ALERTS = [
  { icon: 'warning-outline' as const, text: '3 warranties expiring in 7 days', color: '#F59E0B' },
  { icon: 'build-outline' as const, text: '2 devices pending maintenance', color: '#3B82F6' },
  { icon: 'alert-circle-outline' as const, text: '1 overdue assignment acknowledgment', color: '#EF4444' },
];

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <GradientHeader title="Dashboard" subtitle="Welcome back, Admin">
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            <View style={styles.badge}><ThemedText style={styles.badgeText}>5</ThemedText></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} accessibilityLabel="Scan barcode">
            <Ionicons name="scan-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </GradientHeader>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="cube-outline" label="Total Devices" value="1,247" gradient={AppColors.gradient.primary} />
          <StatCard icon="checkmark-circle-outline" label="Available" value="342" color="#22C55E" />
        </View>
        <View style={styles.statsRow}>
          <StatCard icon="person-outline" label="Assigned" value="856" color="#8B5CF6" />
          <StatCard icon="construct-outline" label="In Maintenance" value="49" color="#F59E0B" />
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Alerts</ThemedText>
          {ALERTS.map((alert, i) => (
            <View key={i} style={styles.alertRow}>
              <View style={[styles.alertIcon, { backgroundColor: alert.color + '15' }]}>
                <Ionicons name={alert.icon} size={18} color={alert.color} />
              </View>
              <ThemedText style={styles.alertText}>{alert.text}</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={AppColors.text.light} />
            </View>
          ))}
        </View>

        {/* Recent Devices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Devices</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/devices')}>
              <ThemedText style={styles.seeAll}>See All</ThemedText>
            </TouchableOpacity>
          </View>
          {RECENT_DEVICES.map((device, i) => (
            <DeviceCard key={i} {...device} onPress={() => router.push('/device-details')} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  headerActions: { flexDirection: 'row', gap: 10, position: 'absolute', right: 20, top: 0 },
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
});
