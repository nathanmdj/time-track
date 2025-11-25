import { PageHeader } from "@/components/shared";
import { SetupInstructions } from "@/components/setup-instructions";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { getClients, getTimeEntries, getTimeEntriesWithClients, getActiveTimeEntry } from "@/app/actions";

async function isSupabaseConfigured(): Promise<boolean> {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function Home() {
  const configured = await isSupabaseConfigured();

  if (!configured) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <PageHeader
            title="Time Tracker"
            description="Track your time and monitor earnings by client"
            centered
          />
          <SetupInstructions />
        </div>
      </div>
    );
  }

  const [clientsResult, timeEntriesResult, timeEntriesWithClientsResult, activeEntryResult] = await Promise.all([
    getClients(),
    getTimeEntries(),
    getTimeEntriesWithClients(),
    getActiveTimeEntry(),
  ]);

  const clients = clientsResult.success ? clientsResult.data : [];
  const timeEntries = timeEntriesResult.success ? timeEntriesResult.data : [];
  const timeEntriesWithClients = timeEntriesWithClientsResult.success
    ? timeEntriesWithClientsResult.data
    : [];
  const activeEntry = activeEntryResult.success ? activeEntryResult.data : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <PageHeader
          title="Time Tracker"
          description="Track your time and monitor earnings by client"
        />

        <div className="space-y-8">
          <StatsCards clients={clients} timeEntries={timeEntries} />
          <DashboardTabs
            clients={clients}
            timeEntries={timeEntries}
            timeEntriesWithClients={timeEntriesWithClients}
            initialActiveEntry={activeEntry}
          />
        </div>
      </div>
    </div>
  );
}
