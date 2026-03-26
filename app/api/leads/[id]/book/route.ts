import { NextResponse } from "next/server";
import { processCalBookingPayload } from "@/services/calBookingService";

/** Dev convenience — same code path as Cal webhook simulation. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await processCalBookingPayload({
    mock: true,
    leadId: id
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, duplicate: result.duplicate ?? false });
}
