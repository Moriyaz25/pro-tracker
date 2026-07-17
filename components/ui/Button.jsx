"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30",
  outline: "border border-brand-200 text-brand-600 bg-white",
  ghost: "text-brand-600 bg-transparent",
  danger: "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30",
};

export default function Button({
  children,
  variant = "primary",
  className,
  loading = false,
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={clsx(
        "ripple relative flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </motion.button>
  );
}
