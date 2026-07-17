"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { HiXMark } from "react-icons/hi2";
import Button from "@/components/ui/Button";
import CameraCapture from "@/components/ui/CameraCapture";
import LiveLocationCard from "@/components/ui/LiveLocationCard";
import { startDutySession, uploadImage } from "@/lib/dataClient";
import { compressImage } from "@/lib/imageCompress";

export default function StartDayModal({ open, onClose, employee, onStarted }) {
  const [location, setLocation] = useState(null);
  const [selfieBlob, setSelfieBlob] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleStart() {
    if (!location) {
      toast.error("Live location is required to start duty.");
      return;
    }
    setSubmitting(true);
    try {
      let selfieUrl = null;
      if (selfieBlob) {
        const compressed = await compressImage(selfieBlob);
        selfieUrl = await uploadImage(compressed);
      }

      const startedSession = await startDutySession({
        employeeId: employee.uid,
        employeeName: employee.name,
        location,
        selfieUrl,
      });

      toast.success("Duty started. Have a productive day!");
      onStarted?.(startedSession);
      onClose();
    } catch (err) {
      toast.error(err.message || "Could not start duty. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="start-duty-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div><h2 id="start-duty-title" className="font-display text-xl font-bold text-slate-900">Start your duty</h2><p className="mt-1 text-sm text-slate-500">Confirm your current GPS location before starting.</p></div>
              <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <HiXMark size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <LiveLocationCard onLocation={setLocation} />
              <CameraCapture
                facingMode="user"
                label="Start-of-day selfie (optional)"
                onCapture={setSelfieBlob}
              />

              <Button
                className="w-full"
                loading={submitting}
                disabled={!location}
                onClick={handleStart}
              >
                {submitting ? "Starting duty..." : "Confirm & Start Duty"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
