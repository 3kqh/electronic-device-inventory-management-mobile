import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import type { ChangePasswordData, UpdateProfileData } from '@/types/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet
} from 'react-native';

export default function ProfileScreen() {
  const { user, checkAuth } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [profileData, setProfileData] = useState<UpdateProfileData>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordData & { confirmNewPassword: string }>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleUpdateProfile = async () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSubmitting(true);
    try {
      await authService.updateProfile(profileData);
      Alert.alert('Thành công', 'Đã cập nhật hồ sơ');
      setEditMode(false);
      checkAuth();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Không thể cập nhật hồ sơ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
      return;
    }
    setSubmitting(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      Alert.alert('Thành công', 'Đã đổi mật khẩu');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      Alert.alert('Lỗi', apiError?.message ?? 'Mật khẩu hiện tại không chính xác');
    } finally {
      setSubmitting(false);
    }
  };

  const renderInfoRow = (icon: string, label: string, value: string) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={20} color={AppColors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.addBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={AppColors.primary} />
          </View>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          {renderInfoRow('person-outline', 'Họ tên', `${user?.firstName ?? ''} ${user?.lastName ?? ''}`)}
          {renderInfoRow('mail-outline', 'Email', user?.email ?? '')}
          {renderInfoRow('shield-outline', 'Vai trò', user?.role ?? '')}
        </View>

        {/* Edit Profile */}
        <TouchableOpacity style={styles.actionCard} onPress={() => { setEditMode(!editMode); setShowPasswordForm(false); }}>
          <Ionicons name="create-outline" size={22} color={AppColors.primary} />
          <Text style={styles.actionText}>Chỉnh sửa hồ sơ</Text>
          <Ionicons name={editMode ? 'chevron-up' : 'chevron-down'} size={20} color={AppColors.text.light} />
        </TouchableOpacity>

        {editMode && (
          <View style={styles.formSection}>
            <Text style={styles.label}>Họ *</Text>
            <TextInput style={styles.input} value={profileData.firstName} onChangeText={(v) => setProfileData({ ...profileData, firstName: v })} placeholder="Nhập họ" placeholderTextColor={AppColors.text.light} />

            <Text style={styles.label}>Tên *</Text>
            <TextInput style={styles.input} value={profileData.lastName} onChangeText={(v) => setProfileData({ ...profileData, lastName: v })} placeholder="Nhập tên" placeholderTextColor={AppColors.text.light} />

            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} value={profileData.email} onChangeText={(v) => setProfileData({ ...profileData, email: v })} placeholder="Nhập email" placeholderTextColor={AppColors.text.light} keyboardType="email-address" autoCapitalize="none" />

            <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleUpdateProfile} disabled={submitting} activeOpacity={0.8}>
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitText}>Cập Nhật Hồ Sơ</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Change Password */}
        <TouchableOpacity style={styles.actionCard} onPress={() => { setShowPasswordForm(!showPasswordForm); setEditMode(false); }}>
          <Ionicons name="lock-closed-outline" size={22} color={AppColors.primary} />
          <Text style={styles.actionText}>Đổi mật khẩu</Text>
          <Ionicons name={showPasswordForm ? 'chevron-up' : 'chevron-down'} size={20} color={AppColors.text.light} />
        </TouchableOpacity>

        {showPasswordForm && (
          <View style={styles.formSection}>
            <Text style={styles.label}>Mật khẩu hiện tại *</Text>
            <TextInput style={styles.input} value={passwordData.currentPassword} onChangeText={(v) => setPasswordData({ ...passwordData, currentPassword: v })} placeholder="Nhập mật khẩu hiện tại" placeholderTextColor={AppColors.text.light} secureTextEntry />

            <Text style={styles.label}>Mật khẩu mới *</Text>
            <TextInput style={styles.input} value={passwordData.newPassword} onChangeText={(v) => setPasswordData({ ...passwordData, newPassword: v })} placeholder="Nhập mật khẩu mới" placeholderTextColor={AppColors.text.light} secureTextEntry />

            <Text style={styles.label}>Xác nhận mật khẩu mới *</Text>
            <TextInput style={styles.input} value={passwordData.confirmNewPassword} onChangeText={(v) => setPasswordData({ ...passwordData, confirmNewPassword: v })} placeholder="Nhập lại mật khẩu mới" placeholderTextColor={AppColors.text.light} secureTextEntry />

            <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleChangePassword} disabled={submitting} activeOpacity={0.8}>
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitText}>Đổi Mật Khẩu</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  addBtn: { width: 32 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: AppColors.primaryLight + '15',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  userName: { fontSize: 20, fontWeight: '700', color: AppColors.text.primary },
  userEmail: { fontSize: 14, color: AppColors.text.secondary, marginTop: 4 },
  section: {
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: AppColors.bg.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: AppColors.text.primary, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: AppColors.bg.border },
  infoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: AppColors.primaryLight + '12', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: AppColors.text.light },
  infoValue: { fontSize: 15, fontWeight: '500', color: AppColors.text.primary, marginTop: 2 },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: AppColors.bg.card,
    borderRadius: 14, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: AppColors.bg.border, gap: 12,
  },
  actionText: { flex: 1, fontSize: 15, fontWeight: '600', color: AppColors.text.primary },
  formSection: {
    backgroundColor: AppColors.bg.card, borderRadius: 14, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: AppColors.bg.border,
  },
  label: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: AppColors.bg.input, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: AppColors.text.primary, borderWidth: 1, borderColor: AppColors.bg.border,
  },
  submitBtn: {
    backgroundColor: AppColors.primary, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
