import { AppColors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E3A8A', '#2563EB']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="cube-outline" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>DeviceTrack</Text>
            <Text style={styles.appDesc}>Electronic Device Inventory Management</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={AppColors.text.light} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={AppColors.text.light}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  accessibilityLabel="Email input"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={AppColors.text.light} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={AppColors.text.light}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  accessibilityLabel="Password input"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} accessibilityLabel="Toggle password visibility">
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={AppColors.text.light} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity accessibilityRole="link">
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8} accessibilityRole="button">
              <LinearGradient colors={['#2563EB', '#3B82F6']} style={styles.loginGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.loginText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>v1.0.0</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 48 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  appName: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  appDesc: { fontSize: 14, color: '#93C5FD', marginTop: 4, textAlign: 'center' },
  form: { gap: 18 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#93C5FD' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, color: '#FFFFFF' },
  forgotText: { fontSize: 13, color: '#93C5FD', textAlign: 'right' },
  loginBtn: { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  loginGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 8,
  },
  loginText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  version: { fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 40 },
});
