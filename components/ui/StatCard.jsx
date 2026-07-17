"use client";

import { motion } from "framer-motion";
import Card from "./Card";

export default function StatCard({ icon: Icon, label, value, tint = "brand", trend }) {
  const tints = {
    brand: "from-brand-500 to-brand-700",
    green: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <Card className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tints[tint]} text-white shadow-md`}
        >
          {Icon && <Icon size={22} />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-brand-500/80">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-2xl font-bold text-brand-900">{value}</p>
            {trend && (
              <span
                className={clsxTrend(trend)}
              >
                {trend}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function clsxTrend(trend) {
  const positive = String(trend).trim().startsWith("+");
  return `text-xs font-semibold ${positive ? "text-emerald-600" : "text-rose-500"}`;
}
