import { NextResponse } from "next/server";
import { hashPassword, publicUser, requireUser } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { jsonError } from "@/lib/server/http";

export async function GET(_request, { params }) {
  try {
    await requireUser("admin");
    const { id } = await params;
    const result = await query("SELECT * FROM users WHERE id = $1 AND role = 'pro'", [id]);
    if (!result.rowCount) return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    return NextResponse.json({ employee: publicUser(result.rows[0]) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireUser("admin");
    const { id } = await params;
    const data = await request.json();
    if (data.action === "status") {
      if (!["active", "inactive"].includes(data.status)) {
        return NextResponse.json({ error: "A valid account status is required." }, { status: 400 });
      }
      await query("UPDATE users SET status = $1, updated_at = now() WHERE id = $2 AND role = 'pro'", [data.status, id]);
      if (data.status === "inactive") await query("DELETE FROM auth_sessions WHERE user_id = $1", [id]);
    } else if (data.action === "password") {
      if (!data.password || data.password.length < 6) {
        return NextResponse.json({ error: "Password must contain at least 6 characters." }, { status: 400 });
      }
      await query("UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2 AND role = 'pro'", [await hashPassword(data.password), id]);
      await query("DELETE FROM auth_sessions WHERE user_id = $1", [id]);
    } else {
      return NextResponse.json({ error: "Unsupported account action." }, { status: 400 });
    }
    const result = await query("SELECT * FROM users WHERE id = $1 AND role = 'pro'", [id]);
    if (!result.rowCount) return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    return NextResponse.json({ employee: publicUser(result.rows[0]) });
  } catch (error) {
    return jsonError(error);
  }
}
