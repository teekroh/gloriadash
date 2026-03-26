import { CALCOM_BOOKING_LINK_EXAMPLE } from "./calcomSetup";

export const appConfig = {
  companyName: "Gloria Custom Cabinetry",
  address: "1300 Schwab Rd, Hatfield, PA",
  /** Fallback when BOOKING_LINK / NEXT_PUBLIC_BOOKING_LINK unset — replace with your real Cal event URL. */
  bookingLink: CALCOM_BOOKING_LINK_EXAMPLE,
  maxDistanceMinutes: 60
};
