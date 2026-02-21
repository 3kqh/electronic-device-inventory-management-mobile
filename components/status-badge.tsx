import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: '#DCFCE7', text: '#166534', label: 'Active' },
  available: { bg: '#DBEAFE', text: '#1E40AF', label: 'Available' },
  assigned: { bg: '#EDE9FE', text: '#5B21B6', label: 'Assigned' },
  in_maintenance: { bg: '#FEF3C7', text: '#92400E', label: 'In Maintenance' },
  retired: { bg: '#FEE2E2', text: '#991B1B', label: 'Retired' },
  disposed: { bg: '#F3F4F6', text: '#374151', label: 'Disposed' },
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
  completed: { bg: '#DCFCE7', text: '#166534', label: 'Completed' },
  expired: { bg: '#FEE2E2', text: '#991B1B', label: 'Expired' },
};

type Props = {
  status: string;
  size?: 'sm' | 'md';
};

export function StatusBadge({ status, size = 'sm' }: Props) {
  const config = STATUS_MAP[status] ?? { bg: '#F3F4F6', text: '#374151', label: status };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === 'md' && styles.badgeMd]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <ThemedText style={[styles.text, { color: config.text }, size === 'md' && styles.textMd]}>
        {config.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  badgeMd: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  textMd: {
    fontSize: 13,
  },
});
