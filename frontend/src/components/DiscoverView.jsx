import { useState, useEffect, useCallback } from 'react';
import { Play, Plus, Film, Loader2, Tv, Sparkles, CheckCircle2 } from 'lucide-react';
import { fetchMovies, fetchMoviesByGenre, fetchAnime, fetchTvSeries } from '../utils/streamingApi';

const GENRES = ['All Genres', 'Action', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];

export default function DiscoverView({ mode = 'discover', onCreateMovie, searchQueryFromHeader = '', onPlayMovie, libraryMovies = [] }) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const libraryMovieIds = new Set(libraryMovies.map(m => String(m.tmdb_id)));

  const loadMovies = useCallback(async (query = '', genre = '') => {
    setLoading(true);
    try {
      let results;
      if (mode === 'anime') {
        results = await fetchAnime({ query, genre });
      } else if (mode === 'series') {
        results = await fetchTvSeries({ query, genre });
      } else if (!query && genre && genre !== 'All Genres') {
        results = await fetchMoviesByGenre(genre);
      } else {
        results = await fetchMovies({ query, genre });
      }
      setMovies(results);
    } finally {
      setLoading(false);
    }
  }, [mode]);

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

  const handlePlay = (movie) => {
    const movieToPlay = { ...movie };
    if (mode === 'anime') movieToPlay.type = 'anime';
    if (mode === 'series') movieToPlay.type = 'series';
    onPlayMovie(movieToPlay);
  };

  const viewTitle = mode === 'anime' ? 'Anime Hub' : mode === 'series' ? 'TV Series & Shows' : 'Discover Films';
  const viewSubtitle = mode === 'anime' ? 'Browse Japanese animation, movies, and series.' : mode === 'series' ? 'Browse popular TV series and episodes.' : 'Browse and add movies to your library.';

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.35em] text-on-surface-variant mb-1">
          {mode === 'anime' ? 'Anime Catalog' : mode === 'series' ? 'TV Catalog' : 'Movie Hub'}
        </div>
        <h2 className="text-2xl font-black text-white">{viewTitle}</h2>
        <p className="text-sm text-on-surface-variant mt-1">{viewSubtitle}</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {movies.map(movie => {
              const isInLibrary = libraryMovieIds.has(String(movie.id));
              return (
                <div key={movie.id} className="group relative rounded-2xl border border-surface-container-high bg-surface-container-low overflow-hidden transition-all duration-300 hover:border-warm-gold/40 hover:shadow-[0_8px_40px_-12px_rgba(217,119,6,0.25)] hover:-translate-y-1">
                  <div className="relative w-full aspect-[3/4] bg-surface-container border-b border-surface-container-high overflow-hidden">
                    {movie.posterUrl
                      ? <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                      : <Film className="w-12 h-12 text-surface-container-high" />
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button onClick={() => handlePlay(movie)} className="p-3 bg-white text-on-primary-container hover:bg-warm-gold hover:text-on-primary-container transition-all cursor-pointer rounded-full shadow-lg">
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                      {!isInLibrary && (
                        <button
                          onClick={() => handleAddMovie(movie)}
                          className="p-3 bg-surface-container-high/80 text-white hover:bg-surface-container-high backdrop-blur-sm transition-all cursor-pointer rounded-full border border-white/10 shadow-lg"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    {isInLibrary && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-emerald-500/90 text-white px-2 py-1 rounded-full backdrop-blur-sm shadow-lg">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[8px] font-bold uppercase tracking-wider">Added</span>
                      </div>
                    )}
                    {movie.rating && (
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10 shadow-lg">
                      <Star className="w-3 h-3 text-warm-gold fill-warm-gold" />
                      <span className="text-[10px] font-mono text-white font-bold">{movie.rating}</span>
                    </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white truncate group-hover:text-warm-gold-light transition-colors">{movie.title}</h4>
                    <p className="text-[10px] text-on-surface-variant mt-1 font-medium">{movie.year} • {movie.genre}</p>
                    <p className="text-[9px] text-on-surface-variant/70 mt-1.5 line-clamp-2 leading-relaxed">{movie.overview}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
