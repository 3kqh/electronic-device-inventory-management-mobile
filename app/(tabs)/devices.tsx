import { DeviceCard } from '@/components/device-card';
import { GradientHeader } from '@/components/gradient-header';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const FILTERS = ['All', 'Available', 'Assigned', 'Maintenance', 'Retired'];

const DEVICES = [
  { name: 'MacBook Pro 16"', assetTag: 'DEV-001', category: 'Laptop', status: 'assigned', assignedTo: 'John Doe' },
  { name: 'Dell UltraSharp 27"', assetTag: 'DEV-042', category: 'Monitor', status: 'available' },
  { name: 'iPhone 15 Pro', assetTag: 'DEV-108', category: 'Phone', status: 'in_maintenance' },
  { name: 'ThinkPad X1 Carbon', assetTag: 'DEV-203', category: 'Laptop', status: 'assigned', assignedTo: 'Jane Smith' },
  { name: 'iPad Pro 12.9"', assetTag: 'DEV-315', category: 'Tablet', status: 'available' },
  { name: 'HP LaserJet Pro', assetTag: 'DEV-420', category: 'Printer', status: 'retired' },
  { name: 'Samsung Galaxy S24', assetTag: 'DEV-501', category: 'Phone', status: 'assigned', assignedTo: 'Bob Wilson' },
  { name: 'Logitech MX Keys', assetTag: 'DEV-612', category: 'Peripheral', status: 'available' },
];

export default function DevicesScreen() {
  return (
    <View style={styles.container}>
      <GradientHeader title="Devices" subtitle="1,247 total devices">
        <SearchBar placeholder="Search by name, tag, serial..." />
      </GradientHeader>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((f, i) => (
            <TouchableOpacity key={f} style={[styles.filterChip, i === 0 && styles.filterActive]}>
              <ThemedText style={[styles.filterText, i === 0 && styles.filterTextActive]}>{f}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {DEVICES.map((device, i) => (
          <DeviceCard key={i} {...device} onPress={() => router.push('/device-details')} />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/device-form')} activeOpacity={0.8} accessibilityLabel="Add new device">
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  filterRow: { paddingVertical: 12 },
  filterScroll: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: AppColors.bg.card,
    borderWidth: 1, borderColor: AppColors.bg.border,
  },
  filterActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterText: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary },
  filterTextActive: { color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  fab: {
    position: 'absolute', bottom: 100, right: 20,
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
});
