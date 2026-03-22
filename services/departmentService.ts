import type {
    CreateDepartmentData,
    Department,
    UpdateDepartmentData,
} from '../types/api';
import { apiClient } from './apiClient';

export const departmentService = {
  async getAll(): Promise<Department[]> {
    const response = await apiClient.get<Department[]>('/departments');
    return response.data;
  },

  async getById(id: string): Promise<Department> {
    const response = await apiClient.get<Department>(`/departments/${id}`);
    return response.data;
  },

  async create(data: CreateDepartmentData): Promise<Department> {
    const response = await apiClient.post<Department>('/departments', data);
    return response.data;
  },

  async update(id: string, data: UpdateDepartmentData): Promise<Department> {
    const response = await apiClient.put<Department>(`/departments/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete('/departments/' + id);
  },
};
