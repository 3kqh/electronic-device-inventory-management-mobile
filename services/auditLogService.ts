import type {
    AuditLog,
    AuditLogFilterParams,
    PaginatedResponse,
} from '../types/api';
import { apiClient } from './apiClient';

export const auditLogService = {
  async getAll(params?: AuditLogFilterParams): Promise<PaginatedResponse<AuditLog>> {
    const queryParams: Record<string, string> = {};
    if (params?.page !== undefined) queryParams.page = String(params.page);
    if (params?.limit !== undefined) queryParams.limit = String(params.limit);
    if (params?.action) queryParams.action = params.action;
    if (params?.module) queryParams.module = params.module;
    if (params?.userId) queryParams.userId = params.userId;
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;
    if (params?.status) queryParams.status = params.status;

    const response = await apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs', queryParams);
    return response.data;
  },

  async exportCsv(params?: AuditLogFilterParams): Promise<string> {
    const queryParams: Record<string, string> = {};
    if (params?.page !== undefined) queryParams.page = String(params.page);
    if (params?.limit !== undefined) queryParams.limit = String(params.limit);
    if (params?.action) queryParams.action = params.action;
    if (params?.module) queryParams.module = params.module;
    if (params?.userId) queryParams.userId = params.userId;
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;
    if (params?.status) queryParams.status = params.status;

    const response = await apiClient.get<string>('/audit-logs/export', queryParams);
    return response.data;
  },
};
