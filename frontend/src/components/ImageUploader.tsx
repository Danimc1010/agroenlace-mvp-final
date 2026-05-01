import { useState, useRef } from 'react';

interface Props {
  currentImage?: string;
  onUpload: (url: string) => void;
}

const CLOUD_NAME = 'dbuaooqas';
const UPLOAD_PRESET = 'agroenlace_products';

export function ImageUploader({ currentImage, onUpload }: Props) {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (JPG, PNG, WebP)');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    // Preview local inmediato
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'agroenlace/products');

      // Simular progreso
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 15, 85));
      }, 200);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      clearInterval(interval);
      setProgress(100);

      if (!res.ok) throw new Error('Error al subir la imagen');

      const data = await res.json();
      onUpload(data.secure_url);
      setPreview(data.secure_url);
    } catch (err) {
      setError('No se pudo subir la imagen. Intenta de nuevo.');
      setPreview(currentImage || '');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      {/* Zona de arrastre / clic */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all
          ${uploading ? 'border-agro-400 bg-agro-50 cursor-wait' : 'border-gray-200 hover:border-agro-400 hover:bg-agro-50'}
          ${preview ? 'h-48' : 'h-36'}
        `}
      >
        {preview ? (
          /* Vista previa de la imagen */
          <>
            <img
              src={preview}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
            {/* Overlay al hacer hover */}
            {!uploading && (
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <span className="text-white text-3xl">📷</span>
                <span className="text-white text-sm font-semibold">Cambiar imagen</span>
              </div>
            )}
          </>
        ) : (
          /* Estado vacío */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <div className="w-12 h-12 bg-agro-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📷</span>
            </div>
            <p className="text-sm font-semibold text-agro-700">
              Haz clic o arrastra una imagen
            </p>
            <p className="text-xs text-gray-400 text-center">
              JPG, PNG o WebP · Máximo 5MB
            </p>
          </div>
        )}

        {/* Barra de progreso */}
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="bg-black/30 px-4 py-2 flex items-center gap-2">
              <div className="flex-1 bg-white/30 rounded-full h-1.5">
                <div
                  className="bg-white h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-white text-xs font-semibold">{progress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      {/* Estado de carga */}
      {uploading && (
        <div className="flex items-center gap-2 text-agro-600 text-sm">
          <div className="w-4 h-4 border-2 border-agro-200 border-t-agro-600 rounded-full animate-spin" />
          Subiendo imagen a Cloudinary...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* URL actual si existe */}
      {preview && !uploading && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-green-600 flex items-center gap-1">
            ✅ Imagen cargada correctamente
          </p>
          <button
            type="button"
            onClick={() => { setPreview(''); onUpload(''); }}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Eliminar imagen
          </button>
        </div>
      )}
    </div>
  );
}
