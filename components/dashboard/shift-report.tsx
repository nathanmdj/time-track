"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared";
import {
  groupTimeEntriesByShift,
  getDefaultPayPeriodRange,
} from "@/lib/utils/calculations";
import { formatHours } from "@/lib/utils/format";
import type { Client, TimeEntry } from "@/lib/supabase/types";
import { RotateCcw } from "lucide-react";

interface ShiftReportProps {
  clients: Client[];
  timeEntries: TimeEntry[];
}

export function ShiftReport({ clients, timeEntries }: ShiftReportProps) {
  const defaultRange = useMemo(() => {
    const { start, end } = getDefaultPayPeriodRange(clients);
    return { start, end };
  }, [clients]);

  const [startDate, setStartDate] = useState<Date | undefined>(defaultRange.start);
  const [endDate, setEndDate] = useState<Date | undefined>(defaultRange.end);

  const handleResetToPayPeriod = () => {
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
  };

  const shifts = useMemo(() => {
    const allShifts = groupTimeEntriesByShift(timeEntries, clients);

    if (!startDate || !endDate) {
      return allShifts;
    }

    // Filter shifts by their shift date (not entry start time)
    // This ensures shifts are properly excluded based on when the shift occurred
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(23, 59, 59, 999);

    return allShifts.filter((shift) => {
      const shiftDateOnly = new Date(shift.shiftDate);
      shiftDateOnly.setHours(0, 0, 0, 0);
      return shiftDateOnly >= normalizedStart && shiftDateOnly <= normalizedEnd;
    });
  }, [timeEntries, clients, startDate, endDate]);
  const totalHours = shifts.reduce((sum, shift) => sum + shift.totalHours, 0);

  const formatPeriodLabel = () => {
    if (!startDate || !endDate) return "";
    const from = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const to = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${from} - ${to}`;
  };

  if (shifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Hours by Shift</CardTitle>
                {startDate && endDate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatPeriodLabel()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder="Start date"
                className="w-auto"
              />
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder="End date"
                className="w-auto"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToPayPeriod}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState title="No completed time entries for selected period" />
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
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Hours by Shift</CardTitle>
              {startDate && endDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPeriodLabel()}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DatePicker
              date={startDate}
              onDateChange={setStartDate}
              placeholder="Start date"
              className="w-auto"
            />
            <DatePicker
              date={endDate}
              onDateChange={setEndDate}
              placeholder="End date"
              className="w-auto"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToPayPeriod}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
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
