import type { DeviceCategory } from '../types/api';
import { apiClient } from './apiClient';

export const categoryService = {
  async getAll(): Promise<DeviceCategory[]> {
    const response = await apiClient.get<DeviceCategory[]>('/categories');
    return response.data;
  },
};
