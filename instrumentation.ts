import { isBookingLinkConfigured } from "@/config/bookingCopy";

/**
 * Next.js instrumentation — runs once on server startup.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!isBookingLinkConfigured()) {
    console.warn(
      "[Gloria] BOOKING_LINK is missing or still a placeholder. Set BOOKING_LINK in .env.local (e.g. https://cal.com/gloriacabinetry/cabinet-project-intro). Setup guide: /setup/cal"
    );
  }
}
