import { useState, useEffect, useCallback, useRef } from 'react';

export default function AuthBackground({ api }) {
  const [movies, setMovies] = useState([]);
  const [index, setIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || hasError) return;
    loaded.current = true;
    let cancelled = false;
    async function load() {
      try {
        const data = await api.movies.list({ limit: 20 });
        const items = (data.movies || [])
          .filter((m) => m.poster_url && !String(m.poster_url).includes('null'))
          .map((m) => ({ url: m.poster_url, title: m.title }));
        if (!cancelled) setMovies(items);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load posters for auth background:', err);
          setHasError(true);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [api.movies, hasError]);

  const next = useCallback(() => {
    setIndex((prev) => (movies.length ? (prev + 1) % movies.length : 0));
  }, [movies.length]);

  useEffect(() => {
    if (!movies.length) return;
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [movies.length, next]);

  if (!movies.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {movies.map((movie, i) => (
        <img
          key={movie.url}
          src={movie.url}
          alt={movie.title}
          className={`absolute inset-0 w-full h-full object-center transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-linear-to-t from-[#0c0a09]/80 via-[#0c0a09]/20 to-[#0c0a09]/60" />
      <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-0 right-0 flex justify-center px-4 sm:px-6">
        <p className="text-white/90 text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide text-center drop-shadow-md leading-snug max-w-xs sm:max-w-md md:max-w-lg">
          {movies[index]?.title}
        </p>
      </div>
    </div>
  );
}