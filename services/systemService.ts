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
};
