export type LeadSource = "CSV Import" | "Online Enriched" | "Scraped / External" | "Manual";

/** First-touch outbound persona — maps from `LeadType`. */
export type FirstTouchClassification =
  | "designer_architect"
  | "builder_contractor"
  | "cabinet_shop_partner"
  | "homeowner";

export type LocationConfidenceLevel = "high" | "low";

export type LeadType =
  | "designer"
  | "architect"
  | "builder"
  | "cabinet shop"
  | "homeowner"
  | "commercial builder";
export type PriorityTier = "Tier A" | "Tier B" | "Tier C" | "Tier D";
export type ProjectTier = "Sub-$20k" | "$20k-$40k" | "$40k-$100k" | "$100k-$300k" | "$300k+";
export type LeadStatus =
  | "New"
  | "Qualified"
  | "In Campaign"
  | "Interested"
  | "Needs Review"
  | "Booking Sent"
  | "Booked"
  | "Not Interested"
  | "Not Now";

export interface TimelineItem {
  at: string;
  kind: "outbound" | "inbound" | "booking" | "campaign" | "system";
  label: string;
  detail: string;
  isAuto: boolean;
}

export interface LatestInboundMeta {
  id: string;
  snippet: string;
  classification: ReplyCategory;
  confidence: number;
  suggestedAction: string;
  suggestedReplyDraft?: string;
  classificationReason?: string;
  classifierExplanation?: string;
  needsReview: boolean;
  mixedIntent?: boolean;
  automationAllowed?: boolean;
  automationBlockedReason?: string | null;
  receivedAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zip: string;
  leadType: LeadType;
  source: LeadSource;
  sourceDetail: string;
  amountSpent: number;
  notes: string;
  distanceMinutes: number;
  score: number;
  conversionScore: number;
  projectFitScore: number;
  estimatedProjectTier: ProjectTier;
  priorityTier: PriorityTier;
  status: LeadStatus;
  doNotContact: boolean;
  /** Pre-deploy Verify tab: null = not yet reviewed (required for score ≥ threshold to send). */
  deployVerifyVerdict?: "approved" | "rejected" | null;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  createdAt: string;
  updatedAt: string;
  enrichmentStatus?: "none" | "enriched";
  /** Trust level for referencing city in first-touch copy; see `resolveEffectiveLocationConfidence`. */
  locationConfidence?: LocationConfidenceLevel;
  /** 0–100 from CSV confidence pass; see `addressConfidencePolicy`. */
  addressConfidence?: number | null;
  /** Explanation from confidence pass (CSV). */
  confidenceNotes?: string;
  importedFromCsv: boolean;
  /** Optional CRM / routing tags for message generation. */
  tags?: string[];
  outreachHistory: Array<{ at: string; message: string; campaignId: string }>;
  replyHistory: Array<{ at: string; text: string; classification: ReplyCategory; confidence?: number }>;
  bookingHistory: Array<{
    at: string;
    status: string;
    note: string;
    bookingLink?: string;
    bookedAt?: string;
    meetingStart?: string;
    meetingEnd?: string;
    meetingStatus?: string;
    externalBookingId?: string;
  }>;
  timeline?: TimelineItem[];
  latestInbound?: LatestInboundMeta;
  scoreBreakdown?: {
    locationScore: number;
    financialCapacityScore: number;
    leadTypeScore: number;
    intentSignalScore: number;
    projectFitScore: number;
    relationshipScore: number;
    conversionProbabilityScore: number;
    largeProjectPenalty: number;
  };
}

export type ReplyCategory =
  | "positive"
  | "asks_for_link"
  | "suggested_time"
  | "pricing_question"
  | "info_request"
  | "objection"
  | "not_now"
  | "unsubscribe"
  | "unclear";
