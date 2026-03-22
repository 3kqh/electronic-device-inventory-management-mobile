import { AppColors } from '@/constants/theme';
import { locationService } from '@/services/locationService';
import type { CreateLocationData, LocationFull, UpdateLocationData } from '@/types/api';
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

type LocationType = 'building' | 'floor' | 'room' | 'other';
const LOCATION_TYPES: LocationType[] = ['building', 'floor', 'room', 'other'];

function getTypeIcon(type: string): string {
  switch (type) {
    case 'building': return 'business-outline';
    case 'floor': return 'layers-outline';
    case 'room': return 'cube-outline';
    default: return 'location-outline';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'building': return AppColors.primary;
    case 'floor': return AppColors.status.assigned;
    case 'room': return AppColors.status.active;
    default: return AppColors.text.light;
  }
}

interface TreeNode extends LocationFull {
  children: TreeNode[];
  level: number;
}

function buildTree(locations: LocationFull[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];
  for (const loc of locations) {
    map.set(loc._id, { ...loc, children: [], level: 0 });
  }
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId)!;
      node.level = parent.level + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children.length > 0) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}

export default function LocationManagementScreen() {
  const [locations, setLocations] = useState<LocationFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateLocationData>({ name: '', code: '', type: 'building', parentId: '', address: '' });

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await locationService.getAll();
      const fullData = data as unknown as LocationFull[];
      setLocations(fullData);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể tải danh sách vị trí');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const treeNodes = buildTree(locations);
  const flatList = flattenTree(treeNodes);

  const resetForm = () => {
    setFormData({ name: '', code: '', type: 'building', parentId: '', address: '' });
    setEditingId(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (loc: LocationFull) => {
    setEditingId(loc._id);
    setFormData({ name: loc.name, code: loc.code, type: loc.type, parentId: loc.parentId ?? '', address: loc.address ?? '' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      Alert.alert('Lỗi', 'Vui lòng điền tên vị trí');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateLocationData = {
        name: formData.name,
        type: formData.type,
        ...(formData.code ? { code: formData.code } : {}),
        ...(formData.parentId ? { parentId: formData.parentId } : {}),
        ...(formData.type === 'building' && formData.address ? { address: formData.address } : {}),
      };
      if (editingId) {
        await locationService.update(editingId, payload as UpdateLocationData);
        Alert.alert('Thành công', 'Đã cập nhật vị trí');
      } else {
        await locationService.create(payload);
        Alert.alert('Thành công', 'Đã tạo vị trí mới');
      }
      setShowModal(false);
      resetForm();
      fetchLocations();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể lưu vị trí');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (loc: LocationFull) => {
    Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa vị trí "${loc.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await locationService.delete(loc._id);
            Alert.alert('Thành công', 'Đã xóa vị trí');
            fetchLocations();
          } catch (err: unknown) {
            const apiError = err as { message?: string };
            Alert.alert('Lỗi', apiError?.message ?? 'Không thể xóa vị trí');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: TreeNode }) => (
    <View style={[styles.card, { marginLeft: item.level * 20 }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: getTypeColor(item.type) + '15' }]}>
          <Ionicons name={getTypeIcon(item.type) as any} size={22} color={getTypeColor(item.type)} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.type.toUpperCase()}{item.code ? ` · ${item.code}` : ''}</Text>
          {item.address ? <Text style={styles.cardAddress}>{item.address}</Text> : null}
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
    </View>
  );

  const parentOptions = locations.filter((l) => l.type === 'building' || l.type === 'floor');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location Management</Text>
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
          data={flatList}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="location-outline" size={48} color={AppColors.text.light} />
              <Text style={styles.emptyText}>Không có vị trí nào</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Sửa Vị Trí' : 'Tạo Vị Trí Mới'}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={AppColors.text.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Tên vị trí *</Text>
              <TextInput style={styles.input} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="Nhập tên vị trí" placeholderTextColor={AppColors.text.light} />

              <Text style={styles.label}>Mã vị trí</Text>
              <TextInput style={styles.input} value={formData.code} onChangeText={(v) => setFormData({ ...formData, code: v })} placeholder="Nhập mã vị trí" placeholderTextColor={AppColors.text.light} />

              <Text style={styles.label}>Loại vị trí</Text>
              <View style={styles.typeRow}>
                {LOCATION_TYPES.map((t) => (
                  <TouchableOpacity key={t} style={[styles.typeBtn, formData.type === t && styles.typeBtnActive]} onPress={() => setFormData({ ...formData, type: t })}>
                    <Text style={[styles.typeBtnText, formData.type === t && styles.typeBtnTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {formData.type === 'building' && (
                <>
                  <Text style={styles.label}>Địa chỉ</Text>
                  <TextInput style={styles.input} value={formData.address} onChangeText={(v) => setFormData({ ...formData, address: v })} placeholder="Nhập địa chỉ" placeholderTextColor={AppColors.text.light} />
                </>
              )}

              <Text style={styles.label}>Vị trí cha</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.parentRow}>
                <TouchableOpacity style={[styles.parentBtn, !formData.parentId && styles.parentBtnActive]} onPress={() => setFormData({ ...formData, parentId: '' })}>
                  <Text style={[styles.parentBtnText, !formData.parentId && styles.parentBtnTextActive]}>Không có</Text>
                </TouchableOpacity>
                {parentOptions.map((p) => (
                  <TouchableOpacity key={p._id} style={[styles.parentBtn, formData.parentId === p._id && styles.parentBtnActive]} onPress={() => setFormData({ ...formData, parentId: p._id })}>
                    <Text style={[styles.parentBtnText, formData.parentId === p._id && styles.parentBtnTextActive]}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitting} activeOpacity={0.8}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitText}>{editingId ? 'Cập Nhật' : 'Tạo Vị Trí'}</Text>}
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
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: AppColors.text.primary },
  cardSubtitle: { fontSize: 13, color: AppColors.text.secondary, marginTop: 2 },
  cardAddress: { fontSize: 12, color: AppColors.text.light, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 6 },
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
  typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: AppColors.bg.input, borderWidth: 1, borderColor: AppColors.bg.border,
  },
  typeBtnActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary },
  typeBtnTextActive: { color: '#fff' },
  parentRow: { maxHeight: 50, marginTop: 4 },
  parentBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: AppColors.bg.input, borderWidth: 1, borderColor: AppColors.bg.border,
  },
  parentBtnActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  parentBtnText: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary },
  parentBtnTextActive: { color: '#fff' },
  submitBtn: {
    backgroundColor: AppColors.primary, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 24, marginBottom: 20,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
