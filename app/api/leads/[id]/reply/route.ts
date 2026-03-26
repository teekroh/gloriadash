import { NextResponse } from "next/server";
import { applyReply } from "@/services/persistenceService";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await request.json();
  const text = String(payload.text || "");
  const classification = await applyReply(id, text);
  return NextResponse.json({ ok: true, classification });
}
