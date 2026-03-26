import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const verdict = body.verdict === "rejected" ? "rejected" : body.verdict === "approved" ? "approved" : null;
  if (!verdict) {
    return NextResponse.json({ ok: false, error: "verdict must be approved or rejected" }, { status: 400 });
  }
  const existing = await db.lead.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  await db.lead.update({
    where: { id },
    data: { deployVerifyVerdict: verdict, updatedAt: new Date() }
  });
  return NextResponse.json({ ok: true, verdict });
}
