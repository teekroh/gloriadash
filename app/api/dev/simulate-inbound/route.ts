import { NextResponse } from "next/server";
import { processInboundEmail } from "@/services/inboundProcessingService";
import { SIMULATED_INBOUND_SCENARIOS, SimulatedScenario } from "@/services/inboundSimulation";
import { blockInProductionUnlessEnabled, requireAdminApiKey } from "@/lib/apiRouteSecurity";

export async function GET() {
  const blocked = blockInProductionUnlessEnabled("ALLOW_DEV_ROUTES");
  if (blocked) return blocked;
  return NextResponse.json({
    scenarios: Object.keys(SIMULATED_INBOUND_SCENARIOS),
    hint: "POST { leadId, scenario } where scenario is one of the keys."
  });
}

export async function POST(request: Request) {
  const blocked = blockInProductionUnlessEnabled("ALLOW_DEV_ROUTES");
  if (blocked) return blocked;
  const authErr = requireAdminApiKey(request);
  if (authErr) return authErr;
  const body = await request.json().catch(() => ({}));
  const leadId = String(body.leadId ?? "");
  const scenario = body.scenario as SimulatedScenario;
  if (!leadId || !scenario || !(scenario in SIMULATED_INBOUND_SCENARIOS)) {
    return NextResponse.json({ ok: false, error: "leadId and valid scenario required." }, { status: 400 });
  }
  const text = SIMULATED_INBOUND_SCENARIOS[scenario];
  const result = await processInboundEmail(
    {
      fromEmail: "simulator@local.test",
      toEmail: "inbound@gloriacabinetry.com",
      subject: `[dev simulate: ${scenario}]`,
      bodyText: text,
      providerMessageId: `sim-${scenario}-${Date.now()}`,
      receivedAt: new Date()
    },
    { leadIdHint: leadId }
  );
  return NextResponse.json({ ok: result.ok, scenario, text, result });
}
