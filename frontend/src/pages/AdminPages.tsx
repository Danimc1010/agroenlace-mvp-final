import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Order, RoutePlan } from '../types';
import { Navbar } from '../components/Navbar';
import { PageHeader, Card, Btn, LoadingSpinner, EmptyState, OrderStatusBadge } from '../components/UI';
import { RouteMap } from '../components/MapView';
import api from '../api/axios';

/* ── Pending Orders ── */
export function PendingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.get('/logistics/pending-orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    load();
  };

  if (loading) return <div className="min-h-screen bg-agro-50"><Navbar /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <PageHeader title="Pedidos pendientes" sub={`${orders.length} pedido(s) por gestionar`} />
          <Link to="/admin/generate-route"><Btn variant="secondary">🗺️ Generar ruta</Btn></Link>
        </div>
        {orders.length === 0 ? (
          <EmptyState icon="✅" title="No hay pedidos pendientes" description="Todos los pedidos están gestionados." />
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <Card key={order.id}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-agro-600 font-bold">{order.traceabilityCode}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-600">🛒 {order.buyer?.name} · Total: <strong>${order.total.toLocaleString('es-CO')}</strong></p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Productos: {order.items?.map(i => `${i.product?.name} (${i.product?.municipality})`).join(', ')}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('es-CO')}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    <select
                      onChange={e => { if (e.target.value) changeStatus(order.id, e.target.value); }}
                      defaultValue=""
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                    >
                      <option value="">Cambiar estado...</option>
                      <option value="CONFIRMADO">Confirmar</option>
                      <option value="EN_RECOLECCION">En recolección</option>
                      <option value="EN_CAMINO">En camino</option>
                      <option value="ENTREGADO">Entregado</option>
                      <option value="CANCELADO">Cancelar</option>
                    </select>
                    <Link to={`/buyer/orders/${order.id}`}><Btn variant="outline">Ver</Btn></Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Generate Route ── */
export function GenerateRoutePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/logistics/pending-orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const generate = async () => {
    if (selected.length === 0) { setError('Selecciona al menos un pedido'); return; }
    setGenerating(true);
    setError('');
    try {
      const { data } = await api.post('/logistics/routes', { orderIds: selected });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar ruta');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-agro-50"><Navbar /><LoadingSpinner /></div>;

  if (result) return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PageHeader title="✅ Ruta generada" sub={`Código: ${result.routePlan.code} · Distancia: ${result.totalDistanceKm} km`} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <RouteMap stops={result.routePlan.stops} depot={result.depot} height="450px" />
          </div>
          <Card>
            <p className="font-display font-semibold text-agro-800 mb-3">Paradas en orden</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm py-1 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">0</span>
                <span className="text-gray-600">Centro de Acopio Bogotá</span>
              </div>
              {result.routePlan.stops?.map((s: any) => (
                <div key={s.id} className="flex items-center gap-2 text-sm py-1 border-b border-gray-100 last:border-0">
                  <span className="w-6 h-6 rounded-full bg-agro-600 text-white text-xs flex items-center justify-center font-bold">{s.stopOrder}</span>
                  <div>
                    <p className="font-semibold">{s.producer?.farmName || s.municipality}</p>
                    <p className="text-xs text-gray-400">📍 {s.municipality}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Btn onClick={() => navigate('/admin/routes')} className="w-full">Ver todas las rutas</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PageHeader title="Generar ruta logística" sub="Selecciona los pedidos a incluir en la ruta" />
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        {orders.length === 0 ? (
          <EmptyState icon="📋" title="No hay pedidos disponibles" description="Los pedidos pendientes aparecerán aquí." />
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-xl mb-4">
              ℹ️ El algoritmo de <strong>vecino más cercano</strong> calculará la ruta óptima partiendo del Centro de Acopio en Bogotá.
            </div>
            <div className="space-y-3 mb-5">
              {orders.map(o => (
                <label key={o.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected.includes(o.id) ? 'border-agro-500 bg-agro-50' : 'border-gray-100 bg-white hover:border-agro-200'}`}>
                  <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} className="mt-1 w-5 h-5 accent-agro-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-agro-600 font-bold">{o.traceabilityCode}</span>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{o.buyer?.name} · ${o.total.toLocaleString('es-CO')}</p>
                    <p className="text-xs text-gray-400">
                      📍 {[...new Set(o.items?.map(i => i.product?.municipality))].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <Btn variant="outline" onClick={() => setSelected(orders.map(o => o.id))} className="flex-1">Seleccionar todos</Btn>
              <Btn onClick={generate} disabled={generating || selected.length === 0} className="flex-1 py-3">
                {generating ? 'Calculando ruta...' : `🗺️ Generar ruta (${selected.length})`}
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Routes List ── */
export function RoutesListPage() {
  const [routes, setRoutes] = useState<RoutePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/logistics/routes').then(r => setRoutes(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-agro-50"><Navbar /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <PageHeader title="Rutas logísticas" sub={`${routes.length} ruta(s) generada(s)`} />
          <Link to="/admin/generate-route"><Btn variant="secondary">➕ Nueva ruta</Btn></Link>
        </div>
        {routes.length === 0 ? (
          <EmptyState icon="🗺️" title="No hay rutas" description="Genera tu primera ruta desde los pedidos pendientes." />
        ) : (
          <div className="space-y-3">
            {routes.map(r => (
              <Card key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-mono font-bold text-agro-700">{r.code}</p>
                  <p className="text-sm text-gray-500">{r.stops?.length || 0} paradas · {r.totalDistanceKm?.toFixed(1)} km</p>
                  <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString('es-CO')}</p>
                </div>
                <Link to={`/admin/routes/${r.id}`}><Btn variant="outline">Ver mapa</Btn></Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Route Detail ── */
export function RouteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<{ route: RoutePlan; depot: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/logistics/routes/${id}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-agro-50"><Navbar /><LoadingSpinner /></div>;
  if (!data) return <div className="min-h-screen bg-agro-50"><Navbar /><EmptyState title="Ruta no encontrada" /></div>;

  const { route, depot } = data;

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-agro-600 text-sm mb-4 hover:underline">← Volver</button>
        <PageHeader title={`Ruta ${route.code}`} sub={`${route.stops?.length} paradas · ${route.totalDistanceKm?.toFixed(1)} km estimados`} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            {route.stops && <RouteMap stops={route.stops} depot={depot} height="500px" />}
          </div>
          <div className="space-y-3">
            <Card>
              <p className="font-display font-semibold text-agro-800 mb-3">Itinerario</p>
              <div className="space-y-2">
                <div className="text-sm py-1 border-b border-gray-100">
                  <span className="text-red-600 font-bold">🏭 Inicio</span>
                  <p className="text-gray-500 text-xs">{depot.name}</p>
                </div>
                {route.stops?.map((s: any) => (
                  <div key={s.id} className="text-sm py-1 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-agro-600 text-white text-xs flex items-center justify-center font-bold shrink-0">{s.stopOrder}</span>
                      <div>
                        <p className="font-semibold">{s.producer?.farmName || s.municipality}</p>
                        <p className="text-xs text-gray-400">📍 {s.municipality}</p>
                        <p className="text-xs text-gray-400">Pedido: {s.order?.traceabilityCode}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
