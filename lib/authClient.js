import { api } from "./apiClient";

export async function loginWithEmployeeId(identifier, password) {
  return (await api.post("/api/auth/login", { mode: "pro", employeeId: identifier, password })).user;
}

export async function loginAsAdmin(email, password) {
  return (await api.post("/api/auth/login", { mode: "admin", email, password })).user;
}

export async function signOut() {
  await api.post("/api/auth/logout", {});
  window.location.assign("/login");
}

export function subscribeToAuth(callback) {
  let active = true;
  api.get("/api/auth/me")
    .then(({ user }) => active && callback(user))
    .catch(() => active && callback(null));
  return () => { active = false; };
}
