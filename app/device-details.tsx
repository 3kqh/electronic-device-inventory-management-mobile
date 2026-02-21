import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const SPECS = [
  { label: 'Serial Number', value: 'C02ZN1YZMD6T' },
  { label: 'Model', value: 'MacBook Pro 16-inch (2024)' },
  { label: 'Processor', value: 'Apple M3 Pro' },
  { label: 'RAM', value: '36 GB' },
  { label: 'Storage', value: '512 GB SSD' },
  { label: 'Purchase Date', value: '2024-06-15' },
  { label: 'Purchase Price', value: '$2,499.00' },
  { label: 'Current Value', value: '$1,874.25' },
];

const HISTORY = [
  { action: 'Assigned to John Doe', date: '2024-07-01', icon: 'person-outline' as const },
  { action: 'Maintenance completed', date: '2025-01-15', icon: 'construct-outline' as const },
  { action: 'Warranty claim filed', date: '2025-06-20', icon: 'shield-outline' as const },
];

export default function DeviceDetailsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hero Card */}
      <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.heroIcon}>
          <Ionicons name="laptop-outline" size={36} color="#fff" />
        </View>
        <ThemedText style={styles.heroName}>MacBook Pro 16"</ThemedText>
        <ThemedText style={styles.heroTag}>DEV-001 · Laptop</ThemedText>
        <View style={styles.heroStatus}>
          <StatusBadge status="assigned" size="md" />
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.actions}>
        {[
          { icon: 'swap-horizontal-outline' as const, label: 'Assign' },
          { icon: 'construct-outline' as const, label: 'Maintain' },
          { icon: 'print-outline' as const, label: 'Label' },
          { icon: 'create-outline' as const, label: 'Edit' },
        ].map((a, i) => (
          <TouchableOpacity key={i} style={styles.actionBtn} onPress={a.label === 'Assign' ? () => router.push('/assignment') : a.label === 'Edit' ? () => router.push('/device-form') : undefined}>
            <View style={styles.actionIcon}>
              <Ionicons name={a.icon} size={20} color={AppColors.primaryLight} />
            </View>
            <ThemedText style={styles.actionLabel}>{a.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Assignment Info */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Current Assignment</ThemedText>
        <View style={styles.assignCard}>
          <View style={styles.assignAvatar}>
            <ThemedText style={styles.avatarText}>JD</ThemedText>
          </View>
          <View style={styles.assignInfo}>
            <ThemedText style={styles.assignName}>John Doe</ThemedText>
            <ThemedText style={styles.assignDept}>Engineering · Since Jul 2024</ThemedText>
          </View>
          <StatusBadge status="active" />
        </View>
      </View>

      {/* Warranty */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Warranty</ThemedText>
        <View style={styles.warrantyCard}>
          <View style={styles.warrantyRow}>
            <ThemedText style={styles.warrantyLabel}>Provider</ThemedText>
            <ThemedText style={styles.warrantyValue}>AppleCare+</ThemedText>
          </View>
          <View style={styles.warrantyRow}>
            <ThemedText style={styles.warrantyLabel}>Expires</ThemedText>
            <ThemedText style={[styles.warrantyValue, { color: '#F59E0B' }]}>2027-06-15 (498 days)</ThemedText>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '55%' }]} />
          </View>
        </View>
      </View>

      {/* Specifications */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Specifications</ThemedText>
        <View style={styles.specsCard}>
          {SPECS.map((s, i) => (
            <View key={i} style={[styles.specRow, i < SPECS.length - 1 && styles.specBorder]}>
              <ThemedText style={styles.specLabel}>{s.label}</ThemedText>
              <ThemedText style={styles.specValue}>{s.value}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* History */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>History</ThemedText>
        {HISTORY.map((h, i) => (
          <View key={i} style={styles.historyRow}>
            <View style={styles.historyDot}>
              <Ionicons name={h.icon} size={14} color={AppColors.primaryLight} />
            </View>
            <View style={styles.historyContent}>
              <ThemedText style={styles.historyAction}>{h.action}</ThemedText>
              <ThemedText style={styles.historyDate}>{h.date}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  content: { paddingBottom: 40 },
  hero: { alignItems: 'center', padding: 28, margin: 16, borderRadius: 20 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  heroName: { fontSize: 22, fontWeight: '700', color: '#fff' },
  heroTag: { fontSize: 14, color: '#93C5FD', marginTop: 4 },
  heroStatus: { marginTop: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginTop: 20 },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: AppColors.primaryLight + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: 12, color: AppColors.text.secondary, fontWeight: '500' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: AppColors.text.primary, marginBottom: 10 },
  assignCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  assignAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: AppColors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  assignInfo: { flex: 1 },
  assignName: { fontSize: 15, fontWeight: '600', color: AppColors.text.primary },
  assignDept: { fontSize: 12, color: AppColors.text.secondary, marginTop: 2 },
  warrantyCard: {
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  warrantyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  warrantyLabel: { fontSize: 13, color: AppColors.text.secondary },
  warrantyValue: { fontSize: 13, fontWeight: '600', color: AppColors.text.primary },
  progressBg: { height: 6, backgroundColor: AppColors.bg.input, borderRadius: 3, marginTop: 4 },
  progressFill: { height: 6, backgroundColor: AppColors.primaryLight, borderRadius: 3 },
  specsCard: {
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  specBorder: { borderBottomWidth: 1, borderBottomColor: AppColors.bg.border },
  specLabel: { fontSize: 13, color: AppColors.text.secondary },
  specValue: { fontSize: 13, fontWeight: '600', color: AppColors.text.primary, textAlign: 'right', flex: 1, marginLeft: 16 },
  historyRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  historyDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: AppColors.primaryLight + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  historyContent: { flex: 1 },
  historyAction: { fontSize: 14, fontWeight: '500', color: AppColors.text.primary },
  historyDate: { fontSize: 12, color: AppColors.text.light, marginTop: 2 },
});
