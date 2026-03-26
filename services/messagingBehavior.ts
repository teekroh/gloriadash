import type { Lead, ReplyCategory } from "@/types/lead";

/** @deprecated First-touch is classification-only; this module is unused. */

export const MESSAGING_BEHAVIORS = [
  "cold_low_score",
  "cold_high_score",
  "warm_engaged",
  "pricing_question",
  "high_intent"
] as const;

export type MessagingBehavior = (typeof MESSAGING_BEHAVIORS)[number];

const HIGH_INTENT_CLASSES: ReplyCategory[] = ["positive", "asks_for_link", "suggested_time"];

const ENGAGED_STATUSES: Lead["status"][] = ["Interested", "Booking Sent", "Booked", "Needs Review"];

/** Score floor for "cold but qualified" — medium CTA, sharper line. */
export const COLD_HIGH_SCORE_THRESHOLD = 70;

/** Classifier confidence for treating reply as high intent. */
export const HIGH_INTENT_CONFIDENCE_THRESHOLD = 0.75;

export type BehaviorResolutionLead = Pick<Lead, "score" | "status" | "replyHistory" | "leadType"> & {
  tags?: string[];
  latestInbound?: Lead["latestInbound"];
};

export type ResolveMessagingBehaviorOptions = {
  behaviorOverride?: MessagingBehavior;
  /** When set, overrides lead.latestInbound for this resolution only. */
  latestInboundClassification?: ReplyCategory;
  latestInboundConfidence?: number;
};

function lastReply(lead: BehaviorResolutionLead) {
  const rh = lead.replyHistory;
  if (!rh?.length) return null;
  return rh[rh.length - 1];
}

/**
 * Behavior drives message style; it overrides segment/lead type for copy selection.
 * Priority: override → pricing → high intent (classifier) → warm engaged → cold by score.
 */
export function resolveMessagingBehavior(
  lead: BehaviorResolutionLead,
  opts?: ResolveMessagingBehaviorOptions
): MessagingBehavior {
  if (opts?.behaviorOverride) return opts.behaviorOverride;

  const cls =
    opts?.latestInboundClassification ?? lead.latestInbound?.classification ?? null;
  const conf =
    opts?.latestInboundConfidence ?? lead.latestInbound?.confidence ?? 0;

  if (cls === "pricing_question") return "pricing_question";

  if (cls && HIGH_INTENT_CLASSES.includes(cls) && conf >= HIGH_INTENT_CONFIDENCE_THRESHOLD) {
    return "high_intent";
  }

  const lr = lastReply(lead);
  if (lr && HIGH_INTENT_CLASSES.includes(lr.classification)) {
    const c = lr.confidence ?? 0.82;
    if (c >= HIGH_INTENT_CONFIDENCE_THRESHOLD) return "high_intent";
  }

  const hasReplied = (lead.replyHistory?.length ?? 0) > 0;
  const statusEngaged = ENGAGED_STATUSES.includes(lead.status);
  if (hasReplied || statusEngaged) return "warm_engaged";

  if (lead.score >= COLD_HIGH_SCORE_THRESHOLD) return "cold_high_score";
  return "cold_low_score";
}
