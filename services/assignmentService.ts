import type { Assignment } from '../types/api';
import { apiClient } from './apiClient';

export const assignmentService = {
  async assign(data: {
    deviceId: string;
    userId: string;
    notes?: string;
  }): Promise<Assignment> {
    const response = await apiClient.post<Assignment>('/assignments', data);
    return response.data;
  },

  async getHistory(deviceId: string): Promise<Assignment[]> {
    const response = await apiClient.get<Assignment[]>(`/assignments/history/${deviceId}`);
    return response.data;
  },
};
