import { GradientHeader } from '@/components/gradient-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const RECORDS = [
  { device: 'MacBook Pro 16"', tag: 'DEV-001', type: 'Repair', date: '2026-02-18', status: 'pending', tech: 'Mike Chen' },
  { device: 'HP LaserJet Pro', tag: 'DEV-420', type: 'Scheduled', date: '2026-02-20', status: 'completed', tech: 'Sarah Lee' },
  { device: 'iPhone 15 Pro', tag: 'DEV-108', type: 'Repair', date: '2026-02-15', status: 'pending', tech: 'Mike Chen' },
  { device: 'Dell Monitor 27"', tag: 'DEV-042', type: 'Inspection', date: '2026-02-22', status: 'pending', tech: 'Unassigned' },
  { device: 'ThinkPad X1', tag: 'DEV-203', type: 'Upgrade', date: '2026-02-10', status: 'completed', tech: 'Sarah Lee' },
];

export default function MaintenanceScreen() {
  return (
    <View style={styles.container}>
      <GradientHeader title="Maintenance" subtitle="Track repairs & schedules" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <StatCard icon="time-outline" label="Pending" value="12" color="#F59E0B" />
          <StatCard icon="checkmark-done-outline" label="Completed" value="89" color="#22C55E" />
          <StatCard icon="calendar-outline" label="Scheduled" value="5" color={AppColors.primaryLight} />
        </View>

        <ThemedText style={styles.sectionTitle}>Maintenance Records</ThemedText>
        {RECORDS.map((r, i) => (
          <TouchableOpacity key={i} style={styles.card} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <View style={styles.cardLeft}>
                <View style={[styles.typeIcon, { backgroundColor: r.type === 'Repair' ? '#FEE2E2' : r.type === 'Scheduled' ? '#DBEAFE' : '#FEF3C7' }]}>
                  <Ionicons
                    name={r.type === 'Repair' ? 'hammer-outline' : r.type === 'Scheduled' ? 'calendar-outline' : 'search-outline'}
                    size={18}
                    color={r.type === 'Repair' ? '#DC2626' : r.type === 'Scheduled' ? '#2563EB' : '#D97706'}
                  />
                </View>
                <View>
                  <ThemedText style={styles.deviceName}>{r.device}</ThemedText>
                  <ThemedText style={styles.deviceTag}>{r.tag} · {r.type}</ThemedText>
                </View>
              </View>
              <StatusBadge status={r.status} />
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.footerItem}>
                <Ionicons name="calendar-outline" size={13} color={AppColors.text.light} />
                <ThemedText style={styles.footerText}>{r.date}</ThemedText>
              </View>
              <View style={styles.footerItem}>
                <Ionicons name="person-outline" size={13} color={AppColors.text.light} />
                <ThemedText style={styles.footerText}>{r.tech}</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} accessibilityLabel="Add maintenance record">
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
});
