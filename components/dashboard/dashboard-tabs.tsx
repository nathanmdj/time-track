"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientList } from "@/components/clients/client-list";
import { TimeEntryList } from "@/components/time-entries/time-entry-list";
import { EarningsSummary } from "@/components/dashboard/earnings-summary";
import type { Client, TimeEntry, TimeEntryWithClient } from "@/lib/supabase/types";

interface DashboardTabsProps {
  clients: Client[];
  timeEntries: TimeEntry[];
  timeEntriesWithClients: TimeEntryWithClient[];
  initialActiveEntry: TimeEntry | null;
}

export function DashboardTabs({
  clients,
  timeEntries,
  timeEntriesWithClients,
  initialActiveEntry,
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="time" className="space-y-6">
      <TabsList>
        <TabsTrigger value="time">Time Tracking</TabsTrigger>
        <TabsTrigger value="clients">Clients</TabsTrigger>
        <TabsTrigger value="earnings">Earnings</TabsTrigger>
      </TabsList>

      <TabsContent value="time" className="space-y-6">
        <TimeEntryList initialEntries={timeEntriesWithClients} initialActiveEntry={initialActiveEntry} clients={clients} />
      </TabsContent>

      <TabsContent value="clients">
        <ClientList initialClients={clients} initialTimeEntries={timeEntries} />
      </TabsContent>

      <TabsContent value="earnings">
        <EarningsSummary clients={clients} timeEntries={timeEntries} />
      </TabsContent>
    </Tabs>
  );
}
