import { NextResponse } from "next/server";
import { processInboundEmail } from "@/services/inboundProcessingService";

/** Resend-style or generic inbound webhook — mockable shape. */
export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const fromEmail = String(payload.from ?? payload.from_email ?? payload.From ?? "").trim();
  const toEmail = String(payload.to ?? payload.to_email ?? "").trim();
  const subject = String(payload.subject ?? "").trim();
  const bodyText = String(payload.text ?? payload.body ?? payload.text_body ?? "").trim();
  const bodyHtml = String(payload.html ?? "").trim();
  const providerMessageId = String(payload.provider_message_id ?? payload.message_id ?? "").trim() || undefined;

  if (!fromEmail || !bodyText) {
    return NextResponse.json({ ok: false, error: "Missing from or body." }, { status: 400 });
  }

  const result = await processInboundEmail({
    fromEmail,
    toEmail,
    subject,
    bodyText,
    bodyHtml,
    providerMessageId,
    receivedAt: new Date()
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
}
