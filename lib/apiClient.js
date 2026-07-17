async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: options.body instanceof FormData
      ? options.headers
      : { "Content-Type": "application/json", ...options.headers },
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || "Request failed.");
  return payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: "POST", body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: "PATCH", body: JSON.stringify(data) }),
  upload: (blob) => {
    const form = new FormData();
    form.append("file", blob, "photo.jpg");
    return request("/api/media", { method: "POST", body: form });
  },
};

export function poll(loader, callback, interval = 5000) {
  let active = true;
  const run = async () => {
    try {
      const value = await loader();
      if (active) callback(value);
    } catch (error) {
      if (active) console.error(error);
    }
  };
  run();
  const timer = setInterval(run, interval);
  return () => {
    active = false;
    clearInterval(timer);
  };
}
