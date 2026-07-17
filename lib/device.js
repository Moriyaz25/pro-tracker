// Captures device fingerprint-lite info to attach to each visit as proof context.
export async function getDeviceContext() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
  const platform = typeof navigator !== "undefined" ? navigator.platform : "unknown";

  let batteryPercent = null;
  try {
    if (navigator.getBattery) {
      const battery = await navigator.getBattery();
      batteryPercent = Math.round(battery.level * 100);
    }
  } catch {
    batteryPercent = null;
  }

  let networkType = "unknown";
  let online = true;
  try {
    online = navigator.onLine;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) networkType = conn.effectiveType || conn.type || "unknown";
  } catch {
    networkType = "unknown";
  }

  return {
    userAgent: ua,
    platform,
    batteryPercent,
    networkType,
    online,
  };
}
