import { NextResponse } from "next/server";
import { createManualLead } from "@/services/persistenceService";
import type { CreateManualLeadPayload, Lead, LeadType } from "@/types/lead";

const LEAD_TYPES: LeadType[] = [
  "homeowner",
  "designer",
  "architect",
  "builder",
  "cabinet shop",
  "commercial builder"
];

const LEAD_TYPE_SET = new Set<string>(LEAD_TYPES);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const leadTypeRaw = typeof body.leadType === "string" ? body.leadType : "";
  if (!LEAD_TYPE_SET.has(leadTypeRaw)) {
    return NextResponse.json({ ok: false, error: "invalid_lead_type" }, { status: 400 });
  }

  const payload: CreateManualLeadPayload = {
    firstName: String(body.firstName ?? ""),
    lastName: String(body.lastName ?? ""),
    company: String(body.company ?? ""),
    email: String(body.email ?? ""),
    phone: String(body.phone ?? ""),
    city: String(body.city ?? ""),
    state: String(body.state ?? ""),
    zip: String(body.zip ?? ""),
    leadType: leadTypeRaw as Lead["leadType"],
    amountSpent: typeof body.amountSpent === "number" ? body.amountSpent : Number(body.amountSpent),
    distanceMinutes:
      typeof body.distanceMinutes === "number" ? body.distanceMinutes : Number(body.distanceMinutes),
    notes: String(body.notes ?? ""),
    sourceDetail: typeof body.sourceDetail === "string" ? body.sourceDetail : undefined,
    addressConfidence:
      body.addressConfidence === null || body.addressConfidence === ""
        ? null
        : typeof body.addressConfidence === "number"
          ? body.addressConfidence
          : Number(body.addressConfidence)
  };

  const result = await createManualLead(payload);

  if (!result.ok) {
    const status = result.error === "duplicate_email" ? 409 : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
