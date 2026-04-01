import Link from "next/link";

/** Static root — avoids DB/Prisma on `/` so deploys (e.g. Vercel) always have a working homepage. */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 bg-[#f4f1ec] p-8 text-center">
      <h1 className="text-2xl font-semibold text-brand-ink">Gloria Dashboard</h1>
      <p className="text-sm text-brand-ink/70">
        App is alive. Open the main dashboard for leads, campaigns, inbox, and verify.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-brand-ink shadow-sm hover:bg-brand-dark"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
