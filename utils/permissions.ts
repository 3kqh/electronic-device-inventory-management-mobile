import { UserRole } from "../types/api";

/**
 * Permission actions that can be checked via hasPermission.
 */
export type PermissionAction =
  | "access_admin"
  | "crud_devices"
  | "manage_users"
  | "manage_settings"
  | "view_reports";

/** Roles that have full privileges. */
const PRIVILEGED_ROLES: ReadonlySet<UserRole> = new Set<UserRole>([
  "admin",
  "inventory_manager",
]);

/**
 * Whether the given role can access admin features
 * (e.g. Admin tab, user management, system settings).
 *
 * Validates: Requirements 9.4, 10.4, 12.1
 */
export function canAccessAdmin(role: UserRole): boolean {
  return PRIVILEGED_ROLES.has(role);
}

/**
 * Whether the given role can create / update / delete devices.
 *
 * Validates: Requirements 12.1, 12.2
 */
export function canCRUDDevices(role: UserRole): boolean {
  return PRIVILEGED_ROLES.has(role);
}

/**
 * Generic permission check for a role + action pair.
 *
 * Validates: Requirements 9.4, 10.4, 12.1, 12.2, 12.3
 */
export function hasPermission(
  role: UserRole,
  action: PermissionAction,
): boolean {
  switch (action) {
    case "access_admin":
      return canAccessAdmin(role);
    case "crud_devices":
      return canCRUDDevices(role);
    case "manage_users":
      return canAccessAdmin(role);
    case "manage_settings":
      return canAccessAdmin(role);
    case "view_reports":
      // All roles can view reports
      return true;
    default:
      return false;
  }
}
