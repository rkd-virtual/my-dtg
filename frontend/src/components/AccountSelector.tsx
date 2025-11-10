import React from "react";

export type UserSite = {
  id: number;
  label: string;     // e.g. "Amazon DEN2"
  site_slug: string; // e.g. "DEN2"
  is_default: boolean;
  created_at?: string;
};

type Props = {
  sites?: UserSite[] | null;    // preferred source
  accounts?: string[];         // fallback
  value: string;               // current selected label (controlled)
  onChange: (newAccount: string) => void;
  label?: string;
  selectClassName?: string;
};

export default function AccountSelector({
  sites,
  accounts = [],
  value,
  onChange,
  label = "Select an Account:",
  selectClassName = "rounded-lg border px-7 py-2 text-sm",
}: Props) {
  // Build option labels: prefer sites[].label, else accounts[]
  const siteLabels: string[] = Array.isArray(sites) && sites.length > 0
    ? sites.map((s) => s.label || `Amazon ${s.site_slug}`)
    : accounts;

  // Remove duplicates and empty values while preserving order
  const seen = new Set<string>();
  const options = siteLabels
    .map((s) => (s ?? "").trim())
    .filter((s) => s)
    .filter((s) => {
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });

  // If no options, show a neutral label
  if (options.length === 0) {
    return (
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">{label}</label>
        <div className="text-sm text-gray-500">No account configured</div>
      </div>
    );
  }

  // If only one option, show plain label (no select)
  if (options.length === 1) {
    const single = options[0];
    return (
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">{label}</label>
        <div className="rounded-md bg-gray-50 px-3 py-1 text-sm text-gray-700">{single}</div>
      </div>
    );
  }

  // Multiple options -> dropdown
  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClassName}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
