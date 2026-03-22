import type { MaintenanceRecord, MaintenanceRequestData } from '../types/api';
import { apiClient } from './apiClient';

interface PaginatedResponse {
  data: MaintenanceRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface UpcomingResponse {
  total: number;
  days: number;
  records: MaintenanceRecord[];
}

interface HistoryResponse {
  deviceId: string;
  deviceName: string;
  total: number;
  history: MaintenanceRecord[];
}

export const maintenanceService = {
  async getAll(): Promise<MaintenanceRecord[]> {
    const response = await apiClient.get<PaginatedResponse>('/maintenance');
    return response.data.data;
  },

  async getUpcoming(): Promise<MaintenanceRecord[]> {
    const response = await apiClient.get<UpcomingResponse>('/maintenance/upcoming');
    return response.data.records;
  },

  async getHistory(deviceId: string): Promise<MaintenanceRecord[]> {
    const response = await apiClient.get<HistoryResponse>(`/maintenance/history/${deviceId}`);
    return response.data.history;
  },

  async requestMaintenance(data: MaintenanceRequestData): Promise<MaintenanceRecord> {
    const response = await apiClient.post<MaintenanceRecord>('/maintenance/request', data);
    return response.data;
  },

  async getById(id: string): Promise<MaintenanceRecord> {
    const response = await apiClient.get<MaintenanceRecord>(`/maintenance/${id}`);
    return response.data;
  },

  async recordMaintenance(data: MaintenanceRequestData): Promise<MaintenanceRecord> {
    const response = await apiClient.post<MaintenanceRecord>('/maintenance/record', data);
    return response.data;
  },

  async scheduleMaintenance(data: MaintenanceRequestData): Promise<MaintenanceRecord> {
    const response = await apiClient.post<MaintenanceRecord>('/maintenance/schedule', data);
    return response.data;
  },

  async updateMaintenance(id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const response = await apiClient.put<MaintenanceRecord>(`/maintenance/${id}`, data);
    return response.data;
  },

  async completeMaintenance(id: string, data: { cost?: number; notes?: string }): Promise<MaintenanceRecord> {
    const response = await apiClient.patch<MaintenanceRecord>(`/maintenance/${id}/complete`, data);
    return response.data;
  },

  async cancelMaintenance(id: string): Promise<MaintenanceRecord> {
    const response = await apiClient.patch<MaintenanceRecord>(`/maintenance/${id}/cancel`);
    return response.data;
  },
};
