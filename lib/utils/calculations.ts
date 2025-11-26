import type { Client, TimeEntry, PayCycleInterval } from "@/lib/supabase/types";

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
 * Filter time entries for current shift (6am to 6am next day)
 * If current time is before 6am, includes entries from 6am yesterday to now
 * If current time is after 6am, includes entries from 6am today to now
 */
export function filterEntriesCurrentShift(timeEntries: TimeEntry[]): TimeEntry[] {
  const now = new Date();
  const currentHour = now.getHours();

  // Determine shift start time
  const shiftStart = new Date(now);
  if (currentHour < 6) {
    // Before 6am - shift started yesterday at 6am
    shiftStart.setDate(shiftStart.getDate() - 1);
  }
  shiftStart.setHours(6, 0, 0, 0);

  // Shift end is 6am the next day
  const shiftEnd = new Date(shiftStart);
  shiftEnd.setDate(shiftEnd.getDate() + 1);

  return timeEntries.filter((entry) => {
    if (!entry.duration_minutes) return false;
    const entryDate = new Date(entry.start_time);
    return entryDate >= shiftStart && entryDate < shiftEnd;
  });
}

/**
 * Calculate current shift total hours (from 6am to now)
 */
export function calculateCurrentShiftHours(timeEntries: TimeEntry[]): number {
  const shiftEntries = filterEntriesCurrentShift(timeEntries);
  return calculateTotalHours(shiftEntries);
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

/**
 * Pay cycle period with start and end dates
 */
export interface PayCyclePeriod {
  start: Date;
  end: Date;
}

/**
 * Get the current pay cycle period for a client
 */
export function getPayCyclePeriod(
  interval: PayCycleInterval,
  startDate: string
): PayCyclePeriod {
  const cycleStart = new Date(startDate);
  cycleStart.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let periodDays: number;

  if (interval === "weekly") {
    periodDays = 7;
  } else if (interval === "biweekly") {
    periodDays = 14;
  } else {
    // Monthly - use calendar months
    const monthsDiff =
      (today.getFullYear() - cycleStart.getFullYear()) * 12 +
      (today.getMonth() - cycleStart.getMonth());

    const currentPeriodStart = new Date(cycleStart);
    currentPeriodStart.setMonth(cycleStart.getMonth() + monthsDiff);

    // If we haven't reached the start day this month, go back one month
    if (today.getDate() < cycleStart.getDate()) {
      currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1);
    }

    const currentPeriodEnd = new Date(currentPeriodStart);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() - 1);
    currentPeriodEnd.setHours(23, 59, 59, 999);

    return { start: currentPeriodStart, end: currentPeriodEnd };
  }

  // For weekly and biweekly
  const daysSinceStart = Math.floor(
    (today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const cycleNumber = Math.floor(daysSinceStart / periodDays);

  const currentPeriodStart = new Date(cycleStart);
  currentPeriodStart.setDate(cycleStart.getDate() + cycleNumber * periodDays);

  const currentPeriodEnd = new Date(currentPeriodStart);
  currentPeriodEnd.setDate(currentPeriodStart.getDate() + periodDays - 1);
  currentPeriodEnd.setHours(23, 59, 59, 999);

  return { start: currentPeriodStart, end: currentPeriodEnd };
}

/**
 * Filter time entries within a date range
 */
export function filterEntriesInDateRange(
  timeEntries: TimeEntry[],
  start: Date,
  end: Date
): TimeEntry[] {
  return timeEntries.filter((entry) => {
    if (!entry.duration_minutes) return false;
    const entryDate = new Date(entry.start_time);
    return entryDate >= start && entryDate <= end;
  });
}

/**
 * Calculate pay cycle earnings across all clients
 * Returns earnings for entries within each client's current pay cycle
 */
export function calculatePayCycleEarnings(
  timeEntries: TimeEntry[],
  clients: Client[]
): { totalEarnings: number; periodLabel: string } {
  const completedEntries = timeEntries.filter((e) => e.duration_minutes);
  let totalEarnings = 0;
  let earliestStart: Date | null = null;
  let latestEnd: Date | null = null;

  for (const client of clients) {
    if (!client.pay_cycle_interval || !client.pay_cycle_start_date) {
      // No pay cycle configured - skip this client for pay cycle calculation
      continue;
    }

    const period = getPayCyclePeriod(
      client.pay_cycle_interval,
      client.pay_cycle_start_date
    );

    // Track the date range for display
    if (!earliestStart || period.start < earliestStart) {
      earliestStart = period.start;
    }
    if (!latestEnd || period.end > latestEnd) {
      latestEnd = period.end;
    }

    // Filter entries for this client within their pay cycle
    const clientEntries = filterEntriesInDateRange(
      completedEntries.filter((e) => e.client_id === client.id),
      period.start,
      period.end
    );

    // Calculate earnings
    const hours = clientEntries.reduce(
      (sum, e) => sum + (e.duration_minutes ?? 0) / 60,
      0
    );
    totalEarnings += hours * client.hourly_rate;
  }

  // Generate period label
  let periodLabel = "No pay cycles configured";
  if (earliestStart && latestEnd) {
    const formatDate = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    periodLabel = `${formatDate(earliestStart)} - ${formatDate(latestEnd)}`;
  }

  return { totalEarnings, periodLabel };
}
