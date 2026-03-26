import { LeadSource } from "@/types/lead";

const styles: Record<LeadSource, string> = {
  "CSV Import": "bg-stone-100 text-slate-900",
  "Online Enriched": "bg-amber-100 text-amber-900",
  "Scraped / External": "bg-neutral-200 text-neutral-900",
  Manual: "bg-slate-200 text-slate-800"
};

export function SourceBadge({ source }: { source: LeadSource }) {
  return <span className={`badge ${styles[source]}`}>{source}</span>;
}
