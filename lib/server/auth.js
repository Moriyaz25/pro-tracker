import "server-only";

import { cookies } from "next/headers";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { query } from "./db";

const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE = "hospital_pro_session";
const SESSION_DAYS = 7;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(derived).toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [salt, key] = (stored || "").split(":");
  if (!salt || !key) return false;
  const derived = Buffer.from(await scrypt(password, salt, 64));
  const expected = Buffer.from(key, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function publicUser(row) {
  if (!row) return null;
  return {
    uid: row.id,
    role: row.role,
    employeeId: row.employee_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    designation: row.designation,
    assignedArea: row.assigned_area,
    status: row.status,
    joiningDate: row.joining_date,
    createdAt: row.created_at,
  };
}

export async function createSession(userId) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await query(
    "INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [tokenHash(token), userId, expires]
  );
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await query("DELETE FROM auth_sessions WHERE token_hash = $1", [tokenHash(token)]);
  jar.delete(SESSION_COOKIE);
}

export async function currentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const result = await query(
    `SELECT u.* FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now() AND u.status = 'active'`,
    [tokenHash(token)]
  );
  return result.rows[0] || null;
}

export async function requireUser(role) {
  const user = await currentUser();
  if (!user) throw Object.assign(new Error("Authentication required."), { status: 401 });
  if (role && user.role !== role) {
    throw Object.assign(new Error("You do not have permission to perform this action."), { status: 403 });
  }
  return user;
}

