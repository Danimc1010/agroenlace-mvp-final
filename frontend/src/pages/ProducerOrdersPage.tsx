import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { OrderStatus, PaymentStatus } from '../types';
import { PageHeader, Card, LoadingSpinner, EmptyState, OrderStatusBadge, PaymentStatusBadge } from '../components/UI';
import api from '../api/axios';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    unit: string;
    municipality: string;
  };
}

interface ProducerOrder {
  id: string;
  traceabilityCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  deliveryAddress: string;
  createdAt: string;
  buyer: { name: string; email: string };
  items: OrderItem[];
}

export default function ProducerOrdersPage() {
  const [orders, setOrders] = useState<ProducerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders/producer-orders')
      .then((r) => setOrders(r.data))
      .catch(() => setError('No se pudieron cargar los pedidos.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-agro-50"><Navbar /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PageHeader title="Pedidos recibidos" sub="Pedidos que incluyen tus productos" />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {orders.length === 0 && !error ? (
          <EmptyState
            icon="📭"
            title="Sin pedidos aún"
            description="Cuando un comprador adquiera tus productos, aparecerán aquí."
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="font-mono text-base font-bold text-agro-700">
                      {order.traceabilityCode}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                </div>

                {/* Buyer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Comprador</p>
                    <p className="font-semibold">{order.buyer.name}</p>
                    <p className="text-xs text-gray-400">{order.buyer.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total del pedido</p>
                    <p className="font-bold text-agro-700 text-base">
                      ${order.total.toLocaleString('es-CO')}
                    </p>
                    {order.deliveryAddress && (
                      <p className="text-xs text-gray-400 mt-1">📍 {order.deliveryAddress}</p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Tus productos en este pedido
                  </p>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm bg-agro-50 rounded-lg px-3 py-2"
                    >
                      <div>
                        <p className="font-semibold text-agro-800">{item.product.name}</p>
                        <p className="text-xs text-gray-400">
                          📍 {item.product.municipality} · {item.quantity} {item.product.unit} ×{' '}
                          ${item.unitPrice.toLocaleString('es-CO')}/{item.product.unit}
                        </p>
                      </div>
                      <p className="font-bold text-agro-700 shrink-0">
                        ${item.subtotal.toLocaleString('es-CO')}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
