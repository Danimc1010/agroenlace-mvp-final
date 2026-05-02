import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { Navbar } from '../components/Navbar';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner, EmptyState, PageHeader, Btn } from '../components/UI';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getUnitOptions, priceInUnit, toBaseUnit } from '../utils/units';
import api from '../api/axios';

const productImages: Record<string, string> = {
  'Mango Tommy': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80&fit=crop',
  'Café pergamino': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80&fit=crop',
  'Tomate chonto': 'https://images.unsplash.com/photo-1546470427-0d9702ad41a1?w=800&q=80&fit=crop',
  'Papa criolla': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80&fit=crop',
  'Mora de Castilla': 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=800&q=80&fit=crop',
};

const categoryImage: Record<string, string> = {
  Fruta: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80&fit=crop',
  Café: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80&fit=crop',
  Hortaliza: 'https://images.unsplash.com/photo-1546470427-0d9702ad41a1?w=800&q=80&fit=crop',
  Tubérculo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80&fit=crop',
  Verdura: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80&fit=crop',
  Cereal: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&fit=crop',
  Legumbre: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80&fit=crop',
};

function getImage(product: Product): string {
  if (product.imageUrl) return product.imageUrl;
  if (productImages[product.name]) return productImages[product.name];
  return categoryImage[product.category] || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&fit=crop';
}

/* ─── CATÁLOGO ─── */
export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', category: '', municipality: '' });
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.name) params.set('name', filters.name);
    if (filters.category) params.set('category', filters.category);
    if (filters.municipality) params.set('municipality', filters.municipality);
    const { data } = await api.get(`/products?${params}`);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = (p: Product) => {
    if (!user) { navigate('/login'); return; }
    addItem(p, 1);
    alert(`✅ "${p.name}" agregado al carrito`);
  };

  const inp = 'border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-agro-500 bg-white transition-all';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader title="Catálogo de productos" sub="Productos frescos directamente de Cundinamarca" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input className={`${inp} flex-1`} placeholder="🔍 Buscar por nombre..."
            value={filters.name} onChange={e => setFilters(p => ({ ...p, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && load()} />
          <select className={inp} value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}>
            <option value="">Todas las categorías</option>
            {['Fruta','Hortaliza','Tubérculo','Café','Cereal','Verdura','Legumbre'].map(c => <option key={c}>{c}</option>)}
          </select>
          <select className={inp} value={filters.municipality} onChange={e => setFilters(p => ({ ...p, municipality: e.target.value }))}>
            <option value="">Todos los municipios</option>
            {['Viotá','La Mesa','Fusagasugá','Arbeláez','Silvania'].map(m => <option key={m}>{m}</option>)}
          </select>
          <Btn onClick={load}>Filtrar</Btn>
        </div>
        {loading ? <LoadingSpinner /> : products.length === 0 ? (
          <EmptyState icon="🌿" title="No hay productos" description="Intenta con otros filtros." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map(p => (
              <ProductCard key={p.id} product={p}
                onAdd={user?.role === 'COMPRADOR' ? handleAdd : undefined} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── DETALLE DE PRODUCTO con selector de unidad ─── */
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data);
      setSelectedUnit(r.data.unit);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><LoadingSpinner /></div>;
  if (!product) return <div className="min-h-screen bg-gray-50"><Navbar /><EmptyState title="Producto no encontrado" /></div>;

  const imgSrc = product.imageUrl || productImages[product.name] || categoryImage[product.category]
    || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&fit=crop';

  const unitOptions = getUnitOptions(product.unit);
  const currentOption = unitOptions.find(u => u.value === selectedUnit) || unitOptions[0];
  const priceInSelected = priceInUnit(product.price, currentOption.factor);
  const baseQtyEquiv = toBaseUnit(qty, currentOption.factor);

  const handleAdd = () => {
    if (!user) { navigate('/login'); return; }
    if (baseQtyEquiv > product.quantity) {
      alert(`⚠️ Stock insuficiente. Solo hay ${product.quantity} ${product.unit} disponibles.`);
      return;
    }
    addItem(product, qty, selectedUnit, currentOption.factor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-agro-600 text-sm mb-6 hover:underline font-medium">
          ← Volver al catálogo
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Imagen real */}
            <div className="relative h-72 md:h-full min-h-[300px] overflow-hidden">
              <img src={imgSrc} alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&fit=crop'; }} />
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 backdrop-blur text-agro-700 text-xs font-bold px-3 py-1 rounded-full shadow">{product.category}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white text-sm font-medium">📍 {product.municipality}, Cundinamarca</p>
              </div>
            </div>

            {/* Info + selector unidad */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-agro-800 mb-1">{product.name}</h1>
                {product.producer?.user && (
                  <p className="text-gray-500 text-sm">👨‍🌾 {product.producer.user.name} · {product.producer?.farmName}</p>
                )}
              </div>

              {product.description && (
                <p className="text-gray-600 text-sm leading-relaxed border-l-2 border-agro-300 pl-3">{product.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-agro-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Stock disponible</p>
                  <p className="font-bold text-agro-800">{product.quantity} {product.unit}</p>
                </div>
                <div className="bg-agro-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Municipio</p>
                  <p className="font-bold text-agro-800">{product.municipality}</p>
                </div>
              </div>

              {/* Selector de unidad */}
              {user?.role === 'COMPRADOR' && (
                <div className="bg-agro-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-agro-700 uppercase tracking-wide">⚖️ Selecciona la unidad de compra</p>
                  <select
                    value={selectedUnit}
                    onChange={e => { setSelectedUnit(e.target.value); setQty(1); }}
                    className="w-full border border-agro-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-agro-500 bg-white font-medium"
                  >
                    {unitOptions.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>

                  {/* Equivalencia */}
                  {selectedUnit !== product.unit && (
                    <div className="bg-white border border-agro-200 rounded-lg px-3 py-2 text-xs text-agro-700">
                      💡 1 {currentOption.display} = {currentOption.factor} {product.unit}
                    </div>
                  )}
                </div>
              )}

              {/* Precio en la unidad seleccionada */}
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-agro-700">${priceInSelected.toLocaleString('es-CO')}</p>
                <p className="text-gray-400 mb-1 text-sm">/ {currentOption.display}</p>
              </div>

              {/* Cantidad + carrito */}
              {user?.role === 'COMPRADOR' && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2">
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg text-agro-700 font-bold hover:bg-agro-50 transition-colors text-xl">−</button>
                      <span className="w-10 text-center font-bold text-lg">{qty}</span>
                      <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 rounded-lg text-agro-700 font-bold hover:bg-agro-50 transition-colors text-xl">+</button>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-bold text-agro-800">{qty} {currentOption.display}</span>
                      {selectedUnit !== product.unit && (
                        <span className="text-gray-400"> = {baseQtyEquiv} {product.unit}</span>
                      )}
                    </div>
                  </div>

                  {/* Total preview */}
                  <div className="bg-agro-50 rounded-xl px-4 py-2 flex justify-between text-sm">
                    <span className="text-gray-500">Total estimado:</span>
                    <span className="font-bold text-agro-800">${(priceInSelected * qty).toLocaleString('es-CO')} COP</span>
                  </div>

                  <button onClick={handleAdd}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      added ? 'bg-green-500 text-white' : 'bg-agro-600 hover:bg-agro-700 text-white hover:-translate-y-0.5 shadow hover:shadow-md'
                    }`}>
                    {added ? '✅ Agregado al carrito' : `Agregar ${qty} ${currentOption.display} al carrito 🛒`}
                  </button>
                </>
              )}

              {!user && (
                <button onClick={() => navigate('/login')} className="w-full py-3 rounded-xl font-bold text-sm bg-agro-600 hover:bg-agro-700 text-white transition-all">
                  Inicia sesión para comprar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
