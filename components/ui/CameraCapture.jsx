"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineCamera, HiOutlineArrowPath, HiOutlineCheck } from "react-icons/hi2";
import Button from "./Button";

// Renders a live camera preview (front camera for selfies, rear for hospital photos)
// and returns a captured Blob via onCapture. Falls back to a native file/camera
// input on browsers/devices where getUserMedia isn't available.
export default function CameraCapture({ facingMode = "environment", label, onCapture }) {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (active && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [active]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function startCamera() {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera API unavailable");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      streamRef.current = stream;
      setActive(true);
    } catch {
      // Fallback: native camera input (works reliably on iOS Safari PWAs)
      fileInputRef.current?.click();
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setActive(false);
  }

  function capture() {
    const video = videoRef.current;
    if (!video?.videoWidth || !video?.videoHeight) {
      setError("Camera is still loading. Please try again.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return setError("Photo capture failed. Please try again.");
      setPreviewUrl(URL.createObjectURL(blob));
      onCapture?.(blob);
      stopCamera();
    }, "image/jpeg", 0.85);
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    onCapture?.(file);
  }

  function retake() {
    setPreviewUrl(null);
    startCamera();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={facingMode === "user" ? "user" : "environment"}
        className="hidden"
        onChange={handleFileInput}
      />

      {previewUrl ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={label || "Captured photo"} className="h-56 w-full object-cover" />
          <button
            type="button"
            onClick={retake}
            className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white"
          >
            <HiOutlineArrowPath size={14} /> Retake
          </button>
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white">
            <HiOutlineCheck size={14} /> Captured
          </span>
        </div>
      ) : active ? (
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline muted className="h-56 w-full object-cover" />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={capture}
            className="absolute bottom-3 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full border-4 border-white bg-brand-500 shadow-lg"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={startCamera}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 px-5 text-brand-500 transition hover:bg-brand-50"
        >
          <HiOutlineCamera size={28} />
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-xs text-slate-400">Tap to open camera</span>
        </button>
      )}
      {error && <p className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
