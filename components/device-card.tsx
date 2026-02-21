import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { StatusBadge } from './status-badge';
import { ThemedText } from './themed-text';

type Props = {
  name: string;
  assetTag: string;
  category: string;
  status: string;
  assignedTo?: string;
  onPress?: () => void;
};

export function DeviceCard({ name, assetTag, category, status, assignedTo, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconWrap}>
        <Ionicons name="laptop-outline" size={24} color={AppColors.primaryLight} />
      </View>
      <View style={styles.info}>
        <ThemedText style={styles.name} numberOfLines={1}>{name}</ThemedText>
        <ThemedText style={styles.meta}>{assetTag} · {category}</ThemedText>
        {assignedTo && (
          <View style={styles.assignRow}>
            <Ionicons name="person-outline" size={12} color={AppColors.text.light} />
            <ThemedText style={styles.assignText}>{assignedTo}</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.right}>
        <StatusBadge status={status} />
        <Ionicons name="chevron-forward" size={16} color={AppColors.text.light} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.bg.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: AppColors.primaryLight + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  meta: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginTop: 2,
  },
  assignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  assignText: {
    fontSize: 11,
    color: AppColors.text.light,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  chevron: {
    marginTop: 4,
  },
});
