import { Clock, DollarSign, Users, Calendar } from "lucide-react";
import { StatCard } from "@/components/shared";
import {
  calculateTotalHours,
  calculateTotalEarnings,
  filterEntriesThisMonth,
} from "@/lib/utils/calculations";
import { formatCurrency, formatHours } from "@/lib/utils/format";
import type { Client, TimeEntry } from "@/lib/supabase/types";

interface StatsCardsProps {
  clients: Client[];
  timeEntries: TimeEntry[];
}

export function StatsCards({ clients, timeEntries }: StatsCardsProps) {
  const completedEntries = timeEntries.filter((e) => e.duration_minutes);
  const totalHours = calculateTotalHours(completedEntries);
  const totalEarnings = calculateTotalEarnings(completedEntries, clients);

  const thisMonthEntries = filterEntriesThisMonth(completedEntries);
  const thisMonthHours = calculateTotalHours(thisMonthEntries);
  const thisMonthEarnings = calculateTotalEarnings(thisMonthEntries, clients);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Hours"
        value={formatHours(totalHours)}
        subtitle="All time"
        icon={Clock}
      />
      <StatCard
        title="Total Earnings"
        value={formatCurrency(totalEarnings)}
        subtitle="All time"
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
