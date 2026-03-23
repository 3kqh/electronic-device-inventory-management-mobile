import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
  gradient?: readonly [string, string, ...string[]];
};

export function StatCard({ icon, label, value, color = AppColors.primaryLight, gradient }: Props) {
  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: gradient ? 'rgba(255,255,255,0.2)' : color + '15' }]}>
        <Ionicons name={icon} size={22} color={gradient ? '#fff' : color} />
      </View>
      <ThemedText style={[styles.value, gradient && { color: '#fff' }]}>{value}</ThemedText>
      <ThemedText style={[styles.label, gradient && { color: 'rgba(255,255,255,0.8)' }]}>{label}</ThemedText>
    </>
  );

  if (gradient) {
    return (
      <LinearGradient colors={[...gradient]} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {content}
      </LinearGradient>
    );
  }

  return <View style={[styles.card, styles.cardBg]}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardBg: {
    backgroundColor: AppColors.bg.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  label: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginTop: 2,
  },
});
