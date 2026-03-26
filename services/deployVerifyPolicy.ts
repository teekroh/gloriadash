import type { Lead } from "@/types/lead";
import type { EligibilityResult, LaunchCampaignOptions } from "@/services/addressConfidencePolicy";
import { campaignSendEligibility } from "@/services/addressConfidencePolicy";

/** Leads at or above this score must be thumbs-up in Verify before campaign send (unless overridden). */
export const DEPLOY_VERIFY_MIN_SCORE = 75;

export type DeployVerifyVerdict = "approved" | "rejected";

export function leadNeedsDeployVerify(lead: Pick<Lead, "score">): boolean {
  return lead.score >= DEPLOY_VERIFY_MIN_SCORE;
}

/**
 * Blocks campaign sends for high-score leads that are not approved.
 * Returns null when this check does not apply.
 */
export function deployVerifySendGate(
  lead: Pick<Lead, "score" | "deployVerifyVerdict">,
  opts: { includeUnverifiedHighScore?: boolean }
): EligibilityResult | null {
  if (!leadNeedsDeployVerify(lead)) return null;
  if (opts.includeUnverifiedHighScore) return null;
  if (lead.deployVerifyVerdict === "rejected") {
    return { eligible: false, reason: "verify_rejected" };
  }
  if (lead.deployVerifyVerdict !== "approved") {
    return { eligible: false, reason: "verify_pending" };
  }
  return null;
}

/** Verify gate + address/outreach rules — use for campaign preview and launch. */
export function isEligibleForCampaignSend(lead: Lead, opts: LaunchCampaignOptions): boolean {
  const g = deployVerifySendGate(lead, opts);
  if (g && !g.eligible) return false;
  return campaignSendEligibility(lead, opts).eligible;
}
