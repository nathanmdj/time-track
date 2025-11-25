"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader, EmptyState } from "@/components/shared";
import { ClientCard } from "./client-card";
import { ClientForm } from "./client-form";
import { createClient, updateClient, deleteClient } from "@/app/actions";
import { calculateClientHours } from "@/lib/utils/calculations";
import type { Client, TimeEntry } from "@/lib/supabase/types";

interface ClientListProps {
  initialClients: Client[];
  initialTimeEntries: TimeEntry[];
}

export function ClientList({ initialClients, initialTimeEntries }: ClientListProps) {
  const [clients, setClients] = useState(initialClients);
  const [timeEntries, setTimeEntries] = useState(initialTimeEntries);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();

  const handleCreate = async (data: { name: string; email: string; hourly_rate: number }) => {
    const result = await createClient({
      name: data.name,
      email: data.email || null,
      hourly_rate: data.hourly_rate,
    });
    if (result.success) {
      setClients((prev) => [...prev, result.data].sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      throw new Error(result.error);
    }
  };

  const handleUpdate = async (data: { name: string; email: string; hourly_rate: number }) => {
    if (!editingClient) return;
    const result = await updateClient(editingClient.id, {
      name: data.name,
      email: data.email || null,
      hourly_rate: data.hourly_rate,
    });
    if (result.success) {
      setClients((prev) =>
        prev.map((c) => (c.id === editingClient.id ? result.data : c))
      );
      setEditingClient(undefined);
    } else {
      throw new Error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteClient(id);
    if (result.success) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      setTimeEntries((prev) => prev.filter((e) => e.client_id !== id));
    }
  };

  const openEditForm = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const closeForm = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setEditingClient(undefined);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Clients"
        action={
          <Button onClick={() => setIsFormOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        }
      />

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add your first client to get started."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              totalHours={calculateClientHours(timeEntries, client.id)}
              onEdit={() => openEditForm(client)}
              onDelete={() => handleDelete(client.id)}
            />
          ))}
        </div>
      )}

      <ClientForm
        open={isFormOpen}
        onOpenChange={closeForm}
        onSubmit={editingClient ? handleUpdate : handleCreate}
        client={editingClient}
      />
    </div>
  );
}
