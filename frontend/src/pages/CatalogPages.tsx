import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { Navbar } from '../components/Navbar';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner, EmptyState, PageHeader, Btn } from '../components/UI';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Imágenes de respaldo por categoría (igual que ProductCard)
const categoryImage: Record<string, string> = {
  Fruta: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80&fit=crop',
  Café: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80&fit=crop',
  Hortaliza: 'https://images.unsplash.com/photo-1546470427-0d9702ad41a1?w=800&q=80&fit=crop',
  Tubérculo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80&fit=crop',
  Verdura: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80&fit=crop',
  Cereal: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&fit=crop',
};

const productImages: Record<string, string> = {
  'Mango Tommy': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80&fit=crop',
  'Café pergamino': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80&fit=crop',
  'Tomate chonto': 'https://images.unsplash.com/photo-1546470427-0d9702ad41a1?w=800&q=80&fit=crop',
  'Papa criolla': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80&fit=crop',
  'Mora de Castilla': 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=800&q=80&fit=crop',
};

function getProductImage(product: Product): string {
  if (product.imageUrl) return product.imageUrl;
  if (productImages[product.name]) return productImages[product.name];
  return categoryImage[product.category] || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&fit=crop';
}

// ─── CatalogPage ────────────────────────────────────────────────────────────

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
    const result = addItem(p, 1);
    if (!result.ok) { alert(result.message || 'No se pudo agregar el producto'); return; }
    alert(`✅ "${p.name}" agregado al carrito`);
  };

  const inp = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-agro-500 bg-white';

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <PageHeader title="Catálogo de productos" sub="Productos frescos directamente de Cundinamarca" />
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            className={`${inp} flex-1`}
            placeholder="🔍 Buscar por nombre..."
            value={filters.name}
            onChange={e => setFilters(p => ({ ...p, name: e.target.value }))}
          />
          <select className={inp} value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}>
            <option value="">Todas las categorías</option>
            {['Fruta', 'Hortaliza', 'Tubérculo', 'Café', 'Cereal', 'Verdura'].map(c => <option key={c}>{c}</option>)}
          </select>
          <select className={inp} value={filters.municipality} onChange={e => setFilters(p => ({ ...p, municipality: e.target.value }))}>
            <option value="">Todos los municipios</option>
            {['Viotá', 'La Mesa', 'Fusagasugá', 'Arbeláez', 'Silvania'].map(m => <option key={m}>{m}</option>)}
          </select>
          <Btn onClick={load}>Filtrar</Btn>
        </div>
        {loading ? <LoadingSpinner /> : products.length === 0 ? (
          <EmptyState icon="🌿" title="No hay productos" description="Intenta con otros filtros." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAdd={user?.role === 'COMPRADOR' ? handleAdd : undefined} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ProductDetailPage ───────────────────────────────────────────────────────

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-agro-50"><Navbar /><LoadingSpinner /></div>;
  if (!product) return <div className="min-h-screen bg-agro-50"><Navbar /><EmptyState title="Producto no encontrado" /></div>;

  const imgSrc = imgError ? getProductImage({ ...product, imageUrl: undefined }) : getProductImage(product);

  const handleAdd = () => {
    if (!user) { navigate('/login'); return; }
    const result = addItem(product, qty);
    if (!result.ok) { alert(result.message || 'No se pudo agregar el producto'); return; }
    alert(`✅ ${qty} ${product.unit} de "${product.name}" agregados al carrito`);
  };

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-agro-600 text-sm mb-4 hover:underline flex items-center gap-1">
          ← Volver al catálogo
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* ── Imagen real del producto ── */}
          <div className="relative h-64 sm:h-80 overflow-hidden bg-agro-50">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            {/* Badge categoría */}
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur text-agro-700 text-sm font-semibold px-3 py-1 rounded-full shadow">
                {product.category}
              </span>
            </div>
            {/* Badge municipio */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-sm font-medium">📍 {product.municipality}</p>
            </div>
          </div>

          {/* ── Contenido ── */}
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-agro-800">{product.name}</h1>
                <p className="text-gray-400 text-sm mt-0.5">{product.category} · {product.municipality}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-agro-700">
                  ${product.price.toLocaleString('es-CO')}
                </p>
                <p className="text-xs text-gray-400">por {product.unit}</p>
              </div>
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 p-4 bg-agro-50 rounded-xl text-sm">
              <div>
                <p className="text-gray-400 text-xs">Productor</p>
                <p className="font-semibold">{product.producer?.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Disponibles</p>
                <p className="font-semibold">{product.quantity} {product.unit}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Finca</p>
                <p className="font-semibold">{product.producer?.farmName || 'N/A'}</p>
              </div>
              {product.harvestDate && (
                <div>
                  <p className="text-gray-400 text-xs">Cosecha</p>
                  <p className="font-semibold">
                    {new Date(product.harvestDate).toLocaleDateString('es-CO')}
                  </p>
                </div>
              )}
            </div>

            {user?.role === 'COMPRADOR' && (
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2 py-1">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-agro-100 text-agro-700 font-bold hover:bg-agro-200 transition-colors"
                  >−</button>
                  <span className="w-10 text-center font-bold text-lg">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(product.quantity, q + 1))}
                    className="w-8 h-8 rounded-lg bg-agro-100 text-agro-700 font-bold hover:bg-agro-200 transition-colors"
                  >+</button>
                </div>
                <Btn onClick={handleAdd} className="flex-1 py-3 text-base">
                  🛒 Agregar {qty} {product.unit} al carrito
                </Btn>
              </div>
            )}

            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 border-2 border-agro-600 text-agro-700 rounded-xl font-semibold hover:bg-agro-50 transition-colors"
              >
                Inicia sesión para comprar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
