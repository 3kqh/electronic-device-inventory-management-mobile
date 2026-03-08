import type { DeviceStatusReport, WarrantyAlert } from '../types/api';
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
};
