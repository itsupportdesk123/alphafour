import { useCallback, useEffect, useState } from 'react';

const KEY = 'aurelia:favourites';
const EVENT = 'aurelia:favourites-changed';

const read = () => {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
};

/** Saved residences, persisted in localStorage and synced across components and tabs. */
export function useFavorites() {
  const [favorites, setFavorites] = useState(read);

  useEffect(() => {
    const sync = () => setFavorites(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const write = useCallback((next) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable: keep in memory for this session */
    }
    setFavorites(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const toggle = useCallback(
    (slug) => {
      const current = read();
      write(current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]);
    },
    [write],
  );

  const isFavorite = useCallback((slug) => favorites.includes(slug), [favorites]);
  const clear = useCallback(() => write([]), [write]);

  return { favorites, count: favorites.length, isFavorite, toggle, clear };
}
