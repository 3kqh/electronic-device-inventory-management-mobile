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
  { key: 'inventory', icon: 'cube-outline', title: 'Inventory Report', desc: 'Overview of all devices by status & category', color: '#4285F4' },
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
          data = await reportService.getInventoryValue();
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
        <LinearGradient colors={['#2D1B69', '#4285F4']} style={styles.quickExport} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
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

/** Safely render a value as a string for display. */
function displayValue(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return `${value.length} items`;
  if (typeof value === 'object') {
    // Try to extract a meaningful label from common shapes
    const obj = value as Record<string, unknown>;
    if (obj.name) return String(obj.name);
    if (obj.count != null) return String(obj.count);
    return `${Object.keys(obj).length} fields`;
  }
  return String(value);
}

function renderReportData(key: string, data: Record<string, unknown>) {
  // ── Inventory / Device Status Report ──
  if (key === 'inventory') {
    const summary = (data.summary ?? {}) as Record<string, unknown>;
    const byStatus = data.byStatus as Record<string, unknown[]> | undefined;
    const byCategory = data.byCategory as Record<string, { count: number; devices?: unknown[] }> | undefined;
    const byLocation = data.byLocation as Record<string, { count: number }> | undefined;

    return (
      <View>
        {/* Summary counts */}
        <View style={styles.resultRow}>
          <ThemedText style={styles.resultLabel}>Total Devices</ThemedText>
          <ThemedText style={styles.resultValue}>{displayValue(summary.totalDevices)}</ThemedText>
        </View>
        {summary.available != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Available</ThemedText>
            <ThemedText style={styles.resultValue}>{displayValue(summary.available)}</ThemedText>
          </View>
        )}
        {summary.assigned != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Assigned</ThemedText>
            <ThemedText style={styles.resultValue}>{displayValue(summary.assigned)}</ThemedText>
          </View>
        )}
        {summary.inMaintenance != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>In Maintenance</ThemedText>
            <ThemedText style={styles.resultValue}>{displayValue(summary.inMaintenance)}</ThemedText>
          </View>
        )}
        {summary.retired != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Retired</ThemedText>
            <ThemedText style={styles.resultValue}>{displayValue(summary.retired)}</ThemedText>
          </View>
        )}

        {/* By Category — backend sends { count, devices[] } per category name */}
        {byCategory && (
          <>
            <ThemedText style={styles.resultSubtitle}>By Category</ThemedText>
            {Object.entries(byCategory).map(([name, info]) => (
              <View key={name} style={styles.resultRow}>
                <ThemedText style={styles.resultLabel}>{name}</ThemedText>
                <ThemedText style={styles.resultValue}>
                  {typeof info === 'object' && info !== null && 'count' in info
                    ? String(info.count)
                    : displayValue(info)}
                </ThemedText>
              </View>
            ))}
          </>
        )}

        {/* By Location */}
        {byLocation && (
          <>
            <ThemedText style={styles.resultSubtitle}>By Location</ThemedText>
            {Object.entries(byLocation).map(([name, info]) => (
              <View key={name} style={styles.resultRow}>
                <ThemedText style={styles.resultLabel}>{name}</ThemedText>
                <ThemedText style={styles.resultValue}>
                  {typeof info === 'object' && info !== null && 'count' in info
                    ? String(info.count)
                    : displayValue(info)}
                </ThemedText>
              </View>
            ))}
          </>
        )}
      </View>
    );
  }

  // ── Assignment Report ──
  if (key === 'assignment') {
    const total = data.total as number | undefined;
    const byStatus = data.byStatus as Record<string, number> | undefined;
    const assignments = data.assignments as Array<Record<string, unknown>> | undefined;

    return (
      <View>
        <View style={styles.resultRow}>
          <ThemedText style={styles.resultLabel}>Total Assignments</ThemedText>
          <ThemedText style={styles.resultValue}>{displayValue(total)}</ThemedText>
        </View>
        {byStatus && Object.entries(byStatus).map(([status, count]) => (
          <View key={status} style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>{status.replace(/_/g, ' ')}</ThemedText>
            <ThemedText style={styles.resultValue}>{displayValue(count)}</ThemedText>
          </View>
        ))}
        {assignments && assignments.length > 0 && (
          <>
            <ThemedText style={styles.resultSubtitle}>Recent Assignments</ThemedText>
            {assignments.slice(0, 10).map((a, i) => (
              <View key={i} style={styles.resultRow}>
                <ThemedText style={styles.resultLabel} numberOfLines={1}>
                  {String(a.deviceName ?? 'Unknown')}
                </ThemedText>
                <ThemedText style={styles.resultValue}>{String(a.status ?? '—')}</ThemedText>
              </View>
            ))}
          </>
        )}
      </View>
    );
  }

  // ── Warranty Report ──
  if (key === 'warranty') {
    const summary = (data.summary ?? {}) as Record<string, unknown>;
    const warranties = data.warranties as Array<Record<string, unknown>> | undefined;

    return (
      <View>
        {summary.total != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Total Warranties</ThemedText>
            <ThemedText style={styles.resultValue}>{displayValue(summary.total)}</ThemedText>
          </View>
        )}
        {summary.active != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Active</ThemedText>
            <ThemedText style={styles.resultValue}>{displayValue(summary.active)}</ThemedText>
          </View>
        )}
        {summary.expired != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Expired</ThemedText>
            <ThemedText style={styles.resultValue}>{displayValue(summary.expired)}</ThemedText>
          </View>
        )}
        {summary.cancelled != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Cancelled</ThemedText>
            <ThemedText style={styles.resultValue}>{displayValue(summary.cancelled)}</ThemedText>
          </View>
        )}
        {summary.totalCost != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Total Cost</ThemedText>
            <ThemedText style={styles.resultValue}>${Number(summary.totalCost).toLocaleString()}</ThemedText>
          </View>
        )}
        {summary.expiringWithin30Days != null && Number(summary.expiringWithin30Days) > 0 && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Expiring within 30 days</ThemedText>
            <ThemedText style={styles.resultValue}>{displayValue(summary.expiringWithin30Days)}</ThemedText>
          </View>
        )}
        {summary.expiringWithin7Days != null && Number(summary.expiringWithin7Days) > 0 && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Expiring within 7 days</ThemedText>
            <ThemedText style={styles.resultValue}>{displayValue(summary.expiringWithin7Days)}</ThemedText>
          </View>
        )}
        {warranties && warranties.length > 0 && (
          <>
            <ThemedText style={styles.resultSubtitle}>Warranties</ThemedText>
            {warranties.slice(0, 10).map((w, i) => (
              <View key={i} style={styles.resultRow}>
                <ThemedText style={styles.resultLabel} numberOfLines={1}>
                  {String(w.device ?? 'Unknown')} · {String(w.provider ?? '')}
                </ThemedText>
                <ThemedText style={styles.resultValue}>{String(w.status ?? '—')}</ThemedText>
              </View>
            ))}
          </>
        )}
      </View>
    );
  }

  // ── Depreciation / Inventory Value Report ──
  if (key === 'depreciation') {
    const summary = (data.summary ?? {}) as Record<string, unknown>;
    const byCategory = data.byCategory as Record<string, { count: number; purchaseValue: number; currentValue: number; depreciation: number }> | undefined;

    return (
      <View>
        {summary.totalDevices != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Total Devices</ThemedText>
            <ThemedText style={styles.resultValue}>{displayValue(summary.totalDevices)}</ThemedText>
          </View>
        )}
        {summary.totalPurchaseValue != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Total Purchase Value</ThemedText>
            <ThemedText style={styles.resultValue}>${Number(summary.totalPurchaseValue).toLocaleString()}</ThemedText>
          </View>
        )}
        {summary.totalCurrentValue != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Total Current Value</ThemedText>
            <ThemedText style={styles.resultValue}>${Number(summary.totalCurrentValue).toLocaleString()}</ThemedText>
          </View>
        )}
        {summary.totalDepreciation != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Total Depreciation</ThemedText>
            <ThemedText style={styles.resultValue}>${Number(summary.totalDepreciation).toLocaleString()}</ThemedText>
          </View>
        )}
        {summary.averageDepreciation != null && (
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Average Depreciation</ThemedText>
            <ThemedText style={styles.resultValue}>{String(summary.averageDepreciation)}%</ThemedText>
          </View>
        )}
        {byCategory && Object.keys(byCategory).length > 0 && (
          <>
            <ThemedText style={styles.resultSubtitle}>By Category</ThemedText>
            {Object.entries(byCategory).map(([name, info]) => (
              <View key={name} style={styles.resultRow}>
                <ThemedText style={styles.resultLabel}>{name} ({info.count})</ThemedText>
                <ThemedText style={styles.resultValue}>${Number(info.depreciation).toLocaleString()}</ThemedText>
              </View>
            ))}
          </>
        )}
      </View>
    );
  }

  // ── Fallback: render only scalar values ──
  const scalarEntries = Object.entries(data).filter(
    ([, v]) => v == null || typeof v !== 'object',
  );
  if (scalarEntries.length === 0) {
    return <ThemedText style={styles.emptyText}>No data available for this report</ThemedText>;
  }
  return (
    <View>
      {scalarEntries.map(([label, value]) => (
        <View key={label} style={styles.resultRow}>
          <ThemedText style={styles.resultLabel}>
            {label.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
          </ThemedText>
          <ThemedText style={styles.resultValue}>{displayValue(value)}</ThemedText>
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
  qeDesc: { fontSize: 12, color: '#C4A8E0', marginTop: 2 },
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
