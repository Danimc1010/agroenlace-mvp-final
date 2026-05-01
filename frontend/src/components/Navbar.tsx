import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const roleLabel: Record<string, string> = {
  PRODUCTOR: 'Productor',
  COMPRADOR: 'Comprador',
  ADMIN_LOGISTICO: 'Admin Logístico',
};

export function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const goHome = () => {
    if (user) navigate('/dashboard');
    else navigate('/');
  };

  return (
    <nav className="bg-agro-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Logo */}
        <button onClick={goHome} className="flex items-center gap-1 text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
          <img
            src="/logo.png"
            alt="AgroEnlace"
            className="w-12 h-12 object-contain drop-shadow"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="font-display">AgroEnlace</span>
        </button>

        {user && (
          <div className="hidden sm:flex items-center gap-1">
            {user.role === 'COMPRADOR' && (
              <>
                <Link to="/catalog" className="text-agro-100 hover:text-white hover:bg-agro-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Catálogo</Link>
                <Link to="/buyer/orders" className="text-agro-100 hover:text-white hover:bg-agro-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Mis pedidos</Link>
                <Link to="/traceability" className="text-agro-100 hover:text-white hover:bg-agro-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Trazabilidad</Link>
              </>
            )}
            {user.role === 'PRODUCTOR' && (
              <>
                <Link to="/producer/products" className="text-agro-100 hover:text-white hover:bg-agro-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Mis productos</Link>
                <Link to="/producer/create-product" className="text-agro-100 hover:text-white hover:bg-agro-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Crear producto</Link>
                <Link to="/producer/orders" className="text-agro-100 hover:text-white hover:bg-agro-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Pedidos</Link>
              </>
            )}
            {user.role === 'ADMIN_LOGISTICO' && (
              <>
                <Link to="/admin/pending-orders" className="text-agro-100 hover:text-white hover:bg-agro-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Pedidos</Link>
                <Link to="/admin/generate-route" className="text-agro-100 hover:text-white hover:bg-agro-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Rutas</Link>
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {user?.role === 'COMPRADOR' && (
            <Link to="/cart" className="relative text-white hover:bg-agro-600 p-2 rounded-lg transition-all">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 3h2l2.5 9h7l2-6H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="15" r="1" fill="white"/>
                <circle cx="14" cy="15" r="1" fill="white"/>
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-harvest-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{count}</span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 bg-agro-600 hover:bg-agro-500 text-white px-3 py-1.5 rounded-lg transition-all text-sm font-medium">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-agro-700 font-bold text-xs">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="hidden sm:block max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}>
                  <path d="M2 4l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                  <div className="px-4 py-3 bg-agro-50 border-b border-gray-100">
                    <p className="font-semibold text-agro-800 text-sm truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-xs bg-agro-100 text-agro-700 px-2 py-0.5 rounded-full font-medium">{roleLabel[user.role]}</span>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { navigate('/dashboard'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-agro-50 hover:text-agro-800 flex items-center gap-2 transition-colors">
                      🏠 Mi dashboard
                    </button>
                    {user.role === 'COMPRADOR' && (
                      <>
                        <button onClick={() => { navigate('/catalog'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-agro-50 hover:text-agro-800 flex items-center gap-2 transition-colors">🛍️ Ver catálogo</button>
                        <button onClick={() => { navigate('/buyer/orders'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-agro-50 hover:text-agro-800 flex items-center gap-2 transition-colors">📋 Mis pedidos</button>
                        <button onClick={() => { navigate('/traceability'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-agro-50 hover:text-agro-800 flex items-center gap-2 transition-colors">🔍 Trazabilidad</button>
                      </>
                    )}
                    {user.role === 'PRODUCTOR' && (
                      <>
                        <button onClick={() => { navigate('/producer/products'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-agro-50 hover:text-agro-800 flex items-center gap-2 transition-colors">📦 Mis productos</button>
                        <button onClick={() => { navigate('/producer/create-product'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-agro-50 hover:text-agro-800 flex items-center gap-2 transition-colors">➕ Crear producto</button>
                        <button onClick={() => { navigate('/producer/orders'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-agro-50 hover:text-agro-800 flex items-center gap-2 transition-colors">📬 Pedidos recibidos</button>
                        <button onClick={() => { navigate('/producer/offline'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-agro-50 hover:text-agro-800 flex items-center gap-2 transition-colors">📡 Productos offline</button>
                      </>
                    )}
                    {user.role === 'ADMIN_LOGISTICO' && (
                      <>
                        <button onClick={() => { navigate('/admin/pending-orders'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-agro-50 hover:text-agro-800 flex items-center gap-2 transition-colors">📋 Pedidos pendientes</button>
                        <button onClick={() => { navigate('/admin/generate-route'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-agro-50 hover:text-agro-800 flex items-center gap-2 transition-colors">🗺️ Generar ruta</button>
                        <button onClick={() => { navigate('/admin/routes'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-agro-50 hover:text-agro-800 flex items-center gap-2 transition-colors">🚚 Ver rutas</button>
                      </>
                    )}
                    <div className="border-t border-gray-100 mt-1">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                        🚪 Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-agro-100 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-agro-600 transition-all">Ingresar</Link>
              <Link to="/register" className="bg-harvest-500 hover:bg-harvest-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-all shadow">Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
