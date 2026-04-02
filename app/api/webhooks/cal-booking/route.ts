import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { detectCalBookingEventType, processCalBookingPayload } from "@/services/calBookingService";
import { requireAdminApiKey, requireWebhookSecret } from "@/lib/apiRouteSecurity";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getHeader(request: Request, name: string): string | undefined {
  const v = request.headers.get(name);
  const s = v?.toString().trim();
  return s ? s : undefined;
}

function extractSecretCandidate(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const direct = b.secret ?? b.webhookSecret ?? b.calWebhookSecret;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const payload = b.payload;
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const nested = p.secret ?? p.webhookSecret ?? p.calWebhookSecret;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
  }
  return null;
}

function normalizeCalSignature(input: string): string {
  const s = input.trim().toLowerCase();
  return s.startsWith("sha256=") ? s.slice(7) : s;
}

/** Verify Cal.com HMAC-SHA256 against raw request body. */
function verifyCalHmac(secret: string, rawBody: string, signatureHeader: string): boolean {
  try {
    if (!secret || !rawBody || !signatureHeader) return false;
    const provided = normalizeCalSignature(signatureHeader);
    if (!/^[a-f0-9]{64}$/.test(provided)) return false;
    const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(provided, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Cal.com booking webhook endpoint.
 *
 * Configure in Cal.com:
 * - URL: https://<your-host>/api/webhooks/cal-booking
 * - Event types: booking.created / booking.rescheduled / booking.cancelled
 *
 * Secret:
 * - Set `CAL_WEBHOOK_SECRET` in env.
 * - This endpoint checks common Cal/Scheduling webhook secret header names and also payload fields.
 *
 * For now:
 * - Logs full payload.
 * - Returns HTTP 200 with `{ ok: true }`.
 */
export async function POST(request: Request) {
  const receivedAt = new Date().toISOString();
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let rawBody = "";
  let body: unknown = null;
  try {
    rawBody = await request.text();
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    body = null;
  }

  const eventType = detectCalBookingEventType(body);
  const secretFromHeader =
    getHeader(request, "x-cal-webhook-secret") ||
    getHeader(request, "x-webhook-secret") ||
    getHeader(request, "x-cal-secret") ||
    getHeader(request, "webhook-secret") ||
    getHeader(request, "webhook-signature");
  const secretFromPayload = extractSecretCandidate(body);
  const calSignatureHeader =
    getHeader(request, "x-cal-signature-256") ||
    getHeader(request, "x-cal-signature") ||
    getHeader(request, "webhook-signature");
  const calSecretConfigured = Boolean(process.env.CAL_WEBHOOK_SECRET?.trim());

  if (calSecretConfigured) {
    const secret = process.env.CAL_WEBHOOK_SECRET!.trim();
    const hmacOk = verifyCalHmac(secret, rawBody, calSignatureHeader ?? "");
    if (!hmacOk) {
      const secretErr = requireWebhookSecret(request, "CAL_WEBHOOK_SECRET", {
        headerNames: ["x-cal-webhook-secret", "x-webhook-secret", "x-cal-secret", "webhook-secret", "webhook-signature"],
        bodyValues: [secretFromPayload ?? "", secretFromHeader ?? ""]
      });
      if (secretErr) {
        const adminErr = requireAdminApiKey(request);
        if (adminErr) return secretErr;
      }
    }
  } else if (isProduction()) {
    const adminErr = requireAdminApiKey(request);
    if (adminErr) return adminErr;
  }

  console.log(`[Cal Webhook] received`, {
    requestId,
    receivedAt,
    eventType,
    hasBody: Boolean(body),
    secretConfigured: calSecretConfigured,
    calSignaturePresent: Boolean(calSignatureHeader),
    secretHeaderPresent: Boolean(secretFromHeader),
    secretPayloadPresent: Boolean(secretFromPayload),
    secretValidated: true
  });
  let calResult: { ok: boolean; error?: string; leadId?: string; duplicate?: boolean } | null = null;
  try {
    calResult = await processCalBookingPayload(body);
  } catch (err) {
    console.error(`[Cal Webhook] processing error`, { requestId, eventType, error: String(err) });
  }
  console.log(`[Cal Webhook] done`, { requestId, eventType, calResult });
  return NextResponse.json({ ok: true, ...calResult });
}
