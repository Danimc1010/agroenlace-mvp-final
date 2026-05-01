import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Btn } from '../components/UI';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-agro-500';

  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl shadow-md border border-agro-100 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-5xl">🌿</span>
            <h1 className="font-display text-2xl text-agro-800 font-bold mt-3">Ingresar a AgroEnlace</h1>
            <p className="text-gray-400 text-sm mt-1">Marketplace agrícola de Cundinamarca</p>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-semibold">Correo electrónico</label>
              <input className={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="productor@agroenlace.com" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">Contraseña</label>
              <input className={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <Btn type="submit" disabled={loading} className="w-full py-3 text-base mt-2">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Btn>
          </form>
          <div className="mt-6 text-center text-sm text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-agro-600 font-semibold hover:underline">Registrarse</Link>
          </div>
          <div className="mt-6 p-4 bg-agro-50 rounded-xl text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-agro-700">Usuarios de prueba:</p>
            <p>👨‍🌾 productor@agroenlace.com</p>
            <p>🛒 comprador@agroenlace.com</p>
            <p>🚚 admin@agroenlace.com</p>
            <p className="text-gray-400">Contraseña: Agro12345</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  // Use AuthContext.register so the session state is consistent after sign-up
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'COMPRADOR',
    phone: '', municipality: '', farmName: '', city: '', buyerType: 'Particular',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: Record<string, any> = { ...form };
      if (form.role === 'COMPRADOR') body.buyerAddress = form.city;
      // register() calls /auth/register, persists token+user in context AND localStorage
      await register(body);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-agro-500';
  return (
    <div className="min-h-screen bg-agro-50">
      <Navbar />
      <div className="flex items-center justify-center py-10 px-4">
        <div className="bg-white rounded-2xl shadow-md border border-agro-100 p-8 w-full max-w-lg">
          <div className="text-center mb-6">
            <span className="text-4xl">🌱</span>
            <h1 className="font-display text-2xl text-agro-800 font-bold mt-2">Crear cuenta</h1>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-semibold">Nombre completo</label>
                <input className={inp} value={form.name} onChange={set('name')} required placeholder="Tu nombre" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold">Teléfono</label>
                <input className={inp} value={form.phone} onChange={set('phone')} placeholder="310..." />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">Correo electrónico</label>
              <input className={inp} type="email" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">Contraseña</label>
              <input className={inp} type="password" value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">Tipo de usuario</label>
              <select className={inp} value={form.role} onChange={set('role')}>
                <option value="COMPRADOR">Comprador</option>
                <option value="PRODUCTOR">Productor</option>
              </select>
            </div>
            {form.role === 'PRODUCTOR' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-agro-50 rounded-xl">
                <div>
                  <label className="text-xs text-gray-500 font-semibold">Nombre de la finca</label>
                  <input className={inp} value={form.farmName} onChange={set('farmName')} placeholder="Finca El Mango" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold">Municipio</label>
                  <input className={inp} value={form.municipality} onChange={set('municipality')} placeholder="Viotá" />
                </div>
              </div>
            )}
            {form.role === 'COMPRADOR' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-agro-50 rounded-xl">
                <div>
                  <label className="text-xs text-gray-500 font-semibold">Ciudad</label>
                  <input className={inp} value={form.city} onChange={set('city')} placeholder="Bogotá" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold">Tipo</label>
                  <select className={inp} value={form.buyerType} onChange={set('buyerType')}>
                    <option>Particular</option><option>Restaurante</option><option>Supermercado</option><option>Empresa</option>
                  </select>
                </div>
              </div>
            )}
            <Btn type="submit" disabled={loading} className="w-full py-3 text-base">
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </Btn>
          </form>
          <div className="mt-4 text-center text-sm text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-agro-600 font-semibold hover:underline">Ingresar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
