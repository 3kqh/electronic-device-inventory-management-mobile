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
