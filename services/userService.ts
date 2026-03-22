import type { CreateUserData, UpdateUserData, User, UserRole } from '../types/api';
import { apiClient } from './apiClient';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserData): Promise<User> {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  async update(id: string, data: UpdateUserData): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async assignRole(id: string, role: UserRole): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}/role`, { role });
    return response.data;
  },

  async deactivate(id: string): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}/deactivate`);
    return response.data;
  },
};
