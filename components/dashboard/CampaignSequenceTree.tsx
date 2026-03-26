"use client";

import { useMemo, useState } from "react";
import {
  FIRST_TOUCH_CLASSIFICATIONS,
  generateFirstTouchPreviewRowsForClassification
} from "@/services/firstTouchMessageGenerator";

type NodeCopy = {
  follow1: string;
  follow2: string;
  booking: string;
  pricing: string;
  info: string;
};

const CLASS_LABELS: Record<(typeof FIRST_TOUCH_CLASSIFICATIONS)[number], string> = {
  designer_architect: "Designer / architect",
  builder_contractor: "Builder / contractor",
  cabinet_shop_partner: "Cabinet shop partner",
  homeowner: "Homeowner"
};

const TREE_LABELS = [
  { key: "firstTouch" as const, title: "1 · First touch (classification + location rules)", editable: false },
  { key: "follow1" as const, title: "2 · Follow-up 1 (scheduled)", editable: true },
  { key: "follow2" as const, title: "3 · Follow-up 2 (scheduled)", editable: true },
  { key: "booking" as const, title: "4 · Booking acknowledgment reply", editable: true },
  { key: "pricing" as const, title: "5 · Auto-reply · Pricing question", editable: true },
  { key: "info" as const, title: "6 · Auto-reply · Info request", editable: true }
];

export function CampaignSequenceTree({
  bookingLinkDisplay,
  initialFollow1,
  initialFollow2,
  initialBooking,
  initialPricing,
  initialInfo
}: {
  bookingLinkDisplay: string;
  initialFollow1: string;
  initialFollow2: string;
  initialBooking: string;
  initialPricing: string;
  initialInfo: string;
}) {
  const [copy, setCopy] = useState<NodeCopy>({
    follow1: initialFollow1,
    follow2: initialFollow2,
    booking: initialBooking,
    pricing: initialPricing,
    info: initialInfo
  });

  const classificationSamples = useMemo(
    () =>
      FIRST_TOUCH_CLASSIFICATIONS.map((c) => ({
        classification: c,
        label: CLASS_LABELS[c],
        rows: generateFirstTouchPreviewRowsForClassification(c, bookingLinkDisplay || "")
      })),
    [bookingLinkDisplay]
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-base font-semibold text-slate-900">Campaign sequence (editable)</h3>
      <p className="mt-1 text-xs text-slate-600">
        First-touch copy uses <strong>lead type classification</strong> only (not score or reply classifiers). City appears only when{" "}
        <strong>location confidence</strong> is high. Three examples per classification below. Other nodes are local previews only.
      </p>
      <div className="relative mt-4 border-l-2 border-slate-200 pl-4">
        {TREE_LABELS.map((node, i) => (
          <div key={node.key} className="relative mb-4 last:mb-0">
            <span className="absolute -left-[21px] top-3 h-2.5 w-2.5 rounded-full border-2 border-slate-600 bg-white" />
            {node.key === "firstTouch" ? (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-800">{node.title}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  First-touch uses a soft CTA only (no booking link in body). Booking link for display elsewhere:{" "}
                  <span className="font-mono text-[10px]">{bookingLinkDisplay || "—"}</span>
                </p>
                <div className="mt-3 space-y-5">
                  {classificationSamples.map((block) => (
                    <div key={block.classification}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {block.label}{" "}
                        <span className="font-mono font-normal normal-case text-slate-400">({block.classification})</span>
                      </p>
                      <ul className="mt-1.5 space-y-2">
                        {block.rows.map((row, j) => (
                          <li
                            key={`${block.classification}-${j}`}
                            className="rounded border border-white bg-white p-2 text-[11px] text-slate-700"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-400">sample {j + 1}</span>
                              <span className="text-[10px] text-slate-600">{row.label}</span>
                              {row.locationOmitted ? (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-950">
                                  Location omitted
                                </span>
                              ) : (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-950">
                                  Location in hook
                                </span>
                              )}
                            </div>
                            <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap font-sans leading-snug">{row.body}</pre>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <label className="text-sm font-medium text-slate-800" htmlFor={`seq-${node.key}`}>
                  {node.title}
                </label>
                <textarea
                  id={`seq-${node.key}`}
                  className="mt-2 max-h-48 min-h-[88px] w-full rounded border border-slate-200 p-2 font-sans text-xs leading-relaxed text-slate-800"
                  value={copy[node.key]}
                  onChange={(e) => setCopy((prev) => ({ ...prev, [node.key]: e.target.value }))}
                />
                <p className="mt-1 text-[10px] text-slate-500">Local preview only for this node.</p>
                <div className="mt-2 rounded border border-dashed border-slate-200 bg-slate-50/80 p-2 text-[11px] text-slate-700">
                  <span className="font-semibold text-slate-600">Live preview</span>
                  <pre className="mt-1 max-h-20 overflow-y-auto whitespace-pre-wrap font-sans">{copy[node.key]}</pre>
                </div>
              </div>
            )}
            {i < TREE_LABELS.length - 1 && <div className="absolute left-[-17px] top-full h-4 w-px bg-slate-200" />}
          </div>
        ))}
      </div>
    </div>
  );
}
