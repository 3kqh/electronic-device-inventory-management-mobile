import { GradientHeader } from '@/components/gradient-header';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { reportService } from '@/services/reportService';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/utils/networkError';
import { hasPermission } from '@/utils/permissions';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// ---------------------------------------------------------------------------
// Report card definitions
// ---------------------------------------------------------------------------

interface ReportType {
  key: 'inventory' | 'assignment' | 'warranty' | 'depreciation';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  color: string;
}

const REPORT_TYPES: ReportType[] = [
  { key: 'inventory', icon: 'cube-outline', title: 'Inventory Report', desc: 'Overview of all devices by status & category', color: '#3B82F6' },
  { key: 'assignment', icon: 'people-outline', title: 'Assignment Report', desc: 'Device assignments by employee & department', color: '#8B5CF6' },
  { key: 'warranty', icon: 'shield-checkmark-outline', title: 'Warranty Report', desc: 'Warranty status, claims & expirations', color: '#22C55E' },
  { key: 'depreciation', icon: 'trending-down-outline', title: 'Depreciation Report', desc: 'Asset depreciation & current book values', color: '#EF4444' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReportsScreen() {
  const { user } = useAuth();
  const canView = user ? hasPermission(user.role, 'view_reports') : false;

  // Track which report is currently being fetched / displayed
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);
  const [reportLoading, setReportLoading] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchReport = useCallback(async (key: string) => {
    // Toggle off if tapping the same report
    if (activeReport === key && !reportLoading) {
      setActiveReport(null);
      setReportData(null);
      setReportError(null);
      return;
    }

    setActiveReport(key);
    setReportLoading(key);
    setReportError(null);
    setReportData(null);

    try {
      let data: unknown;
      switch (key) {
        case 'inventory':
          data = await reportService.getDeviceStatus();
          break;
        case 'assignment':
          data = await reportService.getAssignments();
          break;
        case 'warranty':
          data = await reportService.getWarranty();
          break;
        case 'depreciation':
          data = await reportService.getDepreciation();
          break;
        default:
          return;
      }
      setReportData(data as Record<string, unknown>);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setReportError(apiError?.message ?? 'Failed to load report');
    } finally {
      setReportLoading(null);
    }
  }, [activeReport, reportLoading]);

  // Permission denied screen
  if (!canView) {
    return (
      <View style={styles.container}>
        <GradientHeader title="Reports" subtitle="Generate & export reports" />
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={48} color={AppColors.text.light} />
          <ThemedText style={styles.permissionText}>You do not have permission to view reports</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader title="Reports" subtitle="Generate & export reports" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Export */}
        <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.quickExport} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.qeContent}>
            <ThemedText style={styles.qeTitle}>Quick Export</ThemedText>
            <ThemedText style={styles.qeDesc}>Export full inventory as CSV or PDF</ThemedText>
          </View>
          <View style={styles.qeButtons}>
            <TouchableOpacity style={styles.qeBtn}><ThemedText style={styles.qeBtnText}>CSV</ThemedText></TouchableOpacity>
            <TouchableOpacity style={styles.qeBtn}><ThemedText style={styles.qeBtnText}>PDF</ThemedText></TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Report Types */}
        <ThemedText style={styles.sectionTitle}>Report Types</ThemedText>
        <View style={styles.reportGrid}>
          {REPORT_TYPES.map((r) => {
            const isActive = activeReport === r.key;
            const isLoading = reportLoading === r.key;

            return (
              <TouchableOpacity
                key={r.key}
                style={[styles.reportCard, isActive && styles.reportCardActive]}
                activeOpacity={0.7}
                onPress={() => fetchReport(r.key)}
              >
                <View style={[styles.reportIcon, { backgroundColor: r.color + '15' }]}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={r.color} />
                  ) : (
                    <Ionicons name={r.icon} size={22} color={r.color} />
                  )}
                </View>
                <ThemedText style={styles.reportTitle}>{r.title}</ThemedText>
                <ThemedText style={styles.reportDesc} numberOfLines={2}>{r.desc}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Report Result */}
        {activeReport && !reportLoading && (
          <View style={styles.resultContainer}>
            {reportError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="cloud-offline-outline" size={32} color="#EF4444" />
                <ThemedText style={styles.errorText}>{isNetworkError(reportError) ? NETWORK_ERROR_MESSAGE : reportError}</ThemedText>
                <TouchableOpacity style={styles.retryBtn} onPress={() => fetchReport(activeReport)}>
                  <ThemedText style={styles.retryBtnText}>Thử lại</ThemedText>
                </TouchableOpacity>
              </View>
            ) : reportData ? (
              <View>
                <ThemedText style={styles.resultTitle}>
                  {REPORT_TYPES.find((r) => r.key === activeReport)?.title ?? 'Report'}
                </ThemedText>
                {renderReportData(activeReport, reportData)}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Report data renderer
// ---------------------------------------------------------------------------

function renderReportData(key: string, data: Record<string, unknown>) {
  if (key === 'inventory') {
    const report = data as { totalDevices?: number; byStatus?: Record<string, number>; byCategory?: Array<{ category: string; count: number }> };
    return (
      <View>
        <View style={styles.resultRow}>
          <ThemedText style={styles.resultLabel}>Total Devices</ThemedText>
          <ThemedText style={styles.resultValue}>{report.totalDevices ?? 0}</ThemedText>
        </View>
        {report.byStatus && Object.entries(report.byStatus).map(([status, count]) => (
          <View key={status} style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>{status.replace(/_/g, ' ')}</ThemedText>
            <ThemedText style={styles.resultValue}>{count}</ThemedText>
          </View>
        ))}
        {report.byCategory && report.byCategory.length > 0 && (
          <>
            <ThemedText style={styles.resultSubtitle}>By Category</ThemedText>
            {report.byCategory.map((item, i) => (
              <View key={i} style={styles.resultRow}>
                <ThemedText style={styles.resultLabel}>{item.category}</ThemedText>
                <ThemedText style={styles.resultValue}>{item.count}</ThemedText>
              </View>
            ))}
          </>
        )}
      </View>
    );
  }

  // Generic renderer for assignment, warranty, depreciation reports
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return (
      <ThemedText style={styles.emptyText}>No data available for this report</ThemedText>
    );
  }

  return (
    <View>
      {entries.map(([label, value]) => (
        <View key={label} style={styles.resultRow}>
          <ThemedText style={styles.resultLabel}>{label.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</ThemedText>
          <ThemedText style={styles.resultValue}>
            {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  quickExport: { borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  qeContent: { flex: 1 },
  qeTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  qeDesc: { fontSize: 12, color: '#93C5FD', marginTop: 2 },
  qeButtons: { flexDirection: 'row', gap: 8 },
  qeBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)',
  },
  qeBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text.primary, marginBottom: 14 },
  reportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  reportCard: {
    width: '47%', backgroundColor: AppColors.bg.card,
    borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  reportCardActive: {
    borderWidth: 2, borderColor: AppColors.primaryLight,
  },
  reportIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  reportTitle: { fontSize: 14, fontWeight: '600', color: AppColors.text.primary },
  reportDesc: { fontSize: 11, color: AppColors.text.secondary, marginTop: 4, lineHeight: 16 },
  // Result section
  resultContainer: {
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 16,
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  resultTitle: { fontSize: 16, fontWeight: '700', color: AppColors.text.primary, marginBottom: 12 },
  resultSubtitle: { fontSize: 14, fontWeight: '600', color: AppColors.text.primary, marginTop: 12, marginBottom: 8 },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: AppColors.bg.border,
  },
  resultLabel: { fontSize: 13, color: AppColors.text.secondary, flex: 1, textTransform: 'capitalize' },
  resultValue: { fontSize: 14, fontWeight: '600', color: AppColors.text.primary, flexShrink: 0, maxWidth: '60%', textAlign: 'right' },
  // Error / empty / permission
  centerContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20, gap: 12,
  },
  errorContainer: { alignItems: 'center', gap: 10, paddingVertical: 12 },
  errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: AppColors.primaryLight, borderRadius: 10,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  emptyText: { fontSize: 14, color: AppColors.text.light, textAlign: 'center', paddingVertical: 12 },
  permissionText: { fontSize: 16, color: AppColors.text.secondary, textAlign: 'center' },
});
