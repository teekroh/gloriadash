import { Lead } from "@/types/lead";

export const mockEnrichLead = (lead: Lead): Lead => {
  if (lead.source === "Scraped / External") return lead;
  return {
    ...lead,
    source: lead.source,
    sourceDetail: `${lead.sourceDetail}; enriched with mock web profile`,
    enrichmentStatus: "enriched",
    notes: `${lead.notes} | Enriched: verified local project photos and recent activity.`,
    updatedAt: new Date().toISOString()
  };
};
