import { LeadStatus } from "@/types/lead";

const styles: Record<LeadStatus, string> = {
  New: "bg-slate-100 text-slate-700",
  Qualified: "bg-emerald-100 text-emerald-700",
  "In Campaign": "bg-cyan-100 text-cyan-700",
  Interested: "bg-teal-100 text-teal-800",
  "Needs Review": "bg-orange-100 text-orange-700",
  "Booking Sent": "bg-indigo-100 text-indigo-700",
  Booked: "bg-emerald-200 text-emerald-900",
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
  booking_sent: "bg-indigo-50 text-indigo-900 border border-indigo-200",
  booked: "bg-emerald-50 text-emerald-900 border border-emerald-200"
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
