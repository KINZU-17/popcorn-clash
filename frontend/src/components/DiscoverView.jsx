import { useState, useEffect, useCallback } from 'react';
import { Play, Plus, Film, Loader2 } from 'lucide-react';
import { fetchMovies, fetchMoviesByGenre } from '../utils/streamingApi';

const GENRES = ['All Genres', 'Action', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];

export default function DiscoverView({ onCreateMovie, searchQueryFromHeader = '', onPlayMovie }) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMovies = useCallback(async (query = '', genre = '') => {
    setLoading(true);
    try {
      let results;
      if (!query && genre && genre !== 'All Genres') {
        results = await fetchMoviesByGenre(genre);
      } else {
        results = await fetchMovies({ query, genre });
      }
      setMovies(results);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load — popular movies
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadMovies(); }, [loadMovies]);

  // Header search bar drives search
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (searchQueryFromHeader) loadMovies(searchQueryFromHeader, '');
  }, [searchQueryFromHeader, loadMovies]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSearch = () => loadMovies(searchKeyword, selectedGenre);

  const handleAddMovie = (movie) => {
    onCreateMovie(movie);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.35em] text-on-surface-variant mb-1">Movie Hub</div>
        <h2 className="text-2xl font-black text-white">Discover Films</h2>
        <p className="text-sm text-on-surface-variant mt-1">Browse and add movies to your library.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text" value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by title, genre, or keyword..."
          className="flex-1 bg-surface-container-low border-b border-surface-container-high focus:border-white px-3 py-2 text-xs text-white placeholder-white/30 outline-none transition-colors"
        />
        <select
          value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-surface-container-low border-b border-surface-container-high focus:border-white px-3 py-2 text-xs text-white cursor-pointer outline-none transition-colors"
        >
          {GENRES.map(g => <option key={g} value={g} className="bg-surface-container-lowest text-white">{g}</option>)}
        </select>
        <button
          onClick={handleSearch}
          className="px-5 py-2 bg-white text-on-primary-container font-bold uppercase tracking-[0.2em] text-xs hover:bg-surface-container-high transition-all cursor-pointer flex items-center gap-2"
        >
          <Film className="w-3.5 h-3.5" /> Search
        </button>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">
          {searchKeyword || selectedGenre !== 'All Genres'
            ? `Results (${movies.length})`
            : 'Popular Right Now'}
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin" />
          </div>
        ) : movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Film className="w-10 h-10 text-surface-container-high mb-4" />
            <p className="text-xs text-surface-container-high uppercase tracking-widest">No results found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {movies.map(movie => (
              <div key={movie.id} className="group relative bg-surface-container-low border border-surface-container-high p-2 hover:border-surface-container-high transition-all">
                <div className="relative w-full aspect-3/4 bg-linear-to-b from-white/10 to-white/5 border border-surface-container-high mb-2 overflow-hidden flex items-center justify-center">
                  {movie.posterUrl
                    ? <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <Film className="w-12 h-12 text-surface-container-high" />
                  }
                  <div className="absolute inset-0 bg-surface-container-low opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => onPlayMovie(movie)} className="p-2.5 bg-white text-on-primary-container hover:bg-surface-container-high transition-colors cursor-pointer">
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => handleAddMovie(movie)}
                      className="p-2.5 bg-surface-container-high text-white hover:bg-white/30 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {movie.rating && (
                    <div className="absolute top-2 left-2 bg-surface-container-low px-1.5 py-0.5 rounded text-[9px] font-mono text-popcorn-gold">
                      {movie.rating}
                    </div>
                  )}
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-white truncate">{movie.title}</h4>
                <p className="text-[8px] text-on-surface-variant mt-0.5">{movie.year} • {movie.genre}</p>
                <p className="text-[8px] text-on-surface-variant mt-1 line-clamp-2">{movie.overview}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
