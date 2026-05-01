import { OrderStatus, PaymentStatus } from '../types';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const colors: Record<OrderStatus, string> = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    CONFIRMADO: 'bg-blue-100 text-blue-800',
    EN_RECOLECCION: 'bg-orange-100 text-orange-800',
    EN_CAMINO: 'bg-purple-100 text-purple-800',
    ENTREGADO: 'bg-green-100 text-green-800',
    CANCELADO: 'bg-red-100 text-red-800',
  };
  const labels: Record<OrderStatus, string> = {
    PENDIENTE: '⏳ Pendiente',
    CONFIRMADO: '✅ Confirmado',
    EN_RECOLECCION: '🚜 En recolección',
    EN_CAMINO: '🚚 En camino',
    ENTREGADO: '🎉 Entregado',
    CANCELADO: '❌ Cancelado',
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const colors: Record<PaymentStatus, string> = {
    PENDIENTE: 'bg-gray-100 text-gray-700',
    PAGADO: 'bg-green-100 text-green-800',
    FALLIDO: 'bg-red-100 text-red-800',
    SIMULADO: 'bg-teal-100 text-teal-800',
  };
  const labels: Record<PaymentStatus, string> = {
    PENDIENTE: 'Pago pendiente',
    PAGADO: '💳 Pagado',
    FALLIDO: '❌ Fallido',
    SIMULADO: '🔄 Simulado',
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

export function LoadingSpinner({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 border-4 border-agro-200 border-t-agro-600 rounded-full animate-spin" />
      <p className="text-agro-600 text-sm">{text}</p>
    </div>
  );
}

export function EmptyState({ icon = '📭', title, description }: { icon?: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-5xl">{icon}</span>
      <h3 className="font-display text-xl text-agro-700">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-sm">{description}</p>}
    </div>
  );
}

export function DashboardCard({
  icon, title, value, sub, color = 'green',
}: {
  icon: string; title: string; value: string | number; sub?: string; color?: string;
}) {
  const bg = color === 'yellow' ? 'bg-harvest-50 border-harvest-200' : 'bg-agro-50 border-agro-200';
  const val = color === 'yellow' ? 'text-harvest-600' : 'text-agro-700';
  return (
    <div className={`rounded-xl border-2 p-5 ${bg} flex flex-col gap-1`}>
      <span className="text-3xl">{icon}</span>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${val}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export function OfflineStatus({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;
  return (
    <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
      📡 <strong>Sin conexión</strong> — Los productos se guardarán localmente.
    </div>
  );
}

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl sm:text-3xl text-agro-800 font-bold">{title}</h1>
      {sub && <p className="text-gray-500 mt-1 text-sm">{sub}</p>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>{children}</div>;
}

export function Btn({
  children, onClick, type = 'button', variant = 'primary', disabled = false, className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  className?: string;
}) {
  const base = 'px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-agro-600 text-white hover:bg-agro-700',
    secondary: 'bg-harvest-500 text-white hover:bg-harvest-600',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-agro-600 text-agro-700 hover:bg-agro-50',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
