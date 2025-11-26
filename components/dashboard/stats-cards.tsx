import { Clock, DollarSign, Users, Calendar } from "lucide-react";
import { StatCard } from "@/components/shared";
import {
  calculateCurrentShiftHours,
  calculateTotalHours,
  filterEntriesThisMonth,
  calculateTotalEarnings,
  calculatePayCycleEarnings,
} from "@/lib/utils/calculations";
import { formatCurrency, formatHours } from "@/lib/utils/format";
import type { Client, TimeEntry } from "@/lib/supabase/types";

interface StatsCardsProps {
  clients: Client[];
  timeEntries: TimeEntry[];
}

export function StatsCards({ clients, timeEntries }: StatsCardsProps) {
  const completedEntries = timeEntries.filter((e) => e.duration_minutes);
  const currentShiftHours = calculateCurrentShiftHours(completedEntries);

  const thisMonthEntries = filterEntriesThisMonth(completedEntries);
  const thisMonthHours = calculateTotalHours(thisMonthEntries);
  const thisMonthEarnings = calculateTotalEarnings(thisMonthEntries, clients);

  // Calculate pay cycle earnings
  const { totalEarnings: payCycleEarnings, periodLabel } =
    calculatePayCycleEarnings(completedEntries, clients);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Current Shift"
        value={formatHours(currentShiftHours)}
        subtitle="Today's hours"
        icon={Clock}
      />
      <StatCard
        title="Pay Cycle"
        value={formatCurrency(payCycleEarnings)}
        subtitle={periodLabel}
        icon={DollarSign}
        valueClassName="text-green-600"
      />
      <StatCard
        title="This Month"
        value={`${formatHours(thisMonthHours)}h`}
        subtitle={`${formatCurrency(thisMonthEarnings)} earned`}
        icon={Calendar}
      />
      <StatCard
        title="Active Clients"
        value={clients.length}
        subtitle={`${completedEntries.length} time entries`}
        icon={Users}
      />
    </div>
  );
}
