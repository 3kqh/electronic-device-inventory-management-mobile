import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/hooks/useApiData';
import { systemService, SystemSettings } from '@/services/systemService';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/utils/networkError';
import { canAccessAdmin } from '@/utils/permissions';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View
} from 'react-native';

// ---------------------------------------------------------------------------
// Section / item definitions – values are now resolved from API settings data
// ---------------------------------------------------------------------------

interface SettingItem {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  /** Key used to read / write the value in SystemSettings */
  settingKey?: string;
  /** Static display value (used when there is no settingKey) */
  staticValue?: string;
  /** Whether this item renders a toggle switch */
  toggle?: boolean;
  /** Whether this item navigates to a sub-screen */
  nav?: boolean;
}

interface Section {
  title: string;
  items: SettingItem[];
}

const SECTIONS: Section[] = [
  {
    title: 'General',
    items: [
      { icon: 'business-outline', label: 'Organization Name', settingKey: 'organizationName' },
      { icon: 'globe-outline', label: 'Language', settingKey: 'language' },
      { icon: 'time-outline', label: 'Timezone', settingKey: 'timezone' },
      { icon: 'cash-outline', label: 'Currency', settingKey: 'currency' },
    ],
  },
  {
    title: 'Device Settings',
    items: [
      { icon: 'pricetag-outline', label: 'Asset Tag Prefix', settingKey: 'assetTagPrefix' },
      { icon: 'barcode-outline', label: 'Auto-generate Tags', settingKey: 'autoGenerateTags', toggle: true },
      { icon: 'layers-outline', label: 'Device Categories', settingKey: 'deviceCategories', nav: true },
      { icon: 'location-outline', label: 'Locations', settingKey: 'locations', nav: true },
    ],
  },
  {
    title: 'Depreciation',
    items: [
      { icon: 'trending-down-outline', label: 'Default Method', settingKey: 'depreciationMethod' },
      { icon: 'calendar-outline', label: 'Calculation Frequency', settingKey: 'calculationFrequency' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { icon: 'mail-outline', label: 'Email Notifications', settingKey: 'emailNotifications', toggle: true },
      { icon: 'notifications-outline', label: 'In-App Alerts', settingKey: 'inAppAlerts', toggle: true },
      { icon: 'shield-outline', label: 'Warranty Alerts', settingKey: 'warrantyAlertDays' },
    ],
  },
  {
    title: 'Security',
    items: [
      { icon: 'lock-closed-outline', label: 'Max Login Attempts', settingKey: 'maxLoginAttempts' },
      { icon: 'timer-outline', label: 'Session Timeout', settingKey: 'sessionTimeout' },
      { icon: 'key-outline', label: 'Password Policy', settingKey: 'passwordPolicy', nav: true },
      { icon: 'document-text-outline', label: 'Audit Log Retention', settingKey: 'auditLogRetention' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveDisplayValue(settings: SystemSettings | null, key?: string): string {
  if (!key || !settings) return '—';
  const val = settings[key];
  if (val === undefined || val === null) return '—';
  return String(val);
}

function resolveToggleValue(settings: SystemSettings | null, key?: string): boolean {
  if (!key || !settings) return false;
  return Boolean(settings[key]);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SystemSettingsScreen() {
  const { user } = useAuth();
  const isAdmin = user ? canAccessAdmin(user.role) : false;

  const { data: settings, loading, error, refetch } = useApiData<SystemSettings>(
    useCallback(() => systemService.getSettings(), []),
  );

  const [updatingKeys, setUpdatingKeys] = useState<Set<string>>(new Set());

  // -----------------------------------------------------------------------
  // Update a single setting
  // -----------------------------------------------------------------------
  const handleUpdateSetting = useCallback(
    async (key: string, value: unknown) => {
      if (!isAdmin) return;

      setUpdatingKeys((prev) => new Set(prev).add(key));
      try {
        await systemService.updateSetting(key, value);
        Alert.alert('Thành công', 'Cài đặt đã được cập nhật.');
        refetch();
      } catch {
        Alert.alert('Lỗi', 'Không thể cập nhật cài đặt. Vui lòng thử lại.');
      } finally {
        setUpdatingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [isAdmin, refetch],
  );

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={AppColors.primaryLight} />
        <ThemedText style={styles.loadingText}>Đang tải cài đặt…</ThemedText>
      </View>
    );
  }

  // -----------------------------------------------------------------------
  // Error state
  // -----------------------------------------------------------------------
  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name={isNetworkError(error) ? 'cloud-offline-outline' : 'alert-circle-outline'} size={48} color="#EF4444" />
        <ThemedText style={styles.errorText}>{isNetworkError(error) ? NETWORK_ERROR_MESSAGE : error}</ThemedText>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <ThemedText style={styles.retryText}>Thử lại</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {SECTIONS.map((section, si) => (
        <View key={si} style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
          <View style={styles.sectionCard}>
            {section.items.map((item, ii) => {
              const isUpdating = item.settingKey ? updatingKeys.has(item.settingKey) : false;

              return (
                <TouchableOpacity
                  key={ii}
                  style={[styles.row, ii < section.items.length - 1 && styles.rowBorder]}
                  disabled={!item.nav || !isAdmin}
                  activeOpacity={isAdmin && item.nav ? 0.6 : 1}
                >
                  <View style={styles.rowIcon}>
                    <Ionicons name={item.icon} size={18} color={AppColors.primaryLight} />
                  </View>
                  <ThemedText style={styles.rowLabel}>{item.label}</ThemedText>
                  <View style={styles.rowRight}>
                    {isUpdating ? (
                      <ActivityIndicator size="small" color={AppColors.primaryLight} />
                    ) : item.toggle ? (
                      <Switch
                        value={resolveToggleValue(settings, item.settingKey)}
                        onValueChange={(val) => {
                          if (item.settingKey) handleUpdateSetting(item.settingKey, val);
                        }}
                        disabled={!isAdmin}
                        trackColor={{ true: AppColors.primaryLight, false: AppColors.bg.border }}
                        thumbColor="#fff"
                      />
                    ) : (
                      <>
                        <ThemedText style={styles.rowValue}>
                          {item.staticValue ?? resolveDisplayValue(settings, item.settingKey)}
                        </ThemedText>
                        {item.nav && <Ionicons name="chevron-forward" size={16} color={AppColors.text.light} />}
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {/* Danger Zone – only visible for admins */}
      {isAdmin && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Danger Zone</ThemedText>
          <View style={styles.dangerCard}>
            <TouchableOpacity style={styles.dangerBtn}>
              <Ionicons name="refresh-outline" size={18} color="#EF4444" />
              <ThemedText style={styles.dangerText}>Reset System Settings</ThemedText>
            </TouchableOpacity>
            <View style={styles.dangerDivider} />
            <TouchableOpacity style={styles.dangerBtn}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <ThemedText style={styles.dangerText}>Clear All Data</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  content: { padding: 16, paddingBottom: 40 },
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: AppColors.text.secondary },
  errorText: { marginTop: 12, fontSize: 14, color: '#EF4444', textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: AppColors.primaryLight,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: AppColors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: AppColors.bg.card, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: AppColors.bg.border },
  rowIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: AppColors.primaryLight + '10',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  rowLabel: { flex: 1, fontSize: 14, color: AppColors.text.primary },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 13, color: AppColors.text.light },
  dangerCard: {
    backgroundColor: '#FEF2F2', borderRadius: 14,
    borderWidth: 1, borderColor: '#FECACA',
    overflow: 'hidden',
  },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  dangerText: { fontSize: 14, color: '#EF4444', fontWeight: '500' },
  dangerDivider: { height: 1, backgroundColor: '#FECACA' },
});
