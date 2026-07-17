"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { HiOutlineMapPin, HiOutlineArrowPath } from "react-icons/hi2";
import { getLiveLocation } from "@/lib/geolocation";

// Fetches a fresh GPS fix on mount and whenever refresh is pressed.
// Manual coordinate entry is intentionally not supported anywhere in the UI.
export default function LiveLocationCard({ onLocation }) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const [error, setError] = useState(null);

  const fetchLocation = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const loc = await getLiveLocation();
      setLocation(loc);
      setStatus("ok");
      onLocation?.(loc);
    } catch (err) {
      setStatus("error");
      setError(err.message);
      onLocation?.(null);
    }
  }, [onLocation]);

  useEffect(() => {
    const timer = setTimeout(fetchLocation, 0);
    return () => clearTimeout(timer);
  }, [fetchLocation]);

  const accuracyTint =
    location?.accuracy <= 20 ? "text-emerald-600" : location?.accuracy <= 60 ? "text-amber-600" : "text-rose-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <HiOutlineMapPin size={18} />
          </div>
          <div className="min-w-0">
            {status === "loading" && (
              <div><p className="text-sm font-semibold text-slate-600">Getting live location…</p><p className="mt-0.5 text-xs text-slate-400">Keep GPS enabled and stay outdoors if possible.</p></div>
            )}
            {status === "error" && <div><p className="text-sm font-semibold text-rose-600">Location unavailable</p><p className="mt-0.5 text-xs leading-4 text-rose-500">{error}</p></div>}
            {status === "ok" && (
              <>
                <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
                  {location.address || `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
                </p>
                <p className={`mt-1 text-xs font-semibold ${accuracyTint}`}>
                  ±{Math.round(location.accuracy)}m accuracy · Live GPS
                </p>
              </>
            )}
          </div>
        </div>
        <motion.button
          whileTap={{ rotate: 180 }}
          type="button"
          onClick={fetchLocation}
          disabled={status === "loading"}
          aria-label="Refresh live location"
          className="shrink-0 rounded-xl bg-white p-2.5 text-brand-600 shadow-sm transition hover:bg-brand-50 disabled:opacity-60"
        >
          <HiOutlineArrowPath size={16} className={status === "loading" ? "animate-spin" : ""} />
        </motion.button>
      </div>
    </div>
  );
}
