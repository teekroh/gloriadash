import { NextResponse } from "next/server";
import { enrichLead } from "@/services/persistenceService";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await enrichLead(id);
  if (result.ok === false) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result);
}
