"use client";

import { useState, useEffect } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startTimer, stopTimer } from "@/app/actions";
import { formatTimerDisplay } from "@/lib/utils/format";
import type { Client, TimeEntry } from "@/lib/supabase/types";

interface TimerProps {
  clients: Client[];
  initialActiveEntry: TimeEntry | null;
  onEntryAdded: (entry: TimeEntry) => void;
}

export function Timer({ clients, initialActiveEntry, onEntryAdded }: TimerProps) {
  const [isRunning, setIsRunning] = useState(() => Boolean(initialActiveEntry));
  const [selectedClientId, setSelectedClientId] = useState(
    () => initialActiveEntry?.client_id ?? ""
  );
  const [description, setDescription] = useState(
    () => initialActiveEntry?.description ?? ""
  );
  const [startTime, setStartTime] = useState<Date | null>(
    () => (initialActiveEntry ? new Date(initialActiveEntry.start_time) : null)
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (initialActiveEntry) {
      return Math.floor(
        (Date.now() - new Date(initialActiveEntry.start_time).getTime()) / 1000
      );
    }
    return 0;
  });
  const [activeEntryId, setActiveEntryId] = useState<string | null>(
    () => initialActiveEntry?.id ?? null
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStart = async () => {
    if (!selectedClientId) {
      alert("Please select a client first");
      return;
    }

    const result = await startTimer(selectedClientId, description);
    if (result.success) {
      setActiveEntryId(result.data.id);
      setStartTime(new Date(result.data.start_time));
      setElapsedSeconds(0);
      setIsRunning(true);
    } else {
      console.error("Failed to start timer:", result.error);
    }
  };

  const handleStop = async () => {
    if (!activeEntryId) return;

    const durationMinutes = Math.ceil(elapsedSeconds / 60);
    const result = await stopTimer(activeEntryId, durationMinutes, description);

    if (result.success) {
      onEntryAdded(result.data);
      setIsRunning(false);
      setActiveEntryId(null);
      setStartTime(null);
      setElapsedSeconds(0);
      setDescription("");
    } else {
      console.error("Failed to stop timer:", result.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Timer
          {isRunning && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold tabular-nums">
            {formatTimerDisplay(elapsedSeconds)}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Client</Label>
            <Select
              value={selectedClientId}
              onValueChange={setSelectedClientId}
              disabled={isRunning}
            >
              <SelectTrigger id="client">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
            />
          </div>
        </div>

        <div className="flex justify-center">
          {isRunning ? (
            <Button onClick={handleStop} variant="destructive" size="lg" className="w-full">
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              size="lg"
              className="w-full"
              disabled={!selectedClientId || clients.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
