import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createSession, hashPassword, publicUser, verifyPassword } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { query } from "@/lib/server/db";

async function seedConfiguredAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const exists = await query("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1");
  if (exists.rowCount) return;
  const passwordHash = await hashPassword(password);
  await query(
    `INSERT INTO users (id, role, name, email, password_hash, status)
     VALUES ($1, 'admin', $2, $3, $4, 'active') ON CONFLICT DO NOTHING`,
    [randomUUID(), process.env.ADMIN_NAME || "Super Admin", email, passwordHash]
  );
}

export async function POST(request) {
  try {
    await seedConfiguredAdmin();
    const { mode, employeeId, email, password } = await request.json();
    if (!password || !["pro", "admin"].includes(mode)) {
      return NextResponse.json({ error: "Valid credentials are required." }, { status: 400 });
    }
    const result = mode === "admin"
      ? await query("SELECT * FROM users WHERE role = 'admin' AND lower(email) = lower($1)", [email || ""])
      : await query(
          "SELECT * FROM users WHERE role = 'pro' AND (lower(employee_id) = lower($1) OR lower(email) = lower($1)) LIMIT 1",
          [(employeeId || "").trim()]
        );
    const user = result.rows[0];
    if (!user || user.status !== "active" || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Invalid credentials or inactive account." }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ user: publicUser(user) });
  } catch (error) {
    return jsonError(error);
  }
}
