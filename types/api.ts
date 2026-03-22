// types/api.ts - TypeScript type definitions for API integration

// ============================================================
// Enum-like union types (matching backend models)
// ============================================================

export type DeviceStatus = "available" | "assigned" | "in_maintenance" | "retired";
export type DeviceCondition = "new" | "good" | "fair" | "poor";
export type UserRole = "admin" | "inventory_manager" | "staff";
export type UserStatus = "active" | "inactive";
export type MaintenanceType = "preventive" | "corrective" | "other";
export type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type AssignmentStatus = "pending" | "acknowledged" | "active" | "returned";

// ============================================================
// Domain models
// ============================================================

export interface Device {
  _id: string;
  assetTag: string;
  serialNumber: string;
  name: string;
  categoryId: DeviceCategory | string;
  manufacturer: string;
  model: string;
  specifications: Record<string, unknown>;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  salvageValue: number;
  locationId: Location | string;
  status: DeviceStatus;
  condition: DeviceCondition;
  barcode: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId?: { _id: string; name: string };
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
}

export interface MaintenanceRecord {
  _id: string;
  deviceId: Device | string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate: string;
  performedBy: User | string;
  requestedBy: User | string;
  description: string;
  cost: number;
  notes: string;
  createdAt: string;
}

export interface Assignment {
  _id: string;
  deviceId: Device | string;
  assignedTo: {
    userId: User | string;
    departmentId?: string;
  };
  assignedBy: User | string;
  assignmentDate: string;
  returnDate: string;
  status: AssignmentStatus;
  acknowledgedAt: string;
  notes: string;
  createdAt: string;
}

export interface DeviceCategory {
  _id: string;
  name: string;
  description: string;
}

export interface Location {
  _id: string;
  name: string;
  building: string;
  floor: string;
  room: string;
}

// ============================================================
// API response types
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface ApiErrorResponse {
  message: string;
  errors?: string[];
  field?: string;
  code?: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

// ============================================================
// Device CRUD data types
// ============================================================

export interface CreateDeviceData {
  assetTag: string;
  serialNumber: string;
  name: string;
  categoryId: string;
  manufacturer: string;
  model: string;
  specifications?: Record<string, unknown>;
  purchaseDate: string;
  purchasePrice: number;
  currentValue?: number;
  salvageValue?: number;
  locationId: string;
  status?: DeviceStatus;
  condition?: DeviceCondition;
  barcode?: string;
  imageUrl?: string;
}

export interface UpdateDeviceData {
  assetTag?: string;
  serialNumber?: string;
  name?: string;
  categoryId?: string;
  manufacturer?: string;
  model?: string;
  specifications?: Record<string, unknown>;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  salvageValue?: number;
  locationId?: string;
  status?: DeviceStatus;
  condition?: DeviceCondition;
  barcode?: string;
  imageUrl?: string;
}

// ============================================================
// Maintenance request data type
// ============================================================

export interface MaintenanceRequestData {
  deviceId: string;
  type: MaintenanceType;
  scheduledDate: string;
  description: string;
  notes?: string;
}

// ============================================================
// Report types
// ============================================================

export interface DeviceStatusReport {
  totalDevices: number;
  byStatus: Record<DeviceStatus, number>;
  byCategory: Array<{ category: string; count: number }>;
}

export interface WarrantyAlert {
  device: Device;
  daysRemaining: number;
  expiryDate: string;
}

// ============================================================
// Warranty types
// ============================================================

export type WarrantyType = "manufacturer" | "extended" | "other";
export type WarrantyStatus = "active" | "expired" | "cancelled";
export type WarrantyClaimStatus =
  | "filed"
  | "in_review"
  | "resolved"
  | "rejected";

export interface Warranty {
  _id: string;
  deviceId: Device | string;
  type: WarrantyType;
  provider: string;
  startDate: string;
  endDate: string;
  coverage: string;
  cost: number;
  status: WarrantyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WarrantyClaim {
  _id: string;
  warrantyId: Warranty | string;
  deviceId: Device | string;
  claimNumber: string;
  filedBy: User | string;
  filedDate: string;
  issue: string;
  status: WarrantyClaimStatus;
  resolution: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarrantyData {
  deviceId: string;
  type: WarrantyType;
  provider: string;
  startDate: string;
  endDate: string;
  coverage: string;
  cost?: number;
}

export interface UpdateWarrantyData extends Partial<CreateWarrantyData> {
  status?: WarrantyStatus;
}

export interface CreateWarrantyClaimData {
  warrantyId: string;
  deviceId: string;
  issue: string;
  filedDate?: string;
}

export interface UpdateWarrantyClaimData {
  status?: WarrantyClaimStatus;
  resolution?: string;
}

// ============================================================
// Depreciation types
// ============================================================

export type DepreciationMethod = "straight_line" | "declining_balance";

export interface DepreciationRule {
  _id: string;
  categoryId: DeviceCategory | string;
  method: DepreciationMethod;
  usefulLifeYears: number;
  salvageValuePercent: number;
  depreciationRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepreciationRuleData {
  categoryId: string;
  method: DepreciationMethod;
  usefulLifeYears: number;
  salvageValuePercent?: number;
  depreciationRate?: number;
}

export interface UpdateDepreciationRuleData extends Partial<CreateDepreciationRuleData> {}

export interface DeviceDepreciation {
  device: Device;
  originalValue: number;
  currentValue: number;
  totalDepreciation: number;
  annualDepreciation: number;
  schedule: Array<{ year: number; value: number; depreciation: number }>;
}

export interface CategoryDepreciation {
  category: DeviceCategory;
  devices: Array<{
    device: Device;
    currentValue: number;
    depreciation: number;
  }>;
  totalOriginalValue: number;
  totalCurrentValue: number;
}

export interface BatchUpdateResult {
  updated: number;
  errors: number;
}

// ============================================================
// Department types
// ============================================================

export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateDepartmentData extends Partial<CreateDepartmentData> {}

// ============================================================
// Audit Log types
// ============================================================

export interface AuditLog {
  _id: string;
  userId: User | string | null;
  action: string;
  module: string;
  description: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  status: "SUCCESS" | "FAILED";
  createdAt: string;
}

export interface AuditLogFilterParams {
  page?: number;
  limit?: number;
  action?: string;
  module?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

// ============================================================
// Location extended types
// ============================================================

export interface LocationFull {
  _id: string;
  name: string;
  code: string;
  type: "building" | "floor" | "room" | "other";
  parentId: string | null;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationData {
  name: string;
  code?: string;
  type: "building" | "floor" | "room" | "other";
  parentId?: string;
  address?: string;
}

export interface UpdateLocationData extends Partial<CreateLocationData> {}

// ============================================================
// Category extended types
// ============================================================

export interface DeviceCategoryFull {
  _id: string;
  name: string;
  code: string;
  description: string;
  customFields: Array<{
    fieldName: string;
    fieldType: string;
    required: boolean;
  }>;
  depreciationRuleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  code?: string;
  description?: string;
  customFields?: Array<{
    fieldName: string;
    fieldType: string;
    required: boolean;
  }>;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

// ============================================================
// User extended types
// ============================================================

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  departmentId?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: string;
}

// ============================================================
// Auth extended types
// ============================================================

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// ============================================================
// Report extended types
// ============================================================

export interface InventoryValueReport {
  totalValue: number;
  byCategory: Array<{ category: string; value: number; count: number }>;
}

export interface MaintenanceReport {
  totalRecords: number;
  byStatus: Record<string, number>;
  totalCost: number;
}

export interface ReportConfig {
  _id: string;
  name: string;
  type: string;
  filters: Record<string, unknown>;
  schedule?: string;
  createdAt: string;
}

export interface CreateReportConfigData {
  name: string;
  type: string;
  filters?: Record<string, unknown>;
  schedule?: string;
}

// ============================================================
// System extended types
// ============================================================

export interface SystemStats {
  totalDevices: number;
  totalUsers: number;
  totalCategories: number;
  totalLocations: number;
  totalAssignments: number;
  totalMaintenance: number;
}

export interface BackupInfo {
  filename: string;
  size: number;
  createdAt: string;
}

export interface SystemLog {
  level: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
