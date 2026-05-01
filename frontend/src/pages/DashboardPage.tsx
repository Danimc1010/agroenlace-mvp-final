import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { DashboardCard, LoadingSpinner, PageHeader, Card } from '../components/UI';
import api from '../api/axios';

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary').then(r => setSummary(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-agro-50"><Navbar /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <PageHeader title={`Hola, ${user?.name} 👋`} sub={`Panel de ${user?.role?.replace('_', ' ')}`} />

        {user?.role === 'PRODUCTOR' && <ProducerDashboard summary={summary} />}
        {user?.role === 'COMPRADOR' && <BuyerDashboard summary={summary} />}
        {user?.role === 'ADMIN_LOGISTICO' && <AdminDashboard summary={summary} />}
      </div>
    </div>
  );
}

function ProducerDashboard({ summary }: { summary: any }) {
  const pendingOffline = JSON.parse(localStorage.getItem('agro_offline_products') || '[]').length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DashboardCard icon="📦" title="Total productos" value={summary?.total ?? 0} />
        <DashboardCard icon="✅" title="Disponibles" value={summary?.available ?? 0} color="yellow" />
        <DashboardCard icon="🛒" title="Pedidos recibidos" value={summary?.orders ?? 0} />
        <DashboardCard icon="📡" title="Pendientes sync" value={pendingOffline} color="yellow" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Link to="/producer/products" className="bg-agro-600 text-white rounded-xl p-5 hover:bg-agro-700 transition-colors text-center">
          <span className="text-3xl block mb-2">📋</span>
          <p className="font-bold">Mis productos</p>
        </Link>
        <Link to="/producer/create-product" className="bg-harvest-500 text-white rounded-xl p-5 hover:bg-harvest-600 transition-colors text-center">
          <span className="text-3xl block mb-2">➕</span>
          <p className="font-bold">Crear producto</p>
        </Link>
        <Link to="/producer/orders" className="bg-agro-700 text-white rounded-xl p-5 hover:bg-agro-800 transition-colors text-center">
          <span className="text-3xl block mb-2">📬</span>
          <p className="font-bold">Pedidos recibidos</p>
        </Link>
        <Link to="/producer/offline" className="bg-white border-2 border-agro-200 text-agro-700 rounded-xl p-5 hover:bg-agro-50 transition-colors text-center">
          <span className="text-3xl block mb-2">📡</span>
          <p className="font-bold">Productos offline</p>
        </Link>
      </div>
    </div>
  );
}

function BuyerDashboard({ summary }: { summary: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard icon="🛒" title="Pedidos realizados" value={summary?.totalOrders ?? 0} />
        <DashboardCard icon="💰" title="Total comprado" value={`$${(summary?.totalSpent ?? 0).toLocaleString('es-CO')}`} color="yellow" />
        <DashboardCard icon="📦" title="Último pedido" value={summary?.lastOrder?.traceabilityCode ?? 'Ninguno'} sub={summary?.lastOrder?.status} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/catalog" className="bg-agro-600 text-white rounded-xl p-5 hover:bg-agro-700 text-center">
          <span className="text-3xl block mb-2">🛍️</span>
          <p className="font-bold">Ver catálogo</p>
        </Link>
        <Link to="/buyer/orders" className="bg-white border-2 border-agro-200 text-agro-700 rounded-xl p-5 hover:bg-agro-50 text-center">
          <span className="text-3xl block mb-2">📋</span>
          <p className="font-bold">Mis pedidos</p>
        </Link>
        <Link to="/traceability" className="bg-harvest-500 text-white rounded-xl p-5 hover:bg-harvest-600 text-center">
          <span className="text-3xl block mb-2">🔍</span>
          <p className="font-bold">Trazabilidad</p>
        </Link>
      </div>
    </div>
  );
}

function AdminDashboard({ summary }: { summary: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DashboardCard icon="📦" title="Total productos" value={summary?.totalProducts ?? 0} />
        <DashboardCard icon="🛒" title="Total pedidos" value={summary?.totalOrders ?? 0} />
        <DashboardCard icon="⏳" title="Pendientes" value={summary?.pendingOrders ?? 0} color="yellow" />
        <DashboardCard icon="✅" title="Entregados" value={summary?.deliveredOrders ?? 0} />
        <DashboardCard icon="🗺️" title="Rutas generadas" value={summary?.totalRoutes ?? 0} />
        <DashboardCard icon="💰" title="Valor vendido" value={`$${(summary?.totalSales ?? 0).toLocaleString('es-CO')}`} color="yellow" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/pending-orders" className="bg-agro-600 text-white rounded-xl p-5 hover:bg-agro-700 text-center">
          <span className="text-3xl block mb-2">📋</span><p className="font-bold">Pedidos pendientes</p>
        </Link>
        <Link to="/admin/generate-route" className="bg-harvest-500 text-white rounded-xl p-5 hover:bg-harvest-600 text-center">
          <span className="text-3xl block mb-2">🗺️</span><p className="font-bold">Generar ruta</p>
        </Link>
        <Link to="/admin/routes" className="bg-white border-2 border-agro-200 text-agro-700 rounded-xl p-5 hover:bg-agro-50 text-center">
          <span className="text-3xl block mb-2">🚚</span><p className="font-bold">Ver rutas</p>
        </Link>
      </div>
      {summary?.byMunicipality?.length > 0 && (
        <Card>
          <p className="font-display font-semibold text-agro-800 mb-3">Productos por municipio</p>
          <div className="space-y-2">
            {summary.byMunicipality.map((m: any) => (
              <div key={m.municipality} className="flex justify-between text-sm border-b border-gray-50 pb-1">
                <span className="text-gray-600">📍 {m.municipality}</span>
                <span className="font-semibold text-agro-700">{m._count.id} productos</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
