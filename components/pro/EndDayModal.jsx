"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { HiOutlineCheckCircle, HiXMark } from "react-icons/hi2";
import Button from "@/components/ui/Button";
import CameraCapture from "@/components/ui/CameraCapture";
import LiveLocationCard from "@/components/ui/LiveLocationCard";
import { endDutySession, uploadImage } from "@/lib/dataClient";
import { compressImage } from "@/lib/imageCompress";

export default function EndDayModal({ open, onClose, session, onEnded }) {
  const [location, setLocation] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleEnd() {
    if (!location) return toast.error("Live location is required to end duty.");
    setSubmitting(true);
    try {
      const selfieUrl = selfie ? await uploadImage(await compressImage(selfie)) : null;
      const completed = await endDutySession(session.id, { location, selfieUrl });
      toast.success("Duty completed successfully.");
      onEnded?.(completed);
      onClose();
    } catch (error) {
      toast.error(error.message || "Could not end duty.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-5 flex items-start justify-between">
              <div><span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><HiOutlineCheckCircle size={23} /></span><h2 className="font-display text-xl font-bold text-slate-900">Complete today&apos;s duty</h2><p className="mt-1 text-sm text-slate-500">Capture your final live location before signing off.</p></div>
              <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><HiXMark size={21} /></button>
            </div>
            <div className="space-y-4">
              <LiveLocationCard onLocation={setLocation} />
              <CameraCapture facingMode="user" label="End-of-day selfie (optional)" onCapture={setSelfie} />
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-center">
                <div><p className="text-xl font-bold text-slate-900">{session?.totalVisits || 0}</p><p className="text-xs text-slate-500">Visits</p></div>
                <div><p className="text-xl font-bold text-slate-900">{Number(session?.totalDistanceKm || 0).toFixed(1)}</p><p className="text-xs text-slate-500">Kilometres</p></div>
              </div>
              <Button className="w-full" disabled={!location} loading={submitting} onClick={handleEnd}>{submitting ? "Completing duty..." : "Confirm & End Duty"}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

