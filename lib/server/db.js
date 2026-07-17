import "server-only";

import pg from "pg";

const { Pool } = pg;

const globalForDb = globalThis;

export const pool =
  globalForDb.__hospitalProPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" }
      : undefined,
    max: 10,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__hospitalProPool = pool;

let schemaPromise;

export function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        role text NOT NULL CHECK (role IN ('admin', 'pro')),
        employee_id text UNIQUE,
        name text NOT NULL,
        phone text,
        email text,
        designation text,
        assigned_area text,
        password_hash text NOT NULL,
        status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        joining_date timestamptz DEFAULT now(),
        created_by text REFERENCES users(id) ON DELETE SET NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE UNIQUE INDEX IF NOT EXISTS users_admin_email_lower_idx
        ON users (lower(email)) WHERE role = 'admin';
      CREATE UNIQUE INDEX IF NOT EXISTS users_pro_email_lower_idx
        ON users (lower(email)) WHERE role = 'pro' AND email IS NOT NULL;

      CREATE SEQUENCE IF NOT EXISTS pro_employee_id_seq START WITH 1001;

      CREATE TABLE IF NOT EXISTS auth_sessions (
        token_hash text PRIMARY KEY,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS media (
        id text PRIMARY KEY,
        owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content_type text NOT NULL,
        data bytea NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS duty_sessions (
        id text PRIMARY KEY,
        employee_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        employee_name text NOT NULL,
        started_at timestamptz NOT NULL DEFAULT now(),
        start_location jsonb NOT NULL,
        start_selfie_url text,
        status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
        ended_at timestamptz,
        end_location jsonb,
        end_selfie_url text,
        total_visits integer NOT NULL DEFAULT 0,
        total_distance_km double precision NOT NULL DEFAULT 0
      );

      CREATE UNIQUE INDEX IF NOT EXISTS one_active_session_per_employee_idx
        ON duty_sessions (employee_id) WHERE status = 'active';
      CREATE INDEX IF NOT EXISTS duty_sessions_employee_started_idx
        ON duty_sessions (employee_id, started_at DESC);

      CREATE TABLE IF NOT EXISTS visits (
        id text PRIMARY KEY,
        session_id text NOT NULL REFERENCES duty_sessions(id) ON DELETE CASCADE,
        employee_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        employee_name text NOT NULL,
        hospital_name text NOT NULL,
        doctor_name text,
        department text,
        contact_number text,
        remarks text,
        category text NOT NULL,
        photo_url text NOT NULL,
        location jsonb NOT NULL,
        device jsonb,
        distance_from_previous_km double precision NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS visits_session_created_idx
        ON visits (session_id, created_at);
      CREATE INDEX IF NOT EXISTS visits_created_idx ON visits (created_at DESC);
    `).catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  return schemaPromise;
}

export async function query(text, params) {
  await ensureSchema();
  return pool.query(text, params);
}
