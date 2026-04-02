import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeWebsiteHost } from "@/services/placesLeadDiscoveryService";
import { scoreLeadBase } from "@/services/scoringService";
import type { LeadSource, LeadType } from "@/types/lead";

const UNKNOWN_SCORE_PENALTY = 20;

const LEAD_TYPES: LeadType[] = [
  "designer",
  "architect",
  "builder",
  "cabinet shop",
  "commercial builder",
  "homeowner"
];

function normalizeEmailInput(value: string): string | null {
  const t = value.trim().toLowerCase();
  if (!t) return null;
  if (!t.includes("@")) return null;
  return t;
}

function splitFullName(raw: string): { firstName: string; lastName: string; fullName: string } {
  const fn = raw.trim().replace(/\s+/g, " ");
  if (!fn) return { firstName: "", lastName: "", fullName: "" };
  const idx = fn.indexOf(" ");
  if (idx === -1) return { firstName: fn, lastName: "", fullName: fn };
  const firstName = fn.slice(0, idx).trim();
  const lastName = fn.slice(idx + 1).trim();
  return { firstName, lastName, fullName: fn };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const raw = body.verdict;
  const verdict =
    raw === "rejected" ? "rejected" : raw === "approved" ? "approved" : raw === "unknown" ? "unknown" : null;
  if (!verdict) {
    return NextResponse.json({ ok: false, error: "verdict must be approved, rejected, or unknown" }, { status: 400 });
  }
  const existing = await db.lead.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const isoDate = new Date().toISOString().slice(0, 10);

  if (verdict === "unknown") {
    const newScore = Math.max(0, existing.score - UNKNOWN_SCORE_PENALTY);
    const note = `[Verify ${isoDate}] Uncertain — score −${UNKNOWN_SCORE_PENALTY} (not rejected; re-review if score recovers).`;
    const confidenceNotes = [existing.confidenceNotes?.trim(), note].filter(Boolean).join(" \n");
    await db.lead.update({
      where: { id },
      data: {
        score: newScore,
        confidenceNotes,
        updatedAt: new Date()
      }
    });
    return NextResponse.json({ ok: true, verdict: "unknown", score: newScore });
  }

  const p = body.profile;
  if (!p || typeof p !== "object") {
    return NextResponse.json({ ok: false, error: "profile_required" }, { status: 400 });
  }

  const str = (k: string) => (typeof (p as Record<string, unknown>)[k] === "string" ? String((p as Record<string, unknown>)[k]).trim() : "");

  const names = splitFullName(str("fullName"));
  if (!names.firstName) {
    return NextResponse.json({ ok: false, error: "full_name_required" }, { status: 400 });
  }

  const emailRaw = str("email");
  const emailNorm = normalizeEmailInput(emailRaw);
  if (emailRaw && !emailNorm) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  const emailOut = emailNorm ?? "";

  if (emailOut) {
    const duplicate = await db.lead.findFirst({
      where: { email: { equals: emailOut, mode: "insensitive" }, NOT: { id } }
    });
    if (duplicate) {
      return NextResponse.json({ ok: false, error: "duplicate_email" }, { status: 409 });
    }
  }

  const leadTypeRaw = str("leadType") as LeadType;
  if (!LEAD_TYPES.includes(leadTypeRaw)) {
    return NextResponse.json({ ok: false, error: "invalid_lead_type" }, { status: 400 });
  }

  const company = str("company");
  const phone = str("phone");
  const city = str("city");
  const state = str("state");
  const zip = str("zip");
  const notes = typeof (p as Record<string, unknown>).notes === "string" ? String((p as Record<string, unknown>).notes) : "";

  const w = str("websiteUri");
  let websiteUriOut: string | null = null;
  let websiteHostOut: string | null = null;
  if (w) {
    const normalized = w.startsWith("http") ? w : `https://${w}`;
    websiteUriOut = normalized;
    websiteHostOut = normalizeWebsiteHost(normalized);
  }

  const enrichmentStatus = existing.enrichmentStatus === "enriched" ? "enriched" : "none";

  const scored = scoreLeadBase({
    email: emailOut,
    source: existing.source as LeadSource,
    enrichmentStatus,
    distanceMinutes: existing.distanceMinutes,
    amountSpent: existing.amountSpent,
    leadType: leadTypeRaw
  });

  const fullNameOut = names.fullName || `${names.firstName} ${names.lastName}`.trim();

  await db.lead.update({
    where: { id },
    data: {
      firstName: names.firstName,
      lastName: names.lastName,
      fullName: fullNameOut,
      company,
      email: emailOut,
      phone,
      city,
      state,
      zip,
      notes,
      leadType: leadTypeRaw,
      websiteUri: websiteUriOut,
      websiteHost: websiteHostOut,
      score: scored.score,
      conversionScore: scored.conversionScore,
      projectFitScore: scored.projectFitScore,
      estimatedProjectTier: scored.estimatedProjectTier,
      priorityTier: scored.priorityTier,
      scoreBreakdownJson: JSON.stringify(scored.breakdown),
      deployVerifyVerdict: verdict,
      updatedAt: new Date()
    }
  });

  return NextResponse.json({ ok: true, verdict });
}
