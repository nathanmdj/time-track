"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader, EmptyState } from "@/components/shared";
import { TimeEntryTable } from "./time-entry-table";
import { TimeEntryForm } from "./time-entry-form";
import { Timer } from "./timer";
import { createTimeEntry, deleteTimeEntry } from "@/app/actions";
import type { Client, TimeEntry, TimeEntryWithClient } from "@/lib/supabase/types";

interface TimeEntryListProps {
  initialEntries: TimeEntryWithClient[];
  initialActiveEntry: TimeEntry | null;
  clients: Client[];
}

export function TimeEntryList({ initialEntries, initialActiveEntry, clients }: TimeEntryListProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreate = async (data: {
    client_id: string;
    description: string | null;
    start_time: string;
    end_time: string;
    duration_minutes: number;
  }) => {
    const result = await createTimeEntry(data);
    if (result.success) {
      const client = clients.find((c) => c.id === data.client_id);
      if (client) {
        const entryWithClient: TimeEntryWithClient = {
          ...result.data,
          clients: client,
        };
        setEntries((prev) => [entryWithClient, ...prev]);
      }
    } else {
      throw new Error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteTimeEntry(id);
    if (result.success) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleTimerEntry = (entry: TimeEntry) => {
    const client = clients.find((c) => c.id === entry.client_id);
    if (client) {
      const entryWithClient: TimeEntryWithClient = {
        ...entry,
        clients: client,
      };
      setEntries((prev) => [entryWithClient, ...prev]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Timer clients={clients} initialActiveEntry={initialActiveEntry} onEntryAdded={handleTimerEntry} />
        </div>
        <div className="lg:col-span-2">
          <SectionHeader
            title="Time Entries"
            action={
              <Button onClick={() => setIsFormOpen(true)} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Manual Entry
              </Button>
            }
          />

          <div className="mt-4">
            {entries.length === 0 ? (
              <EmptyState
                title="No time entries yet"
                description="Start the timer or add a manual entry."
                className="border rounded-lg"
              />
            ) : (
              <TimeEntryTable entries={entries} onDelete={handleDelete} />
            )}
          </div>
        </div>
      </div>

      <TimeEntryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreate}
        clients={clients}
      />
    </div>
  );
}
