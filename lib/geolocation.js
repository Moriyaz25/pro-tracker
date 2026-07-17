// Live GPS capture. Never accepts manual coordinate entry — every visit
// must call this at submission time so the fix is fresh.
export function getLiveLocation({ timeout = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        let address = null;
        try {
          address = await reverseGeocode(latitude, longitude);
        } catch {
          address = null;
        }
        resolve({
          latitude,
          longitude,
          accuracy,
          speed: speed ?? null,
          heading: heading ?? null,
          address,
          capturedAt: new Date().toISOString(),
        });
      },
      (err) => reject(mapGeoError(err)),
      { enableHighAccuracy: true, timeout, maximumAge: 0 }
    );
  });
}

function mapGeoError(err) {
  const messages = {
    1: "Location permission denied. Please enable GPS access to continue.",
    2: "Location unavailable. Move to an open area and try again.",
    3: "Location request timed out. Please try again.",
  };
  return new Error(messages[err.code] || "Could not fetch live location.");
}

// Uses OpenStreetMap Nominatim for reverse geocoding (no key needed).
// Swap for Google Maps Geocoding API if you have a billing-enabled key.
export async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=en-IN&lat=${lat}&lon=${lon}`,
    { headers: { Accept: "application/json", "Accept-Language": "en-IN,en;q=0.9" } }
  );
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const data = await res.json();
  return data.display_name || null;
}

// Haversine distance in kilometers between two {latitude, longitude} points.
export function distanceKm(a, b) {
  if (!a || !b) return 0;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}
