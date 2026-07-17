import clsx from "clsx";

export default function Select({ label, error, options = [], className, ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      )}
      <select
        className={clsx(
          "field-control appearance-none bg-white",
          error && "border-rose-400 focus:ring-rose-200",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs text-rose-500">{error}</span>}
    </label>
  );
}
