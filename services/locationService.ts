import type { Location } from '../types/api';
import { apiClient } from './apiClient';

export const locationService = {
  async getAll(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>('/locations');
    return response.data;
  },
};
