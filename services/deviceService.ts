import type {
    CreateDeviceData,
    Device,
    DeviceStatus,
    PaginatedResponse,
    UpdateDeviceData,
} from '../types/api';
import { apiClient } from './apiClient';

export const deviceService = {
  async getAll(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Device>> {
    const queryParams: Record<string, string> = {};
    if (params?.page !== undefined) queryParams.page = String(params.page);
    if (params?.limit !== undefined) queryParams.limit = String(params.limit);

    const response = await apiClient.get<PaginatedResponse<Device>>('/devices', queryParams);
    return response.data;
  },

  async getById(id: string): Promise<Device> {
    const response = await apiClient.get<Device>(`/devices/${id}`);
    return response.data;
  },

  async search(query: string): Promise<Device[]> {
    const response = await apiClient.get<Device[]>('/devices/search', { keyword: query });
    return response.data;
  },

  async filter(status: DeviceStatus): Promise<Device[]> {
    const response = await apiClient.get<PaginatedResponse<Device>>('/devices/filter', { status });
    return response.data.data;
  },

  async create(data: CreateDeviceData): Promise<Device> {
    const response = await apiClient.post<Device>('/devices', data);
    return response.data;
  },

  async update(id: string, data: UpdateDeviceData): Promise<Device> {
    const response = await apiClient.put<Device>(`/devices/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete('/devices/' + id);
  },
};
