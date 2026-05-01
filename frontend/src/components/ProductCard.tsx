import { Link } from 'react-router-dom';
import { Product } from '../types';

const categoryImage: Record<string, string> = {
  Fruta: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80&fit=crop',
  Café: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80&fit=crop',
  Hortaliza: 'https://images.unsplash.com/photo-1546470427-0d9702ad41a1?w=400&q=80&fit=crop',
  Tubérculo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80&fit=crop',
  Verdura: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80&fit=crop',
  Cereal: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80&fit=crop',
};

const productImages: Record<string, string> = {
  'Mango Tommy': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80&fit=crop',
  'Café pergamino': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80&fit=crop',
  'Tomate chonto': 'https://images.unsplash.com/photo-1546470427-0d9702ad41a1?w=400&q=80&fit=crop',
  'Papa criolla': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80&fit=crop',
  'Mora de Castilla': 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=400&q=80&fit=crop',
};

function getImage(product: Product): string {
  if (product.imageUrl) return product.imageUrl;
  if (productImages[product.name]) return productImages[product.name];
  return categoryImage[product.category] || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80&fit=crop';
}

export function ProductCard({ product, onAdd }: { product: Product; onAdd?: (p: Product) => void }) {
  const imgSrc = getImage(product);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
      {/* Imagen real */}
      <div className="relative h-40 overflow-hidden bg-agro-50">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80&fit=crop';
          }}
        />
        {/* Badge categoría */}
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 backdrop-blur text-agro-700 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
            {product.category}
          </span>
        </div>
        {/* Badge municipio */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
          <p className="text-white text-xs font-medium">📍 {product.municipality}</p>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-display font-semibold text-agro-800 text-base leading-tight group-hover:text-agro-600 transition-colors">
          {product.name}
        </h3>
        {product.producer?.user && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span>👨‍🌾</span> {product.producer.user.name}
          </p>
        )}
        <p className="text-xs text-gray-400">{product.quantity} {product.unit} disponibles</p>
        <p className="text-agro-700 font-bold text-lg mt-auto">
          ${product.price.toLocaleString('es-CO')}
          <span className="text-xs font-normal text-gray-400"> / {product.unit}</span>
        </p>
        <div className="flex gap-2 mt-1">
          <Link
            to={`/catalog/${product.id}`}
            className="flex-1 text-center text-xs border border-agro-600 text-agro-700 py-2 rounded-lg hover:bg-agro-50 transition-colors font-medium"
          >
            Ver detalle
          </Link>
          {onAdd && (
            <button
              onClick={() => onAdd(product)}
              className="flex-1 text-xs bg-agro-600 text-white py-2 rounded-lg hover:bg-agro-700 transition-colors font-medium active:scale-95"
            >
              + Carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
