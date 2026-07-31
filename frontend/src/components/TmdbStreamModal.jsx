import { useState } from 'react';
import { X, Play, Plus, Tv, Film, Sparkles } from 'lucide-react';

export default function TmdbStreamModal({ isOpen, onClose, onPlayMovie, onCreateMovie }) {
  const [tmdbId, setTmdbId] = useState('');
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState('movie'); // 'movie' | 'series' | 'anime'
  const [episodes, setEpisodes] = useState('24');

  if (!isOpen) return null;

  const handlePlay = (e) => {
    e.preventDefault();
    if (!tmdbId.trim()) return;

    const cleanId = tmdbId.trim();
    const movieObj = {
      id: mediaType === 'anime' ? `anime-${cleanId}` : mediaType === 'series' ? `series-${cleanId}` : `tmdb-${cleanId}`,
      tmdbId: cleanId,
      title: title.trim() || `${mediaType.toUpperCase()} #${cleanId}`,
      isAnime: mediaType === 'anime',
      isSeries: mediaType === 'series',
      episodes: mediaType === 'anime' || mediaType === 'series' ? parseInt(episodes, 10) || 24 : 1,
      genre: mediaType === 'anime' ? 'Animation' : mediaType === 'series' ? 'TV Series' : 'Drama',
      year: new Date().getFullYear(),
      rating: 8.5,
    };

    onPlayMovie(movieObj);
    onClose();
  };

  const handleAddToLibrary = async (e) => {
    e.preventDefault();
    if (!tmdbId.trim()) return;

    const cleanId = tmdbId.trim();
    const movieObj = {
      tmdb_id: parseInt(cleanId, 10) || null,
      title: title.trim() || `${mediaType.toUpperCase()} #${cleanId}`,
      overview: `Direct TMDB import for ID ${cleanId}`,
      genre: mediaType === 'anime' ? 'Animation' : mediaType === 'series' ? 'TV Series' : 'Drama',
      year: new Date().getFullYear(),
      rating: 8.5,
    };

    if (onCreateMovie) {
      await onCreateMovie(movieObj);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-[#0c0a09] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-scale-in text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-primary-light" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Stream or Add by TMDB ID</h3>
          </div>
          <button onClick={onClose} className="p-1 text-white/50 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePlay} className="space-y-4">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 block mb-1.5">
              Content Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'movie', label: 'Movie', icon: Film },
                { id: 'series', label: 'TV Series', icon: Tv },
                { id: 'anime', label: 'Anime', icon: Sparkles },
              ].map((type) => {
                const Icon = type.icon;
                const active = mediaType === type.id;
                return (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setMediaType(type.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-white text-black border-white shadow-md'
                        : 'bg-white/[0.03] text-white/60 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 block mb-1.5">
              TMDB ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 105825 (Movie) or 1399 (Series)"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 focus:border-primary-light rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/30 outline-none font-mono transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 block mb-1.5">
              Title <span className="text-white/30 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. One Piece, Attack on Titan, Inception"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 focus:border-primary-light rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/30 outline-none transition-colors"
            />
          </div>

          {(mediaType === 'series' || mediaType === 'anime') && (
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 block mb-1.5">
                Total Episodes
              </label>
              <input
                type="number"
                min="1"
                max="2000"
                value={episodes}
                onChange={(e) => setEpisodes(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 focus:border-primary-light rounded-xl px-3 py-2 text-xs text-white outline-none font-mono transition-colors"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToLibrary}
              disabled={!tmdbId.trim()}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add to Library
            </button>
            <button
              type="submit"
              disabled={!tmdbId.trim()}
              className="flex-1 py-3 bg-white hover:bg-neutral-200 rounded-xl text-xs font-bold uppercase tracking-wider text-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" /> Stream Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
