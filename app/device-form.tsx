import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';
import type { ApiError } from '@/services/apiClient';
import { categoryService } from '@/services/categoryService';
import { deviceService } from '@/services/deviceService';
import { locationService } from '@/services/locationService';
import type { Location as ApiLocation, DeviceCategory } from '@/types/api';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/utils/networkError';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface FormData {
  name: string;
  serialNumber: string;
  assetTag: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  purchasePrice: string;
  categoryId: string;
  locationId: string;
  notes: string;
}

interface FieldErrors {
  [key: string]: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  serialNumber: '',
  assetTag: '',
  manufacturer: '',
  model: '',
  purchaseDate: '',
  purchasePrice: '',
  categoryId: '',
  locationId: '',
  notes: '',
};

function FormField({
  label,
  placeholder,
  multiline,
  value,
  onChangeText,
  error,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  multiline?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline, error ? styles.inputError : null]}
        placeholder={placeholder}
        placeholderTextColor={AppColors.text.light}
        multiline={multiline}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        accessibilityLabel={label}
      />
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
    </View>
  );
}

export default function DeviceFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const navigation = useNavigation();
  const isEditMode = !!id;

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Update header title based on mode
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Device' : 'Add Device',
    });
  }, [navigation, isEditMode]);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear field error when user types
    setFieldErrors(prev => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  // Fetch categories, locations, and device data (if edit mode)
  const fetchInitialData = useCallback(async () => {
    setLoadingData(true);
    setLoadError(null);
    try {
      const promises: Promise<unknown>[] = [
        categoryService.getAll(),
        locationService.getAll(),
      ];
      if (isEditMode && id) {
        promises.push(deviceService.getById(id));
      }

      const results = await Promise.all(promises);
      setCategories(results[0] as DeviceCategory[]);
      setLocations(results[1] as ApiLocation[]);

      if (isEditMode && results[2]) {
        const device = results[2] as import('@/types/api').Device;
        setForm({
          name: device.name || '',
          serialNumber: device.serialNumber || '',
          assetTag: device.assetTag || '',
          manufacturer: device.manufacturer || '',
          model: device.model || '',
          purchaseDate: device.purchaseDate ? device.purchaseDate.split('T')[0] : '',
          purchasePrice: device.purchasePrice != null ? String(device.purchasePrice) : '',
          categoryId: typeof device.categoryId === 'string' ? device.categoryId : device.categoryId?._id || '',
          locationId: typeof device.locationId === 'string' ? device.locationId : device.locationId?._id || '',
          notes: '',
        });
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setLoadError(apiErr?.message ?? 'Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Parse validation errors from API response
  const parseValidationErrors = (err: unknown): FieldErrors => {
    const apiErr = err as ApiError;
    const errors: FieldErrors = {};

    if (apiErr.errors && Array.isArray(apiErr.errors)) {
      // Map error messages to fields by keyword matching
      for (const errorMsg of apiErr.errors) {
        const lower = errorMsg.toLowerCase();
        if (lower.includes('name')) errors.name = errorMsg;
        else if (lower.includes('serial')) errors.serialNumber = errorMsg;
        else if (lower.includes('asset')) errors.assetTag = errorMsg;
        else if (lower.includes('manufacturer') || lower.includes('brand')) errors.manufacturer = errorMsg;
        else if (lower.includes('model')) errors.model = errorMsg;
        else if (lower.includes('purchase date') || lower.includes('date')) errors.purchaseDate = errorMsg;
        else if (lower.includes('price') || lower.includes('purchase')) errors.purchasePrice = errorMsg;
        else if (lower.includes('category')) errors.categoryId = errorMsg;
        else if (lower.includes('location')) errors.locationId = errorMsg;
        else {
          // Put unmatched errors under a general key
          errors._general = errors._general ? `${errors._general}\n${errorMsg}` : errorMsg;
        }
      }
    } else if (apiErr.message) {
      errors._general = apiErr.message;
    }

    return errors;
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    setSubmitting(true);

    try {
      const deviceData = {
        name: form.name.trim(),
        serialNumber: form.serialNumber.trim(),
        assetTag: form.assetTag.trim(),
        manufacturer: form.manufacturer.trim(),
        model: form.model.trim(),
        purchaseDate: form.purchaseDate.trim(),
        purchasePrice: parseFloat(form.purchasePrice) || 0,
        categoryId: form.categoryId,
        locationId: form.locationId,
      };

      if (isEditMode && id) {
        await deviceService.update(id, deviceData);
      } else {
        await deviceService.create(deviceData);
      }

      router.back();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.status === 400 && (apiErr.errors || apiErr.message)) {
        const parsed = parseValidationErrors(err);
        setFieldErrors(parsed);
        if (parsed._general) {
          Alert.alert('Validation Error', parsed._general);
        }
      } else {
        Alert.alert('Error', apiErr?.message ?? 'Failed to save device');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loadingData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primaryLight} />
      </View>
    );
  }

  // Error state
  if (loadError) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={AppColors.text.light} />
        <ThemedText style={styles.loadErrorText}>{isNetworkError(loadError) ? NETWORK_ERROR_MESSAGE : loadError}</ThemedText>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchInitialData}>
          <ThemedText style={styles.retryBtnText}>Thử lại</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedLocation = locations.find(l => l._id === form.locationId);
  const locationLabel = selectedLocation
    ? `${selectedLocation.name} — ${selectedLocation.building}, Floor ${selectedLocation.floor}`
    : undefined;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Category Selector */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Category</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {categories.map(c => (
            <TouchableOpacity
              key={c._id}
              style={[styles.catChip, form.categoryId === c._id && styles.catActive]}
              onPress={() => updateField('categoryId', c._id)}
            >
              <ThemedText style={[styles.catText, form.categoryId === c._id && styles.catTextActive]}>
                {c.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {fieldErrors.categoryId ? <ThemedText style={styles.errorText}>{fieldErrors.categoryId}</ThemedText> : null}
      </View>

      <FormField label="Device Name" placeholder="e.g. MacBook Pro 16-inch" value={form.name} onChangeText={v => updateField('name', v)} error={fieldErrors.name} />
      <FormField label="Serial Number" placeholder="Enter serial number" value={form.serialNumber} onChangeText={v => updateField('serialNumber', v)} error={fieldErrors.serialNumber} />
      <FormField label="Asset Tag" placeholder="Auto-generated or custom" value={form.assetTag} onChangeText={v => updateField('assetTag', v)} error={fieldErrors.assetTag} />

      {/* Scan Barcode */}
      <TouchableOpacity style={styles.scanBtn}>
        <Ionicons name="scan-outline" size={20} color={AppColors.primaryLight} />
        <ThemedText style={styles.scanText}>Scan Barcode / QR Code</ThemedText>
      </TouchableOpacity>

      <FormField label="Brand / Manufacturer" placeholder="e.g. Apple" value={form.manufacturer} onChangeText={v => updateField('manufacturer', v)} error={fieldErrors.manufacturer} />
      <FormField label="Model" placeholder="e.g. A2991" value={form.model} onChangeText={v => updateField('model', v)} error={fieldErrors.model} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormField label="Purchase Date" placeholder="YYYY-MM-DD" value={form.purchaseDate} onChangeText={v => updateField('purchaseDate', v)} error={fieldErrors.purchaseDate} />
        </View>
        <View style={styles.halfField}>
          <FormField label="Purchase Price" placeholder="0.00" value={form.purchasePrice} onChangeText={v => updateField('purchasePrice', v)} error={fieldErrors.purchasePrice} keyboardType="numeric" />
        </View>
      </View>

      {/* Location Selector */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Location</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {locations.map(loc => (
            <TouchableOpacity
              key={loc._id}
              style={[styles.catChip, form.locationId === loc._id && styles.catActive]}
              onPress={() => updateField('locationId', loc._id)}
            >
              <ThemedText style={[styles.catText, form.locationId === loc._id && styles.catTextActive]}>
                {loc.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {locationLabel ? (
          <ThemedText style={styles.locationDetail}>{locationLabel}</ThemedText>
        ) : null}
        {fieldErrors.locationId ? <ThemedText style={styles.errorText}>{fieldErrors.locationId}</ThemedText> : null}
      </View>

      <FormField label="Notes" placeholder="Additional notes..." multiline value={form.notes} onChangeText={v => updateField('notes', v)} />

      {/* General error */}
      {fieldErrors._general ? (
        <View style={styles.generalError}>
          <Ionicons name="alert-circle-outline" size={16} color={AppColors.status.retired} />
          <ThemedText style={styles.generalErrorText}>{fieldErrors._general}</ThemedText>
        </View>
      ) : null}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitDisabled]}
        onPress={handleSubmit}
        activeOpacity={0.8}
        disabled={submitting}
        accessibilityRole="button"
      >
        <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark" size={20} color="#fff" />
          )}
          <ThemedText style={styles.submitText}>
            {submitting ? 'Saving...' : isEditMode ? 'Update Device' : 'Save Device'}
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg.primary },
  content: { padding: 20, paddingBottom: 40 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.bg.primary,
    padding: 20,
  },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary, marginBottom: 6 },
  input: {
    backgroundColor: AppColors.bg.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: AppColors.text.primary,
    borderWidth: 1,
    borderColor: AppColors.bg.border,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: AppColors.status.retired },
  placeholderText: { fontSize: 15, color: AppColors.text.light },
  errorText: { fontSize: 12, color: AppColors.status.retired, marginTop: 4 },
  loadErrorText: { fontSize: 15, color: AppColors.text.secondary, marginTop: 12, textAlign: 'center' },
  catScroll: { gap: 8 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: AppColors.bg.card,
    borderWidth: 1,
    borderColor: AppColors.bg.border,
  },
  catActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  catText: { fontSize: 13, fontWeight: '600', color: AppColors.text.secondary },
  catTextActive: { color: '#fff' },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: AppColors.primaryLight,
    borderStyle: 'dashed',
    marginBottom: 18,
  },
  scanText: { fontSize: 14, fontWeight: '600', color: AppColors.primaryLight },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  locationDetail: { fontSize: 12, color: AppColors.text.light, marginTop: 6 },
  generalError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  generalErrorText: { fontSize: 13, color: AppColors.status.retired, flex: 1 },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: AppColors.primary,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  submitDisabled: { opacity: 0.7 },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
