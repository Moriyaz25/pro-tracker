import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { jsonError } from "@/lib/server/http";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    const user = await requireUser();
    const file = (await request.formData()).get("file");
    if (!(file instanceof Blob) || !file.type.startsWith("image/") || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Upload a valid image no larger than 5 MB." }, { status: 400 });
    }
    const id = randomUUID();
    await query("INSERT INTO media (id, owner_id, content_type, data) VALUES ($1, $2, $3, $4)", [
      id, user.id, file.type, Buffer.from(await file.arrayBuffer()),
    ]);
    return NextResponse.json({ url: `/api/media/${id}` }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

