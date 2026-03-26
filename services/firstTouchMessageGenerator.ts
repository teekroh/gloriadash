import type { FirstTouchClassification, Lead, LeadType } from "@/types/lead";
import { resolveEffectiveLocationConfidence } from "@/services/locationConfidence";

/** @deprecated First-touch uses `FirstTouchClassification` only; kept for sample helpers. */
export type FirstTouchSegment = "designer" | "builder" | "cabinet_shop" | "homeowner";

export const FIRST_TOUCH_CLASSIFICATIONS: readonly FirstTouchClassification[] = [
  "designer_architect",
  "builder_contractor",
  "cabinet_shop_partner",
  "homeowner"
] as const;

/** Fields needed for first-touch + follow-up compatibility. */
export type MessageLeadInput = Pick<
  Lead,
  | "id"
  | "firstName"
  | "fullName"
  | "company"
  | "city"
  | "state"
  | "leadType"
  | "source"
  | "enrichmentStatus"
  | "score"
  | "priorityTier"
  | "status"
  | "replyHistory"
  | "locationConfidence"
  | "addressConfidence"
> & {
  tags?: string[];
  latestInbound?: Lead["latestInbound"];
};

export interface RenderedFirstTouch {
  body: string;
  templateId: string;
  classification: FirstTouchClassification;
  variantIndex: number;
  /** True when city/region was intentionally left out of the hook (low confidence or missing city). */
  locationOmitted: boolean;
}

export interface FirstTouchPreviewRow {
  label: string;
  body: string;
  locationOmitted: boolean;
}

export function stableLayerIndex(leadId: string, salt: string, modulo: number): number {
  let h = 2166136261;
  const s = `${leadId}:${salt}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % Math.max(1, modulo);
}

export function stableVariantIndex(leadId: string, variantCount: number): number {
  return stableLayerIndex(leadId, "ab", variantCount);
}

export function mapLeadTypeToFirstTouchClassification(leadType: LeadType): FirstTouchClassification {
  switch (leadType) {
    case "designer":
    case "architect":
      return "designer_architect";
    case "builder":
    case "commercial builder":
      return "builder_contractor";
    case "cabinet shop":
      return "cabinet_shop_partner";
    case "homeowner":
    default:
      return "homeowner";
  }
}

export function mapLeadTypeToSegment(leadType: LeadType): FirstTouchSegment {
  switch (leadType) {
    case "designer":
    case "architect":
      return "designer";
    case "builder":
    case "commercial builder":
      return "builder";
    case "cabinet shop":
      return "cabinet_shop";
    case "homeowner":
    default:
      return "homeowner";
  }
}

function segmentToClassification(segment: FirstTouchSegment): FirstTouchClassification {
  const m: Record<FirstTouchSegment, FirstTouchClassification> = {
    designer: "designer_architect",
    builder: "builder_contractor",
    cabinet_shop: "cabinet_shop_partner",
    homeowner: "homeowner"
  };
  return m[segment];
}

export function firstNameFromLead(lead: MessageLeadInput): string {
  return lead.firstName?.trim() || lead.fullName.split(/\s+/)[0] || "there";
}

function cleanCompany(lead: MessageLeadInput): string | null {
  const c = lead.company?.trim();
  return c || null;
}

function cleanCityState(lead: MessageLeadInput): { city: string | null; state: string | null } {
  return { city: lead.city?.trim() || null, state: lead.state?.trim() || null };
}

/** Gloria positioning lines (B — structure). */
const POSITIONING: string[] = [
  "We're Gloria Custom Cabinetry in Hatfield — custom kitchens, built-ins, finishing, and installs from one shop.",

  "Gloria Custom Cabinetry is based in Hatfield. We take kitchen and built-in work from design through install, with finishing done in-house.",

  "I'm with Gloria Custom Cabinetry in Hatfield. We focus on kitchens and built-ins where the finish work and the install crew actually match the drawings."
];

/** Differentiators (C). */
const DIFFERENTIATORS: string[] = [
  "We keep finishing in-house and run our own install team, which is what keeps mid- to higher-end work honest on site.",

  "Most of our projects sit in that mid-to-upper residential range where execution matters as much as the initial concept.",

  "The differentiator for us is continuity — shop standards, field standards, fewer handoffs."
];

const CTAS: string[] = [
  "Happy to connect if it makes sense.",
  "Happy to connect if it's useful.",
  "Worth connecting if relevant."
];

/** Hooks when location is trusted and city is present (A). */
const HOOKS_WITH_LOCATION: Record<FirstTouchClassification, string[]> = {
  designer_architect: [
    "I came across {{company}} in {{city}}{{statePhrase}} and liked the work.",
    "Noticed {{company}} in {{city}}{{statePhrase}} — thought a short note was fair.",
    "Saw {{company}} out of {{city}}{{statePhrase}} and wanted to reach out."
  ],
  builder_contractor: [
    "I noticed {{company}} in {{city}}{{statePhrase}} on the general side and liked what you're putting in the field.",
    "Came across {{company}} around {{city}}{{statePhrase}} — we're Hatfield-based and always looking for solid regional partners.",
    "Saw {{company}} in {{city}}{{statePhrase}} and thought there might be overlap on fit and finish."
  ],
  cabinet_shop_partner: [
    "I saw {{company}} in {{city}}{{statePhrase}} and thought there might be a fit on overflow or finishing support.",
    "Noticed {{company}} up {{city}}{{statePhrase}} way — we coordinate with shops when timelines or capacity get tight.",
    "Came across {{company}} in {{city}}{{statePhrase}} from the trade side and wanted to introduce our shop."
  ],
  homeowner: [
    "We're working with homeowners in and around {{city}}{{statePhrase}} and wanted to introduce our Hatfield shop.",
    "I saw context for a project in {{city}}{{statePhrase}} and thought a direct note made sense.",
    "We're active near {{city}}{{statePhrase}} on the kitchen side — quick note from Gloria."
  ]
};

/** Neutral hooks — no city (A, low location confidence). */
const HOOKS_NEUTRAL: Record<FirstTouchClassification, string[]> = {
  designer_architect: [
    "I came across {{company}} and wanted to reach out.",
    "Noticed {{company}} — thought a quick, personal note made sense.",
    "Saw your work through {{company}}."
  ],
  builder_contractor: [
    "Came across {{company}} and noticed your projects.",
    "Noticed {{company}} — wanted to connect from the cabinet side.",
    "Saw your firm in passing and thought I'd write from Gloria in Hatfield."
  ],
  cabinet_shop_partner: [
    "Came across {{company}} — we sometimes partner with shops on builds and finishing.",
    "Noticed {{company}} on the trade side and wanted to say hello from our Hatfield shop.",
    "Saw {{company}} listed and thought there might be a fit down the road."
  ],
  homeowner: [
    "We came across your name while looking at projects in the area.",
    "Noticed your details and thought a quick note from our Hatfield shop was appropriate.",
    "Saw your info cross my desk and wanted to reach out personally."
  ]
};

function statePhrase(state: string | null): string {
  if (!state) return "";
  return `, ${state}`;
}

function applyHookTemplate(
  template: string,
  company: string | null,
  city: string | null,
  state: string | null
): string {
  const co = company ?? "";
  const ci = city ?? "";
  const sp = statePhrase(state);
  let out = template
    .replace(/\{\{company\}\}/g, co || "your firm")
    .replace(/\{\{city\}\}/g, ci)
    .replace(/\{\{statePhrase\}\}/g, sp);

  return out.replace(/\s+,/g, ",").replace(/\s{2,}/g, " ").trim();
}

function pickHook(
  classification: FirstTouchClassification,
  leadId: string,
  useLocationHooks: boolean,
  company: string | null,
  city: string | null,
  state: string | null
): string {
  const pool = useLocationHooks ? HOOKS_WITH_LOCATION[classification] : HOOKS_NEUTRAL[classification];
  const salt = useLocationHooks ? "hook_loc" : "hook_neu";
  const idx = stableLayerIndex(leadId, salt, pool.length);
  const tpl = pool[idx];
  return applyHookTemplate(tpl, company, city, state);
}

function assembleBody(firstName: string, hook: string, positioning: string, differentiator: string, cta: string): string {
  const blocks = [`Hi ${firstName},`, "", hook, "", positioning, "", differentiator, "", cta];
  return blocks.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * First-touch outbound — **classification** (lead type) only.
 * Does not use lead score or reply classification. No booking URL in body (soft CTA only).
 */
export function generateFirstTouchMessage(lead: MessageLeadInput, _bookingUnused = ""): RenderedFirstTouch {
  const classification = mapLeadTypeToFirstTouchClassification(lead.leadType);
  const trustedLocation = resolveEffectiveLocationConfidence(lead) === "high";
  const addr = lead.addressConfidence;
  const addressVerifiedForCopy =
    addr !== null && addr !== undefined && !Number.isNaN(addr) && Math.round(addr) >= 86;

  const { city, state } = cleanCityState(lead);
  const company = cleanCompany(lead);

  const allowLocationInHook =
    (trustedLocation || addressVerifiedForCopy) &&
    Boolean(city) &&
    (Boolean(company) || classification === "homeowner");

  const locationOmitted = !allowLocationInHook;

  const hook = pickHook(classification, lead.id, allowLocationInHook, company, city, state);

  const pi = stableLayerIndex(lead.id, "pos", POSITIONING.length);
  const di = stableLayerIndex(lead.id, "diff", DIFFERENTIATORS.length);
  const ci = stableLayerIndex(lead.id, "cta", CTAS.length);

  const positioning = POSITIONING[pi];
  const differentiator = DIFFERENTIATORS[di];
  const cta = CTAS[ci];

  const body = assembleBody(firstNameFromLead(lead), hook, positioning, differentiator, cta);
  const variantIndex = stableLayerIndex(lead.id, "variant", 1_000_000);

  const locTag = allowLocationInHook ? "loc" : "noloc";
  const templateId = `gen:v3:${classification}:${pi}:${di}:${ci}:${locTag}`;

  return {
    body,
    templateId,
    classification,
    variantIndex,
    locationOmitted
  };
}

export function renderFirstTouchForLead(lead: Lead, bookingLinkForCta?: string): RenderedFirstTouch {
  return generateFirstTouchMessage(lead, bookingLinkForCta ?? "");
}

/**
 * Three preview rows per classification: high location, omitted location, tone shift (alternate template salt).
 */
export function generateFirstTouchPreviewRowsForClassification(
  classification: FirstTouchClassification,
  bookingLink = ""
): FirstTouchPreviewRow[] {
  void bookingLink;
  const base = {
    firstName: "Alex",
    fullName: "Alex Rivera",
    company: "Rivera Studio",
    city: "Doylestown",
    state: "PA",
    leadType: "designer" as LeadType,
    source: "CSV Import" as const,
    enrichmentStatus: "none" as const,
    score: 0,
    priorityTier: "Tier B" as const,
    status: "New" as const,
    replyHistory: []
  };

  const leadTypeForClass = (c: FirstTouchClassification): LeadType => {
    switch (c) {
      case "designer_architect":
        return "designer";
      case "builder_contractor":
        return "builder";
      case "cabinet_shop_partner":
        return "cabinet shop";
      case "homeowner":
        return "homeowner";
    }
  };

  const lt = leadTypeForClass(classification);

  const withLoc = generateFirstTouchMessage({
    ...base,
    id: `preview-${classification}-loc`,
    leadType: lt,
    locationConfidence: "high",
    enrichmentStatus: "enriched",
    company: "Rivera Studio",
    city: "Doylestown"
  });

  const noLoc = generateFirstTouchMessage({
    ...base,
    id: `preview-${classification}-noloc`,
    leadType: lt,
    locationConfidence: "low",
    city: "Doylestown",
    company: "Rivera Studio"
  });

  const tone = generateFirstTouchMessage({
    ...base,
    id: `preview-${classification}-tone`,
    leadType: lt,
    locationConfidence: "high",
    enrichmentStatus: "enriched",
    company: "North Main Workshop",
    city: "Lansdale"
  });

  return [
    { label: "With location (high confidence)", body: withLoc.body, locationOmitted: withLoc.locationOmitted },
    { label: "Without location (low confidence)", body: noLoc.body, locationOmitted: noLoc.locationOmitted },
    { label: "Tone variation", body: tone.body, locationOmitted: tone.locationOmitted }
  ];
}

/** @deprecated No longer behavior-driven. */
export function generateFirstTouchSamplesForSegment(segment: FirstTouchSegment, count = 3, bookingLink = ""): string[] {
  const classification = segmentToClassification(segment);
  const rows = generateFirstTouchPreviewRowsForClassification(classification, bookingLink);
  return rows.slice(0, count).map((r) => r.body);
}

export function generateFirstTouchSamplesForLeadType(leadType: LeadType, count = 3, bookingLink = ""): string[] {
  const classification = mapLeadTypeToFirstTouchClassification(leadType);
  const rows = generateFirstTouchPreviewRowsForClassification(classification, bookingLink);
  return rows.slice(0, count).map((r) => r.body);
}
