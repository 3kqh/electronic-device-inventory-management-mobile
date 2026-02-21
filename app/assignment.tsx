import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const EMPLOYEES = [
  { name: 'John Doe', dept: 'Engineering', initials: 'JD', devices: 3 },
  { name: 'Jane Smith', dept: 'Design', initials: 'JS', devices: 2 },
  { name: 'Bob Wilson', dept: 'Marketing', initials: 'BW', devices: 1 },
  { name: 'Alice Brown', dept: 'Engineering', initials: 'AB', devices: 4 },
  { name: 'Charlie Davis', dept: 'HR', initials: 'CD', devices: 1 },
];

export default function AssignmentScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Device Info */}
      <View style={styles.deviceCard}>
        <View style={styles.deviceIcon}>
          <Ionicons name="laptop-outline" size={24} color={AppColors.primaryLight} />
        </View>
        <View style={styles.deviceInfo}>
          <ThemedText style={styles.deviceName}>MacBook Pro 16"</ThemedText>
          <ThemedText style={styles.deviceTag}>DEV-001 · Available</ThemedText>
        </View>
      </View>

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
          accessibilityLabel="Search employees"
        />
      </View>

      {/* Employee List */}
      {EMPLOYEES.map((emp, i) => (
        <TouchableOpacity key={i} style={[styles.empCard, i === 0 && styles.empCardSelected]}>
          <View style={[styles.empAvatar, i === 0 && styles.empAvatarSelected]}>
            <ThemedText style={[styles.empInitials, i === 0 && { color: '#fff' }]}>{emp.initials}</ThemedText>
          </View>
          <View style={styles.empInfo}>
            <ThemedText style={styles.empName}>{emp.name}</ThemedText>
            <ThemedText style={styles.empDept}>{emp.dept} · {emp.devices} devices</ThemedText>
          </View>
          {i === 0 && <Ionicons name="checkmark-circle" size={22} color={AppColors.primaryLight} />}
        </TouchableOpacity>
      ))}

      {/* Notes */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Assignment Notes</ThemedText>
        <TextInput
          style={styles.notesInput}
          placeholder="Optional notes..."
          placeholderTextColor={AppColors.text.light}
          multiline
          accessibilityLabel="Assignment notes"
        />
      </View>

      {/* Submit */}
      <TouchableOpacity style={styles.submitBtn} onPress={() => router.back()} activeOpacity={0.8} accessibilityRole="button">
        <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Ionicons name="swap-horizontal-outline" size={20} color="#fff" />
          <ThemedText style={styles.submitText}>Assign Device</ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  content: { padding: 20, paddingBottom: 40 },
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
  submitGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 8,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
