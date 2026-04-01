import { NextResponse } from "next/server";
import { Resend } from "resend";
import { processInboundEmail } from "@/services/inboundProcessingService";
import { requireWebhookSecret } from "@/lib/apiRouteSecurity";

function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Resend `email.received` webhooks: Svix-signed envelope + fetch body via API. Legacy: flat JSON + INBOUND_WEBHOOK_SECRET. */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const svixId = request.headers.get("svix-id");
  const resendSigningSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();

  let fromEmail = "";
  let toEmail = "";
  let subject = "";
  let bodyText = "";
  let bodyHtml = "";
  let providerMessageId: string | undefined;

  if (svixId && resendSigningSecret) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Server misconfiguration: RESEND_API_KEY required to load inbound email bodies." },
        { status: 503 }
      );
    }

    let event: unknown;
    try {
      const resend = new Resend(apiKey);
      event = resend.webhooks.verify({
        payload: rawBody,
        webhookSecret: resendSigningSecret,
        headers: {
          id: svixId,
          timestamp: request.headers.get("svix-timestamp") ?? "",
          signature: request.headers.get("svix-signature") ?? ""
        }
      });
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 401 });
    }

    const ev = event as { type?: string; data?: { email_id?: string } };
    if (ev.type !== "email.received") {
      return NextResponse.json({ ok: true, skipped: true, eventType: ev.type ?? null });
    }

    const emailId = ev.data?.email_id;
    if (!emailId) {
      return NextResponse.json({ ok: false, error: "Missing email_id in email.received payload." }, { status: 400 });
    }

    const resend = new Resend(apiKey);
    const { data: received, error } = await resend.emails.receiving.get(emailId);
    if (error || !received) {
      return NextResponse.json(
        {
          ok: false,
          error: "Could not load received email from Resend.",
          detail: error && typeof error === "object" && "message" in error ? String((error as { message?: string }).message) : null
        },
        { status: 502 }
      );
    }

    fromEmail = String(received.from ?? "").trim();
    toEmail = (received.to?.[0] != null ? String(received.to[0]) : "").trim();
    subject = String(received.subject ?? "").trim();
    bodyHtml = String(received.html ?? "").trim();
    bodyText = String(received.text ?? "").trim();
    if (!bodyText && bodyHtml) bodyText = htmlToPlainText(bodyHtml);
    providerMessageId = received.message_id ? String(received.message_id) : undefined;
  } else {
    if (svixId && process.env.NODE_ENV === "production" && !resendSigningSecret) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This request is Svix-signed (Resend). Set RESEND_WEBHOOK_SECRET to the signing secret from Resend → your webhook details."
        },
        { status: 503 }
      );
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody || "{}") as Record<string, unknown>;
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
    }

    fromEmail = String(payload.from ?? payload.from_email ?? payload.From ?? "").trim();
    toEmail = String(payload.to ?? payload.to_email ?? "").trim();
    subject = String(payload.subject ?? "").trim();
    bodyText = String(payload.text ?? payload.body ?? payload.text_body ?? "").trim();
    bodyHtml = String(payload.html ?? "").trim();

    const bodySecret =
      typeof payload.webhookSecret === "string"
        ? payload.webhookSecret
        : typeof payload.secret === "string"
          ? payload.secret
          : "";
    const secretErr = requireWebhookSecret(request, "INBOUND_WEBHOOK_SECRET", {
      headerNames: ["x-inbound-webhook-secret", "x-webhook-secret", "webhook-secret"],
      bodyValues: [bodySecret]
    });
    if (secretErr) return secretErr;

    providerMessageId =
      String(payload.provider_message_id ?? payload.message_id ?? "").trim() || undefined;
  }

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
