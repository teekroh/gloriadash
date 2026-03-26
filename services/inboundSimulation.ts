/** Realistic sample bodies — unambiguous where noted; pricing includes scheduling hedging. */
export const SIMULATED_INBOUND_SCENARIOS = {
  positive: `Hi — yes, we're interested in a quick intro.

What's the best way to connect sometime this week?`,

  asks_for_link: `This looks like a good fit. Please send your calendar link so I can book a 15-minute intro.`,

  /** Must classify as pricing_question (not asks_for_link): scheduling hedge + budget question. */
  pricing_question: `Before we schedule anything — roughly what does a typical fast-turn kitchen (cabinets + install) run with you? We're trying to sanity-check budget.`,

  suggested_time: `I'm free Thursday afternoon if you have time — say 2:30 or 3:00? Otherwise Friday morning works.`,

  info_request: `Could you share more about typical lead times, your service radius around Hatfield, and whether you ever partner directly with builders?`,

  objection: `Thanks for the follow-up — we’ve decided to go with another millwork vendor for this project.`,

  not_now: `Not ready to add vendors this month — can we circle back next quarter?`,

  unsubscribe: `Please remove me from this mailing list and stop sending outreach.`,

  unclear: `Got it — traveling today and will read properly tomorrow.`
} as const;

export type SimulatedScenario = keyof typeof SIMULATED_INBOUND_SCENARIOS;

export const SIMULATED_SCENARIO_ORDER: SimulatedScenario[] = [
  "positive",
  "asks_for_link",
  "suggested_time",
  "pricing_question",
  "info_request",
  "objection",
  "not_now",
  "unsubscribe",
  "unclear"
];
