import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { RouteStop } from '../types';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const depotIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

export function MapView({
  stops,
  depot,
  height = '400px',
}: {
  stops: { lat: number; lon: number; label: string; sub?: string }[];
  depot?: { lat: number; lon: number; name: string };
  height?: string;
}) {
  const center = stops.length > 0 ? [stops[0].lat, stops[0].lon] : [4.711, -74.072];

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-agro-200">
      <MapContainer center={center as [number, number]} zoom={9} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {depot && (
          <Marker position={[depot.lat, depot.lon]} icon={depotIcon}>
            <Popup>
              <strong>🏭 {depot.name}</strong>
              <br />Punto de partida
            </Popup>
          </Marker>
        )}
        {stops.map((s, i) => (
          <Marker key={i} position={[s.lat, s.lon]}>
            <Popup>
              <strong>Parada {i + 1}: {s.label}</strong>
              {s.sub && <><br />{s.sub}</>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export function RouteMap({
  stops,
  depot,
  height = '450px',
}: {
  stops: RouteStop[];
  depot: { lat: number; lon: number; name: string };
  height?: string;
}) {
  const positions: [number, number][] = [
    [depot.lat, depot.lon],
    ...stops.map((s) => [s.latitude, s.longitude] as [number, number]),
  ];

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-agro-200">
      <MapContainer center={[depot.lat, depot.lon]} zoom={9} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[depot.lat, depot.lon]} icon={depotIcon}>
          <Popup><strong>🏭 {depot.name}</strong><br />Punto de partida / llegada</Popup>
        </Marker>
        {stops.map((s) => (
          <Marker key={s.id} position={[s.latitude, s.longitude]}>
            <Popup>
              <strong>Parada {s.stopOrder}</strong><br />
              {s.producer?.farmName || s.municipality}<br />
              📍 {s.municipality}
            </Popup>
          </Marker>
        ))}
        <Polyline positions={positions} color="#2e7d32" weight={3} dashArray="8,4" />
      </MapContainer>
    </div>
  );
}
