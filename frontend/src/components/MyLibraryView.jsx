import { useState } from 'react';
import { Plus, Trash2, Play, Film, X, Grid, Heart, Star } from 'lucide-react';

export default function MyLibraryView({
   movies = [],
   collections = [],
   history = [],
   searchQuery = '',
   onCreateMovie,
   onDeleteMovie,
   onUpdateMovieStatus,
   onAddCollection,
   onDeleteCollection,
   onDeleteHistory,
   onReplayMovie,
   onPlayMovie
   }) {
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedMovieIds, setSelectedMovieIds] = useState([]);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [newMovie, setNewMovie] = useState({ title: '', year: '', genre: 'Drama', duration: '', rating: '' });

  const genres = ['All Genres', 'Sci-Fi', 'Thriller', 'Action', 'Animation', 'Drama', 'Horror', 'Romance', 'History', 'Comedy', 'Documentary'];
  const subTabs = ['all', 'watchlist', 'watching', 'watched', 'favorites'];

  const filteredMovies = movies.filter(movie => {
    let match = true;
    if (searchQuery) match = match && (movie.title.toLowerCase().includes(searchQuery.toLowerCase()) || (movie.genre && movie.genre.toLowerCase().includes(searchQuery.toLowerCase())));
    if (selectedGenre !== 'All Genres') match = match && movie.genre === selectedGenre;
    if (activeSubTab === 'watchlist') match = match && movie.status === 'watchlist';
    else if (activeSubTab === 'watching') match = match && movie.status === 'watching';
    else if (activeSubTab === 'watched') match = match && movie.status === 'watched';
    else if (activeSubTab === 'favorites') match = match && movie.isFavorite;
    return match;
  }).sort((a, b) => {
    let aVal = a[sortBy] || '';
    let bVal = b[sortBy] || '';
    if (sortBy === 'rating') { aVal = parseFloat(aVal); bVal = parseFloat(bVal); }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleToggleMovieSelect = (id) =>
    setSelectedMovieIds(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || selectedMovieIds.length === 0) return;
    await onAddCollection(newCollectionName, selectedMovieIds);
    setNewCollectionName('');
    setSelectedMovieIds([]);
    setShowNewCollectionModal(false);
  };

  const handleAddMovie = async () => {
    if (!newMovie.title.trim()) return;
    await onCreateMovie({
      title: newMovie.title.trim(),
      year: parseInt(newMovie.year) || null,
      genre: newMovie.genre,
      duration: newMovie.duration || null,
      rating: parseFloat(newMovie.rating) || null,
    });
    setNewMovie({ title: '', year: '', genre: 'Drama', duration: '', rating: '' });
    setShowAddMovieModal(false);
  };

  const handleToggleFavorite = (movie) =>
    onUpdateMovieStatus(movie.id, { isFavorite: !movie.isFavorite });

  return (
    <div className="space-y-10">

      {/* Tabs and filters */}
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 items-center border-b border-surface-container-high pb-4">
          <div className="flex gap-3 flex-wrap">
            {subTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`text-xs font-bold uppercase tracking-[0.15em] pb-2 border-b-2 transition-all ${
                  activeSubTab === tab ? 'text-white border-surface-container-high' : 'text-on-surface-variant border-transparent hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="ml-auto flex gap-3 items-center flex-wrap">
            <button
              onClick={() => setShowAddMovieModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-on-primary-container text-xs font-bold uppercase tracking-wider hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Movie
            </button>

            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-surface-container-low border border-surface-container-high text-xs px-3 py-2 text-white cursor-pointer hover:border-surface-container-high transition-colors outline-none">
              {genres.map(g => <option key={g} value={g} className="bg-surface-container-lowest text-white">{g}</option>)}
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container-low border border-surface-container-high text-xs px-3 py-2 text-white cursor-pointer hover:border-surface-container-high transition-colors outline-none">
              <option value="title" className="bg-surface-container-lowest text-white">Sort: Title</option>
              <option value="year" className="bg-surface-container-lowest text-white">Sort: Year</option>
              <option value="rating" className="bg-surface-container-lowest text-white">Sort: Rating</option>
            </select>

            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-xs px-3 py-2 border border-surface-container-high text-on-surface-variant hover:text-white hover:border-surface-container-high transition-all">
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </button>
          </div>
        </div>

        {/* Collections */}
        {collections.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">Collections</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
{collections.map(col => (
                 <div key={col.id} className="group bg-surface-container-low border border-surface-container-high p-4 hover:border-surface-container-high transition-all cursor-pointer relative">
                   <button
                     onClick={(e) => { e.stopPropagation(); onDeleteCollection && onDeleteCollection(col.id); }}
                     className="absolute top-2 right-2 p-1 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 className="w-3 h-3" />
                   </button>
                   <div className="w-full aspect-video bg-linear-to-br from-white/10 to-white/5 border border-surface-container-high mb-3 flex items-center justify-center">
                     <Grid className="w-8 h-8 text-surface-container-high" />
                   </div>
                   <h4 className="text-xs font-bold uppercase tracking-wider text-white">{col.name}</h4>
                   <p className="text-[9px] text-on-surface-variant mt-1">{col.movieCount} films</p>
                   <p className="text-[9px] text-surface-container-high mt-2">{col.updatedTime}</p>
                 </div>
               ))}
               <button onClick={() => setShowNewCollectionModal(true)}
                 className="bg-surface-container-low border border-surface-container-high p-4 hover:border-surface-container-high hover:bg-surface-container-low transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                 <Plus className="w-4 h-4" /> New Collection
               </button>
             </div>
          </div>
        )}
      </div>

      {/* Movies grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">
          {activeSubTab.charAt(0).toUpperCase() + activeSubTab.slice(1)} ({filteredMovies.length})
        </h3>

        {filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Film className="w-10 h-10 text-surface-container-high mb-4" />
            <p className="text-xs text-surface-container-high uppercase tracking-widest">Nothing here yet</p>
            <button onClick={() => setShowAddMovieModal(true)}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 border border-surface-container-high text-xs text-on-surface-variant hover:text-white hover:border-surface-container-high transition-all">
              <Plus className="w-3.5 h-3.5" /> Add your first movie
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMovies.map(movie => (
              <div key={movie.id} className="group relative bg-surface-container-low border border-surface-container-high p-2 hover:border-surface-container-high transition-all cursor-pointer">
                <div
                  className="relative w-full aspect-3/4 bg-linear-to-b from-white/10 to-white/5 border border-surface-container-high mb-2 flex items-center justify-center overflow-hidden"
                  onClick={() => onPlayMovie(movie)}
                >
                  {movie.posterUrl
                    ? <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <Film className="w-12 h-12 text-surface-container-high" />
                  }

                  <div className="absolute inset-0 bg-surface-container-low opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onPlayMovie(movie); }}
                      className="p-2.5 bg-white text-on-primary-container hover:bg-surface-container-high transition-colors">
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteMovie(movie.id); }}
                      className="p-2.5 bg-red-500/80 text-white hover:bg-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {movie.progress !== undefined && movie.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-high">
                      <div className="h-full bg-white transition-all" style={{ width: `${movie.progress}%` }} />
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(movie); }}
                    className="absolute top-2 right-2 p-1.5 bg-surface-container-lowest/50 hover:bg-surface-container-lowest/70 transition-colors rounded-full"
                  >
                    <Heart className={`w-3.5 h-3.5 transition-colors ${movie.isFavorite ? 'fill-red-500 text-red-500' : 'text-on-surface-variant'}`} />
                  </button>

                  {movie.rating && (
                    <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-surface-container-low px-1.5 py-0.5 rounded">
                      <Star className="w-2.5 h-2.5 text-popcorn-gold fill-popcorn-gold" />
                      <span className="text-[9px] font-mono text-white">{movie.rating}</span>
                    </div>
                  )}
                </div>

                <h4 className="text-[10px] font-bold uppercase tracking-wider text-white truncate">{movie.title}</h4>
                <p className="text-[8px] text-on-surface-variant mt-0.5">{movie.year} &middot; {movie.genre}</p>

                <div className="flex gap-2 mt-2">
                  <select value={movie.status || 'watchlist'} onChange={(e) => onUpdateMovieStatus(movie.id, { status: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-surface-container-low border border-surface-container-high text-[8px] px-1.5 py-1 text-white cursor-pointer outline-none hover:border-surface-container-high">
                    <option value="watchlist">Watchlist</option>
                    <option value="watching">Watching</option>
                    <option value="watched">Watched</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Watch history */}
      {history.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">Recently Watched</h3>
          <div className="space-y-3">
            {history.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-surface-container-low border border-surface-container-high hover:border-surface-container-high transition-all group">
                <div className="w-16 h-24 bg-linear-to-br from-white/10 to-white/5 border border-surface-container-high shrink-0 flex items-center justify-center">
                  {item.posterUrl && <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white truncate">{item.title}</h4>
                  <p className="text-[9px] text-on-surface-variant mt-1">{item.watchedAt}</p>
                  <div className="w-full h-1 bg-surface-container-low mt-2 rounded-full">
                    <div className="h-full bg-white rounded-full" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.progress < 100 && (
                    <button onClick={() => onReplayMovie(history.find(h => h.id === item.id))}
                      className="p-2 text-on-surface-variant hover:text-white transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => onDeleteHistory(item.id)}
                    className="p-2 text-on-surface-variant hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Movie Modal */}
      {showAddMovieModal && (
        <div className="fixed inset-0 bg-surface-container-low backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-container-high p-6 w-full max-w-md">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white mb-6">Add a Movie</h3>
            <div className="space-y-4 mb-6">
              <input type="text" placeholder="Title" value={newMovie.title}
                onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                className="w-full bg-surface-container-low border-b border-surface-container-high focus:border-white px-3 py-3 text-xs outline-none text-white placeholder-white/30 transition-colors" autoFocus />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Year" value={newMovie.year}
                  onChange={(e) => setNewMovie({ ...newMovie, year: e.target.value })}
                  className="bg-surface-container-low border-b border-surface-container-high focus:border-white px-3 py-3 text-xs outline-none text-white placeholder-white/30 transition-colors" />
                <input type="text" placeholder="Duration, e.g. 2h 10m" value={newMovie.duration}
                  onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                  className="bg-surface-container-low border-b border-surface-container-high focus:border-white px-3 py-3 text-xs outline-none text-white placeholder-white/30 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={newMovie.genre} onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                  className="bg-surface-container-low border-b border-surface-container-high focus:border-white px-3 py-3 text-xs text-white cursor-pointer outline-none transition-colors">
                  {genres.filter(g => g !== 'All Genres').map(g => <option key={g} value={g} className="bg-surface-container-lowest text-white">{g}</option>)}
                </select>
                <input type="number" step="0.1" min="0" max="10" placeholder="Rating out of 10" value={newMovie.rating}
                  onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                  className="bg-surface-container-low border-b border-surface-container-high focus:border-white px-3 py-3 text-xs outline-none text-white placeholder-white/30 transition-colors" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowAddMovieModal(false); setNewMovie({ title: '', year: '', genre: 'Drama', duration: '', rating: '' }); }}
                className="flex-1 px-4 py-2 border border-surface-container-high text-xs font-bold uppercase tracking-wider text-white hover:bg-surface-container-low transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAddMovie} disabled={!newMovie.title.trim()}
                className="flex-1 px-4 py-2 bg-white text-on-primary-container text-xs font-bold uppercase tracking-wider hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                Add to Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Collection Modal */}
      {showNewCollectionModal && (
        <div className="fixed inset-0 bg-surface-container-low backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-container-high p-6 w-full max-w-md">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white mb-6">New Collection</h3>
            <div className="mb-6">
              <input type="text" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Give it a name..." autoFocus
                className="w-full bg-surface-container-low border-b border-surface-container-high focus:border-white px-3 py-3 text-xs outline-none text-white placeholder-white/30 transition-colors" />
            </div>
            <div className="max-h-64 overflow-y-auto mb-6 space-y-2">
              {movies.map(movie => (
                <label key={movie.id} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-surface-container-low transition-colors">
                  <input type="checkbox" checked={selectedMovieIds.includes(movie.id)}
                    onChange={() => handleToggleMovieSelect(movie.id)}
                    className="w-4 h-4 cursor-pointer accent-white" />
                  <span className="text-xs text-white flex-1">{movie.title}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowNewCollectionModal(false); setNewCollectionName(''); setSelectedMovieIds([]); }}
                className="flex-1 px-4 py-2 border border-surface-container-high text-xs font-bold uppercase tracking-wider text-white hover:bg-surface-container-low transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleCreateCollection} disabled={!newCollectionName.trim() || selectedMovieIds.length === 0}
                className="flex-1 px-4 py-2 bg-white text-on-primary-container text-xs font-bold uppercase tracking-wider hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
