import { useState } from 'react';
import { Btn } from './UI';
import { ImageUploader } from './ImageUploader';

interface ProductFormData {
  name: string;
  category: string;
  description: string;
  quantity: string;
  unit: string;
  price: string;
  municipality: string;
  harvestDate: string;
  imageUrl: string;
}

const CATEGORIES = ['Fruta', 'Hortaliza', 'Tubérculo', 'Café', 'Cereal', 'Verdura', 'Legumbre', 'Otro'];
const UNITS = ['kg', 'ton', 'bulto', 'caja', 'unidad', 'libra', 'arroba'];
const MUNICIPALITIES = ['Viotá', 'La Mesa', 'Fusagasugá', 'Arbeláez', 'Silvania', 'Tibacuy', 'Apulo', 'Anapoima', 'Otro'];

interface Props {
  initial?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  loading?: boolean;
  submitLabel?: string;
}

export function ProductForm({ initial = {}, onSubmit, loading = false, submitLabel = 'Guardar producto' }: Props) {
  const [form, setForm] = useState<ProductFormData>({
    name: initial.name || '',
    category: initial.category || 'Fruta',
    description: initial.description || '',
    quantity: initial.quantity || '',
    unit: initial.unit || 'kg',
    price: initial.price || '',
    municipality: initial.municipality || 'Viotá',
    harvestDate: initial.harvestDate || '',
    imageUrl: initial.imageUrl || '',
  });

  const set = (key: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-agro-500 focus:ring-2 focus:ring-agro-100 transition-all bg-white';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Imagen del producto */}
      <div>
        <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
          📷 Foto del producto
        </label>
        <ImageUploader
          currentImage={form.imageUrl}
          onUpload={(url) => setForm(p => ({ ...p, imageUrl: url }))}
        />
        <p className="text-xs text-gray-400 mt-1">
          Sube una foto real de tu producto — se mostrará en el catálogo
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Nombre del producto *</label>
          <input className={inputCls} value={form.name} onChange={set('name')} required placeholder="Ej: Habichuelas frescas" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Categoría *</label>
          <select className={inputCls} value={form.category} onChange={set('category')}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Cantidad disponible *</label>
          <input className={inputCls} type="number" min="1" step="0.1" value={form.quantity} onChange={set('quantity')} required placeholder="100" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Unidad *</label>
          <select className={inputCls} value={form.unit} onChange={set('unit')}>
            {UNITS.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Precio por unidad (COP) *</label>
          <input className={inputCls} type="number" min="100" value={form.price} onChange={set('price')} required placeholder="3200" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Municipio *</label>
          <select className={inputCls} value={form.municipality} onChange={set('municipality')}>
            {MUNICIPALITIES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Fecha de cosecha</label>
          <input className={inputCls} type="date" value={form.harvestDate} onChange={set('harvestDate')} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Descripción</label>
        <textarea
          className={inputCls}
          rows={3}
          value={form.description}
          onChange={set('description')}
          placeholder="Describe la calidad, variedad, características del producto..."
        />
      </div>

      {/* Vista previa del precio */}
      {form.price && form.quantity && (
        <div className="bg-agro-50 border border-agro-200 rounded-xl p-3 flex justify-between items-center text-sm">
          <span className="text-agro-600">💰 Valor total del inventario:</span>
          <span className="font-bold text-agro-800">
            ${(parseFloat(form.price) * parseFloat(form.quantity)).toLocaleString('es-CO')} COP
          </span>
        </div>
      )}

      <Btn type="submit" disabled={loading} className="w-full py-3 text-base">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Guardando...
          </span>
        ) : submitLabel}
      </Btn>
    </form>
  );
}
