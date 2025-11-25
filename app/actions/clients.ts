"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { Client, ClientInsert, ClientUpdate } from "@/lib/supabase/types";
import type { ActionResult } from "./types";

export async function getClients(): Promise<ActionResult<Client[]>> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("name");

    if (error) throw error;
    return { success: true, data: data ?? [] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getClient(id: string): Promise<ActionResult<Client>> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createClient(
  input: ClientInsert
): Promise<ActionResult<Client>> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("clients")
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

export async function updateClient(
  id: string,
  input: ClientUpdate
): Promise<ActionResult<Client>> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("clients")
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

export async function deleteClient(id: string): Promise<ActionResult> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) throw error;
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
