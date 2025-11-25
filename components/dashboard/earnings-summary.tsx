import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared";
import { getClientSummaries } from "@/lib/utils/calculations";
import { formatCurrency, formatHours } from "@/lib/utils/format";
import type { Client, TimeEntry } from "@/lib/supabase/types";

interface EarningsSummaryProps {
  clients: Client[];
  timeEntries: TimeEntry[];
}

export function EarningsSummary({ clients, timeEntries }: EarningsSummaryProps) {
  const clientSummaries = getClientSummaries(clients, timeEntries);
  const totalEarnings = clientSummaries.reduce((sum, s) => sum + s.earnings, 0);

  if (clientSummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Client</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState title="No completed time entries yet" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings by Client</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {clientSummaries.map((summary, index) => (
          <div key={summary.client.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{summary.client.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatHours(summary.totalHours)} hours @ {formatCurrency(summary.client.hourly_rate)}/hr
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  {formatCurrency(summary.earnings)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((summary.earnings / totalEarnings) * 100).toFixed(0)}% of total
                </p>
              </div>
            </div>
            {index < clientSummaries.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}

        <Separator />
        <div className="flex items-center justify-between pt-2">
          <p className="font-semibold">Total Earnings</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(totalEarnings)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
