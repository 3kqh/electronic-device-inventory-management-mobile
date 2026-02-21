import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const CATEGORIES = ['Laptop', 'Desktop', 'Monitor', 'Phone', 'Tablet', 'Printer', 'Peripheral'];

function FormField({ label, placeholder, multiline }: { label: string; placeholder: string; multiline?: boolean }) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={AppColors.text.light}
        multiline={multiline}
        accessibilityLabel={label}
      />
    </View>
  );
}

export default function DeviceFormScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Category Selector */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Category</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map((c, i) => (
            <TouchableOpacity key={c} style={[styles.catChip, i === 0 && styles.catActive]}>
              <ThemedText style={[styles.catText, i === 0 && styles.catTextActive]}>{c}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FormField label="Device Name" placeholder="e.g. MacBook Pro 16-inch" />
      <FormField label="Serial Number" placeholder="Enter serial number" />
      <FormField label="Asset Tag" placeholder="Auto-generated or custom" />

      {/* Scan Barcode */}
      <TouchableOpacity style={styles.scanBtn}>
        <Ionicons name="scan-outline" size={20} color={AppColors.primaryLight} />
        <ThemedText style={styles.scanText}>Scan Barcode / QR Code</ThemedText>
      </TouchableOpacity>

      <FormField label="Brand / Manufacturer" placeholder="e.g. Apple" />
      <FormField label="Model" placeholder="e.g. A2991" />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ThemedText style={styles.label}>Purchase Date</ThemedText>
          <TouchableOpacity style={styles.input}>
            <ThemedText style={styles.placeholderText}>Select date</ThemedText>
            <Ionicons name="calendar-outline" size={18} color={AppColors.text.light} />
          </TouchableOpacity>
        </View>
        <View style={styles.halfField}>
          <ThemedText style={styles.label}>Purchase Price</ThemedText>
          <TextInput style={styles.input} placeholder="$0.00" placeholderTextColor={AppColors.text.light} keyboardType="numeric" accessibilityLabel="Purchase price" />
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText style={styles.label}>Location</ThemedText>
        <TouchableOpacity style={styles.input}>
          <ThemedText style={styles.placeholderText}>Select location</ThemedText>
          <Ionicons name="chevron-down" size={18} color={AppColors.text.light} />
        </TouchableOpacity>
      </View>

      <FormField label="Notes" placeholder="Additional notes..." multiline />

      {/* Submit */}
      <TouchableOpacity style={styles.submitBtn} onPress={() => router.back()} activeOpacity={0.8} accessibilityRole="button">
        <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Ionicons name="checkmark" size={20} color="#fff" />
          <ThemedText style={styles.submitText}>Save Device</ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  content: { padding: 20, paddingBottom: 40 },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary, marginBottom: 6 },
  input: {
    backgroundColor: AppColors.bg.card, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: AppColors.text.primary,
    borderWidth: 1, borderColor: AppColors.bg.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  placeholderText: { fontSize: 15, color: AppColors.text.light },
  catScroll: { gap: 8 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, backgroundColor: AppColors.bg.card,
    borderWidth: 1, borderColor: AppColors.bg.border,
  },
  catActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  catText: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary },
  catTextActive: { color: '#fff' },
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: AppColors.primaryLight, borderStyle: 'dashed',
    marginBottom: 18,
  },
  scanText: { fontSize: 14, fontWeight: '600', color: AppColors.primaryLight },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1, marginBottom: 18 },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  submitGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 8,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
