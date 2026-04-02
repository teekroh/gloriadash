import { NextResponse } from "next/server";
import { blockInProductionUnlessEnabled, requireAdminApiKey } from "@/lib/apiRouteSecurity";
import { cleanSlateOutreachData } from "@/services/persistenceService";

export async function GET() {
  const blocked = blockInProductionUnlessEnabled("ALLOW_DEV_ROUTES");
  if (blocked) return blocked;
  return NextResponse.json({
    hint: "POST with admin key wipes messages, campaigns, inbound, follow-ups, bookings, notifications; resets all leads to New + Verify cleared (keeps DNC, scores). Clears dashboard dry-run override."
  });
}

export async function POST(request: Request) {
  const blocked = blockInProductionUnlessEnabled("ALLOW_DEV_ROUTES");
  if (blocked) return blocked;
  const authErr = requireAdminApiKey(request);
  if (authErr) return authErr;
  const data = await cleanSlateOutreachData();
  return NextResponse.json(data);
}
