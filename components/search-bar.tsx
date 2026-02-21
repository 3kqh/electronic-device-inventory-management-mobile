import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, TextInput, View } from 'react-native';

type Props = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
};

export function SearchBar({ placeholder = 'Search...', value, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color={AppColors.text.light} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={AppColors.text.light}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    marginTop: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
