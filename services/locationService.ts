import type { CreateLocationData, Location, LocationFull, UpdateLocationData } from '../types/api';
import { apiClient } from './apiClient';

export const locationService = {
  async getAll(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>('/locations');
    return response.data;
  },

  async getById(id: string): Promise<LocationFull> {
    const response = await apiClient.get<LocationFull>(`/locations/${id}`);
    return response.data;
  },

  async create(data: CreateLocationData): Promise<LocationFull> {
    const response = await apiClient.post<LocationFull>('/locations', data);
    return response.data;
  },

  async update(id: string, data: UpdateLocationData): Promise<LocationFull> {
    const response = await apiClient.put<LocationFull>(`/locations/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/locations/${id}`);
  },
};
