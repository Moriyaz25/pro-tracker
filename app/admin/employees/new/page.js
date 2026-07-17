"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft, HiOutlineUserPlus } from "react-icons/hi2";
import RouteGuard from "@/components/RouteGuard";
import AdminShell from "@/components/admin/AdminShell";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";
import { createProAccount } from "@/lib/dataClient";

export default function NewEmployeePage() {
  return (
    <RouteGuard role="admin">
      <AdminShell>
        <NewEmployeeForm />
      </AdminShell>
    </RouteGuard>
  );
}

function NewEmployeeForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    designation: "",
    assignedArea: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await createProAccount(form);
      toast.success(`PRO account created with ID ${created.employeeId}.`);
      router.push("/admin/employees");
    } catch (err) {
      toast.error(err.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/employees" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-700"><HiOutlineArrowLeft size={17} /> Back to employees</Link>
      <div className="mb-6 flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700"><HiOutlineUserPlus size={23} /></span><div><h1 className="font-display text-2xl font-bold text-slate-900">Create PRO account</h1><p className="text-sm text-slate-500">Add a field representative and assign their login credentials.</p></div></div>
      <Card className="!p-5 sm:!p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700"><span className="font-semibold">Employee ID is automatic.</span> A unique ID such as PRO1001 will be generated after creation.</div>
          <Input label="Full Name" placeholder="Employee name" autoComplete="name" required value={form.name} onChange={update("name")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Phone" type="tel" inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number" value={form.phone} onChange={update("phone")} />
            <Input label="Email" type="email" autoComplete="email" placeholder="employee@example.com" value={form.email} onChange={update("email")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Designation" placeholder="e.g. Medical Representative" value={form.designation} onChange={update("designation")} />
            <Input label="Assigned Area" placeholder="e.g. South Delhi" value={form.assignedArea} onChange={update("assignedArea")} />
          </div>
          <PasswordInput
            label="Temporary Password"
            autoComplete="new-password"
            placeholder="Minimum 6 characters"
            required
            minLength={6}
            value={form.password}
            onChange={update("password")}
          />
          <Button type="submit" className="w-full sm:ml-auto sm:w-auto" loading={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
