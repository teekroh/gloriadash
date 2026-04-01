import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processInboundEmail } from "@/services/inboundProcessingService";
import { SIMULATED_INBOUND_SCENARIOS, SIMULATED_SCENARIO_ORDER, SimulatedScenario } from "@/services/inboundSimulation";
import { blockInProductionUnlessEnabled, requireAdminApiKey } from "@/lib/apiRouteSecurity";

export async function GET() {
  const blocked = blockInProductionUnlessEnabled("ALLOW_DEV_ROUTES");
  if (blocked) return blocked;
  return NextResponse.json({
    hint: "POST with no body runs one simulated inbound per classification, using the top leads by score (unique lead per scenario). Respects DRY_RUN for outbound.",
    scenarios: SIMULATED_SCENARIO_ORDER,
    count: SIMULATED_SCENARIO_ORDER.length
  });
}

export async function POST(request: Request) {
  const blocked = blockInProductionUnlessEnabled("ALLOW_DEV_ROUTES");
  if (blocked) return blocked;
  const authErr = requireAdminApiKey(request);
  if (authErr) return authErr;
  const leads = await db.lead.findMany({
    orderBy: { score: "desc" },
    take: SIMULATED_SCENARIO_ORDER.length,
    select: { id: true, email: true }
  });
  if (leads.length < SIMULATED_SCENARIO_ORDER.length) {
    return NextResponse.json(
      { ok: false, error: `Need at least ${SIMULATED_SCENARIO_ORDER.length} leads in the database to seed all categories.` },
      { status: 400 }
    );
  }

  const results: { scenario: SimulatedScenario; leadId: string; ok: boolean; error?: string }[] = [];

  for (let i = 0; i < SIMULATED_SCENARIO_ORDER.length; i++) {
    const scenario = SIMULATED_SCENARIO_ORDER[i];
    const leadId = leads[i].id;
    const text = SIMULATED_INBOUND_SCENARIOS[scenario];
    const r = await processInboundEmail(
      {
        fromEmail: `inbound-seed+${scenario}@gloria.local`,
        toEmail: "inbound@gloriacabinetry.com",
        subject: `[seed sample · ${scenario}]`,
        bodyText: text,
        providerMessageId: `seed-${scenario}-${Date.now()}`,
        receivedAt: new Date()
      },
      { leadIdHint: leadId }
    );
    results.push({ scenario, leadId, ok: r.ok, error: r.error });
  }

  return NextResponse.json({ ok: true, results });
}
