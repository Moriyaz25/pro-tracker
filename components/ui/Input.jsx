import clsx from "clsx";

export default function Input({ label, error, className, ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      )}
      <input
        className={clsx(
          "field-control",
          error && "border-rose-400 focus:ring-rose-200",
          className
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-rose-500">{error}</span>}
    </label>
  );
}
