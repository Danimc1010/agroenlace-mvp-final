import { TraceabilityEvent } from '../types';

const eventIcon: Record<string, string> = {
  'Pedido creado': '📋',
  'Pago simulado registrado': '💳',
  'Pedido confirmado': '✅',
  'Producto asignado a ruta logística': '🗺️',
  'Estado actualizado: EN RECOLECCION': '🚜',
  'Estado actualizado: EN CAMINO': '🚚',
  'Estado actualizado: ENTREGADO': '🎉',
  'Estado actualizado: CANCELADO': '❌',
};

export function TraceabilityTimeline({ events }: { events: TraceabilityEvent[] }) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-agro-200" />
      <div className="space-y-6">
        {events.map((ev, idx) => (
          <div key={ev.id} className="flex gap-4 relative">
            <div className="w-10 h-10 rounded-full bg-agro-600 text-white flex items-center justify-center text-sm z-10 shrink-0 shadow">
              {eventIcon[ev.title] || '📌'}
            </div>
            <div className={`flex-1 pb-4 ${idx < events.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <p className="font-semibold text-agro-800 text-sm">{ev.title}</p>
              {ev.description && <p className="text-gray-500 text-xs mt-0.5">{ev.description}</p>}
              {ev.location && <p className="text-gray-400 text-xs">📍 {ev.location}</p>}
              <p className="text-gray-400 text-xs mt-1">
                {new Date(ev.createdAt).toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
