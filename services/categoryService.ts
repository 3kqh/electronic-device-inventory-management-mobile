import type { CreateCategoryData, DeviceCategory, DeviceCategoryFull, UpdateCategoryData } from '../types/api';
import { apiClient } from './apiClient';

export const categoryService = {
  async getAll(): Promise<DeviceCategory[]> {
    const response = await apiClient.get<DeviceCategory[]>('/categories');
    return response.data;
  },

  async getById(id: string): Promise<DeviceCategoryFull> {
    const response = await apiClient.get<DeviceCategoryFull>(`/categories/${id}`);
    return response.data;
  },

  async create(data: CreateCategoryData): Promise<DeviceCategoryFull> {
    const response = await apiClient.post<DeviceCategoryFull>('/categories', data);
    return response.data;
  },

  async update(id: string, data: UpdateCategoryData): Promise<DeviceCategoryFull> {
    const response = await apiClient.put<DeviceCategoryFull>(`/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
