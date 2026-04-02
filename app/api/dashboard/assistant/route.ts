import { NextResponse } from "next/server";
import { requireAdminApiKey } from "@/lib/apiRouteSecurity";
import {
  answerDashboardQuestion,
  extractPrimaryUrl,
  importLeadFromWebsiteUrl
} from "@/services/dashboardClaudeAssistant";

export async function POST(request: Request) {
  const authErr = requireAdminApiKey(request);
  if (authErr) return authErr;

  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ ok: false, error: "message_required" }, { status: 400 });
  }

  const ctx = body.context;
  const contextStr =
    typeof ctx === "object" && ctx !== null ? JSON.stringify(ctx, null, 2) : String(ctx ?? "");

  const url = extractPrimaryUrl(message);
  if (url) {
    const result = await importLeadFromWebsiteUrl(url);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error, mode: "website_import" });
    }
    return NextResponse.json({
      ok: true,
      mode: "lead_created",
      leadId: result.id,
      summary: result.summary
    });
  }

  const ans = await answerDashboardQuestion(message, contextStr);
  if (!ans.ok) {
    return NextResponse.json({ ok: false, error: ans.error, mode: "question" });
  }
  return NextResponse.json({ ok: true, mode: "answer", text: ans.answer });
}
