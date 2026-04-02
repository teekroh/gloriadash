import { NextResponse } from "next/server";
import { outreachConfig } from "@/config/outreachConfig";
import { requireAdminApiKey } from "@/lib/apiRouteSecurity";
import { outreachDryRunFromEnv, setOutreachDryRunOverride } from "@/services/outreachDryRunService";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function allowDashboardLiveWhenEnvDry() {
  return String(process.env.ALLOW_DASHBOARD_LIVE_SEND ?? "").toLowerCase() === "true";
}

/** When set, all `sendOutreachEmail` Resend deliveries use this To — safe to allow dashboard live without blasting lead inboxes. */
function outreachTestInboxConfigured() {
  return Boolean(outreachConfig.testToEmail);
}

/** Preview deploys are for testing; allow dashboard live toggle without changing production env rules. */
function isVercelPreview() {
  return process.env.VERCEL_ENV === "preview";
}

export async function POST(request: Request) {
  const authErr = requireAdminApiKey(request);
  if (authErr) return authErr;

  const body = await request.json().catch(() => ({}));

  if (body.clearOverride === true) {
    await setOutreachDryRunOverride(null);
    return NextResponse.json({ ok: true });
  }

  const mode = body.mode;
  if (mode === "dry") {
    await setOutreachDryRunOverride(true);
    return NextResponse.json({ ok: true });
  }

  if (mode === "live") {
    const canLiveFromDashboard =
      allowDashboardLiveWhenEnvDry() || outreachTestInboxConfigured() || isVercelPreview();
    if (isProduction() && outreachDryRunFromEnv() && !canLiveFromDashboard) {
      return NextResponse.json(
        {
          ok: false,
          code: "dry_run_guard",
          error:
            "DRY_RUN is enabled in the environment (default is on) and this deployment is not a Vercel preview. Add an escape hatch in the host env, then redeploy."
        },
        { status: 403 }
      );
    }
    await setOutreachDryRunOverride(false);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, error: "Invalid body: { mode: 'dry' | 'live' } or { clearOverride: true }" },
    { status: 400 }
  );
}
