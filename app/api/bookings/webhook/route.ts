import { NextResponse } from "next/server";
import { processCalBookingPayload } from "@/services/calBookingService";

/** @deprecated Prefer POST /api/webhooks/cal-booking — same processor. */
export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
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
