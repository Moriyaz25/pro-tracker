"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlineMagnifyingGlass, HiOutlineUserPlus, HiOutlineUsers } from "react-icons/hi2";
import RouteGuard from "@/components/RouteGuard";
import AdminShell from "@/components/admin/AdminShell";
import Card from "@/components/ui/Card";
import { subscribeEmployees } from "@/lib/dataClient";

export default function EmployeesPage() {
  return (
    <RouteGuard role="admin">
      <AdminShell>
        <EmployeesList />
      </AdminShell>
    </RouteGuard>
  );
}

function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeEmployees((items) => {
      setEmployees(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const query = search.trim().toLowerCase();
  const filtered = employees.filter((employee) =>
    [employee.name, employee.employeeId, employee.assignedArea, employee.designation]
      .some((value) => String(value || "").toLowerCase().includes(query))
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-brand-600">Team management</p><h1 className="font-display text-3xl font-bold text-slate-900">Employees</h1><p className="mt-1 text-sm text-slate-500">Manage PRO accounts and review field activity.</p></div>
        <Link
          href="/admin/employees/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700"
        >
          <HiOutlineUserPlus size={18} /> Create PRO
        </Link>
      </div>

      <div className="relative mb-5">
        <HiOutlineMagnifyingGlass className="absolute left-4 top-3.5 text-brand-300" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, employee ID, area or designation..."
          className="field-control has-leading-icon"
        />
      </div>

      {loading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="skeleton h-24 rounded-2xl" />)}</div>}

      {!loading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((emp) => (
          <Link key={emp.uid} href={`/admin/employees/${emp.uid}`}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                  {(emp.name || "?").charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-brand-900">{emp.name}</p>
                  <p className="truncate text-xs text-slate-500">{emp.employeeId} · {emp.designation || "PRO"}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">{emp.assignedArea || "Area not assigned"}</p>
                </div>
                <span className={`ml-auto rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${emp.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{emp.status}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>}

      {!loading && filtered.length === 0 && (
        <Card className="mt-6 flex flex-col items-center py-12 text-center"><span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><HiOutlineUsers size={26} /></span><p className="font-semibold text-slate-700">No employees found</p><p className="mt-1 text-sm text-slate-400">Try another search or create a new PRO account.</p></Card>
      )}
    </div>
  );
}
