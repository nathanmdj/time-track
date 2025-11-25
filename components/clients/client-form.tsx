"use client";

import { useState, useEffect } from "react";
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
import type { Client, PayCycleInterval } from "@/lib/supabase/types";

interface ClientFormData {
  name: string;
  email: string;
  hourly_rate: number;
  pay_cycle_interval: PayCycleInterval | "";
  pay_cycle_start_date: string;
}

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  client?: Client;
}

const initialFormData: ClientFormData = {
  name: "",
  email: "",
  hourly_rate: 0,
  pay_cycle_interval: "",
  pay_cycle_start_date: "",
};

export function ClientForm({ open, onOpenChange, onSubmit, client }: ClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email ?? "",
        hourly_rate: client.hourly_rate,
        pay_cycle_interval: client.pay_cycle_interval ?? "",
        pay_cycle_start_date: client.pay_cycle_start_date ?? "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        ...formData,
        email: formData.email || "",
        pay_cycle_interval: formData.pay_cycle_interval || "",
        pay_cycle_start_date: formData.pay_cycle_start_date || "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ClientFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{client ? "Edit Client" : "Add Client"}</DialogTitle>
            <DialogDescription>
              {client ? "Update client details." : "Add a new client to track time for."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Client name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="client@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => handleChange("hourly_rate", parseFloat(e.target.value) || 0)}
                placeholder="50.00"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pay_cycle_interval">Pay Cycle</Label>
              <Select
                value={formData.pay_cycle_interval}
                onValueChange={(value) => handleChange("pay_cycle_interval", value)}
              >
                <SelectTrigger id="pay_cycle_interval">
                  <SelectValue placeholder="Select pay cycle (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly (2 weeks)</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.pay_cycle_interval && (
              <div className="grid gap-2">
                <Label htmlFor="pay_cycle_start_date">Pay Cycle Start Date</Label>
                <Input
                  id="pay_cycle_start_date"
                  type="date"
                  value={formData.pay_cycle_start_date}
                  onChange={(e) => handleChange("pay_cycle_start_date", e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : client ? "Update" : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
