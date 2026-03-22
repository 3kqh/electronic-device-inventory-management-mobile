import type { BackupInfo, PaginatedResponse, SystemLog, SystemStats } from '../types/api';
import { apiClient } from './apiClient';

export interface SystemSettings {
  [key: string]: unknown;
}

export const systemService = {
  async getSettings(): Promise<SystemSettings> {
    const response = await apiClient.get<SystemSettings>('/system/settings');
    return response.data;
  },

  async updateSetting(key: string, value: unknown): Promise<void> {
    await apiClient.post('/system/settings', { key, value });
  },

  async healthCheck(): Promise<{ status: string }> {
    const response = await apiClient.get<{ status: string }>('/system/health');
    return response.data;
  },

  async getStats(): Promise<SystemStats> {
    const response = await apiClient.get<SystemStats>('/system/stats');
    return response.data;
  },

  async deleteSetting(key: string): Promise<void> {
    await apiClient.delete(`/system/settings/${key}`);
  },

  async createBackup(): Promise<BackupInfo> {
    const response = await apiClient.post<BackupInfo>('/system/backup/create');
    return response.data;
  },

  async getBackupList(): Promise<BackupInfo[]> {
    const response = await apiClient.get<BackupInfo[]>('/system/backup/list');
    return response.data;
  },

  async downloadBackup(filename: string): Promise<unknown> {
    const response = await apiClient.get(`/system/backup/download/${filename}`);
    return response.data;
  },

  async deleteBackup(filename: string): Promise<void> {
    await apiClient.delete(`/system/backup/delete/${filename}`);
  },

  async getSystemLogs(params?: { page?: number; limit?: number; level?: string }): Promise<PaginatedResponse<SystemLog>> {
    const response = await apiClient.get<PaginatedResponse<SystemLog>>('/system/logs', { params });
    return response.data;
  },
};
