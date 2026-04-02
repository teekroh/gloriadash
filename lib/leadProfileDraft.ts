import type { Lead, LeadType } from "@/types/lead";

/** Lead types shown in Verify + lead library editor (order matches scoring UX). */
export const LEAD_PROFILE_TYPES: LeadType[] = [
  "designer",
  "architect",
  "builder",
  "cabinet shop",
  "commercial builder",
  "homeowner"
];

export type LeadProfileDraft = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  websiteUri: string;
  city: string;
  state: string;
  zip: string;
  leadType: LeadType;
  notes: string;
};

export function leadToProfileDraft(l: Lead): LeadProfileDraft {
  return {
    fullName: l.fullName ?? "",
    company: l.company ?? "",
    email: l.email ?? "",
    phone: l.phone ?? "",
    websiteUri: l.websiteUri ?? "",
    city: l.city ?? "",
    state: l.state ?? "",
    zip: l.zip ?? "",
    leadType: LEAD_PROFILE_TYPES.includes(l.leadType) ? l.leadType : "homeowner",
    notes: l.notes ?? ""
  };
}

/** Body shape for PATCH verify-decision / PATCH /api/leads/[id]. */
export function profileDraftToApiPayload(d: LeadProfileDraft) {
  return {
    fullName: d.fullName,
    company: d.company,
    email: d.email,
    phone: d.phone,
    websiteUri: d.websiteUri,
    city: d.city,
    state: d.state,
    zip: d.zip,
    leadType: d.leadType,
    notes: d.notes
  };
}

export function buildSearchQueryFromProfileDraft(d: LeadProfileDraft): string {
  const parts = [
    `"${d.fullName.trim()}"`,
    d.company?.trim() || undefined,
    [d.city, d.state, d.zip].filter(Boolean).join(" ")
  ].filter(Boolean);
  return parts.join(" ");
}
