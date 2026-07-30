import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/backendApi';
import { normalizeBackendMovie } from '../utils/streamingApi';

// Loads the movie library from the backend (/api/movies) and merges each
// user's per-library state (status, isFavorite) from /api/movies/status.
// Status/favorite changes are persisted via PATCH /api/movies/:id/status.
export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [listData, statusData] = await Promise.all([
        api.movies.list(),
        api.movies.status().catch(() => ({ status: {} })),
      ]);
      const statusMap = statusData.status || {};
      const merged = (listData.movies || []).map((m) => {
        const nm = normalizeBackendMovie(m);
        const s = statusMap[m.id];
        return s
          ? { ...nm, status: s.status || 'watchlist', isFavorite: !!s.is_favorite }
          : nm;
      });
      setMovies(merged);
      setError(null);
    } catch (err) {
      console.error('Failed to load movies:', err);
      setError(err.message || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh(); }, [refresh]);

  const createMovie = useCallback(async (movieData) => {
    const data = await api.movies.create(movieData);
    await refresh();
    return data.movie;
  }, [refresh]);

  const deleteMovie = useCallback(async (id) => {
    const localId = `movie-${id}`;
    const numericId = typeof id === 'number' ? id : Number(String(id).replace('movie-', ''));
    await api.movies.remove(numericId);
    setMovies(prev => prev.filter(m => m.id !== localId));
  }, []);

  // Persist a UI-only patch (status, isFavorite) for a single movie.
  const setMovieStatus = useCallback(async (id, patch) => {
    const numericId = typeof id === 'number' ? id : Number(String(id).replace('movie-', ''));
    setMovies(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)));
    try {
      await api.movies.setStatus(numericId, patch);
    } catch (err) {
      console.error('Failed to save movie status:', err);
    }
  }, []);

  return { movies, loading, error, refresh, createMovie, deleteMovie, setMovieStatus };
}
