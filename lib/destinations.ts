import "server-only";

import {
  DESTINATION_SELECT,
  destinationFromRow,
  isDestinationId,
  toDestinationRow,
  type Destination,
  type DestinationFormInput,
} from "@/lib/destination-model";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

function throwQueryError(operation: string, error: { message: string }): never {
  throw new Error(operation + " failed: " + error.message);
}

export async function listDestinations(): Promise<Destination[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("destinations")
    .select(DESTINATION_SELECT)
    .order("featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throwQueryError("Listing destinations", error);
  }

  return ((data ?? []) as unknown[]).map(destinationFromRow);
}

export async function getDestinationBySlug(
  slug: string,
): Promise<Destination | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return null;
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("destinations")
    .select(DESTINATION_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throwQueryError("Loading destination", error);
  }

  return data ? destinationFromRow(data) : null;
}

export async function listAdminDestinations(): Promise<Destination[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("destinations")
    .select(DESTINATION_SELECT)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throwQueryError("Listing admin destinations", error);
  }

  return ((data ?? []) as unknown[]).map(destinationFromRow);
}

export async function getAdminDestinationById(
  id: string,
): Promise<Destination | null> {
  if (!isDestinationId(id)) {
    return null;
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("destinations")
    .select(DESTINATION_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throwQueryError("Loading admin destination", error);
  }

  return data ? destinationFromRow(data) : null;
}

export async function createAdminDestination(
  input: DestinationFormInput,
): Promise<Destination> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("destinations")
    .insert(toDestinationRow(input))
    .select(DESTINATION_SELECT)
    .single();

  if (error || !data) {
    throw new Error("Creating destination failed: " + (error?.message ?? "no row returned"));
  }

  return destinationFromRow(data);
}

export async function updateAdminDestination(
  id: string,
  input: DestinationFormInput,
): Promise<Destination> {
  if (!isDestinationId(id)) {
    throw new Error("Invalid destination id.");
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("destinations")
    .update(toDestinationRow(input))
    .eq("id", id)
    .select(DESTINATION_SELECT)
    .single();

  if (error || !data) {
    throw new Error("Updating destination failed: " + (error?.message ?? "no row returned"));
  }

  return destinationFromRow(data);
}

export async function deleteAdminDestination(id: string): Promise<void> {
  if (!isDestinationId(id)) {
    throw new Error("Invalid destination id.");
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("destinations").delete().eq("id", id);

  if (error) {
    throwQueryError("Deleting destination", error);
  }
}
