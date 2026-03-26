import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapDbLeadToLead } from "@/lib/mappers";
import { DEPLOY_VERIFY_MIN_SCORE } from "@/services/deployVerifyPolicy";

/** Max leads returned in one response (browser memory). `stats.pending` is always the full count. */
const VERIFY_QUEUE_MAX = 2000;

/** Leads with strong scores still awaiting pre-deploy verification. */
export async function GET() {
  const [pending, rejected, approvedHigh] = await Promise.all([
    db.lead.count({
      where: {
        score: { gte: DEPLOY_VERIFY_MIN_SCORE },
        deployVerifyVerdict: null,
        doNotContact: false
      }
    }),
    db.lead.count({ where: { deployVerifyVerdict: "rejected" } }),
    db.lead.count({
      where: {
        score: { gte: DEPLOY_VERIFY_MIN_SCORE },
        deployVerifyVerdict: "approved"
      }
    })
  ]);

  const rows = await db.lead.findMany({
    where: {
      score: { gte: DEPLOY_VERIFY_MIN_SCORE },
      deployVerifyVerdict: null,
      doNotContact: false
    },
    orderBy: [{ score: "desc" }, { fullName: "asc" }, { id: "asc" }],
    take: VERIFY_QUEUE_MAX
  });

  const leads = rows.map(mapDbLeadToLead);
  return NextResponse.json({
    leads,
    stats: {
      pending,
      rejected,
      approvedHigh,
      minScore: DEPLOY_VERIFY_MIN_SCORE,
      loaded: leads.length,
      cappedAt: VERIFY_QUEUE_MAX
    }
  });
}
