"use client";

import { motion } from "framer-motion";
import { HiOutlineFlag, HiOutlineBuildingOffice2, HiOutlineCheckCircle } from "react-icons/hi2";

function fmtTime(ts) {
  const date = ts ? new Date(ts) : null;
  return date ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—";
}

export default function Timeline({ session, visits = [] }) {
  const items = [
    { type: "start", time: session?.startedAt, label: "Started Duty" },
    ...visits.map((v) => ({ type: "visit", time: v.createdAt, label: v.hospitalName, visit: v })),
    session?.endedAt && { type: "end", time: session.endedAt, label: "Ended Duty" },
  ].filter(Boolean);

  return (
    <div className="relative pl-6">
      <div className="absolute bottom-2 left-2 top-2 w-px bg-brand-100" />
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="relative mb-6 last:mb-0"
        >
          <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-4 ring-brand-50">
            {item.type === "start" && <HiOutlineFlag size={13} className="text-emerald-600" />}
            {item.type === "visit" && <HiOutlineBuildingOffice2 size={13} className="text-brand-500" />}
            {item.type === "end" && <HiOutlineCheckCircle size={13} className="text-rose-500" />}
          </div>
          <p className="text-xs font-medium text-brand-400">{fmtTime(item.time)}</p>
          <p className="text-sm font-semibold text-brand-900">{item.label}</p>
          {item.visit && (
            <p className="text-xs text-brand-400">
              {item.visit.doctorName ? `Dr. ${item.visit.doctorName} · ` : ""}
              {item.visit.location?.address}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
