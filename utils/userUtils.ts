import { User } from "../types/api";

/**
 * Format user's full name from firstName and lastName.
 */
export function formatFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

/**
 * Format user display data ensuring all required fields are present:
 * full name, email, role, and status.
 *
 * Validates: Requirements 9.2
 */
export function formatUserDisplay(user: User): {
  fullName: string;
  email: string;
  role: string;
  status: string;
} {
  return {
    fullName: formatFullName(user),
    email: user.email,
    role: user.role,
    status: user.status,
  };
}
