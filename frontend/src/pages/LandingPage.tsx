import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import api from '../api/axios';

export default function LandingPage() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    api.get('/products?limit=5')
      .then(r => setFeatured(r.data.slice(0, 5)))
      .catch(() => {
        // Si falla la API, no muestra nada en featured — sin crash
        setFeatured([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80&fit=crop"
          alt="Campo agrícola Cundinamarca"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-agro-900/90 via-agro-800/75 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <span className="inline-block bg-harvest-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-5">
              Marketplace Agrícola · Cundinamarca
            </span>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-5">
              Del campo a tu mesa,<br />
              <span className="text-harvest-300">sin intermediarios</span>
            </h1>
            <p className="text-agro-100 text-lg mb-8 leading-relaxed max-w-xl">
              Conectamos pequeños productores rurales de Cundinamarca con compradores urbanos.
              Productos frescos, trazabilidad completa y logística inteligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="bg-harvest-500 hover:bg-harvest-600 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center">
                Comenzar ahora →
              </Link>
              <Link to="/catalog" className="bg-white/10 backdrop-blur hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-base transition-all text-center">
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-agro-700 py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { num: '3', label: 'Municipios activos' },
            { num: '5+', label: 'Productores' },
            { num: '100%', label: 'Trazabilidad' },
            { num: '0', label: 'Intermediarios' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-harvest-300 font-display">{s.num}</p>
              <p className="text-agro-200 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS — cargados desde la API */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-agro-800 mb-3">Productos de temporada</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Cosechas frescas disponibles ahora mismo de nuestros productores en Cundinamarca
          </p>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          /* Fallback visual si la API no responde */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {[
              { name: 'Mango Tommy', municipio: 'Viotá', precio: '$3.200/kg', img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80&fit=crop' },
              { name: 'Café pergamino', municipio: 'Viotá', precio: '$9.500/kg', img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80&fit=crop' },
              { name: 'Tomate chonto', municipio: 'La Mesa', precio: '$2.800/kg', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80&fit=crop' },
              { name: 'Papa criolla', municipio: 'Fusagasugá', precio: '$2.500/kg', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80&fit=crop' },
              { name: 'Mora de Castilla', municipio: 'La Mesa', precio: '$4.200/kg', img: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=400&q=80&fit=crop' },
            ].map(p => (
              <Link
                key={p.name}
                to="/catalog"
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80&fit=crop';
                    }}
                  />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-agro-800 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">📍 {p.municipio}</p>
                  <p className="text-agro-600 font-bold text-sm mt-1">{p.precio}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/catalog" className="inline-block bg-agro-600 hover:bg-agro-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow">
            Ver todos los productos →
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-agro-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-agro-800 text-center mb-12">¿Por qué AgroEnlace?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500&q=80&fit=crop',
                icon: '🌱',
                title: 'Directo del productor',
                desc: 'Sin intermediarios. Mejor precio para el agricultor y producto más fresco para ti.',
              },
              {
                img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80&fit=crop',
                icon: '🗺️',
                title: 'Logística inteligente',
                desc: 'Rutas optimizadas con algoritmo Haversine. Recolección eficiente desde la finca.',
              },
              {
                img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80&fit=crop',
                icon: '🔍',
                title: 'Trazabilidad total',
                desc: 'Código único por pedido. Sigue tu producto desde la cosecha hasta tu puerta.',
              },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-agro-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-44 overflow-hidden">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className="text-3xl">{f.icon}</span>
                  <h3 className="font-display font-bold text-agro-800 text-lg mt-2 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl font-bold text-agro-800 text-center mb-10">Para cada actor de la cadena</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '👨‍🌾', rol: 'Productor', desc: 'Publica cosechas, gestiona pedidos y trabaja sin conexión desde el campo.', color: 'border-agro-400 hover:bg-agro-50', link: '/register' },
            { icon: '🛒', rol: 'Comprador', desc: 'Filtra por municipio, agrega al carrito y rastrea tu pedido en tiempo real.', color: 'border-harvest-400 hover:bg-harvest-50', link: '/catalog' },
            { icon: '🚚', rol: 'Logístico', desc: 'Genera rutas optimizadas y visualiza los puntos de recolección en el mapa.', color: 'border-agro-600 hover:bg-agro-50', link: '/login' },
          ].map(r => (
            <Link
              key={r.rol}
              to={r.link}
              className={`border-2 ${r.color} rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-md`}
            >
              <span className="text-5xl block mb-4">{r.icon}</span>
              <h3 className="font-bold text-agro-800 text-xl mb-2">{r.rol}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA TRAZABILIDAD */}
      <section className="bg-agro-800 py-14 px-6 text-center relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=1200&q=60&fit=crop"
          alt="Fondo campo"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10">
          <p className="text-agro-300 text-sm mb-2 uppercase tracking-widest">¿Ya compraste?</p>
          <h3 className="font-display text-3xl font-bold text-white mb-4">Rastrea tu pedido ahora</h3>
          <p className="text-agro-200 mb-6 text-sm">Ingresa tu código AGRO-XXXX-XXXXXX y conoce el estado de tu producto</p>
          <Link to="/traceability" className="inline-block bg-harvest-500 hover:bg-harvest-600 text-white px-8 py-4 rounded-xl font-bold transition-all hover:-translate-y-0.5 shadow-lg">
            Consultar trazabilidad →
          </Link>
        </div>
      </section>

      <footer className="text-center py-6 text-gray-400 text-xs border-t border-gray-100 bg-white">
        AgroEnlace MVP TRL5 — Prototipo académico funcional — Cundinamarca, Colombia
      </footer>
    </div>
  );
}
