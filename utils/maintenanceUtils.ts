import { MaintenanceRecord, MaintenanceStatus } from "../types/api";

export interface MaintenanceStatusCounts {
  pending: number;
  completed: number;
  scheduled: number;
  in_progress: number;
  cancelled: number;
}

/**
 * Count maintenance records by status.
 *
 * The actual MaintenanceStatus values are: "scheduled", "in_progress",
 * "completed", "cancelled". The UI also expects a "pending" count —
 * "scheduled" records are treated as pending, so `pending` mirrors
 * `scheduled`. The sum of the four real-status counts always equals
 * the total number of records.
 */
export function countByStatus(
  records: MaintenanceRecord[]
): MaintenanceStatusCounts {
  const counts: MaintenanceStatusCounts = {
    pending: 0,
    completed: 0,
    scheduled: 0,
    in_progress: 0,
    cancelled: 0,
  };

  if (!Array.isArray(records)) return counts;

  for (const record of records) {
    const status: MaintenanceStatus = record.status;
    switch (status) {
      case "scheduled":
        counts.scheduled++;
        counts.pending++;
        break;
      case "in_progress":
        counts.in_progress++;
        break;
      case "completed":
        counts.completed++;
        break;
      case "cancelled":
        counts.cancelled++;
        break;
    }
  }

  return counts;
}
