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

  // --- Advanced Search & Barcode (Task 6.1) ---

  async advancedSearch(params: Record<string, string>): Promise<Device[]> {
    const response = await apiClient.get<Device[]>('/devices/advanced-search', params);
    return response.data;
  },

  async scanBarcode(code: string): Promise<Device> {
    const response = await apiClient.get<Device>(`/devices/barcode/scan/${code}`);
    return response.data;
  },

  async generateBarcode(deviceId: string): Promise<{ barcode: string }> {
    const response = await apiClient.post<{ barcode: string }>(`/devices/barcode/generate/${deviceId}`);
    return response.data;
  },

  async generateMultipleBarcodes(deviceIds: string[]): Promise<{ barcodes: string[] }> {
    const response = await apiClient.post<{ barcodes: string[] }>('/devices/barcode/generate-multiple', { deviceIds });
    return response.data;
  },

  // --- Asset Labels (Task 6.2) ---

  async printAssetLabel(id: string): Promise<unknown> {
    const response = await apiClient.get<unknown>(`/devices/label/${id}`);
    return response.data;
  },

  async bulkPrintAssetLabels(ids: string[]): Promise<unknown> {
    const response = await apiClient.post<unknown>('/devices/labels/bulk', { ids });
    return response.data;
  },

  // --- Bulk Operations & Dispose (Task 6.3) ---

  async bulkImportDevices(data: Record<string, unknown>): Promise<unknown> {
    const response = await apiClient.post<unknown>('/devices/bulk/import', data);
    return response.data;
  },

  async bulkExportDevices(params: Record<string, string>): Promise<unknown> {
    const response = await apiClient.post<unknown>('/devices/bulk/export', params);
    return response.data;
  },

  async bulkUpdateStatus(deviceIds: string[], status: string): Promise<unknown> {
    const response = await apiClient.put<unknown>('/devices/bulk/update-status', { deviceIds, status });
    return response.data;
  },

  async bulkUpdateLocation(deviceIds: string[], locationId: string): Promise<unknown> {
    const response = await apiClient.put<unknown>('/devices/bulk/update-location', { deviceIds, locationId });
    return response.data;
  },

  async disposeDevice(id: string): Promise<Device> {
    const response = await apiClient.patch<Device>(`/devices/${id}/dispose`);
    return response.data;
  },
};
