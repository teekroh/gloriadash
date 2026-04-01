import { NextResponse } from "next/server";
import { processCalBookingPayload } from "@/services/calBookingService";
import { requireAdminApiKey, requireWebhookSecret } from "@/lib/apiRouteSecurity";

/** @deprecated Prefer POST /api/webhooks/cal-booking — same processor. */
export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const bodySecret =
    typeof payload.secret === "string"
      ? payload.secret
      : typeof payload.webhookSecret === "string"
        ? payload.webhookSecret
        : "";
  const secretErr = requireWebhookSecret(request, "CAL_WEBHOOK_SECRET", {
    headerNames: ["x-cal-webhook-secret", "x-webhook-secret", "x-cal-secret", "webhook-secret", "webhook-signature"],
    bodyValues: [bodySecret]
  });
  if (secretErr) {
    const adminErr = requireAdminApiKey(request);
    if (adminErr) return secretErr;
  }
  const result = await processCalBookingPayload(payload);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    duplicate: result.duplicate ?? false,
    leadId: result.leadId,
    message: "Booking webhook processed (legacy path; use /api/webhooks/cal-booking)."
  });
}
