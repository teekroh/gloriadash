import { NextResponse } from "next/server";
import { sendManualReviewReply } from "@/services/persistenceService";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  const text = String(payload.text ?? "").trim();
  const inboundReplyId = payload.inboundReplyId ? String(payload.inboundReplyId) : undefined;
  if (!text) return NextResponse.json({ ok: false, error: "text required" }, { status: 400 });
  const result = await sendManualReviewReply(id, text, inboundReplyId);
  return NextResponse.json(result);
}
