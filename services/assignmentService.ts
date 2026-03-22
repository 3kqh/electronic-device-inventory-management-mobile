import type { Assignment, PaginatedResponse } from '../types/api';
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

  async getAll(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Assignment>> {
    const response = await apiClient.get<PaginatedResponse<Assignment>>('/assignments', { params });
    return response.data;
  },

  async getById(id: string): Promise<Assignment> {
    const response = await apiClient.get<Assignment>(`/assignments/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<Assignment>): Promise<Assignment> {
    const response = await apiClient.put<Assignment>(`/assignments/${id}`, data);
    return response.data;
  },

  async unassign(id: string): Promise<void> {
    await apiClient.delete(`/assignments/${id}`);
  },

  async transfer(id: string, data: { newUserId: string; notes?: string }): Promise<Assignment> {
    const response = await apiClient.post<Assignment>(`/assignments/${id}/transfer`, data);
    return response.data;
  },

  async acknowledge(id: string): Promise<Assignment> {
    const response = await apiClient.patch<Assignment>(`/assignments/${id}/acknowledge`);
    return response.data;
  },

  async getUserAssignments(userId: string): Promise<Assignment[]> {
    const response = await apiClient.get<Assignment[]>(`/assignments/user/${userId}`);
    return response.data;
  },
};
