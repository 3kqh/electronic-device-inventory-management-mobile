import type {
    BatchUpdateResult,
    CategoryDepreciation,
    CreateDepreciationRuleData,
    DepreciationRule,
    DeviceDepreciation,
    UpdateDepreciationRuleData,
} from '../types/api';
import { apiClient } from './apiClient';

export const depreciationService = {
  // ============================================================
  // Depreciation Rule CRUD
  // ============================================================

  async getAll(): Promise<DepreciationRule[]> {
    const response = await apiClient.get<DepreciationRule[]>('/depreciation');
    return response.data;
  },

  async getRuleById(id: string): Promise<DepreciationRule> {
    const response = await apiClient.get<DepreciationRule>(`/depreciation/${id}`);
    return response.data;
  },

  async getRuleByCategory(categoryId: string): Promise<DepreciationRule> {
    const response = await apiClient.get<DepreciationRule>(`/depreciation/category/${categoryId}`);
    return response.data;
  },

  async create(data: CreateDepreciationRuleData): Promise<DepreciationRule> {
    const response = await apiClient.post<DepreciationRule>('/depreciation', data);
    return response.data;
  },

  async update(id: string, data: UpdateDepreciationRuleData): Promise<DepreciationRule> {
    const response = await apiClient.put<DepreciationRule>(`/depreciation/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete('/depreciation/' + id);
  },

  // ============================================================
  // Depreciation Calculations
  // ============================================================

  async calculateDeviceDepreciation(deviceId: string): Promise<DeviceDepreciation> {
    const response = await apiClient.get<DeviceDepreciation>(`/depreciation/device/${deviceId}`);
    return response.data;
  },

  async getCategoryDepreciation(categoryId: string): Promise<CategoryDepreciation> {
    const response = await apiClient.get<CategoryDepreciation>(`/depreciation/category/${categoryId}/devices`);
    return response.data;
  },

  async batchUpdateValues(): Promise<BatchUpdateResult> {
    const response = await apiClient.post<BatchUpdateResult>('/depreciation/batch-update');
    return response.data;
  },
};
