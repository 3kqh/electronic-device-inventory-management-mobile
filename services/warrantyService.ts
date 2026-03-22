import type {
    CreateWarrantyClaimData,
    CreateWarrantyData,
    PaginatedResponse,
    UpdateWarrantyClaimData,
    UpdateWarrantyData,
    Warranty,
    WarrantyClaim,
} from '../types/api';
import { apiClient } from './apiClient';

export const warrantyService = {
  // ============================================================
  // Warranty CRUD + expiring
  // ============================================================

  async getAll(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Warranty>> {
    const queryParams: Record<string, string> = {};
    if (params?.page !== undefined) queryParams.page = String(params.page);
    if (params?.limit !== undefined) queryParams.limit = String(params.limit);

    const response = await apiClient.get<PaginatedResponse<Warranty>>('/warranties', queryParams);
    return response.data;
  },

  async getById(id: string): Promise<Warranty> {
    const response = await apiClient.get<Warranty>(`/warranties/${id}`);
    return response.data;
  },

  async create(data: CreateWarrantyData): Promise<Warranty> {
    const response = await apiClient.post<Warranty>('/warranties', data);
    return response.data;
  },

  async update(id: string, data: UpdateWarrantyData): Promise<Warranty> {
    const response = await apiClient.put<Warranty>(`/warranties/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete('/warranties/' + id);
  },

  async getExpiring(days?: number): Promise<Warranty[]> {
    const queryParams: Record<string, string> = {};
    if (days !== undefined) queryParams.days = String(days);

    const response = await apiClient.get<Warranty[]>('/warranties/expiring', queryParams);
    return response.data;
  },

  // ============================================================
  // Warranty Claims
  // ============================================================

  async createClaim(data: CreateWarrantyClaimData): Promise<WarrantyClaim> {
    const response = await apiClient.post<WarrantyClaim>('/warranty-claims', data);
    return response.data;
  },

  async getAllClaims(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<WarrantyClaim>> {
    const queryParams: Record<string, string> = {};
    if (params?.page !== undefined) queryParams.page = String(params.page);
    if (params?.limit !== undefined) queryParams.limit = String(params.limit);

    const response = await apiClient.get<PaginatedResponse<WarrantyClaim>>('/warranty-claims', queryParams);
    return response.data;
  },

  async getClaimById(id: string): Promise<WarrantyClaim> {
    const response = await apiClient.get<WarrantyClaim>(`/warranty-claims/${id}`);
    return response.data;
  },

  async updateClaim(id: string, data: UpdateWarrantyClaimData): Promise<WarrantyClaim> {
    const response = await apiClient.put<WarrantyClaim>(`/warranty-claims/${id}`, data);
    return response.data;
  },

  async deleteClaim(id: string): Promise<void> {
    await apiClient.delete('/warranty-claims/' + id);
  },
};
