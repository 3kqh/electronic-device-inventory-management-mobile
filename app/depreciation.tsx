import { AppColors } from '@/constants/theme';
import { depreciationService } from '@/services/depreciationService';
import type { CreateDepreciationRuleData, DepreciationMethod, DepreciationRule } from '@/types/api';
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

function getCategoryName(categoryId: unknown): string {
  if (typeof categoryId === 'object' && categoryId !== null && 'name' in categoryId) {
    return (categoryId as { name: string }).name;
  }
  return String(categoryId ?? '');
}

function getMethodLabel(method: DepreciationMethod): string {
  return method === 'straight_line' ? 'Straight Line' : 'Declining Balance';
}

export default function DepreciationScreen() {
  const [rules, setRules] = useState<DepreciationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateDepreciationRuleData>({
    categoryId: '',
    method: 'straight_line',
    usefulLifeYears: 5,
    salvageValuePercent: 10,
    depreciationRate: 20,
  });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await depreciationService.getAll();
      setRules(data ?? []);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể tải danh sách quy tắc khấu hao');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleCreate = async () => {
    if (!formData.categoryId) {
      Alert.alert('Lỗi', 'Vui lòng nhập Category ID');
      return;
    }
    if (formData.usefulLifeYears <= 0) {
      Alert.alert('Lỗi', 'Thời gian sử dụng phải lớn hơn 0');
      return;
    }
    setSubmitting(true);
    try {
      await depreciationService.create(formData);
      Alert.alert('Thành công', 'Đã tạo quy tắc khấu hao mới');
      setShowCreateModal(false);
      resetForm();
      fetchRules();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể tạo quy tắc khấu hao');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: '',
      method: 'straight_line',
      usefulLifeYears: 5,
      salvageValuePercent: 10,
      depreciationRate: 20,
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderRuleItem = ({ item }: { item: DepreciationRule }) => {
    const isExpanded = expandedId === item._id;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleExpand(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="trending-down-outline" size={22} color={AppColors.primaryLight} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{getCategoryName(item.categoryId)}</Text>
            <Text style={styles.cardSubtitle}>{getMethodLabel(item.method)}</Text>
          </View>
          <View style={[styles.methodBadge, { backgroundColor: item.method === 'straight_line' ? AppColors.status.available + '20' : AppColors.status.assigned + '20' }]}>
            <Text style={[styles.methodText, { color: item.method === 'straight_line' ? AppColors.status.available : AppColors.status.assigned }]}>
              {item.method === 'straight_line' ? 'SL' : 'DB'}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.cardDetail}>
            <Ionicons name="time-outline" size={14} color={AppColors.text.light} />
            <Text style={styles.cardDetailText}>{item.usefulLifeYears} năm</Text>
          </View>
          <View style={styles.cardDetail}>
            <Ionicons name="cash-outline" size={14} color={AppColors.text.light} />
            <Text style={styles.cardDetailText}>Salvage: {item.salvageValuePercent}%</Text>
          </View>
          <View style={styles.cardDetail}>
            <Ionicons name="analytics-outline" size={14} color={AppColors.text.light} />
            <Text style={styles.cardDetailText}>Rate: {item.depreciationRate}%</Text>
          </View>
        </View>
        {isExpanded && (
          <View style={styles.detailSection}>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category ID</Text>
              <Text style={styles.detailValue}>{typeof item.categoryId === 'string' ? item.categoryId : (item.categoryId as { _id: string })._id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phương pháp</Text>
              <Text style={styles.detailValue}>{getMethodLabel(item.method)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thời gian sử dụng</Text>
              <Text style={styles.detailValue}>{item.usefulLifeYears} năm</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giá trị còn lại</Text>
              <Text style={styles.detailValue}>{item.salvageValuePercent}%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tỷ lệ khấu hao</Text>
              <Text style={styles.detailValue}>{item.depreciationRate}%</Text>
            </View>
            {item.createdAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ngày tạo</Text>
                <Text style={styles.detailValue}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            )}
          </View>
        )}
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
        <Text style={styles.headerTitle}>Depreciation Rules</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addBtn}>
          <Ionicons name="add-circle" size={28} color={AppColors.primary} />
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      ) : (
        <FlatList
          data={rules}
          keyExtractor={(item) => item._id}
          renderItem={renderRuleItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="analytics-outline" size={48} color={AppColors.text.light} />
              <Text style={styles.emptyText}>Không có quy tắc khấu hao nào</Text>
            </View>
          }
        />
      )}

      {/* Create Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo Quy Tắc Khấu Hao</Text>
              <TouchableOpacity onPress={() => { setShowCreateModal(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={AppColors.text.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Category ID *</Text>
              <TextInput style={styles.input} value={formData.categoryId} onChangeText={(v) => setFormData({ ...formData, categoryId: v })} placeholder="Nhập Category ID" placeholderTextColor={AppColors.text.light} />

              <Text style={styles.label}>Phương pháp khấu hao</Text>
              <View style={styles.typeRow}>
                {(['straight_line', 'declining_balance'] as const).map((m) => (
                  <TouchableOpacity key={m} style={[styles.typeBtn, formData.method === m && styles.typeBtnActive]} onPress={() => setFormData({ ...formData, method: m })}>
                    <Text style={[styles.typeBtnText, formData.method === m && styles.typeBtnTextActive]}>{getMethodLabel(m)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Thời gian sử dụng (năm) *</Text>
              <TextInput style={styles.input} value={String(formData.usefulLifeYears)} onChangeText={(v) => setFormData({ ...formData, usefulLifeYears: Number(v) || 0 })} placeholder="5" placeholderTextColor={AppColors.text.light} keyboardType="numeric" />

              <Text style={styles.label}>Giá trị còn lại (%)</Text>
              <TextInput style={styles.input} value={formData.salvageValuePercent !== undefined ? String(formData.salvageValuePercent) : ''} onChangeText={(v) => setFormData({ ...formData, salvageValuePercent: Number(v) || 0 })} placeholder="10" placeholderTextColor={AppColors.text.light} keyboardType="numeric" />

              <Text style={styles.label}>Tỷ lệ khấu hao (%)</Text>
              <TextInput style={styles.input} value={formData.depreciationRate !== undefined ? String(formData.depreciationRate) : ''} onChangeText={(v) => setFormData({ ...formData, depreciationRate: Number(v) || 0 })} placeholder="20" placeholderTextColor={AppColors.text.light} keyboardType="numeric" />

              <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleCreate} disabled={submitting} activeOpacity={0.8}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Tạo Quy Tắc</Text>
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
  methodBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  methodText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  cardFooter: { flexDirection: 'row', marginTop: 12, gap: 16 },
  cardDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardDetailText: { fontSize: 12, color: AppColors.text.light },
  detailSection: { marginTop: 12 },
  detailDivider: { height: 1, backgroundColor: AppColors.bg.border, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  detailLabel: { fontSize: 13, color: AppColors.text.secondary },
  detailValue: { fontSize: 13, fontWeight: '600', color: AppColors.text.primary, maxWidth: '60%', textAlign: 'right' },
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
