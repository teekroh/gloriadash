import { NextResponse } from "next/server";
import { applyLeadProfileUpdate } from "@/services/leadProfileUpdateService";
import { deleteLeadById } from "@/services/persistenceService";
import { requireAdminApiKey } from "@/lib/apiRouteSecurity";

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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdminApiKey(request);
  if (authErr) return authErr;
  const { id } = await params;
  const result = await deleteLeadById(id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
