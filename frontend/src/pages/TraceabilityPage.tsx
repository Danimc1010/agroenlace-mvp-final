import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Order } from '../types';
import { Navbar } from '../components/Navbar';
import { OrderStatusBadge, PaymentStatusBadge, LoadingSpinner, PageHeader, Card, Btn } from '../components/UI';
import { TraceabilityTimeline } from '../components/TraceabilityTimeline';
import api from '../api/axios';

export default function TraceabilityPage() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (searchCode: string) => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await api.get(`/traceability/${searchCode.trim().toUpperCase()}`);
      setOrder(data);
    } catch {
      setError('Código no encontrado. Verifica e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if URL contains ?code=AGRO-XXXX-XXXXXX (QR / direct link simulation)
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      const upper = urlCode.toUpperCase();
      setCode(upper);
      search(upper);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); search(code); };

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <span className="text-5xl">🔍</span>
          <h1 className="font-display text-3xl font-bold text-agro-800 mt-3">Trazabilidad de pedido</h1>
          <p className="text-gray-400 mt-2">Ingresa tu código para conocer el estado de tu pedido</p>
        </div>

        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-agro-500 uppercase"
              placeholder="AGRO-2026-000001"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
            />
            <Btn type="submit" disabled={loading} className="px-6 py-3">Buscar</Btn>
          </form>
        </Card>

        {loading && <LoadingSpinner text="Buscando código..." />}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-5">
            <Card>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="font-mono text-lg font-bold text-agro-700">{order.traceabilityCode}</span>
                  <p className="text-xs text-gray-400 mt-0.5">Pedido realizado: {new Date(order.createdAt).toLocaleDateString('es-CO')}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-400">Comprador</p><p className="font-semibold">{order.buyer?.name}</p></div>
                <div><p className="text-gray-400">Total</p><p className="font-bold text-agro-700">${order.total?.toLocaleString('es-CO')}</p></div>
                {order.deliveryAddress && <div className="col-span-2"><p className="text-gray-400">Dirección</p><p className="font-semibold text-xs">{order.deliveryAddress}</p></div>}
              </div>
            </Card>

            <Card>
              <p className="font-display font-semibold text-agro-800 mb-3">Productos del pedido</p>
              {order.items?.map(item => (
                <div key={item.id} className="flex gap-3 py-2 border-b border-gray-50 last:border-0 text-sm">
                  <div className="flex-1">
                    <p className="font-semibold">{item.product?.name}</p>
                    <p className="text-xs text-gray-400">
                      Productor: {item.product?.producer?.user?.name} · 📍 {item.product?.municipality}
                    </p>
                    {item.product?.producer?.farmName && (
                      <p className="text-xs text-gray-400">🌿 {item.product.producer.farmName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-agro-700">${item.subtotal.toLocaleString('es-CO')}</p>
                    <p className="text-xs text-gray-400">{item.quantity} {item.product?.unit}</p>
                  </div>
                </div>
              ))}
            </Card>

            {order.traceabilityEvents && order.traceabilityEvents.length > 0 && (
              <Card>
                <p className="font-display font-semibold text-agro-800 mb-4">Línea de tiempo</p>
                <TraceabilityTimeline events={order.traceabilityEvents} />
              </Card>
            )}
          </div>
        )}

        {!order && !loading && !error && (
          <div className="text-center text-gray-400 text-sm py-8">
            <p>El código tiene el formato <span className="font-mono font-bold">AGRO-2026-000001</span></p>
            <p className="mt-1">Encuéntralo en tu correo de confirmación o en "Mis pedidos".</p>
          </div>
        )}
      </div>
    </div>
  );
}
