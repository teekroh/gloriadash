/** Legacy: triage queue vs auto-handled reply record. */
export function HandlingBadge({ needsReview }: { needsReview: boolean }) {
  if (needsReview) {
    return (
      <span
        className="badge border border-amber-300 bg-amber-50 text-amber-900"
        title="A human should review and reply (or confirm automation)."
      >
        Needs review
      </span>
    );
  }
  return (
    <span className="badge border border-emerald-200 bg-emerald-50 text-emerald-900" title="Automation ran without a review gate on this reply.">
      Automated
    </span>
  );
}

/** Booking / reply automation outcome with mixed-intent and block reason. */
export function AutomationAuditBadges({
  needsReview,
  automationAllowed,
  automationBlockedReason,
  mixedIntent
}: {
  needsReview: boolean;
  automationAllowed: boolean;
  automationBlockedReason?: string | null;
  mixedIntent?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {automationAllowed ? (
        <span className="badge border border-emerald-200 bg-emerald-50 text-emerald-900">Auto-sent</span>
      ) : needsReview ? (
        <span className="badge border border-amber-300 bg-amber-50 text-amber-900">Review required</span>
      ) : (
        <span className="badge border border-slate-200 bg-slate-50 text-slate-700">No auto action</span>
      )}
      {mixedIntent ? (
        <span className="badge border border-stone-300 bg-stone-100 text-stone-900" title="Multiple intents detected — booking automation blocked unless clearly safe.">
          Mixed intent
        </span>
      ) : null}
      {automationBlockedReason ? (
        <span className="max-w-[200px] truncate rounded border border-amber-200 bg-amber-50/80 px-1.5 py-0.5 text-[10px] text-amber-950" title={automationBlockedReason}>
          Blocked: {automationBlockedReason}
        </span>
      ) : null}
    </div>
  );
}
