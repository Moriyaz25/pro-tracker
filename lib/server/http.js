import { NextResponse } from "next/server";

export function jsonError(error) {
  console.error(error);
  const databaseAuthFailed = error.code === "28P01";
  const status = error.status || (databaseAuthFailed ? 503 : error.code === "23505" ? 409 : 500);
  const message = databaseAuthFailed
    ? "PostgreSQL rejected the database credentials. Check DATABASE_URL and restart the server."
    : status === 500
      ? "The server could not complete this request."
      : error.message;
  return NextResponse.json({ error: message }, { status });
}

export function sessionRow(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    startedAt: row.started_at,
    startLocation: row.start_location,
    currentLocation: row.current_location || row.start_location,
    startSelfieUrl: row.start_selfie_url,
    status: row.status,
    endedAt: row.ended_at,
    endLocation: row.end_location,
    endSelfieUrl: row.end_selfie_url,
    totalVisits: row.total_visits,
    totalDistanceKm: row.total_distance_km,
  };
}

export function visitRow(row) {
  return {
    id: row.id,
    sessionId: row.session_id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    hospitalName: row.hospital_name,
    doctorName: row.doctor_name,
    department: row.department,
    contactNumber: row.contact_number,
    remarks: row.remarks,
    category: row.category,
    photoUrl: row.photo_url,
    location: row.location,
    device: row.device,
    distanceFromPreviousKm: row.distance_from_previous_km,
    createdAt: row.created_at,
  };
}
