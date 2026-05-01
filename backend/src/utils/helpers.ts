export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestNeighborRoute<T extends { lat: number; lon: number }>(
  start: { lat: number; lon: number },
  points: (T & { lat: number; lon: number })[]
): (T & { lat: number; lon: number })[] {
  const remaining = [...points];
  const route: typeof points = [];
  let current = start;

  while (remaining.length > 0) {
    let nearest = 0;
    let minDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current.lat, current.lon, remaining[i].lat, remaining[i].lon);
      if (d < minDist) { minDist = d; nearest = i; }
    }
    const next = remaining.splice(nearest, 1)[0];
    route.push(next);
    current = next;
  }
  return route;
}

export function generateTraceabilityCode(sequence: number): string {
  const year = new Date().getFullYear();
  return `AGRO-${year}-${String(sequence).padStart(6, '0')}`;
}

export function generatePaymentReference(): string {
  return `PAY-AGRO-${Date.now().toString().slice(-6)}`;
}

export function generateRouteCode(): string {
  return `RUTA-${Date.now().toString(36).toUpperCase()}`;
}
