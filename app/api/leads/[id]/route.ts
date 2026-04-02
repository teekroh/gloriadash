import { NextResponse } from "next/server";
import { applyLeadProfileUpdate } from "@/services/leadProfileUpdateService";

/** Update lead profile fields (same shape as Verify). Does not change deploy verify verdict. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await applyLeadProfileUpdate(id, body.profile);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
