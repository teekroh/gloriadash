import { NextResponse } from "next/server";
import { recalculateAllLeadScores } from "@/services/persistenceService";

/** POST to re-apply `scoreLeadBase` to every row (distance / spend / lead type only). Local dev helper. */
export async function POST() {
  const updated = await recalculateAllLeadScores();
  return NextResponse.json({ ok: true, updated });
}
