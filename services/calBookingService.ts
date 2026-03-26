import { db } from "@/lib/db";
import { markBooked } from "@/services/markBookedService";
import { getBookingLink } from "@/config/bookingCopy";

type Json = Record<string, unknown>;

function asObj(v: unknown): Json | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : null;
}

/** Normalize Cal.com / Zapier-style emails */
function normEmail(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Process Cal.com (or mock) booking webhook payload.
 * Resolves lead by explicit leadId, then attendee email.
 * @see config/calcomSetup.ts for event + URL guidance
 */
export async function processCalBookingPayload(body: unknown): Promise<{
  ok: boolean;
  duplicate?: boolean;
  error?: string;
  leadId?: string;
}> {
  const root = asObj(body) ?? {};
  const isMock = root.mock === true;

  const eventType = detectCalBookingEventType(body) ?? (isMock ? "booking.created" : undefined);

  let leadId: string | null = root.leadId ? String(root.leadId) : null;
  let externalBookingId: string | undefined;
  let meetingStart: string | undefined;
  let meetingEnd: string | undefined;
  let campaignId: string | undefined =
    root.campaignId !== undefined && root.campaignId !== null ? String(root.campaignId) : undefined;
  let attendeeEmail: string | null = null;

  const rootHasLegacyFields =
    isMock ||
    Boolean(root.bookingUid) ||
    Boolean(leadId && (root.startTime || root.start || root.bookingId || root.uid || root.id));

  if (rootHasLegacyFields) {
    externalBookingId =
      (root.bookingUid as string) ||
      (root.bookingId as string) ||
      (root.uid as string) ||
      (root.id as string | undefined)?.toString() ||
      `mock-${Date.now()}`;
    meetingStart = (root.startTime as string) || (root.start as string);
    meetingEnd = (root.endTime as string) || (root.end as string);
    if (!meetingStart) {
      const s = new Date();
      s.setDate(s.getDate() + 1);
      s.setHours(10, 0, 0, 0);
      meetingStart = s.toISOString();
      meetingEnd = new Date(s.getTime() + 15 * 60 * 1000).toISOString();
    }
    if (!meetingEnd && meetingStart) {
      meetingEnd = new Date(new Date(meetingStart).getTime() + 15 * 60 * 1000).toISOString();
    }
  }

  const payload = asObj(root.payload);
  const bookingFromPayload = asObj(payload?.booking) ?? asObj(payload) ?? asObj(root.booking);

  if (bookingFromPayload && !isMock) {
    externalBookingId =
      (bookingFromPayload.id as string)?.toString() ||
      (bookingFromPayload.uid as string) ||
      (bookingFromPayload.bookingId as string)?.toString() ||
      externalBookingId;
    meetingStart =
      (bookingFromPayload.startTime as string) ||
      (bookingFromPayload.start as string) ||
      (bookingFromPayload.startTimeUtc as string) ||
      meetingStart;
    meetingEnd =
      (bookingFromPayload.endTime as string) ||
      (bookingFromPayload.end as string) ||
      (bookingFromPayload.endTimeUtc as string) ||
      meetingEnd;

    const responses = bookingFromPayload.responses as Json | undefined;
    const attendees = bookingFromPayload.attendees as unknown;
    if (Array.isArray(attendees) && attendees[0] && typeof attendees[0] === "object") {
      const a = attendees[0] as Json;
      attendeeEmail = (a.email as string) || null;
    }
    if (!attendeeEmail && responses?.email) attendeeEmail = String(responses.email);
  }

  if (!leadId && attendeeEmail) {
    const lead = await db.lead.findFirst({
      where: { email: normEmail(attendeeEmail) }
    });
    leadId = lead?.id ?? null;
  }

  if (!leadId) {
    console.warn("[Cal Booking] could not resolve lead for event", {
      eventType,
      hasAttendeeEmail: Boolean(attendeeEmail),
      externalBookingId: externalBookingId ?? null
    });
    return { ok: false, error: "Could not resolve lead (need leadId or attendee email matching a lead)." };
  }

  if (!campaignId) {
    const cl = await db.campaignLead.findFirst({
      where: { leadId },
      orderBy: { assignedAt: "desc" }
    });
    campaignId = cl?.campaignId ?? undefined;
  }

  // Event handlers.
  if (eventType === "booking.created" || !eventType) {
    const result = await markBooked(leadId, {
      externalBookingId,
      meetingStart,
      meetingEnd,
      campaignId: campaignId ?? undefined
    });
    if (!result.ok) return { ok: false, error: result.error ?? "markBooked failed" };
    return { ok: true, duplicate: result.duplicate, leadId };
  }

  if (eventType === "booking.rescheduled") {
    const now = new Date();
    const link = getBookingLink() || null;
    const where =
      externalBookingId && externalBookingId.trim()
        ? { leadId, externalBookingId }
        : { leadId };

    // Prefer updating the existing confirmed booking when possible.
    const existing = await db.booking.findFirst({
      where: where as any,
      orderBy: { createdAt: "desc" }
    });

    if (existing) {
      await db.booking.update({
        where: { id: existing.id },
        data: {
          status: "booked",
          note: "Booking rescheduled",
          bookingLink: link ?? existing.bookingLink ?? null,
          externalBookingId: existing.externalBookingId ?? externalBookingId ?? null,
          bookedAt: now,
          meetingStart: meetingStart ? new Date(meetingStart) : null,
          meetingEnd: meetingEnd ? new Date(meetingEnd) : null,
          meetingStatus: "confirmed"
        }
      });
      await db.message.create({
        data: {
          id: String(`msg-${Date.now()}-${Math.random()}`),
          leadId,
          campaignId: campaignId ?? null,
          direction: "outbound",
          kind: "system_auto",
          body: "[Auto] Booking rescheduled",
          sentAt: now,
          status: "sent"
        }
      });
    } else {
      // No matching booking: create a booking row so the event isn't lost.
      const result = await markBooked(leadId, {
        externalBookingId,
        meetingStart,
        meetingEnd,
        campaignId: campaignId ?? undefined
      });
      if (!result.ok) return { ok: false, error: result.error ?? "markBooked failed" };
    }

    await db.lead.update({
      where: { id: leadId },
      data: { status: "Booked", updatedAt: new Date() }
    });

    return { ok: true, leadId };
  }

  if (eventType === "booking.cancelled") {
    const now = new Date();
    const where =
      externalBookingId && externalBookingId.trim()
        ? { leadId, externalBookingId }
        : { leadId };

    const existing = await db.booking.findFirst({
      where: where as any,
      orderBy: { createdAt: "desc" }
    });

    if (existing) {
      await db.booking.update({
        where: { id: existing.id },
        data: {
          status: "cancelled",
          note: "Booking cancelled",
          meetingStart: existing.meetingStart,
          meetingEnd: existing.meetingEnd,
          meetingStatus: "cancelled",
          bookedAt: now
        }
      });

      await db.message.create({
        data: {
          id: String(`msg-${Date.now()}-${Math.random()}`),
          leadId,
          campaignId: campaignId ?? null,
          direction: "outbound",
          kind: "system_auto",
          body: "[Auto] Booking cancelled",
          sentAt: now,
          status: "sent"
        }
      });

      // If they were previously marked as Booked, return them to Interested so automation can resume.
      const lead = await db.lead.findUnique({ where: { id: leadId }, select: { status: true } });
      if (lead?.status === "Booked") {
        await db.lead.update({
          where: { id: leadId },
          data: { status: "Interested", updatedAt: new Date() }
        });
      }
    }

    return { ok: true, leadId };
  }

  // Unknown event type: still ok, but we don't change booking state.
  return { ok: true, leadId };
}

/**
 * Extract Cal.com event type string like `booking.created`.
 * Cal payload shapes vary by integration; we try the common locations.
 */
export function detectCalBookingEventType(body: unknown): string | undefined {
  const root = asObj(body) ?? {};
  const direct =
    root.event && typeof root.event === "string"
      ? root.event
      : (root.type && typeof root.type === "string" ? root.type : undefined);

  if (direct && direct.includes("booking.")) return direct;

  const eventObj = root.event && typeof root.event === "object" ? (root.event as Record<string, unknown>) : null;
  const fromEventObj =
    eventObj?.type && typeof eventObj.type === "string"
      ? eventObj.type
      : eventObj?.eventType && typeof eventObj.eventType === "string"
        ? eventObj.eventType
        : undefined;
  if (fromEventObj && fromEventObj.includes("booking.")) return fromEventObj;

  const payload = asObj(root.payload);
  const payloadType =
    (payload?.eventType && typeof payload.eventType === "string" ? payload.eventType : undefined) ||
    (payload?.type && typeof payload.type === "string" ? payload.type : undefined);
  if (payloadType && payloadType.includes("booking.")) return payloadType;

  return undefined;
}
