import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type LeadStatus = "new" | "contacted" | "interested" | "not_interested" | "converted";
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadNote = Database["public"]["Tables"]["lead_notes"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not authenticated");
  return data.user.id;
}

async function logActivity(leadId: string | null, action: string, description?: string) {
  const user_id = await uid();
  await supabase.from("activities").insert({ user_id, lead_id: leadId, action, description: description ?? null });
}

export async function listLeads() {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getLead(id: string) {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createLead(input: Omit<LeadInsert, "user_id">) {
  const user_id = await uid();
  const { data, error } = await supabase.from("leads").insert({ ...input, user_id }).select().single();
  if (error) throw error;
  await logActivity(data.id, "lead_created", `Lead "${data.name}" was created`);
  return data;
}

export async function updateLead(id: string, patch: Partial<LeadInsert>) {
  const before = await getLead(id);
  const { data, error } = await supabase.from("leads").update(patch).eq("id", id).select().single();
  if (error) throw error;
  if (before && patch.status && patch.status !== before.status) {
    await logActivity(id, "status_changed", `Status changed from ${before.status} to ${patch.status}`);
  } else {
    await logActivity(id, "lead_updated", `Lead "${data.name}" was updated`);
  }
  return data;
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
  await logActivity(null, "lead_deleted", `Lead ${id} was deleted`);
}

export async function listNotes(leadId: string) {
  const { data, error } = await supabase.from("lead_notes").select("*").eq("lead_id", leadId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addNote(leadId: string, content: string) {
  const user_id = await uid();
  const { data, error } = await supabase.from("lead_notes").insert({ lead_id: leadId, user_id, content }).select().single();
  if (error) throw error;
  await logActivity(leadId, "note_added", "A note was added");
  return data;
}

export async function updateNote(id: string, content: string) {
  const { data, error } = await supabase.from("lead_notes").update({ content }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteNote(id: string) {
  const { error } = await supabase.from("lead_notes").delete().eq("id", id);
  if (error) throw error;
}

export async function listActivities(limit = 20, leadId?: string) {
  let q = supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(limit);
  if (leadId) q = q.eq("lead_id", leadId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
