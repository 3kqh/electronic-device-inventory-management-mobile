import { AppColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';

type Props = ViewProps & {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
};

export function GradientHeader({ title, subtitle, rightElement, children, style }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={[...AppColors.gradient.header]} style={[styles.container, style]}>
      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
          </View>
          {rightElement}
        </View>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#93C5FD',
    marginTop: 4,
  },
});
