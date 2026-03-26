import type { MessageLeadInput } from "@/services/firstTouchMessageGenerator";
import { stableLayerIndex, firstNameFromLead } from "@/services/firstTouchMessageGenerator";

function firstLinePreview(firstTouchBody: string, max = 72): string {
  const line =
    firstTouchBody
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0 && !l.startsWith("Hi ")) || "my last note";
  const t = line.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export function generateFollowUp1Message(lead: MessageLeadInput, firstTouchBody: string): string {
  const fn = firstNameFromLead(lead);
  const ref = firstLinePreview(firstTouchBody);
  const variants = [
    `Hi ${fn} — gentle follow-up on my last note (“${ref}”). Still here if a quick intro helps.`,
    `Hi ${fn} — bumping once. I’d written about ${ref} — reply whenever if it’s relevant.`,
    `Hi ${fn} — soft nudge after my earlier email (${ref}). No pressure.`,
    `Hi ${fn} — following up once on ${ref}. Happy to connect if timing opens up.`,
    `Hi ${fn} — quick check-in after my last message — ${ref}. Still glad to help.`,
    `Hi ${fn} — circling back on ${ref}. Say the word if you want a short call.`,
    `Hi ${fn} — resurfacing my note about ${ref}. Ignore if it’s not a fit.`,
    `Hi ${fn} — light follow-up re: ${ref}. Still around if useful.`
  ];
  const i = stableLayerIndex(lead.id, "fu1", variants.length);
  return variants[i].replace(/\s+/g, " ").trim();
}

export function generateFollowUp2Message(lead: MessageLeadInput): string {
  const fn = firstNameFromLead(lead);
  const variants = [
    `Hi ${fn} — last note from me. If a custom kitchen or millwork project is on your roadmap, I’m happy to do a quick intro when it helps. Otherwise, all good.`,
    `Hi ${fn} — I’ll leave it here. If cabinet or kitchen work comes up later, you’ve got my email — no need to reply.`,
    `Hi ${fn} — final ping from my side. Reach out anytime if a short call becomes useful; otherwise I won’t keep bumping this.`,
    `Hi ${fn} — closing the loop on my side. If timing wasn’t right, no worries — glad to reconnect down the road.`,
    `Hi ${fn} — one last respectful check-in. If midsize kitchen or built-in work ever fits, I’m around; if not, thanks for reading.`,
    `Hi ${fn} — I’ll step back after this. If you ever want a 15-minute intro, just reply — otherwise wishing you a smooth season.`,
    `Hi ${fn} — last touch. Happy to help if projects align; if not, thanks for your time and I’ll stay out of your inbox.`
  ];
  const i = stableLayerIndex(lead.id, "fu2", variants.length);
  return variants[i];
}
