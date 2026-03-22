import { AppColors } from '@/constants/theme';
import { departmentService } from '@/services/departmentService';
import type { CreateDepartmentData, Department, UpdateDepartmentData } from '@/types/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DepartmentScreen() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateDepartmentData>({ name: '', code: '', description: '' });

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể tải danh sách phòng ban');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const resetForm = () => {
    setFormData({ name: '', code: '', description: '' });
    setEditingId(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (dept: Department) => {
    setEditingId(dept._id);
    setFormData({ name: dept.name, code: dept.code, description: dept.description ?? '' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      Alert.alert('Lỗi', 'Vui lòng điền tên và mã phòng ban');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const updateData: UpdateDepartmentData = { name: formData.name, code: formData.code, description: formData.description };
        await departmentService.update(editingId, updateData);
        Alert.alert('Thành công', 'Đã cập nhật phòng ban');
      } else {
        await departmentService.create(formData);
        Alert.alert('Thành công', 'Đã tạo phòng ban mới');
      }
      setShowModal(false);
      resetForm();
      fetchDepartments();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể lưu phòng ban');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (dept: Department) => {
    Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa phòng ban "${dept.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await departmentService.delete(dept._id);
            Alert.alert('Thành công', 'Đã xóa phòng ban');
            fetchDepartments();
          } catch (err: unknown) {
            const apiError = err as { message?: string };
            Alert.alert('Lỗi', apiError?.message ?? 'Không thể xóa phòng ban');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Department }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name="business-outline" size={22} color={AppColors.primaryLight} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>Mã: {item.code}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
            <Ionicons name="create-outline" size={20} color={AppColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={20} color={AppColors.status.retired} />
          </TouchableOpacity>
        </View>
      </View>
      {item.description ? <Text style={styles.cardDescription}>{item.description}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Department Management</Text>
        <TouchableOpacity onPress={openCreate} style={styles.addBtn}>
          <Ionicons name="add-circle" size={28} color={AppColors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      ) : (
        <FlatList
          data={departments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="business-outline" size={48} color={AppColors.text.light} />
              <Text style={styles.emptyText}>Không có phòng ban nào</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Sửa Phòng Ban' : 'Tạo Phòng Ban Mới'}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={AppColors.text.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Tên phòng ban *</Text>
              <TextInput style={styles.input} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="Nhập tên phòng ban" placeholderTextColor={AppColors.text.light} />

              <Text style={styles.label}>Mã phòng ban *</Text>
              <TextInput style={styles.input} value={formData.code} onChangeText={(v) => setFormData({ ...formData, code: v })} placeholder="Nhập mã phòng ban" placeholderTextColor={AppColors.text.light} />

              <Text style={styles.label}>Mô tả</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} placeholder="Nhập mô tả" placeholderTextColor={AppColors.text.light} multiline numberOfLines={3} />

              <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitting} activeOpacity={0.8}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitText}>{editingId ? 'Cập Nhật' : 'Tạo Phòng Ban'}</Text>}
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
    backgroundColor: AppColors.bg.card, borderBottomWidth: 1, borderBottomColor: AppColors.bg.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text.primary },
  addBtn: { padding: 4 },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: AppColors.bg.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: AppColors.primaryLight + '12',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: AppColors.text.primary },
  cardSubtitle: { fontSize: 13, color: AppColors.text.secondary, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 6 },
  cardDescription: { fontSize: 13, color: AppColors.text.secondary, marginTop: 10, lineHeight: 18 },
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: AppColors.primary, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 24, marginBottom: 20,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
