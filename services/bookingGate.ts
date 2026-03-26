import { db } from "@/lib/db";

/** True when lead is already on the calendar — do not send another booking invite. */
export async function shouldSuppressBookingInvite(leadId: string): Promise<boolean> {
  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { status: true } });
  if (lead?.status === "Booked") return true;
  const confirmed = await db.booking.findFirst({
    where: {
      leadId,
      status: "booked",
      meetingStatus: "confirmed"
    }
  });
  return Boolean(confirmed);
}
