import { LeadSource } from "@/types/lead";

const styles: Record<LeadSource, string> = {
  "CSV Import": "bg-blue-100 text-blue-800",
  "Online Enriched": "bg-amber-100 text-amber-900",
  "Scraped / External": "bg-purple-100 text-purple-800",
  Manual: "bg-slate-200 text-slate-800"
};

export function SourceBadge({ source }: { source: LeadSource }) {
  return <span className={`badge ${styles[source]}`}>{source}</span>;
}
