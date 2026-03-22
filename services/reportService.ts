import type { CreateReportConfigData, DeviceStatusReport, InventoryValueReport, MaintenanceReport, ReportConfig, WarrantyAlert } from '../types/api';
import { apiClient } from './apiClient';

// Report types not fully defined in the design — use lightweight interfaces
export interface AssignmentReport {
  [key: string]: unknown;
}

export interface WarrantyReport {
  [key: string]: unknown;
}

export interface DepreciationReport {
  [key: string]: unknown;
}

export const reportService = {
  async getDeviceStatus(): Promise<DeviceStatusReport> {
    const response = await apiClient.get<DeviceStatusReport>('/reports/device-status');
    return response.data;
  },

  async getAssignments(): Promise<AssignmentReport> {
    const response = await apiClient.get<AssignmentReport>('/reports/assignments');
    return response.data;
  },

  async getWarranty(): Promise<WarrantyReport> {
    const response = await apiClient.get<WarrantyReport>('/reports/warranty');
    return response.data;
  },

  async getWarrantyAlerts(): Promise<WarrantyAlert[]> {
    const response = await apiClient.get<{ success: boolean; total: number; alerts: WarrantyAlert[] }>('/reports/warranty-alerts');
    return response.data.alerts ?? [];
  },

  async getDepreciation(): Promise<DepreciationReport> {
    const response = await apiClient.get<DepreciationReport>('/reports/depreciation');
    return response.data;
  },

  async getInventoryValue(): Promise<InventoryValueReport> {
    const response = await apiClient.get<InventoryValueReport>('/reports/inventory-value');
    return response.data;
  },

  async getMaintenance(): Promise<MaintenanceReport> {
    const response = await apiClient.get<MaintenanceReport>('/reports/maintenance');
    return response.data;
  },

  async generateCustomReport(data: Record<string, unknown>): Promise<unknown> {
    const response = await apiClient.post('/reports/custom', data);
    return response.data;
  },

  async createReportConfig(data: CreateReportConfigData): Promise<ReportConfig> {
    const response = await apiClient.post<ReportConfig>('/reports/schedules', data);
    return response.data;
  },

  async getReportConfigs(): Promise<ReportConfig[]> {
    const response = await apiClient.get<ReportConfig[]>('/reports/schedules');
    return response.data;
  },

  async updateReportConfig(id: string, data: Partial<CreateReportConfigData>): Promise<ReportConfig> {
    const response = await apiClient.put<ReportConfig>(`/reports/schedules/${id}`, data);
    return response.data;
  },

  async deleteReportConfig(id: string): Promise<void> {
    await apiClient.delete(`/reports/schedules/${id}`);
  },

  async exportReport(data: { type: string; format?: string; filters?: Record<string, unknown> }): Promise<unknown> {
    const response = await apiClient.post('/reports/export', data);
    return response.data;
  },
};
