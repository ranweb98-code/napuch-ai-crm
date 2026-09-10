"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createLead, updateLead, deleteLead, addActivity } from "@/lib/leads";
import { isChannelSource, isLeadStatus, isActivityType } from "@/lib/constants";

/**
 * Server Action wrappers around the lib/leads.ts data-access layer.
 * Kept intentionally thin: form parsing and redirects live here, all
 * business logic and validation lives in lib/leads.ts so it stays reusable
 * from a future non-form caller (e.g. a webhook route handler).
 */

function requireString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required field: ${key}`);
  }
  return value;
}

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
}

function parseDateInput(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createLeadAction(formData: FormData): Promise<void> {
  const channelSource = requireString(formData, "channelSource");
  const status = requireString(formData, "status");
  if (!isChannelSource(channelSource)) throw new Error("Invalid channel source");
  if (!isLeadStatus(status)) throw new Error("Invalid status");

  const lead = await createLead({
    businessName: requireString(formData, "businessName"),
    contactName: optionalString(formData, "contactName"),
    phone: optionalString(formData, "phone"),
    channelSource,
    status,
    notes: optionalString(formData, "notes"),
    nextFollowUp: parseDateInput(formData.get("nextFollowUp")),
  });

  revalidatePath("/leads");
  revalidatePath("/");
  redirect(`/leads/${lead.id}`);
}

export async function updateLeadAction(id: string, formData: FormData): Promise<void> {
  const channelSource = requireString(formData, "channelSource");
  const status = requireString(formData, "status");
  if (!isChannelSource(channelSource)) throw new Error("Invalid channel source");
  if (!isLeadStatus(status)) throw new Error("Invalid status");

  await updateLead(id, {
    businessName: requireString(formData, "businessName"),
    contactName: optionalString(formData, "contactName"),
    phone: optionalString(formData, "phone"),
    channelSource,
    status,
    notes: optionalString(formData, "notes"),
    nextFollowUp: parseDateInput(formData.get("nextFollowUp")),
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/");
  redirect(`/leads/${id}`);
}

export async function deleteLeadAction(id: string): Promise<void> {
  await deleteLead(id);
  revalidatePath("/leads");
  revalidatePath("/");
  redirect("/leads");
}

export async function addActivityAction(formData: FormData): Promise<void> {
  const leadId = requireString(formData, "leadId");
  const type = requireString(formData, "type");
  if (!isActivityType(type)) throw new Error("Invalid activity type");

  await addActivity(leadId, {
    type,
    content: requireString(formData, "content"),
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  redirect(`/leads/${leadId}`);
}
