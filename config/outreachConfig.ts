const toInt = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const replyToEmail = process.env.OUTREACH_REPLY_TO_EMAIL ?? "hello@example.com";

/** Canonical default when `OUTREACH_EMAIL_SIGNATURE` is unset (same as intended prod value). */
const DEFAULT_OUTREACH_EMAIL_SIGNATURE = `Nicholas Benton
Gloria Custom Cabinetry
Hatfield, PA`;

/**
 * Plain-text signature appended by `sendOutreachEmail` (after body, before optional test footer).
 * Source: `OUTREACH_EMAIL_SIGNATURE`. Real newlines in the env value are preserved; `\n` sequences in a single-line env value become line breaks.
 */
const emailSignatureRaw = process.env.OUTREACH_EMAIL_SIGNATURE;
const emailSignature = (
  emailSignatureRaw !== undefined && emailSignatureRaw !== ""
    ? emailSignatureRaw.replace(/\\n/g, "\n").trim()
    : DEFAULT_OUTREACH_EMAIL_SIGNATURE
);

export const outreachConfig = {
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  fromEmail: process.env.OUTREACH_FROM_EMAIL ?? "Gloria Custom Cabinetry <hello@example.com>",
  replyToEmail,
  emailSignature,
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  dryRun: (process.env.DRY_RUN ?? "true").toLowerCase() === "true",
  dailySendLimit: toInt(process.env.DAILY_SEND_LIMIT, 20),
  campaignSendLimit: toInt(process.env.CAMPAIGN_SEND_LIMIT, 10),
  /** If set, first-touch sends go here and the body notes the intended lead email (safe testing). */
  testToEmail: (process.env.OUTREACH_TEST_TO ?? "").trim().toLowerCase()
};
