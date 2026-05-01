import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Order } from '../types';
import { Navbar } from '../components/Navbar';
import { OrderStatusBadge, PaymentStatusBadge, LoadingSpinner, EmptyState, PageHeader, Card, Btn } from '../components/UI';
import { TraceabilityTimeline } from '../components/TraceabilityTimeline';
import api from '../api/axios';

export function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-agro-50"><Navbar /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PageHeader title="Mis pedidos" sub="Historial de compras realizadas" />
        {orders.length === 0 ? (
          <EmptyState icon="📋" title="No tienes pedidos" description="Visita el catálogo y realiza tu primera compra." />
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs text-agro-600 font-bold">{order.traceabilityCode}</span>
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                  <p className="text-sm text-gray-500">{order.items?.length || 0} producto(s) · Total: <strong>${order.total.toLocaleString('es-CO')}</strong></p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('es-CO')}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/buyer/orders/${order.id}`}><Btn variant="outline">Ver detalle</Btn></Link>
                  {order.paymentStatus === 'PENDIENTE' && (
                    <Link to={`/payment/${order.id}`}><Btn variant="secondary">Pagar</Btn></Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-agro-50"><Navbar /><LoadingSpinner /></div>;
  if (!order) return <div className="min-h-screen bg-agro-50"><Navbar /><EmptyState title="Pedido no encontrado" /></div>;

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-agro-600 text-sm mb-4 hover:underline">← Volver</button>
        <PageHeader title={`Pedido ${order.traceabilityCode}`} />
        <div className="space-y-5">
          <Card>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><p className="text-gray-400">Estado</p><OrderStatusBadge status={order.status} /></div>
              <div><p className="text-gray-400">Pago</p><PaymentStatusBadge status={order.paymentStatus} /></div>
              <div><p className="text-gray-400">Total</p><p className="font-bold text-agro-700">${order.total.toLocaleString('es-CO')}</p></div>
              <div><p className="text-gray-400">Fecha</p><p className="font-semibold text-xs">{new Date(order.createdAt).toLocaleDateString('es-CO')}</p></div>
            </div>
            {order.deliveryAddress && <p className="text-xs text-gray-400 mt-3">📍 {order.deliveryAddress}</p>}
          </Card>

          <Card>
            <p className="font-display font-semibold text-agro-800 mb-3">Productos</p>
            {order.items?.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 text-sm">
                <div>
                  <p className="font-semibold">{item.product?.name}</p>
                  <p className="text-xs text-gray-400">{item.product?.municipality} · {item.product?.producer?.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{item.quantity} {item.product?.unit} × ${item.unitPrice.toLocaleString('es-CO')}</p>
                  <p className="font-bold text-agro-700">${item.subtotal.toLocaleString('es-CO')}</p>
                </div>
              </div>
            ))}
          </Card>

          {order.payment && (
            <Card>
              <p className="font-display font-semibold text-agro-800 mb-3">Pago</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-400">Método</p><p className="font-semibold">{order.payment.method}</p></div>
                <div><p className="text-gray-400">Referencia</p><p className="font-mono text-xs text-agro-600">{order.payment.transactionReference}</p></div>
              </div>
            </Card>
          )}

          {order.traceabilityEvents && order.traceabilityEvents.length > 0 && (
            <Card>
              <p className="font-display font-semibold text-agro-800 mb-4">Historial de trazabilidad</p>
              <TraceabilityTimeline events={order.traceabilityEvents} />
            </Card>
          )}

          {order.paymentStatus === 'PENDIENTE' && (
            <Link to={`/payment/${order.id}`}><Btn className="w-full py-3 text-base">💳 Ir al pago</Btn></Link>
          )}
        </div>
      </div>
    </div>
  );
}
