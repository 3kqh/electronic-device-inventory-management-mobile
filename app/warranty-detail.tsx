import { AppColors } from '@/constants/theme';
import { warrantyService } from '@/services/warrantyService';
import type { CreateWarrantyClaimData, Warranty, WarrantyClaim } from '@/types/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
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

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return AppColors.status.active;
    case 'expired': return AppColors.status.retired;
    case 'cancelled': return AppColors.status.disposed;
    case 'filed': return AppColors.status.inMaintenance;
    case 'in_review': return AppColors.primaryLight;
    case 'resolved': return AppColors.status.active;
    case 'rejected': return AppColors.status.retired;
    default: return AppColors.text.light;
  }
}

function getDeviceName(deviceId: unknown): string {
  if (typeof deviceId === 'object' && deviceId !== null && 'name' in deviceId) {
    return (deviceId as { name: string }).name;
  }
  return String(deviceId ?? '');
}

function getDeviceId(deviceId: unknown): string {
  if (typeof deviceId === 'object' && deviceId !== null && '_id' in deviceId) {
    return (deviceId as { _id: string })._id;
  }
  return String(deviceId ?? '');
}

export default function WarrantyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [claimIssue, setClaimIssue] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [warrantyData, claimsData] = await Promise.all([
        warrantyService.getById(id),
        warrantyService.getAllClaims(),
      ]);
      setWarranty(warrantyData);
      const related = (claimsData.data ?? []).filter((c) => {
        const claimWarrantyId = typeof c.warrantyId === 'object' && c.warrantyId !== null && '_id' in c.warrantyId
          ? (c.warrantyId as { _id: string })._id
          : String(c.warrantyId);
        return claimWarrantyId === id;
      });
      setClaims(related);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể tải chi tiết bảo hành');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateClaim = async () => {
    if (!claimIssue.trim() || !warranty) {
      Alert.alert('Lỗi', 'Vui lòng mô tả vấn đề');
      return;
    }
    setSubmitting(true);
    try {
      const data: CreateWarrantyClaimData = {
        warrantyId: warranty._id,
        deviceId: getDeviceId(warranty.deviceId),
        issue: claimIssue.trim(),
      };
      await warrantyService.createClaim(data);
      Alert.alert('Thành công', 'Đã tạo warranty claim');
      setShowClaimModal(false);
      setClaimIssue('');
      fetchData();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể tạo claim');
    } finally {
      setSubmitting(false);
    }
  };

  const renderDetailRow = (icon: string, label: string, value: string) => (
    <View style={styles.detailRow} key={label}>
      <Ionicons name={icon as any} size={18} color={AppColors.text.light} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  const renderClaimItem = ({ item }: { item: WarrantyClaim }) => (
    <View style={styles.claimCard}>
      <View style={styles.claimHeader}>
        <Text style={styles.claimNumber}>{item.claimNumber || 'Claim'}</Text>
        <View style={[styles.claimBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.claimBadgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.claimIssue}>{item.issue}</Text>
      {item.resolution ? <Text style={styles.claimResolution}>Resolution: {item.resolution}</Text> : null}
      <Text style={styles.claimDate}>{new Date(item.filedDate).toLocaleDateString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (!warranty) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={AppColors.text.light} />
        <Text style={styles.emptyText}>Không tìm thấy bảo hành</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Warranty Detail</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Warranty Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-checkmark" size={28} color={AppColors.primaryLight} />
            </View>
            <View style={styles.infoTitleWrap}>
              <Text style={styles.infoTitle}>{getDeviceName(warranty.deviceId)}</Text>
              <Text style={styles.infoSubtitle}>{warranty.provider}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(warranty.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(warranty.status) }]}>{warranty.status}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {renderDetailRow('pricetag-outline', 'Loại', warranty.type)}
          {renderDetailRow('calendar-outline', 'Bắt đầu', new Date(warranty.startDate).toLocaleDateString())}
          {renderDetailRow('calendar', 'Kết thúc', new Date(warranty.endDate).toLocaleDateString())}
          {renderDetailRow('document-text-outline', 'Phạm vi', warranty.coverage)}
          {renderDetailRow('cash-outline', 'Chi phí', warranty.cost ? `$${warranty.cost.toLocaleString()}` : 'N/A')}
        </View>

        {/* Claims Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Warranty Claims ({claims.length})</Text>
          <TouchableOpacity onPress={() => setShowClaimModal(true)} style={styles.addClaimBtn}>
            <Ionicons name="add" size={20} color={AppColors.primary} />
            <Text style={styles.addClaimText}>Tạo Claim</Text>
          </TouchableOpacity>
        </View>

        {claims.length === 0 ? (
          <View style={styles.emptyClaimsWrap}>
            <Ionicons name="document-outline" size={36} color={AppColors.text.light} />
            <Text style={styles.emptyClaimsText}>Chưa có warranty claim nào</Text>
          </View>
        ) : (
          <FlatList
            data={claims}
            keyExtractor={(item) => item._id}
            renderItem={renderClaimItem}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* Create Claim Modal */}
      <Modal visible={showClaimModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo Warranty Claim</Text>
              <TouchableOpacity onPress={() => { setShowClaimModal(false); setClaimIssue(''); }}>
                <Ionicons name="close" size={24} color={AppColors.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Mô tả vấn đề *</Text>
            <TextInput
              style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
              value={claimIssue}
              onChangeText={setClaimIssue}
              placeholder="Mô tả chi tiết vấn đề cần bảo hành..."
              placeholderTextColor={AppColors.text.light}
              multiline
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleCreateClaim}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitText}>Tạo Claim</Text>
              )}
            </TouchableOpacity>
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
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.bg.primary, gap: 12 },
  emptyText: { fontSize: 14, color: AppColors.text.light, marginTop: 8 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: AppColors.primaryLight, borderRadius: 10 },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  infoCard: {
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: AppColors.bg.border, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: AppColors.primaryLight + '12',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  infoTitleWrap: { flex: 1 },
  infoTitle: { fontSize: 17, fontWeight: '700', color: AppColors.text.primary },
  infoSubtitle: { fontSize: 13, color: AppColors.text.secondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: AppColors.bg.border, marginVertical: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  detailLabel: { fontSize: 13, color: AppColors.text.secondary, width: 80 },
  detailValue: { flex: 1, fontSize: 14, fontWeight: '500', color: AppColors.text.primary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: AppColors.text.primary },
  addClaimBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addClaimText: { fontSize: 14, fontWeight: '600', color: AppColors.primary },
  emptyClaimsWrap: { alignItems: 'center', paddingVertical: 32 },
  emptyClaimsText: { fontSize: 14, color: AppColors.text.light, marginTop: 8 },
  claimCard: {
    backgroundColor: AppColors.bg.card, borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: AppColors.bg.border,
  },
  claimHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  claimNumber: { fontSize: 14, fontWeight: '600', color: AppColors.text.primary },
  claimBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  claimBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  claimIssue: { fontSize: 13, color: AppColors.text.secondary, marginBottom: 4 },
  claimResolution: { fontSize: 12, color: AppColors.status.active, marginBottom: 4 },
  claimDate: { fontSize: 11, color: AppColors.text.light },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: AppColors.bg.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '60%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text.primary },
  label: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: AppColors.bg.input, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: AppColors.text.primary, borderWidth: 1, borderColor: AppColors.bg.border,
  },
  submitBtn: {
    backgroundColor: AppColors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 20, marginBottom: 10,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
