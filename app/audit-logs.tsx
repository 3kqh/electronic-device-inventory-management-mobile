import { AppColors } from '@/constants/theme';
import { auditLogService } from '@/services/auditLogService';
import type { AuditLog, AuditLogFilterParams } from '@/types/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

function getUserName(userId: unknown): string {
  if (typeof userId === 'object' && userId !== null && 'firstName' in userId) {
    const u = userId as { firstName: string; lastName?: string };
    return `${u.firstName} ${u.lastName ?? ''}`.trim();
  }
  return userId ? String(userId) : 'System';
}

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilterParams>({ action: '', userId: '', startDate: '', endDate: '' });

  const fetchLogs = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params: AuditLogFilterParams = { page: pageNum, limit: 20 };
      if (filters.action) params.action = filters.action;
      if (filters.userId) params.userId = filters.userId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const response = await auditLogService.getAll(params);
      const newLogs = response.data ?? [];
      setLogs(append ? (prev) => [...prev, ...newLogs] : newLogs);
      setHasMore(response.pagination?.hasNext ?? newLogs.length === 20);
      setPage(pageNum);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể tải nhật ký');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchLogs(page + 1, true);
  };

  const applyFilters = () => {
    setShowFilters(false);
    fetchLogs(1);
  };

  const clearFilters = () => {
    setFilters({ action: '', userId: '', startDate: '', endDate: '' });
  };

  const renderItem = ({ item }: { item: AuditLog }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name="document-text-outline" size={22} color={AppColors.primaryLight} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.action}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>{item.description}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'SUCCESS' ? AppColors.status.active + '20' : AppColors.status.retired + '20' }]}>
          <Text style={[styles.statusText, { color: item.status === 'SUCCESS' ? AppColors.status.active : AppColors.status.retired }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.cardDetail}>
          <Ionicons name="person-outline" size={14} color={AppColors.text.light} />
          <Text style={styles.cardDetailText}>{getUserName(item.userId)}</Text>
        </View>
        <View style={styles.cardDetail}>
          <Ionicons name="time-outline" size={14} color={AppColors.text.light} />
          <Text style={styles.cardDetailText}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit Logs</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.addBtn}>
          <Ionicons name="filter" size={24} color={AppColors.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Action</Text>
          <TextInput style={styles.filterInput} value={filters.action} onChangeText={(v) => setFilters({ ...filters, action: v })} placeholder="e.g. CREATE, UPDATE, DELETE" placeholderTextColor={AppColors.text.light} />

          <Text style={styles.filterLabel}>User ID</Text>
          <TextInput style={styles.filterInput} value={filters.userId} onChangeText={(v) => setFilters({ ...filters, userId: v })} placeholder="Nhập User ID" placeholderTextColor={AppColors.text.light} />

          <Text style={styles.filterLabel}>Start Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.filterInput} value={filters.startDate} onChangeText={(v) => setFilters({ ...filters, startDate: v })} placeholder="2024-01-01" placeholderTextColor={AppColors.text.light} />

          <Text style={styles.filterLabel}>End Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.filterInput} value={filters.endDate} onChangeText={(v) => setFilters({ ...filters, endDate: v })} placeholder="2024-12-31" placeholderTextColor={AppColors.text.light} />

          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.filterClearBtn} onPress={clearFilters}>
              <Text style={styles.filterClearText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterApplyBtn} onPress={applyFilters}>
              <Text style={styles.filterApplyText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={AppColors.primary} style={{ paddingVertical: 16 }} /> : null}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="document-text-outline" size={48} color={AppColors.text.light} />
              <Text style={styles.emptyText}>Không có nhật ký nào</Text>
            </View>
          }
        />
      )}
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
  filterSection: {
    backgroundColor: AppColors.bg.card, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: AppColors.bg.border,
  },
  filterLabel: { fontSize: 12, fontWeight: '600', color: AppColors.text.secondary, marginBottom: 4, marginTop: 8 },
  filterInput: {
    backgroundColor: AppColors.bg.input, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 14, color: AppColors.text.primary, borderWidth: 1, borderColor: AppColors.bg.border,
  },
  filterActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  filterClearBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  filterClearText: { fontSize: 14, color: AppColors.text.secondary },
  filterApplyBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: AppColors.primary },
  filterApplyText: { fontSize: 14, fontWeight: '600', color: '#fff' },
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
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', marginTop: 12, gap: 16 },
  cardDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardDetailText: { fontSize: 12, color: AppColors.text.light },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: AppColors.text.light, marginTop: 12 },
});
