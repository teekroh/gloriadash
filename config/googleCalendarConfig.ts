/**
 * Google Calendar integration for high-confidence "suggested time" auto-booking.
 *
 * Setup (Workspace / shared calendar):
 * 1. Create a Google Cloud project, enable Calendar API.
 * 2. Create a service account; download JSON key.
 * 3. Domain-wide delegation: grant the service account calendar scope for your domain,
 *    OR share the target calendar with the service account email (Editor).
 * 4. For user calendar hello@… without sharing: use domain-wide delegation and set
 *    GOOGLE_CALENDAR_IMPERSONATE=hello@gloriacabinetry.com
 *
 * Env:
 * - GOOGLE_CALENDAR_CREDENTIALS_JSON — full service account JSON (single line in .env.local)
 * - GOOGLE_CALENDAR_ID — calendar to check (default: impersonate email or "primary")
 * - GOOGLE_CALENDAR_IMPERSONATE — subject user for domain-wide delegation
 * - BUSINESS_TIMEZONE — IANA tz, default America/New_York
 */

const trim = (s: string | undefined) => (s ?? "").trim();

export const googleCalendarConfig = {
  credentialsJson: trim(process.env.GOOGLE_CALENDAR_CREDENTIALS_JSON),
  calendarId: trim(process.env.GOOGLE_CALENDAR_ID) || trim(process.env.GOOGLE_CALENDAR_IMPERSONATE) || "primary",
  impersonateUser: trim(process.env.GOOGLE_CALENDAR_IMPERSONATE),
  businessTimezone: trim(process.env.BUSINESS_TIMEZONE) || "America/New_York",
  /** Default intro length when holding a slot from a suggested-time reply. */
  slotMinutes: Math.min(60, Math.max(10, Number(process.env.GOOGLE_CALENDAR_SLOT_MINUTES) || 15))
};

export function isGoogleCalendarConfigured(): boolean {
  if (!googleCalendarConfig.credentialsJson) return false;
  try {
    const j = JSON.parse(googleCalendarConfig.credentialsJson) as { client_email?: string; private_key?: string };
    return Boolean(j.client_email && j.private_key);
  } catch {
    return false;
  }
}
