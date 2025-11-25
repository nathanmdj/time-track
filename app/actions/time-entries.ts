"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type {
  TimeEntry,
  TimeEntryInsert,
  TimeEntryUpdate,
  TimeEntryWithClient,
} from "@/lib/supabase/types";
import type { ActionResult } from "./types";

export async function getTimeEntries(): Promise<ActionResult<TimeEntry[]>> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .order("start_time", { ascending: false });

    if (error) throw error;
    return { success: true, data: data ?? [] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getTimeEntriesWithClients(): Promise<
  ActionResult<TimeEntryWithClient[]>
> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("time_entries")
      .select("*, clients(*)")
      .not("end_time", "is", null)
      .order("start_time", { ascending: false })
      .limit(50);

    if (error) throw error;
    return { success: true, data: (data as TimeEntryWithClient[]) ?? [] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getActiveTimeEntry(): Promise<ActionResult<TimeEntry | null>> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .is("end_time", null)
      .order("start_time", { ascending: false })
      .limit(1);

    if (error) throw error;
    return { success: true, data: data?.[0] ?? null };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createTimeEntry(
  input: TimeEntryInsert
): Promise<ActionResult<TimeEntry>> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("time_entries")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateTimeEntry(
  id: string,
  input: TimeEntryUpdate
): Promise<ActionResult<TimeEntry>> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("time_entries")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteTimeEntry(id: string): Promise<ActionResult> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.from("time_entries").delete().eq("id", id);

    if (error) throw error;
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function startTimer(
  clientId: string,
  description?: string
): Promise<ActionResult<TimeEntry>> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        client_id: clientId,
        description: description || null,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function stopTimer(
  id: string,
  durationMinutes: number,
  description?: string
): Promise<ActionResult<TimeEntry>> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("time_entries")
      .update({
        end_time: new Date().toISOString(),
        duration_minutes: durationMinutes,
        description: description || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
