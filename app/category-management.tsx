import { AppColors } from '@/constants/theme';
import { categoryService } from '@/services/categoryService';
import type { CreateCategoryData, DeviceCategoryFull, UpdateCategoryData } from '@/types/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet
} from 'react-native';

interface CustomField {
  fieldName: string;
  fieldType: string;
  required: boolean;
}

const FIELD_TYPES = ['text', 'number', 'date', 'boolean', 'select'];

export default function CategoryManagementScreen() {
  const [categories, setCategories] = useState<DeviceCategoryFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCategoryData>({ name: '', code: '', description: '', customFields: [] });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data as unknown as DeviceCategoryFull[]);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const resetForm = () => {
    setFormData({ name: '', code: '', description: '', customFields: [] });
    setEditingId(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (cat: DeviceCategoryFull) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      code: cat.code ?? '',
      description: cat.description ?? '',
      customFields: cat.customFields?.map((f) => ({ ...f })) ?? [],
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      Alert.alert('Lỗi', 'Vui lòng điền tên danh mục');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const updateData: UpdateCategoryData = { name: formData.name, code: formData.code, description: formData.description, customFields: formData.customFields };
        await categoryService.update(editingId, updateData);
        Alert.alert('Thành công', 'Đã cập nhật danh mục');
      } else {
        await categoryService.create(formData);
        Alert.alert('Thành công', 'Đã tạo danh mục mới');
      }
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (cat: DeviceCategoryFull) => {
    Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa danh mục "${cat.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await categoryService.delete(cat._id);
            Alert.alert('Thành công', 'Đã xóa danh mục');
            fetchCategories();
          } catch (err: unknown) {
            const apiError = err as { message?: string };
            Alert.alert('Lỗi', apiError?.message ?? 'Không thể xóa danh mục');
          }
        },
      },
    ]);
  };

  const addCustomField = () => {
    setFormData({
      ...formData,
      customFields: [...(formData.customFields ?? []), { fieldName: '', fieldType: 'text', required: false }],
    });
  };

  const removeCustomField = (index: number) => {
    const fields = [...(formData.customFields ?? [])];
    fields.splice(index, 1);
    setFormData({ ...formData, customFields: fields });
  };

  const updateCustomField = (index: number, key: keyof CustomField, value: string | boolean) => {
    const fields = [...(formData.customFields ?? [])];
    fields[index] = { ...fields[index], [key]: value };
    setFormData({ ...formData, customFields: fields });
  };

  const renderItem = ({ item }: { item: DeviceCategoryFull }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name="grid-outline" size={22} color={AppColors.primaryLight} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.code ? `Mã: ${item.code}` : ''}{item.description ? ` · ${item.description}` : ''}</Text>
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
      {item.customFields && item.customFields.length > 0 && (
        <View style={styles.fieldsBadge}>
          <Ionicons name="list-outline" size={14} color={AppColors.primary} />
          <Text style={styles.fieldsText}>{item.customFields.length} custom field{item.customFields.length > 1 ? 's' : ''}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Category Management</Text>
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
          data={categories}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="grid-outline" size={48} color={AppColors.text.light} />
              <Text style={styles.emptyText}>Không có danh mục nào</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Sửa Danh Mục' : 'Tạo Danh Mục Mới'}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={AppColors.text.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Tên danh mục *</Text>
              <TextInput style={styles.input} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="Nhập tên danh mục" placeholderTextColor={AppColors.text.light} />

              <Text style={styles.label}>Mã danh mục</Text>
              <TextInput style={styles.input} value={formData.code} onChangeText={(v) => setFormData({ ...formData, code: v })} placeholder="Nhập mã danh mục" placeholderTextColor={AppColors.text.light} />

              <Text style={styles.label}>Mô tả</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} placeholder="Nhập mô tả" placeholderTextColor={AppColors.text.light} multiline numberOfLines={3} />

              {/* Custom Fields */}
              <View style={styles.customFieldsHeader}>
                <Text style={styles.label}>Custom Fields</Text>
                <TouchableOpacity onPress={addCustomField} style={styles.addFieldBtn}>
                  <Ionicons name="add-circle-outline" size={22} color={AppColors.primary} />
                  <Text style={styles.addFieldText}>Thêm</Text>
                </TouchableOpacity>
              </View>

              {(formData.customFields ?? []).map((field, index) => (
                <View key={index} style={styles.customFieldRow}>
                  <View style={styles.customFieldInputs}>
                    <TextInput style={[styles.input, styles.fieldInput]} value={field.fieldName} onChangeText={(v) => updateCustomField(index, 'fieldName', v)} placeholder="Tên trường" placeholderTextColor={AppColors.text.light} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fieldTypeRow}>
                      {FIELD_TYPES.map((t) => (
                        <TouchableOpacity key={t} style={[styles.fieldTypeBtn, field.fieldType === t && styles.fieldTypeBtnActive]} onPress={() => updateCustomField(index, 'fieldType', t)}>
                          <Text style={[styles.fieldTypeBtnText, field.fieldType === t && styles.fieldTypeBtnTextActive]}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <View style={styles.requiredRow}>
                      <Text style={styles.requiredLabel}>Bắt buộc</Text>
                      <Switch value={field.required} onValueChange={(v) => updateCustomField(index, 'required', v)} trackColor={{ true: AppColors.primary }} />
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => removeCustomField(index)} style={styles.removeFieldBtn}>
                    <Ionicons name="close-circle" size={24} color={AppColors.status.retired} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitting} activeOpacity={0.8}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitText}>{editingId ? 'Cập Nhật' : 'Tạo Danh Mục'}</Text>}
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
  fieldsBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: AppColors.bg.border },
  fieldsText: { fontSize: 12, color: AppColors.primary, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: AppColors.text.light, marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: AppColors.bg.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text.primary },
  label: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: AppColors.bg.input, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: AppColors.text.primary, borderWidth: 1, borderColor: AppColors.bg.border,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  customFieldsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  addFieldBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addFieldText: { fontSize: 13, fontWeight: '600', color: AppColors.primary },
  customFieldRow: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: AppColors.bg.input,
    borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: AppColors.bg.border,
  },
  customFieldInputs: { flex: 1 },
  fieldInput: { marginBottom: 8 },
  fieldTypeRow: { maxHeight: 40, marginBottom: 8 },
  fieldTypeBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 6,
    backgroundColor: AppColors.bg.card, borderWidth: 1, borderColor: AppColors.bg.border,
  },
  fieldTypeBtnActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  fieldTypeBtnText: { fontSize: 12, fontWeight: '600', color: AppColors.text.secondary },
  fieldTypeBtnTextActive: { color: '#fff' },
  requiredRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  requiredLabel: { fontSize: 13, color: AppColors.text.secondary },
  removeFieldBtn: { padding: 4, marginLeft: 8 },
  submitBtn: {
    backgroundColor: AppColors.primary, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 24, marginBottom: 20,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
