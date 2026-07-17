"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { HiXMark } from "react-icons/hi2";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import CameraCapture from "@/components/ui/CameraCapture";
import LiveLocationCard from "@/components/ui/LiveLocationCard";
import { submitVisit, uploadImage } from "@/lib/dataClient";
import { compressImage } from "@/lib/imageCompress";
import { getDeviceContext } from "@/lib/device";
import { distanceKm } from "@/lib/geolocation";

const categories = [
  { value: "existing", label: "Existing Client" },
  { value: "new_lead", label: "New Lead" },
  { value: "follow_up", label: "Follow-up" },
  { value: "visited_only", label: "Visited Only" },
];

export default function VisitForm({ open, onClose, session, previousLocation, onSubmitted }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [location, setLocation] = useState(null);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(data) {
    if (!location) {
      toast.error("Live GPS location is required to submit a visit.");
      return;
    }
    if (!photoBlob) {
      toast.error("A hospital front photo is required.");
      return;
    }
    setSubmitting(true);
    try {
      const compressed = await compressImage(photoBlob);
      const photoUrl = await uploadImage(compressed);

      const device = await getDeviceContext();
      const distanceFromPrevious = previousLocation
        ? Number(distanceKm(previousLocation, location).toFixed(2))
        : 0;

      const visitData = {
        sessionId: session.id,
        employeeId: session.employeeId,
        employeeName: session.employeeName,
        hospitalName: data.hospitalName,
        doctorName: data.doctorName || null,
        department: data.department || null,
        contactNumber: data.contactNumber || null,
        remarks: data.remarks || null,
        category: data.category,
        photoUrl,
        location,
        device,
        distanceFromPreviousKm: distanceFromPrevious,
      };
      const visitId = await submitVisit(visitData);

      toast.success("Visit submitted and verified!");
      reset();
      setPhotoBlob(null);
      onSubmitted?.({ id: visitId, ...visitData, createdAt: new Date().toISOString() });
      onClose();
    } catch (err) {
      toast.error(err.message || "Could not submit visit. Try again.");
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
          aria-labelledby="visit-form-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div><h2 id="visit-form-title" className="font-display text-xl font-bold text-slate-900">Log hospital visit</h2><p className="mt-1 text-sm text-slate-500">Photo and fresh GPS are required for verification.</p></div>
              <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <HiXMark size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <CameraCapture
                facingMode="environment"
                label="Capture hospital front photo"
                onCapture={setPhotoBlob}
              />

              <Input
                label="Hospital Name"
                placeholder="e.g. City Care Hospital"
                error={errors.hospitalName && "Hospital name is required"}
                {...register("hospitalName", { required: true })}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Doctor Name" placeholder="Optional" {...register("doctorName")} />
                <Input label="Department" placeholder="Optional" {...register("department")} />
              </div>

              <Input
                label="Contact Number"
                placeholder="Optional"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                {...register("contactNumber")}
              />

              <Select
                label="Hospital Category"
                options={categories}
                {...register("category", { required: true })}
              />

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-800">Remarks</span>
                <textarea
                  rows={3}
                  placeholder="Any notes about this visit..."
                  className="field-control min-h-24 resize-y"
                  {...register("remarks")}
                />
              </label>

              <LiveLocationCard onLocation={setLocation} />

              <Button type="submit" className="w-full" loading={submitting}>
                {submitting ? "Submitting visit..." : "Submit Visit"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
