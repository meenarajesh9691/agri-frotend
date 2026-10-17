import type { InputHTMLAttributes } from "react";

export function Field({ label, ...rest }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-base font-medium">{label}</span>
      <input {...rest} className="h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-base placeholder:text-stone-500" />
    </label>
  );
}

export function SelectField({ label, children, ...rest }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-base font-medium">{label}</span>
      <select {...rest} className="h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-base">{children}</select>
    </label>
  );
}
