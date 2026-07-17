"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineBuildingOffice2,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineCheckCircle,
  HiOutlineArrowRightOnRectangle,
  HiPlus,
} from "react-icons/hi2";
import RouteGuard from "@/components/RouteGuard";
import BottomNav from "@/components/pro/BottomNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StartDayModal from "@/components/pro/StartDayModal";
import VisitForm from "@/components/pro/VisitForm";
import EndDayModal from "@/components/pro/EndDayModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useDutyStore } from "@/store/useDutyStore";
import { subscribeActiveSession, subscribeVisitsForSession } from "@/lib/dataClient";
import { signOut } from "@/lib/authClient";

export default function ProHomePage() {
  return (
    <RouteGuard role="pro">
      <ProHome />
    </RouteGuard>
  );
}

function ProHome() {
  const user = useAuthStore((s) => s.user);
  const { session, setSession, visits, setVisits, addVisitLocal } = useDutyStore();
  const [showStart, setShowStart] = useState(false);
  const [showVisit, setShowVisit] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeActiveSession(user.uid, setSession);
    return () => unsub();
  }, [user, setSession]);

  useEffect(() => {
    if (!session) {
      setVisits([]);
      return;
    }
    const unsub = subscribeVisitsForSession(session.id, setVisits);
    return () => unsub();
  }, [session, setVisits]);

  const onDuty = session?.status === "active";
  const lastVisit = visits[visits.length - 1];

  return (
    <div className="app-pro-screen min-h-dvh bg-[#f5f8fc] pb-32">
      <div className="mx-auto max-w-lg px-4 pt-6 sm:px-6 sm:pt-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-slate-500">
              {now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening"}
            </p>
            <h1 className="font-display text-2xl font-bold text-slate-900">{user?.name || "PRO"}</h1>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:text-rose-600"
          >
            <HiOutlineArrowRightOnRectangle size={16} /> Sign out
          </button>
        </motion.div>

        <Card className="mb-4 overflow-hidden !border-0 bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-xl shadow-brand-500/20">
          <div className="flex items-center justify-between text-sm text-blue-100">
            <span>{now.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</span>
            <span className="font-semibold text-white">
              {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${onDuty ? "animate-pulse bg-emerald-300" : "bg-white/40"}`}
            />
            <span className="text-sm font-semibold text-white">
              {onDuty ? "On duty" : "Off duty"}
            </span>
          </div>
        </Card>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <Card className="!p-4">
            <div className="flex items-center gap-2 text-brand-400">
              <HiOutlineBuildingOffice2 size={18} />
              <span className="text-xs font-medium">Today&apos;s Visits</span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-brand-900">{visits.length}</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-2 text-brand-400">
              <HiOutlineClock size={18} />
              <span className="text-xs font-medium">Duty Started</span>
            </div>
            <p className="mt-2 font-display text-lg font-bold text-brand-900">
              {session?.startedAt
                ? new Date(session.startedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                : "—"}
            </p>
          </Card>
        </div>

        {lastVisit && (
          <Card className="mb-4 flex items-center gap-3">
            <HiOutlineMapPin className="shrink-0 text-brand-400" size={20} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-brand-900">Last visit: {lastVisit.hospitalName}</p>
              <p className="text-xs text-brand-400">{lastVisit.location?.address || "Location captured"}</p>
            </div>
          </Card>
        )}

        {!onDuty ? (
          <Button className="w-full" onClick={() => setShowStart(true)}>
            Start Day
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => setShowVisit(true)}><HiPlus size={18} /> Add Visit</Button>
            <Button variant="outline" onClick={() => setShowEnd(true)}><HiOutlineCheckCircle size={18} /> End Duty</Button>
          </div>
        )}
      </div>

      <StartDayModal
        open={showStart}
        onClose={() => setShowStart(false)}
        employee={user}
        onStarted={(startedSession) => {
          setSession(startedSession);
          setShowStart(false);
        }}
      />

      {session && (
        <VisitForm
          open={showVisit}
          onClose={() => setShowVisit(false)}
          session={session}
          previousLocation={lastVisit?.location || session.startLocation}
          onSubmitted={addVisitLocal}
        />
      )}

      {session && (
        <EndDayModal
          open={showEnd}
          onClose={() => setShowEnd(false)}
          session={session}
          onEnded={() => {
            setSession(null);
            setVisits([]);
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
