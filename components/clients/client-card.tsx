import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/shared";
import { formatCurrency, formatHours } from "@/lib/utils/format";
import type { Client } from "@/lib/supabase/types";

interface ClientCardProps {
  client: Client;
  totalHours: number;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

export function ClientCard({ client, totalHours, onEdit, onDelete }: ClientCardProps) {
  const earnings = totalHours * client.hourly_rate;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{client.name}</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <DeleteButton
            onDelete={onDelete}
            confirmMessage="Are you sure you want to delete this client? All time entries will be deleted."
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {client.email && (
            <p className="text-sm text-muted-foreground">{client.email}</p>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{formatCurrency(client.hourly_rate)}/hr</Badge>
          </div>
          <div className="mt-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Hours:</span>
              <span className="font-medium">{formatHours(totalHours)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Earnings:</span>
              <span className="font-medium text-green-600">{formatCurrency(earnings)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
