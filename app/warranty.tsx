import { AppColors } from '@/constants/theme';
import { warrantyService } from '@/services/warrantyService';
import type { CreateWarrantyData, Warranty } from '@/types/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet
} from 'react-native';

type FilterStatus = 'all' | 'active' | 'expired' | 'expiring';

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return AppColors.status.active;
    case 'expired': return AppColors.status.retired;
    case 'cancelled': return AppColors.status.disposed;
    default: return AppColors.text.light;
  }
}

function isExpiringSoon(endDate: string): boolean {
  const end = new Date(endDate);
  const now = new Date();
  const diffDays = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays <= 30;
}

function getDeviceName(deviceId: unknown): string {
  if (typeof deviceId === 'object' && deviceId !== null && 'name' in deviceId) {
    return (deviceId as { name: string }).name;
  }
  return String(deviceId ?? '');
}

export default function WarrantyScreen() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateWarrantyData>({
    deviceId: '',
    type: 'manufacturer',
    provider: '',
    startDate: '',
    endDate: '',
    coverage: '',
    cost: 0,
  });

  const fetchWarranties = useCallback(async () => {
    setLoading(true);
    try {
      const response = await warrantyService.getAll();
      setWarranties(response.data ?? []);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể tải danh sách bảo hành');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarranties();
  }, [fetchWarranties]);

  const filteredWarranties = warranties.filter((w) => {
    if (filter === 'all') return true;
    if (filter === 'active') return w.status === 'active';
    if (filter === 'expired') return w.status === 'expired';
    if (filter === 'expiring') return w.status === 'active' && isExpiringSoon(w.endDate);
    return true;
  });

  const handleCreate = async () => {
    if (!formData.deviceId || !formData.provider || !formData.startDate || !formData.endDate || !formData.coverage) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setSubmitting(true);
    try {
      await warrantyService.create(formData);
      Alert.alert('Thành công', 'Đã tạo bảo hành mới');
      setShowCreateModal(false);
      resetForm();
      fetchWarranties();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể tạo bảo hành');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ deviceId: '', type: 'manufacturer', provider: '', startDate: '', endDate: '', coverage: '', cost: 0 });
  };

  const renderFilterTab = (label: string, value: FilterStatus) => (
    <TouchableOpacity
      key={value}
      style={[styles.filterTab, filter === value && styles.filterTabActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterTabText, filter === value && styles.filterTabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderWarrantyItem = ({ item }: { item: Warranty }) => {
    const expiring = item.status === 'active' && isExpiringSoon(item.endDate);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/warranty-detail', params: { id: item._id } })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="shield-checkmark-outline" size={22} color={AppColors.primaryLight} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{getDeviceName(item.deviceId)}</Text>
            <Text style={styles.cardSubtitle}>{item.provider}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: expiring ? AppColors.status.inMaintenance + '20' : getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: expiring ? AppColors.status.inMaintenance : getStatusColor(item.status) }]}>
              {expiring ? 'Expiring Soon' : item.status}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.cardDetail}>
            <Ionicons name="calendar-outline" size={14} color={AppColors.text.light} />
            <Text style={styles.cardDetailText}>Đến: {new Date(item.endDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.cardDetail}>
            <Ionicons name="pricetag-outline" size={14} color={AppColors.text.light} />
            <Text style={styles.cardDetailText}>{item.type}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Warranty Management</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addBtn}>
          <Ionicons name="add-circle" size={28} color={AppColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterRowContent}>
        {renderFilterTab('Tất cả', 'all')}
        {renderFilterTab('Active', 'active')}
        {renderFilterTab('Expired', 'expired')}
        {renderFilterTab('Expiring Soon', 'expiring')}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredWarranties}
          keyExtractor={(item) => item._id}
          renderItem={renderWarrantyItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="shield-outline" size={48} color={AppColors.text.light} />
              <Text style={styles.emptyText}>Không có bảo hành nào</Text>
            </View>
          }
        />
      )}

      {/* Create Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo Bảo Hành Mới</Text>
              <TouchableOpacity onPress={() => { setShowCreateModal(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={AppColors.text.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Device ID *</Text>
              <TextInput style={styles.input} value={formData.deviceId} onChangeText={(v) => setFormData({ ...formData, deviceId: v })} placeholder="Nhập Device ID" placeholderTextColor={AppColors.text.light} />

              <Text style={styles.label}>Loại bảo hành</Text>
              <View style={styles.typeRow}>
                {(['manufacturer', 'extended', 'other'] as const).map((t) => (
                  <TouchableOpacity key={t} style={[styles.typeBtn, formData.type === t && styles.typeBtnActive]} onPress={() => setFormData({ ...formData, type: t })}>
                    <Text style={[styles.typeBtnText, formData.type === t && styles.typeBtnTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Nhà cung cấp *</Text>
              <TextInput style={styles.input} value={formData.provider} onChangeText={(v) => setFormData({ ...formData, provider: v })} placeholder="Nhập nhà cung cấp" placeholderTextColor={AppColors.text.light} />

              <Text style={styles.label}>Ngày bắt đầu * (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={formData.startDate} onChangeText={(v) => setFormData({ ...formData, startDate: v })} placeholder="2024-01-01" placeholderTextColor={AppColors.text.light} />

              <Text style={styles.label}>Ngày kết thúc * (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={formData.endDate} onChangeText={(v) => setFormData({ ...formData, endDate: v })} placeholder="2025-01-01" placeholderTextColor={AppColors.text.light} />

              <Text style={styles.label}>Phạm vi bảo hành *</Text>
              <TextInput style={styles.input} value={formData.coverage} onChangeText={(v) => setFormData({ ...formData, coverage: v })} placeholder="Mô tả phạm vi bảo hành" placeholderTextColor={AppColors.text.light} />

              <Text style={styles.label}>Chi phí</Text>
              <TextInput style={styles.input} value={formData.cost ? String(formData.cost) : ''} onChangeText={(v) => setFormData({ ...formData, cost: Number(v) || 0 })} placeholder="0" placeholderTextColor={AppColors.text.light} keyboardType="numeric" />

              <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleCreate} disabled={submitting} activeOpacity={0.8}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Tạo Bảo Hành</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    backgroundColor: AppColors.bg.card,
    borderBottomWidth: 1, borderBottomColor: AppColors.bg.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text.primary },
  addBtn: { padding: 4 },
  filterRow: { maxHeight: 52, backgroundColor: AppColors.bg.card },
  filterRowContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: AppColors.bg.input, marginRight: 8,
  },
  filterTabActive: { backgroundColor: AppColors.primary },
  filterTabText: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary },
  filterTabTextActive: { color: '#fff' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: AppColors.bg.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: AppColors.primaryLight + '12',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: AppColors.text.primary },
  cardSubtitle: { fontSize: 13, color: AppColors.text.secondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  cardFooter: { flexDirection: 'row', marginTop: 12, gap: 16 },
  cardDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardDetailText: { fontSize: 12, color: AppColors.text.light },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: AppColors.text.light, marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: AppColors.bg.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text.primary },
  label: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: AppColors.bg.input, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: AppColors.text.primary, borderWidth: 1, borderColor: AppColors.bg.border,
  },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: AppColors.bg.input, borderWidth: 1, borderColor: AppColors.bg.border,
  },
  typeBtnActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary },
  typeBtnTextActive: { color: '#fff' },
  submitBtn: {
    backgroundColor: AppColors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
