"use client";

import {
  addressBandLabel,
  addressConfidenceBand,
  type AddressConfidenceBand
} from "@/services/addressConfidencePolicy";

const BAND_STYLES: Record<AddressConfidenceBand, string> = {
  strong: "bg-emerald-100 text-emerald-900 border-emerald-200",
  good: "bg-lime-100 text-lime-900 border-lime-200",
  caution: "bg-amber-100 text-amber-950 border-amber-200",
  weak: "bg-orange-100 text-orange-950 border-orange-200",
  poor: "bg-rose-100 text-rose-950 border-rose-200",
  unknown: "bg-slate-100 text-slate-600 border-slate-200"
};

export const ADDRESS_CONFIDENCE_TOOLTIP =
  "0–100 from a confidence pass on the lead address. 86+ = strong / web-verified; 71–85 = full address likely usable; 51–70 = city fit uncertain; 31–50 = weak detail; 10 or below = very poor. Unknown = not set (treated cautiously for outreach).";

export function AddressConfidenceBadge({
  score,
  showLabel = false,
  className = ""
}: {
  score: number | null | undefined;
  showLabel?: boolean;
  className?: string;
}) {
  const band = addressConfidenceBand(score);
  const label = addressBandLabel(band);
  const display =
    score === null || score === undefined || Number.isNaN(score) ? "—" : `${Math.round(score)}`;
  return (
    <span
      title={ADDRESS_CONFIDENCE_TOOLTIP}
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${BAND_STYLES[band]} ${className}`}
    >
      {display}
      {showLabel ? <span className="font-normal opacity-90">{label}</span> : null}
    </span>
  );
}
