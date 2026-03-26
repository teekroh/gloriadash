import { LeadStatus } from "@/types/lead";

const styles: Record<LeadStatus, string> = {
  New: "bg-slate-100 text-slate-700",
  Qualified: "bg-stone-200 text-stone-900",
  "In Campaign": "bg-zinc-200 text-zinc-900",
  Interested: "bg-neutral-200 text-neutral-900",
  "Needs Review": "bg-orange-100 text-orange-700",
  "Booking Sent": "bg-stone-100 text-stone-900",
  Booked: "bg-slate-300 text-slate-900",
  "Not Interested": "bg-rose-100 text-rose-700",
  "Not Now": "bg-yellow-100 text-yellow-800"
};

const hints: Record<LeadStatus, string> = {
  New: "No outreach recorded yet",
  Qualified: "Meets targeting criteria",
  "In Campaign": "Actively in a send sequence",
  Interested: "Positive signal — often followed by booking invite",
  "Needs Review": "Reply needs a human decision or send",
  "Booking Sent": "Intro link emailed — waiting on them to book",
  Booked: "Meeting confirmed on calendar",
  "Not Interested": "Closed lost or opted out of pursuit",
  "Not Now": "Paused — follow up when they re-engage"
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`badge ${styles[status]}`} title={hints[status]}>
      {status}
    </span>
  );
}

const bookingStyles: Record<string, string> = {
  booking_sent: "bg-stone-100 text-stone-900 border border-stone-200",
  booked: "bg-slate-100 text-slate-900 border border-slate-300"
};

const bookingLabels: Record<string, string> = {
  booking_sent: "Invite sent",
  booked: "Confirmed"
};

/** Booking row / record status (pipeline vs calendar). */
export function BookingStatusBadge({ status }: { status: string }) {
  const s = bookingStyles[status] ?? "bg-slate-50 text-slate-800 border border-slate-200";
  const label = bookingLabels[status] ?? status.replace(/_/g, " ");
  const hint =
    status === "booking_sent"
      ? "Cal link delivered — not yet confirmed"
      : status === "booked"
        ? "They picked a time; meeting details recorded"
        : "Booking workflow state";
  return (
    <span className={`badge ${s}`} title={hint}>
      {label}
    </span>
  );
}
