import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { Navbar } from '../components/Navbar';
import { PageHeader, Card, Btn, LoadingSpinner, EmptyState, OfflineStatus } from '../components/UI';
import { ProductForm } from '../components/ProductForm';
import { useOffline } from '../hooks/useOffline';
import api from '../api/axios';

/* ── My Products ── */
export function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.get('/products/my-products').then(r => setProducts(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deactivate = async (id: string) => {
    if (!confirm('¿Desactivar este producto?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  const statusLabel: Record<string, string> = {
    DISPONIBLE: '✅ Disponible', RESERVADO: '⏳ Reservado',
    VENDIDO: '💰 Vendido', INACTIVO: '❌ Inactivo',
  };

  if (loading) return <div className="min-h-screen bg-agro-50"><Navbar /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <PageHeader title="Mis productos" sub="Productos publicados en AgroEnlace" />
          <Link to="/producer/create-product"><Btn>➕ Nuevo producto</Btn></Link>
        </div>
        {products.length === 0 ? (
          <EmptyState icon="📦" title="No tienes productos" description="Crea tu primer producto para publicarlo en el catálogo." />
        ) : (
          <div className="space-y-3">
            {products.map(p => (
              <Card key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Miniatura de imagen si existe */}
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-agro-800">{p.name}</p>
                    <span className="text-xs bg-agro-100 text-agro-700 px-2 py-0.5 rounded-full">{p.category}</span>
                    <span className="text-xs text-gray-400">{statusLabel[p.status]}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    📍 {p.municipality} · {p.quantity} {p.unit} · <strong>${p.price.toLocaleString('es-CO')}/{p.unit}</strong>
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Btn variant="outline" onClick={() => navigate(`/producer/edit-product/${p.id}`)}>Editar</Btn>
                  {p.status !== 'INACTIVO' && (
                    <Btn variant="danger" onClick={() => deactivate(p.id)}>Desactivar</Btn>
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

/* ── Create Product ── */
export function CreateProductPage() {
  const navigate = useNavigate();
  const { isOnline, saveOfflineProduct } = useOffline();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [offlineSaved, setOfflineSaved] = useState(false);

  const handleSubmit = async (formData: any) => {
    const payload = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      price: parseFloat(formData.price),
      municipality: formData.municipality,
      harvestDate: formData.harvestDate || undefined,
      imageUrl: formData.imageUrl || undefined, // ✅ incluido
    };

    if (!isOnline) {
      saveOfflineProduct(payload);
      setOfflineSaved(true);
      return;
    }

    setLoading(true);
    try {
      await api.post('/products', payload);
      setSuccess(true);
      setTimeout(() => navigate('/producer/products'), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-agro-600 text-sm mb-4 hover:underline">← Volver</button>
        <PageHeader title="Crear producto" sub="Publica una cosecha o producto agrícola" />
        <OfflineStatus isOnline={isOnline} />
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
            ✅ Producto creado exitosamente.
          </div>
        )}
        {offlineSaved && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl mb-4">
            📡 <strong>Producto guardado localmente.</strong> Se sincronizará cuando vuelva la conexión.
            <div className="mt-2">
              <Link to="/producer/offline"><Btn variant="outline">Ver productos pendientes</Btn></Link>
            </div>
          </div>
        )}
        {!offlineSaved && !success && (
          <Card>
            <ProductForm
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel={isOnline ? 'Publicar producto' : '💾 Guardar offline'}
            />
          </Card>
        )}
      </div>
    </div>
  );
}

/* ── Edit Product ── */
export function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/products/${id}`, {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        price: parseFloat(formData.price),
        municipality: formData.municipality,
        harvestDate: formData.harvestDate || undefined,
        imageUrl: formData.imageUrl || undefined, // ✅ incluido
      });
      navigate('/producer/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen bg-agro-50"><Navbar /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-agro-600 text-sm mb-4 hover:underline">← Volver</button>
        <PageHeader title="Editar producto" />
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        <Card>
          {product && (
            <ProductForm
              initial={{
                name: product.name,
                category: product.category,
                description: product.description,
                quantity: String(product.quantity),
                unit: product.unit,
                price: String(product.price),
                municipality: product.municipality,
                harvestDate: product.harvestDate ? product.harvestDate.slice(0, 10) : '',
                imageUrl: product.imageUrl || '', // ✅ carga la imagen actual en el uploader
              }}
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel="Guardar cambios"
            />
          )}
        </Card>
      </div>
    </div>
  );
}

/* ── Offline Products ── */
export function OfflineProductsPage() {
  const { isOnline, offlineProducts, removeOfflineProduct, clearOfflineProducts } = useOffline();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ ok: number; fail: number } | null>(null);

  const syncAll = async () => {
    if (!isOnline) { alert('Aún no tienes conexión'); return; }
    setSyncing(true);
    let ok = 0; let fail = 0;
    for (const p of offlineProducts) {
      try {
        await api.post('/products', {
          name: p.name, category: p.category, description: p.description,
          quantity: p.quantity, unit: p.unit, price: p.price,
          municipality: p.municipality, harvestDate: p.harvestDate,
        });
        removeOfflineProduct(p.tempId);
        ok++;
      } catch { fail++; }
    }
    setSyncResult({ ok, fail });
    setSyncing(false);
  };

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title="Productos pendientes de sincronización" sub="Guardados localmente sin conexión" />
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-semibold ${isOnline
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-orange-50 border border-orange-200 text-orange-700'}`}>
          {isOnline ? '🟢 Conexión activa — puedes sincronizar' : '📡 Sin conexión — los productos se guardan localmente'}
        </div>
        {syncResult && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-xl mb-4">
            ✅ Sincronización completa: <strong>{syncResult.ok}</strong> exitosos · <strong>{syncResult.fail}</strong> fallidos
          </div>
        )}
        {offlineProducts.length === 0 ? (
          <EmptyState icon="✅" title="No hay productos pendientes" description="Todos los productos están sincronizados." />
        ) : (
          <>
            <div className="space-y-3 mb-5">
              {offlineProducts.map(p => (
                <Card key={p.tempId}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-agro-800">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.category} · {p.municipality} · {p.quantity} {p.unit} · ${p.price.toLocaleString('es-CO')}/{p.unit}
                      </p>
                      <p className="text-xs text-gray-400">Guardado: {new Date(p.savedAt).toLocaleString('es-CO')}</p>
                    </div>
                    <button
                      onClick={() => removeOfflineProduct(p.tempId)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex gap-3">
              <Btn onClick={syncAll} disabled={!isOnline || syncing} className="flex-1 py-3">
                {syncing ? 'Sincronizando...' : `🔄 Sincronizar ${offlineProducts.length} producto(s)`}
              </Btn>
              <Btn variant="danger" onClick={() => {
                if (confirm('¿Eliminar todos los productos offline?')) clearOfflineProducts();
              }}>
                Limpiar
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
