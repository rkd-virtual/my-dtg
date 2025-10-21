import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function FormInput({ label, error, ...rest }: Props) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        {...rest}
        className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
          ${error ? "border-red-500 ring-red-300" : "border-gray-300"}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
