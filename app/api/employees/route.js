import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { hashPassword, publicUser, requireUser } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { jsonError } from "@/lib/server/http";

export async function GET() {
  try {
    await requireUser("admin");
    const result = await query("SELECT * FROM users WHERE role = 'pro' ORDER BY name");
    return NextResponse.json({ employees: result.rows.map(publicUser) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    const admin = await requireUser("admin");
    const data = await request.json();
    const name = data.name?.trim();
    if (!name || !data.password || data.password.length < 6) {
      return NextResponse.json({ error: "Name and a password of at least 6 characters are required." }, { status: 400 });
    }
    const email = data.email?.trim().toLowerCase() || null;
    const employeeIdResult = await query("SELECT 'PRO' || nextval('pro_employee_id_seq')::text AS employee_id");
    const employeeId = employeeIdResult.rows[0].employee_id;
    const id = randomUUID();
    await query(
      `INSERT INTO users
       (id, role, employee_id, name, phone, email, designation, assigned_area, password_hash, status, created_by)
       VALUES ($1, 'pro', $2, $3, $4, $5, $6, $7, $8, 'active', $9)`,
      [id, employeeId, name, data.phone || null, email, data.designation || "PRO", data.assignedArea || null, await hashPassword(data.password), admin.id]
    );
    return NextResponse.json({ uid: id, employeeId }, { status: 201 });
  } catch (error) {
    if (error.code === "23505") error = Object.assign(new Error("That employee ID or email already exists."), { status: 409 });
    return jsonError(error);
  }
}
