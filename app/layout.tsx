import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gloria Leads",
  description: "Lead qualification, outreach automation, and booking pipeline."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
