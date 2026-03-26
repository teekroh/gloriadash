import { NextResponse } from "next/server";
import { markLeadNotInterested } from "@/services/persistenceService";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await markLeadNotInterested(id);
  return NextResponse.json({ ok: true });
}
