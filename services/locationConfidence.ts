import type { Lead, LeadSource, LocationConfidenceLevel } from "@/types/lead";

type LeadLike = Pick<
  Lead,
  "source" | "enrichmentStatus" | "tags" | "locationConfidence" | "city" | "company"
>;

/**
 * Effective location confidence for copy (city mention).
 *
 * **High** when any of:
 * - `lead.locationConfidence === "high"` (CRM / manual trust)
 * - `enrichmentStatus === "enriched"` (downstream enrichment completed)
 * - `source === "Online Enriched"` (sourced as already enriched)
 * - tag `verified_location` (explicit operator flag)
 *
 * **Low** when explicit `"low"`, or when none of the above apply.
 * Default without DB field: **low** (do not guess city).
 */
export function resolveEffectiveLocationConfidence(lead: LeadLike): LocationConfidenceLevel {
  const explicit = lead.locationConfidence;
  if (explicit === "low") return "low";
  if (explicit === "high") return "high";

  if (lead.enrichmentStatus === "enriched") return "high";

  const src = lead.source as LeadSource | undefined;
  if (src === "Online Enriched") return "high";

  if (lead.tags?.includes("verified_location")) return "high";

  return "low";
}

/**
 * Optional background validation hook (Google Places, listings, etc.).
 * - Does **not** throw; returns `null` when skipped or inconclusive.
 * - When `GOOGLE_PLACES_API_KEY` is set, a real Places Text Search can be wired here
 *   without blocking message generation — callers update `locationConfidence` on the lead
 *   in a separate persistence path.
 *
 * Currently returns `null` (no automatic upgrade) until an API integration is configured.
 */
export async function tryEnrichLocationConfidenceFromPlaces(
  _lead: Pick<Lead, "company" | "city" | "state">
): Promise<LocationConfidenceLevel | null> {
  const key = typeof process !== "undefined" ? process.env.GOOGLE_PLACES_API_KEY?.trim() : "";
  if (!key) return null;
  // Stub: implement Text Search + structured address match; return "high" only on strong listing match.
  return null;
}
