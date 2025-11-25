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
  hours: string;
  minutes: string;
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
  const [formData, setFormData] = useState<TimeEntryFormData>({
    client_id: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    hours: "",
    minutes: "",
  });

  const resetForm = () => {
    setFormData({
      client_id: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      hours: "",
      minutes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const totalMinutes =
        (parseInt(formData.hours) || 0) * 60 + (parseInt(formData.minutes) || 0);

      if (totalMinutes <= 0) {
        alert("Please enter a valid duration");
        return;
      }

      const startTime = new Date(`${formData.date}T09:00:00`);
      const endTime = new Date(startTime.getTime() + totalMinutes * 60 * 1000);

      await onSubmit({
        client_id: formData.client_id,
        description: formData.description || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: totalMinutes,
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save time entry:", error);
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
                <Label htmlFor="entry-hours">Hours</Label>
                <Input
                  id="entry-hours"
                  type="number"
                  min="0"
                  max="24"
                  value={formData.hours}
                  onChange={(e) => handleChange("hours", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entry-minutes">Minutes</Label>
                <Input
                  id="entry-minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={formData.minutes}
                  onChange={(e) => handleChange("minutes", e.target.value)}
                  placeholder="0"
                />
              </div>
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
