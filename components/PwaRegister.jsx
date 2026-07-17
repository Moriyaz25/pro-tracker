"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
  HiOutlineExclamationTriangle,
  HiOutlinePlusCircle,
  HiXMark,
} from "react-icons/hi2";

const DISMISS_KEY = "pro-tracker-install-dismissed";
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;

function isDismissed() {
  try {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
    return dismissedAt && Date.now() - dismissedAt < DISMISS_FOR_MS;
  } catch {
    return false;
  }
}

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installType, setInstallType] = useState(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    const mobile = window.matchMedia("(pointer: coarse)").matches && window.matchMedia("(max-width: 900px)").matches;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const root = document.documentElement;

    root.classList.toggle("pwa-mode", standalone);
    root.classList.toggle("mobile-device", mobile);
    root.classList.toggle("ios-device", ios);

    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

    const iosTimer = !standalone && mobile && ios && !isDismissed()
      ? setTimeout(() => setInstallType("ios"), 1400)
      : null;

    function handleInstallPrompt(event) {
      event.preventDefault();
      if (!standalone && mobile && !isDismissed()) {
        setDeferredPrompt(event);
        setInstallType("android");
      }
    }
    function handleInstalled() {
      setInstallType(null);
      root.classList.add("pwa-mode");
    }
    function handleOnline() { setOnline(true); }
    function handleOffline() { setOnline(false); }
    function handleHaptic(event) {
      if (standalone && event.target instanceof Element && event.target.closest("button, a") && navigator.vibrate) navigator.vibrate(8);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("click", handleHaptic, { passive: true });
    return () => {
      if (iosTimer) clearTimeout(iosTimer);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("click", handleHaptic);
    };
  }, []);

  async function installAndroid() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstallType(null);
  }

  function dismissInstall() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setInstallType(null);
    setShowIosHelp(false);
  }

  return (
    <>
      <AnimatePresence>
        {!online && (
          <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }} className="app-offline-pill fixed left-1/2 top-3 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xl">
            <HiOutlineExclamationTriangle size={16} /> You&apos;re offline
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {installType && !showIosHelp && (
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="fixed bottom-4 left-1/2 z-[60] grid w-[calc(100%_-_1.5rem)] max-w-md -translate-x-1/2 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/20">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><HiOutlineArrowDownTray size={20} /></div>
            <div className="min-w-0"><p className="text-sm font-semibold text-slate-900">Install PRO Tracker</p><p className="mt-0.5 text-xs leading-4 text-slate-500">Open it full-screen like a mobile app.</p></div>
            <div className="flex items-center gap-1"><button onClick={installType === "android" ? installAndroid : () => setShowIosHelp(true)} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white">{installType === "android" ? "Install" : "How"}</button><button aria-label="Dismiss install prompt" onClick={dismissInstall} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><HiXMark size={18} /></button></div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIosHelp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-end bg-slate-950/50 backdrop-blur-sm" onClick={dismissInstall}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }} onClick={(event) => event.stopPropagation()} className="w-full rounded-t-[2rem] bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-5 shadow-2xl">
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />
              <div className="mx-auto max-w-sm"><div className="mb-5 flex items-start justify-between"><div><h2 className="font-display text-xl font-bold text-slate-900">Install on iPhone or iPad</h2><p className="mt-1 text-sm text-slate-500">Use Safari to add PRO Tracker as a full-screen app.</p></div><button aria-label="Close" onClick={dismissInstall} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><HiXMark size={21} /></button></div>
                <ol className="space-y-4"><li className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><HiOutlineArrowUpTray size={20} /></span><div><p className="text-sm font-semibold text-slate-800">1. Tap the Share button</p><p className="mt-0.5 text-xs text-slate-500">It is in Safari&apos;s bottom toolbar.</p></div></li><li className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><HiOutlinePlusCircle size={21} /></span><div><p className="text-sm font-semibold text-slate-800">2. Choose Add to Home Screen</p><p className="mt-0.5 text-xs text-slate-500">Then tap Add in the top-right corner.</p></div></li></ol>
                <button onClick={dismissInstall} className="mt-6 min-h-12 w-full rounded-xl bg-brand-600 text-sm font-semibold text-white">Got it</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
