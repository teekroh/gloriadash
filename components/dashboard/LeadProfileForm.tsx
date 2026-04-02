"use client";

import type { LeadProfileDraft } from "@/lib/leadProfileDraft";
import { LEAD_PROFILE_TYPES } from "@/lib/leadProfileDraft";
import type { LeadType } from "@/types/lead";

const fieldInput =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-ink placeholder:text-slate-400";
const fieldLabel = "block text-xs text-slate-600";

type Props = {
  value: LeadProfileDraft;
  onChange: (next: LeadProfileDraft) => void;
  /** Shown under the "Lead profile" title */
  hint?: string;
};

export function LeadProfileForm({ value, onChange, hint }: Props) {
  const set = (patch: Partial<LeadProfileDraft>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-3">
      {hint ? <p className="text-[11px] text-slate-500">{hint}</p> : null}
      <label className={fieldLabel}>
        <span className="font-medium text-brand-ink">Full name</span>
        <input
          type="text"
          autoComplete="off"
          value={value.fullName}
          onChange={(e) => set({ fullName: e.target.value })}
          className={fieldInput}
        />
      </label>
      <label className={fieldLabel}>
        <span className="font-medium text-brand-ink">Company</span>
        <input
          type="text"
          autoComplete="organization"
          value={value.company}
          onChange={(e) => set({ company: e.target.value })}
          className={fieldInput}
        />
      </label>
      <label className={fieldLabel}>
        <span className="font-medium text-brand-ink">Email</span>
        <input
          type="email"
          autoComplete="off"
          value={value.email}
          onChange={(e) => set({ email: e.target.value })}
          className={fieldInput}
          placeholder="name@example.com"
        />
      </label>
      <label className={fieldLabel}>
        <span className="font-medium text-brand-ink">Phone</span>
        <input
          type="text"
          autoComplete="off"
          value={value.phone}
          onChange={(e) => set({ phone: e.target.value })}
          className={fieldInput}
        />
      </label>
      <label className={fieldLabel}>
        <span className="font-medium text-brand-ink">Website</span>
        <input
          type="text"
          autoComplete="off"
          value={value.websiteUri}
          onChange={(e) => set({ websiteUri: e.target.value })}
          className={fieldInput}
          placeholder="https:// or domain.com"
        />
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <label className={fieldLabel}>
          <span className="font-medium text-brand-ink">City</span>
          <input
            type="text"
            autoComplete="address-level2"
            value={value.city}
            onChange={(e) => set({ city: e.target.value })}
            className={fieldInput}
          />
        </label>
        <label className={fieldLabel}>
          <span className="font-medium text-brand-ink">State</span>
          <input
            type="text"
            autoComplete="address-level1"
            value={value.state}
            onChange={(e) => set({ state: e.target.value })}
            className={fieldInput}
          />
        </label>
        <label className={`${fieldLabel} col-span-2 sm:col-span-1`}>
          <span className="font-medium text-brand-ink">ZIP</span>
          <input
            type="text"
            autoComplete="postal-code"
            value={value.zip}
            onChange={(e) => set({ zip: e.target.value })}
            className={fieldInput}
          />
        </label>
      </div>
      <label className={fieldLabel}>
        <span className="font-medium text-brand-ink">Lead type</span>
        <select
          value={value.leadType}
          onChange={(e) => set({ leadType: e.target.value as LeadType })}
          className={fieldInput}
        >
          {LEAD_PROFILE_TYPES.map((lt) => (
            <option key={lt} value={lt}>
              {lt}
            </option>
          ))}
        </select>
      </label>
      <label className={fieldLabel}>
        <span className="font-medium text-brand-ink">Notes</span>
        <textarea
          rows={3}
          value={value.notes}
          onChange={(e) => set({ notes: e.target.value })}
          className={`${fieldInput} resize-y`}
          placeholder="Internal notes"
        />
      </label>
    </div>
  );
}
