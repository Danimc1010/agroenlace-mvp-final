import { useState, useEffect } from 'react';
import { OfflineProduct } from '../types';

const STORAGE_KEY = 'agro_offline_products';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineProducts, setOfflineProducts] = useState<OfflineProduct[]>([]);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    loadOffline();
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); };
  }, []);

  const loadOffline = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    setOfflineProducts(raw ? JSON.parse(raw) : []);
  };

  const saveOfflineProduct = (product: Omit<OfflineProduct, 'tempId' | 'savedAt'>) => {
    const item: OfflineProduct = {
      ...product,
      tempId: `offline-${Date.now()}`,
      savedAt: new Date().toISOString(),
    };
    const updated = [...offlineProducts, item];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setOfflineProducts(updated);
    return item;
  };

  const removeOfflineProduct = (tempId: string) => {
    const updated = offlineProducts.filter((p) => p.tempId !== tempId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setOfflineProducts(updated);
  };

  const clearOfflineProducts = () => {
    localStorage.removeItem(STORAGE_KEY);
    setOfflineProducts([]);
  };

  return { isOnline, offlineProducts, saveOfflineProduct, removeOfflineProduct, clearOfflineProducts, reload: loadOffline };
}
