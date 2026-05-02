import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { PageHeader, Btn, Card, EmptyState } from '../components/UI';
import api from '../api/axios';

const productImages: Record<string, string> = {
  'Mango Tommy': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&q=80&fit=crop',
  'Café pergamino': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=200&q=80&fit=crop',
  'Tomate chonto': 'https://images.unsplash.com/photo-1546470427-0d9702ad41a1?w=200&q=80&fit=crop',
  'Papa criolla': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&q=80&fit=crop',
  'Mora de Castilla': 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=200&q=80&fit=crop',
};
const categoryImage: Record<string, string> = {
  Fruta: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&q=80&fit=crop',
  Café: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=200&q=80&fit=crop',
  Hortaliza: 'https://images.unsplash.com/photo-1546470427-0d9702ad41a1?w=200&q=80&fit=crop',
  Tubérculo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&q=80&fit=crop',
  Verdura: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80&fit=crop',
};

function getImage(product: any): string {
  if (product.imageUrl) return product.imageUrl;
  if (productImages[product.name]) return productImages[product.name];
  return categoryImage[product.category] || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&q=80&fit=crop';
}

/* ─── CARRITO ─── */
export function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <EmptyState icon="🛒" title="Tu carrito está vacío" description="Agrega productos desde el catálogo." />
          <div className="text-center mt-4"><Link to="/catalog"><Btn>Ir al catálogo</Btn></Link></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PageHeader title="Carrito de compras" sub={`${items.length} producto(s) seleccionado(s)`} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const displayPrice = (item as any).displayPrice || item.product.price;
              const displayUnit = (item as any).displayUnit || item.product.unit;
              const imgSrc = getImage(item.product);

              return (
                <Card key={item.product.id} className="flex gap-4 items-center hover:border-agro-200 transition-colors">
                  {/* Miniatura real */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-agro-50">
                    <img
                      src={imgSrc}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&q=80&fit=crop'; }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-agro-800 text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-400">${displayPrice.toLocaleString('es-CO')} / {displayUnit}</p>
                    {(item as any).unitFactor && (item as any).unitFactor !== 1 && (
                      <p className="text-xs text-agro-500">
                        = {((item as any).baseQuantity || item.quantity * (item as any).unitFactor).toFixed(3)} {item.product.unit} en total
                      </p>
                    )}
                  </div>

                  {/* Control cantidad */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => item.quantity > 1 ? updateQty(item.product.id, item.quantity - 1) : removeItem(item.product.id)}
                      className="w-8 h-8 rounded-full bg-agro-100 text-agro-700 font-bold hover:bg-agro-200 transition-colors flex items-center justify-center"
                    >−</button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-agro-100 text-agro-700 font-bold hover:bg-agro-200 transition-colors flex items-center justify-center"
                    >+</button>
                  </div>

                  <div className="text-right shrink-0 min-w-[70px]">
                    <p className="font-bold text-agro-700">${(displayPrice * item.quantity).toLocaleString('es-CO')}</p>
                    <button onClick={() => removeItem(item.product.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Eliminar</button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Resumen */}
          <div>
            <Card>
              <p className="font-display font-bold text-agro-800 text-lg mb-4">Resumen</p>
              <div className="space-y-2 text-sm">
                {items.map(i => {
                  const displayPrice = (i as any).displayPrice || i.product.price;
                  const displayUnit = (i as any).displayUnit || i.product.unit;
                  return (
                    <div key={i.product.id} className="flex justify-between text-gray-500">
                      <span>{i.product.name} ×{i.quantity} {displayUnit}</span>
                      <span>${(displayPrice * i.quantity).toLocaleString('es-CO')}</span>
                    </div>
                  );
                })}
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-agro-800 text-base">
                  <span>Total</span>
                  <span>${total.toLocaleString('es-CO')}</span>
                </div>
              </div>
              <Btn onClick={() => navigate('/checkout')} className="w-full mt-5 py-3 text-base">Confirmar pedido →</Btn>
              <button onClick={clearCart} className="w-full mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors">Vaciar carrito</button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CHECKOUT ─── */
export function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        items: items.map(i => ({
          productId: i.product.id,
          quantity: (i as any).baseQuantity || i.quantity * ((i as any).unitFactor || 1),
        })),
        deliveryAddress: address || user?.buyerProfile?.address || 'Por definir',
      };
      const { data } = await api.post('/orders', payload);
      clearCart();
      navigate(`/payment/${data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear pedido');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0)
    return (
      <div className="min-h-screen bg-gray-50"><Navbar />
        <div className="max-w-xl mx-auto px-4 py-10">
          <EmptyState icon="🛒" title="Carrito vacío" />
          <div className="text-center mt-4"><Link to="/catalog"><Btn>Ir al catálogo</Btn></Link></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <PageHeader title="Confirmar pedido" sub="Revisa tu pedido antes de continuar al pago" />
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        <Card className="mb-4">
          <p className="font-semibold text-agro-800 mb-3">📦 Productos</p>
          {items.map(i => {
            const displayPrice = (i as any).displayPrice || i.product.price;
            const displayUnit = (i as any).displayUnit || i.product.unit;
            return (
              <div key={i.product.id} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-600">{i.product.name} × {i.quantity} {displayUnit}</span>
                <span className="font-semibold">${(displayPrice * i.quantity).toLocaleString('es-CO')}</span>
              </div>
            );
          })}
          <div className="flex justify-between font-bold text-agro-800 text-base mt-3 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>${total.toLocaleString('es-CO')}</span>
          </div>
        </Card>
        <Card className="mb-6">
          <p className="font-semibold text-agro-800 mb-3">📍 Dirección de entrega</p>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-agro-500 transition-all"
            rows={2} placeholder="Ej: Calle 80 # 15-20, Bogotá"
            value={address} onChange={e => setAddress(e.target.value)}
          />
        </Card>
        <div className="flex gap-3">
          <Btn variant="outline" onClick={() => navigate('/cart')} className="flex-1 py-3">← Volver</Btn>
          <Btn onClick={handleConfirm} disabled={loading} className="flex-1 py-3 text-base">
            {loading ? 'Procesando...' : 'Ir al pago →'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ─── PAGO ─── */
export function PaymentPage() {
  const navigate = useNavigate();
  const orderId = window.location.pathname.split('/').pop() || '';
  const [method, setMethod] = useState<string>('NEQUI');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState('');

  const methods = [
    { id: 'NEQUI', label: 'Nequi', icon: '📱', color: 'bg-green-500', desc: 'Bancolombia digital' },
    { id: 'DAVIPLATA', label: 'Daviplata', icon: '💜', color: 'bg-purple-700', desc: 'Davivienda móvil' },
    { id: 'PSE', label: 'PSE', icon: '🏦', color: 'bg-blue-800', desc: 'Débito bancario' },
    { id: 'CONTRAENTREGA', label: 'Contraentrega', icon: '💵', color: 'bg-agro-600', desc: 'Pago en efectivo' },
  ];

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/payments/simulate', { orderId, method });
      setReceipt(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar pago');
    } finally {
      setLoading(false);
    }
  };

  if (receipt) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <Card className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h2 className="font-display text-2xl text-agro-800 font-bold">¡Pago registrado!</h2>
          <p className="text-gray-500 text-sm">Tu pedido ha sido confirmado exitosamente.</p>
          <div className="bg-agro-50 rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Referencia</span><span className="font-mono font-bold text-agro-700">{receipt.transactionReference}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Método</span><span className="font-semibold">{method}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Estado</span><span className="text-teal-600 font-semibold">✅ Simulado</span></div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Btn onClick={() => navigate('/buyer/orders')} className="w-full py-3">Ver mis pedidos</Btn>
            <Btn variant="outline" onClick={() => navigate('/traceability')} className="w-full py-3">🔍 Consultar trazabilidad</Btn>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <PageHeader title="Simular pago" sub="Selecciona tu método de pago preferido" />
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        <Card className="space-y-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Método de pago</p>
          <div className="grid grid-cols-2 gap-3">
            {methods.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`p-4 rounded-xl border-2 text-center transition-all hover:-translate-y-0.5 ${method === m.id ? 'border-agro-600 bg-agro-50 shadow-md' : 'border-gray-100 hover:border-agro-200'}`}>
                <span className={`text-2xl block w-12 h-8 rounded-lg ${m.color} flex items-center justify-center mx-auto mb-2`}>
                  {m.icon}
                </span>
                <span className="text-sm font-bold text-agro-800 block">{m.label}</span>
                <span className="text-xs text-gray-400">{m.desc}</span>
              </button>
            ))}
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
            ⚠️ Este es un pago <strong>simulado</strong>. No se realizará ningún cobro real.
          </div>
          <Btn onClick={handlePay} disabled={loading} className="w-full py-3 text-base">
            {loading ? 'Procesando...' : `Confirmar pago con ${method}`}
          </Btn>
        </Card>
      </div>
    </div>
  );
}
