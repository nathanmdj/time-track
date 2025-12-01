import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared";
import { groupTimeEntriesByShift } from "@/lib/utils/calculations";
import { formatHours } from "@/lib/utils/format";
import type { Client, TimeEntry } from "@/lib/supabase/types";

interface ShiftReportProps {
  clients: Client[];
  timeEntries: TimeEntry[];
}

export function ShiftReport({ clients, timeEntries }: ShiftReportProps) {
  const shifts = groupTimeEntriesByShift(timeEntries, clients);
  const totalHours = shifts.reduce((sum, shift) => sum + shift.totalHours, 0);

  if (shifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hours by Shift</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState title="No completed time entries yet" />
        </CardContent>
      </Card>
    );
  }

  const formatShiftDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatShiftTime = (start: Date, end: Date) => {
    const startTime = start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const endTime = end.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${startTime} - ${endTime}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hours by Shift</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead className="text-right">Hours Worked</TableHead>
              <TableHead className="text-right">Break Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.shiftDate.toISOString()}>
                <TableCell className="font-medium">
                  {formatShiftDate(shift.shiftDate)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatShiftTime(shift.actualStartTime, shift.actualEndTime)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatHours(shift.totalHours)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatHours(shift.breakHours)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2">
              <TableCell className="font-bold">Total</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {shifts.length} {shifts.length === 1 ? "shift" : "shifts"}
              </TableCell>
              <TableCell className="text-right font-bold text-lg">
                {formatHours(totalHours)}
              </TableCell>
              <TableCell className="text-right font-bold text-lg text-muted-foreground">
                {formatHours(shifts.reduce((sum, s) => sum + s.breakHours, 0))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
