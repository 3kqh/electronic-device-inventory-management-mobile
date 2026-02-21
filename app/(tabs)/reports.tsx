import { GradientHeader } from '@/components/gradient-header';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const REPORT_TYPES = [
  { icon: 'cube-outline' as const, title: 'Inventory Report', desc: 'Overview of all devices by status & category', color: '#3B82F6' },
  { icon: 'people-outline' as const, title: 'Assignment Report', desc: 'Device assignments by employee & department', color: '#8B5CF6' },
  { icon: 'construct-outline' as const, title: 'Maintenance Report', desc: 'Maintenance history, costs & schedules', color: '#F59E0B' },
  { icon: 'trending-down-outline' as const, title: 'Depreciation Report', desc: 'Asset depreciation & current book values', color: '#EF4444' },
  { icon: 'shield-checkmark-outline' as const, title: 'Warranty Report', desc: 'Warranty status, claims & expirations', color: '#22C55E' },
  { icon: 'options-outline' as const, title: 'Custom Report', desc: 'Build a custom report with filters', color: '#06B6D4' },
];

const SCHEDULED = [
  { name: 'Monthly Inventory Summary', schedule: 'Every 1st of month', format: 'PDF', lastRun: '2026-02-01' },
  { name: 'Weekly Assignment Update', schedule: 'Every Monday', format: 'Excel', lastRun: '2026-02-17' },
];

export default function ReportsScreen() {
  return (
    <View style={styles.container}>
      <GradientHeader title="Reports" subtitle="Generate & export reports" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Export */}
        <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.quickExport} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.qeContent}>
            <ThemedText style={styles.qeTitle}>Quick Export</ThemedText>
            <ThemedText style={styles.qeDesc}>Export full inventory as CSV or PDF</ThemedText>
          </View>
          <View style={styles.qeButtons}>
            <TouchableOpacity style={styles.qeBtn}><ThemedText style={styles.qeBtnText}>CSV</ThemedText></TouchableOpacity>
            <TouchableOpacity style={styles.qeBtn}><ThemedText style={styles.qeBtnText}>PDF</ThemedText></TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Report Types */}
        <ThemedText style={styles.sectionTitle}>Report Types</ThemedText>
        <View style={styles.reportGrid}>
          {REPORT_TYPES.map((r, i) => (
            <TouchableOpacity key={i} style={styles.reportCard} activeOpacity={0.7}>
              <View style={[styles.reportIcon, { backgroundColor: r.color + '15' }]}>
                <Ionicons name={r.icon} size={22} color={r.color} />
              </View>
              <ThemedText style={styles.reportTitle}>{r.title}</ThemedText>
              <ThemedText style={styles.reportDesc} numberOfLines={2}>{r.desc}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Scheduled Reports */}
        <ThemedText style={styles.sectionTitle}>Scheduled Reports</ThemedText>
        {SCHEDULED.map((s, i) => (
          <View key={i} style={styles.schedCard}>
            <View style={styles.schedLeft}>
              <ThemedText style={styles.schedName}>{s.name}</ThemedText>
              <ThemedText style={styles.schedMeta}>{s.schedule} · {s.format}</ThemedText>
            </View>
            <View style={styles.schedRight}>
              <ThemedText style={styles.schedDate}>Last: {s.lastRun}</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={AppColors.text.light} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  quickExport: { borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  qeContent: { flex: 1 },
  qeTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  qeDesc: { fontSize: 12, color: '#93C5FD', marginTop: 2 },
  qeButtons: { flexDirection: 'row', gap: 8 },
  qeBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)',
  },
  qeBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text.primary, marginBottom: 14 },
  reportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  reportCard: {
    width: '47%', backgroundColor: AppColors.bg.card,
    borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  reportIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  reportTitle: { fontSize: 14, fontWeight: '600', color: AppColors.text.primary },
  reportDesc: { fontSize: 11, color: AppColors.text.secondary, marginTop: 4, lineHeight: 16 },
  schedCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.bg.card, borderRadius: 12,
    padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  schedLeft: { flex: 1 },
  schedName: { fontSize: 14, fontWeight: '600', color: AppColors.text.primary },
  schedMeta: { fontSize: 12, color: AppColors.text.secondary, marginTop: 2 },
  schedRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  schedDate: { fontSize: 11, color: AppColors.text.light },
});
