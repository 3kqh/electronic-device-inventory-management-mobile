import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

const SECTIONS = [
  {
    title: 'General',
    items: [
      { icon: 'business-outline' as const, label: 'Organization Name', value: 'Acme Corp' },
      { icon: 'globe-outline' as const, label: 'Language', value: 'English' },
      { icon: 'time-outline' as const, label: 'Timezone', value: 'UTC+7' },
      { icon: 'cash-outline' as const, label: 'Currency', value: 'USD' },
    ],
  },
  {
    title: 'Device Settings',
    items: [
      { icon: 'pricetag-outline' as const, label: 'Asset Tag Prefix', value: 'DEV-' },
      { icon: 'barcode-outline' as const, label: 'Auto-generate Tags', toggle: true },
      { icon: 'layers-outline' as const, label: 'Device Categories', value: '12 categories', nav: true },
      { icon: 'location-outline' as const, label: 'Locations', value: '8 locations', nav: true },
    ],
  },
  {
    title: 'Depreciation',
    items: [
      { icon: 'trending-down-outline' as const, label: 'Default Method', value: 'Straight-line' },
      { icon: 'calendar-outline' as const, label: 'Calculation Frequency', value: 'Monthly' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { icon: 'mail-outline' as const, label: 'Email Notifications', toggle: true },
      { icon: 'notifications-outline' as const, label: 'In-App Alerts', toggle: true },
      { icon: 'shield-outline' as const, label: 'Warranty Alerts', value: '30, 14, 7 days' },
    ],
  },
  {
    title: 'Security',
    items: [
      { icon: 'lock-closed-outline' as const, label: 'Max Login Attempts', value: '5' },
      { icon: 'timer-outline' as const, label: 'Session Timeout', value: '30 minutes' },
      { icon: 'key-outline' as const, label: 'Password Policy', value: 'Strong', nav: true },
      { icon: 'document-text-outline' as const, label: 'Audit Log Retention', value: '7 years' },
    ],
  },
];

export default function SystemSettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {SECTIONS.map((section, si) => (
        <View key={si} style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
          <View style={styles.sectionCard}>
            {section.items.map((item, ii) => (
              <TouchableOpacity key={ii} style={[styles.row, ii < section.items.length - 1 && styles.rowBorder]} disabled={!item.nav}>
                <View style={styles.rowIcon}>
                  <Ionicons name={item.icon} size={18} color={AppColors.primaryLight} />
                </View>
                <ThemedText style={styles.rowLabel}>{item.label}</ThemedText>
                <View style={styles.rowRight}>
                  {item.toggle !== undefined ? (
                    <Switch value={item.toggle} trackColor={{ true: AppColors.primaryLight, false: AppColors.bg.border }} thumbColor="#fff" />
                  ) : (
                    <>
                      <ThemedText style={styles.rowValue}>{item.value}</ThemedText>
                      {item.nav && <Ionicons name="chevron-forward" size={16} color={AppColors.text.light} />}
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Danger Zone */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Danger Zone</ThemedText>
        <View style={styles.dangerCard}>
          <TouchableOpacity style={styles.dangerBtn}>
            <Ionicons name="refresh-outline" size={18} color="#EF4444" />
            <ThemedText style={styles.dangerText}>Reset System Settings</ThemedText>
          </TouchableOpacity>
          <View style={styles.dangerDivider} />
          <TouchableOpacity style={styles.dangerBtn}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <ThemedText style={styles.dangerText}>Clear All Data</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: AppColors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingHorizontal: 4 },
  sectionCard: {
    backgroundColor: AppColors.bg.card, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: AppColors.bg.border },
  rowIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: AppColors.primaryLight + '10',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  rowLabel: { flex: 1, fontSize: 14, color: AppColors.text.primary },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 13, color: AppColors.text.light },
  dangerCard: {
    backgroundColor: '#FEF2F2', borderRadius: 14,
    borderWidth: 1, borderColor: '#FECACA',
    overflow: 'hidden',
  },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  dangerText: { fontSize: 14, color: '#EF4444', fontWeight: '500' },
  dangerDivider: { height: 1, backgroundColor: '#FECACA' },
});
