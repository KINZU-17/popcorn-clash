import { useState, useEffect, useCallback } from 'react';
import { Play, Plus, Film, Check, Loader2 } from 'lucide-react';
import { fetchMovies, fetchMoviesByGenre } from '../utils/streamingApi';

const GENRES = ['All Genres', 'Action', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];

export default function DiscoverView({ onAddMovieToLibrary, searchQueryFromHeader = '', onPlayMovie }) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedMovies, setAddedMovies] = useState(new Set());

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
    } catch (error) {
      console.error("Error loading movies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQueryFromHeader) {
        loadMovies(searchQueryFromHeader, '');
      } else {
        loadMovies(searchKeyword, selectedGenre);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [searchQueryFromHeader, loadMovies]);

  const handleSearch = () => loadMovies(searchKeyword, selectedGenre);

  const handleAddMovie = (movie) => {
    onAddMovieToLibrary({ ...movie, status: 'watchlist', isFavorite: false });
    setAddedMovies(prev => new Set([...prev, movie.id]));
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.35em] text-white/40 mb-1">Movie Hub</div>
        <h2 className="text-2xl font-black text-white">Discover Films</h2>
        <p className="text-sm text-gray-400 mt-1">Browse and add movies to your library.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text" 
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by title, genre, or keyword..."
          className="flex-1 bg-white/5 border-b border-white/10 focus:border-white px-3 py-2 text-xs text-white placeholder-white/30 outline-none transition-colors"
        />
        <select
          value={selectedGenre} 
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-white/5 border-b border-white/10 focus:border-white px-3 py-2 text-xs text-white cursor-pointer outline-none transition-colors"
        >
          {GENRES.map(g => <option key={g} value={g} className="bg-black text-white">{g}</option>)}
        </select>
        <button
          onClick={handleSearch}
          className="px-5 py-2 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-2"
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
            <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
          </div>
        ) : movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Film className="w-10 h-10 text-white/10 mb-4" />
            <p className="text-xs text-white/30 uppercase tracking-widest">No results found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {movies.map(movie => (
              <div key={movie.id} className="group relative bg-white/5 border border-white/10 p-2 hover:border-white/20 transition-all">
                <div className="relative w-full aspect-3/4 bg-linear-to-b from-white/10 to-white/5 border border-white/10 mb-2 overflow-hidden flex items-center justify-center">
                  {movie.posterUrl
                    ? <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <Film className="w-12 h-12 text-white/20" />
                  }
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => onPlayMovie(movie)} className="p-2.5 bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer">
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => handleAddMovie(movie)}
                      className={`p-2.5 transition-colors cursor-pointer ${addedMovies.has(movie.id) ? 'bg-emerald-500/80 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    >
                      {addedMovies.has(movie.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                  {movie.rating && (
                    <div className="absolute top-2 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-mono text-popcorn-gold">
                      {movie.rating}
                    </div>
                  )}
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-white truncate">{movie.title}</h4>
                <p className="text-[8px] text-white/40 mt-0.5">{movie.year} • {movie.genre}</p>
                <p className="text-[8px] text-white/50 mt-1 line-clamp-2">{movie.overview}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}