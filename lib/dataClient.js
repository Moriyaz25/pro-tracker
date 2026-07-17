import { api, poll } from "./apiClient";

export async function uploadImage(blob) {
  return (await api.upload(blob)).url;
}

export async function startDutySession({ location, selfieUrl }) {
  return (await api.post("/api/sessions", { location, selfieUrl })).session;
}

export async function endDutySession(sessionId, { location, selfieUrl }) {
  return (await api.post(`/api/sessions/${encodeURIComponent(sessionId)}/end`, { location, selfieUrl })).session;
}

export function subscribeActiveSession(employeeId, callback) {
  return poll(() => api.get(`/api/sessions?employeeId=${encodeURIComponent(employeeId)}&active=true`).then((r) => r.sessions[0] || null), callback);
}

export function subscribeAllActiveSessions(callback) {
  return poll(() => api.get("/api/sessions?active=true").then((r) => r.sessions), callback);
}

export async function submitVisit(visit) {
  return (await api.post("/api/visits", visit)).id;
}

export function subscribeVisitsForSession(sessionId, callback) {
  return poll(() => api.get(`/api/visits?sessionId=${encodeURIComponent(sessionId)}&limit=200`).then((r) => r.visits), callback);
}

export function subscribeRecentVisits(callback, max = 50) {
  return poll(() => api.get(`/api/visits?limit=${max}`).then((r) => r.visits), callback);
}

export function subscribeEmployees(callback) {
  return poll(() => api.get("/api/employees").then((r) => r.employees), callback, 10000);
}

export async function getEmployee(id) {
  return (await api.get(`/api/employees/${encodeURIComponent(id)}`)).employee;
}

export async function setEmployeeStatus(id, status) {
  return (await api.patch(`/api/employees/${encodeURIComponent(id)}`, { action: "status", status })).employee;
}

export async function resetEmployeePassword(id, password) {
  return (await api.patch(`/api/employees/${encodeURIComponent(id)}`, { action: "password", password })).employee;
}

export function subscribeLatestSession(employeeId, callback) {
  return poll(() => api.get(`/api/sessions?employeeId=${encodeURIComponent(employeeId)}`).then((r) => r.sessions[0] || null), callback);
}

export function createProAccount(data) {
  return api.post("/api/employees", data);
}

export async function listDutySessions() {
  return (await api.get("/api/sessions?all=true")).sessions;
}
