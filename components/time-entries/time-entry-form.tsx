"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client } from "@/lib/supabase/types";

interface TimeEntryFormData {
  client_id: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: string;
}

interface TimeEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    client_id: string;
    description: string | null;
    start_time: string;
    end_time: string;
    duration_minutes: number;
  }) => Promise<void>;
  clients: Client[];
}

export function TimeEntryForm({ open, onOpenChange, onSubmit, clients }: TimeEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TimeEntryFormData>({
    client_id: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "17:00",
    break_minutes: "0",
  });

  const resetForm = () => {
    setFormData({
      client_id: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      start_time: "09:00",
      end_time: "17:00",
      break_minutes: "0",
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const startTime = new Date(`${formData.date}T${formData.start_time}:00`);
      const endTime = new Date(`${formData.date}T${formData.end_time}:00`);
      const breakMinutes = parseInt(formData.break_minutes) || 0;

      if (endTime <= startTime) {
        setError("End time must be after start time");
        return;
      }

      const totalMs = endTime.getTime() - startTime.getTime();
      const totalMinutes = Math.floor(totalMs / (1000 * 60));

      if (breakMinutes < 0) {
        setError("Break time cannot be negative");
        return;
      }

      if (breakMinutes >= totalMinutes) {
        setError("Break time cannot exceed or equal the total work duration");
        return;
      }

      const durationMinutes = totalMinutes - breakMinutes;

      await onSubmit({
        client_id: formData.client_id,
        description: formData.description || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save time entry:", error);
      setError("Failed to save time entry");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof TimeEntryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Manual Entry</DialogTitle>
            <DialogDescription>Manually log time for a client.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="entry-client">Client *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => handleChange("client_id", value)}
              >
                <SelectTrigger id="entry-client">
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
              <Label htmlFor="entry-date">Date *</Label>
              <Input
                id="entry-date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="entry-start-time">Start Time *</Label>
                <Input
                  id="entry-start-time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleChange("start_time", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entry-end-time">End Time *</Label>
                <Input
                  id="entry-end-time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleChange("end_time", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="entry-break">Break (minutes)</Label>
              <Input
                id="entry-break"
                type="number"
                min="0"
                value={formData.break_minutes}
                onChange={(e) => handleChange("break_minutes", e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="entry-description">Description</Label>
              <Input
                id="entry-description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="What did you work on?"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.client_id}>
              {isLoading ? "Saving..." : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
