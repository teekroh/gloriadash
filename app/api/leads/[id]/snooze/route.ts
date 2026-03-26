import { NextResponse } from "next/server";
import { snoozeLead } from "@/services/persistenceService";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  const followUpAt = String(payload.followUpAt ?? "").trim();
  if (!followUpAt) return NextResponse.json({ ok: false }, { status: 400 });
  await snoozeLead(id, followUpAt);
  return NextResponse.json({ ok: true });
}
