import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/shared";
import { formatDate, formatTime, formatDuration } from "@/lib/utils/format";
import type { TimeEntryWithClient } from "@/lib/supabase/types";

interface TimeEntryTableProps {
  entries: TimeEntryWithClient[];
  onDelete: (id: string) => Promise<void>;
}

export function TimeEntryTable({ entries, onDelete }: TimeEntryTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">
                {formatDate(entry.start_time)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{entry.clients.name}</Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {entry.description || "-"}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatTime(entry.start_time)}
                {entry.end_time && ` - ${formatTime(entry.end_time)}`}
              </TableCell>
              <TableCell className="font-medium">
                {formatDuration(entry.duration_minutes)}
              </TableCell>
              <TableCell>
                <DeleteButton
                  onDelete={() => onDelete(entry.id)}
                  confirmMessage="Are you sure you want to delete this entry?"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
