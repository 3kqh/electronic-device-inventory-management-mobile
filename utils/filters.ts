import { User } from "../types/api";

/**
 * Filters users by firstName, lastName, or department name (case-insensitive).
 * Returns all users if query is empty.
 */
export function filterEmployees(users: User[], query: string): User[] {
  const trimmed = query.trim();
  if (!trimmed) return users;

  const lowerQuery = trimmed.toLowerCase();

  return users.filter((user) => {
    const firstName = user.firstName?.toLowerCase() ?? "";
    const lastName = user.lastName?.toLowerCase() ?? "";
    const departmentName = user.departmentId?.name?.toLowerCase() ?? "";

    return (
      firstName.includes(lowerQuery) ||
      lastName.includes(lowerQuery) ||
      departmentName.includes(lowerQuery)
    );
  });
}

/**
 * Filters users by role. Returns all users if role is "All" or empty.
 */
export function filterUsersByRole(users: User[], role: string): User[] {
  const trimmed = role.trim();
  if (!trimmed || trimmed === "All") return users;

  return users.filter((user) => user.role === trimmed);
}
