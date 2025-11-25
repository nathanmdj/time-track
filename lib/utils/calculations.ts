import type { Client, TimeEntry } from "@/lib/supabase/types";

/**
 * Calculate total hours from time entries for a specific client
 */
export function calculateClientHours(
  timeEntries: TimeEntry[],
  clientId: string
): number {
  return (
    timeEntries
      .filter((entry) => entry.client_id === clientId && entry.duration_minutes)
      .reduce((total, entry) => total + (entry.duration_minutes ?? 0), 0) / 60
  );
}

/**
 * Calculate total hours from all time entries
 */
export function calculateTotalHours(timeEntries: TimeEntry[]): number {
  const totalMinutes = timeEntries
    .filter((e) => e.duration_minutes)
    .reduce((sum, entry) => sum + (entry.duration_minutes ?? 0), 0);
  return totalMinutes / 60;
}

/**
 * Calculate earnings for a specific client
 */
export function calculateClientEarnings(
  timeEntries: TimeEntry[],
  client: Client
): number {
  const hours = calculateClientHours(timeEntries, client.id);
  return hours * client.hourly_rate;
}

/**
 * Calculate total earnings across all clients
 */
export function calculateTotalEarnings(
  timeEntries: TimeEntry[],
  clients: Client[]
): number {
  return timeEntries
    .filter((entry) => entry.duration_minutes)
    .reduce((sum, entry) => {
      const client = clients.find((c) => c.id === entry.client_id);
      if (!client) return sum;
      return sum + ((entry.duration_minutes ?? 0) / 60) * client.hourly_rate;
    }, 0);
}

/**
 * Filter time entries for current month
 */
export function filterEntriesThisMonth(timeEntries: TimeEntry[]): TimeEntry[] {
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  return timeEntries.filter(
    (e) => e.duration_minutes && new Date(e.start_time) >= thisMonth
  );
}

/**
 * Get client summary with hours and earnings
 */
export interface ClientSummary {
  client: Client;
  totalMinutes: number;
  totalHours: number;
  earnings: number;
}

export function getClientSummaries(
  clients: Client[],
  timeEntries: TimeEntry[]
): ClientSummary[] {
  const completedEntries = timeEntries.filter((e) => e.duration_minutes);

  return clients
    .map((client) => {
      const clientEntries = completedEntries.filter(
        (e) => e.client_id === client.id
      );
      const totalMinutes = clientEntries.reduce(
        (sum, e) => sum + (e.duration_minutes ?? 0),
        0
      );
      const totalHours = totalMinutes / 60;
      const earnings = totalHours * client.hourly_rate;

      return { client, totalMinutes, totalHours, earnings };
    })
    .filter((s) => s.totalMinutes > 0)
    .sort((a, b) => b.earnings - a.earnings);
}
