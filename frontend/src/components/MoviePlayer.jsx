import { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, RefreshCw, Maximize2, Star, Sparkles, AlertTriangle } from 'lucide-react';

// ─── Movie Servers (TMDB ID) ───
const MOVIE_SERVERS = [
  { id: 'vidsrc-cc', name: 'VidSrc.cc', getUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}` },
  { id: 'vidsrc-me', name: 'VidSrc.me', getUrl: (id) => `https://vidsrc.me/embed/movie/${id}` },
  { id: 'vidlink', name: 'VidLink', getUrl: (id) => `https://vidlink.pro/movie/${id}` },
  { id: 'vidsrc-in', name: 'VidSrc.in', getUrl: (id) => `https://vidsrc.in/embed/movie/${id}` },
  { id: 'vidsrc-pm', name: 'VidSrc.pm', getUrl: (id) => `https://vidsrc.pm/embed/movie/${id}` },
  { id: 'multiembed', name: 'MultiEmbed', getUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1` },
  { id: 'autoembed', name: 'AutoEmbed', getUrl: (id) => `https://autoembed.co/movie/tmdb/${id}` },
  { id: 'vidsrc-to', name: 'VidSrc.to', getUrl: (id) => `https://vidsrc.to/embed/movie/${id}` },
  { id: '2embed', name: '2Embed', getUrl: (id) => `https://www.2embed.cc/embed/${id}` },
];

// ─── Anime Servers ───
const ANIME_SERVERS_SUB = [
  { id: 'vidsrc-cc-anime', name: 'VidSrc.cc (SUB)', getUrl: (id, ep) => `https://vidsrc.cc/v2/embed/tv/${id}/1/${ep}` },
  { id: 'vidsrc-me-anime', name: 'VidSrc.me (SUB)', getUrl: (id, ep) => `https://vidsrc.me/embed/tv/${id}/1/${ep}` },
  { id: 'vidlink-anime', name: 'VidLink (SUB)', getUrl: (id, ep) => `https://vidlink.pro/tv/${id}/1/${ep}` },
  { id: 'vidsrc-in-anime', name: 'VidSrc.in (SUB)', getUrl: (id, ep) => `https://vidsrc.in/embed/tv/${id}/1/${ep}` },
  { id: 'vidsrc-pm-anime', name: 'VidSrc.pm (SUB)', getUrl: (id, ep) => `https://vidsrc.pm/embed/tv/${id}/1/${ep}` },
  { id: 'multiembed-anime', name: 'MultiEmbed (SUB)', getUrl: (id, ep) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=1&e=${ep}` },
  { id: 'vidsrc-to-anime', name: 'VidSrc.to (SUB)', getUrl: (id, ep) => `https://vidsrc.to/embed/tv/${id}/1/${ep}` },
  { id: '2embed-anime', name: '2Embed (SUB)', getUrl: (id, ep) => `https://www.2embed.cc/embedtv/${id}&s=1&e=${ep}` },
];

const ANIME_SERVERS_DUB = [
  { id: 'vidsrc-cc-dub', name: 'VidSrc.cc (DUB)', getUrl: (id, ep) => `https://vidsrc.cc/v2/embed/tv/${id}/1/${ep}` },
  { id: 'vidsrc-me-dub', name: 'VidSrc.me (DUB)', getUrl: (id, ep) => `https://vidsrc.me/embed/tv/${id}/1/${ep}` },
  { id: 'vidlink-dub', name: 'VidLink (DUB)', getUrl: (id, ep) => `https://vidlink.pro/tv/${id}/1/${ep}?ds_lang=en` },
  { id: 'vidsrc-in-dub', name: 'VidSrc.in (DUB)', getUrl: (id, ep) => `https://vidsrc.in/embed/tv/${id}/1/${ep}` },
  { id: 'vidsrc-pm-dub', name: 'VidSrc.pm (DUB)', getUrl: (id, ep) => `https://vidsrc.pm/embed/tv/${id}/1/${ep}` },
  { id: 'multiembed-dub', name: 'MultiEmbed (DUB)', getUrl: (id, ep) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=1&e=${ep}` },
  { id: 'vidsrc-to-dub', name: 'VidSrc.to (DUB)', getUrl: (id, ep) => `https://vidsrc.to/embed/tv/${id}/1/${ep}` },
  { id: '2embed-dub', name: '2Embed (DUB)', getUrl: (id, ep) => `https://www.2embed.cc/embedtv/${id}&s=1&e=${ep}` },
];

export default function MoviePlayer({ movie, onClose, onProgressUpdate }) {
  const isAnime = String(movie?.id || '').startsWith('anime-') || Boolean(movie?.isAnime);
  const [isDub, setIsDub] = useState(false);

  const activeServers = isAnime ? (isDub ? ANIME_SERVERS_DUB : ANIME_SERVERS_SUB) : MOVIE_SERVERS;

  const [selectedServer, setSelectedServer] = useState(activeServers[0]);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const playerContainerRef = useRef(null);

  const cleanTmdbId = String(movie?.tmdbId || movie?.id || '').replace(/\D/g, '') || '105825'; 
  const totalEpisodes = isAnime ? parseInt(movie?.episodes || 24, 10) : 1;

  useEffect(() => {
    const servers = isAnime ? (isDub ? ANIME_SERVERS_DUB : ANIME_SERVERS_SUB) : MOVIE_SERVERS;
    setSelectedServer(servers[0]);
    setIsLoading(true);
  }, [movie?.id, isDub, isAnime]);

  const handleServerChange = (server) => {
    setSelectedServer(server);
    setIsLoading(true);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleClose = () => {
    if (onProgressUpdate && movie?.id) {
      onProgressUpdate(movie.id, 100, 'watched');
    }
    onClose();
  };

  const currentStreamUrl = typeof selectedServer?.getUrl === 'function'
    ? (isAnime ? selectedServer.getUrl(cleanTmdbId, activeEpisode) : selectedServer.getUrl(cleanTmdbId))
    : '';

  return (
    <div
      ref={playerContainerRef}
      className="fixed inset-0 bg-bg-deepest z-50 flex flex-col justify-between overflow-hidden text-white animate-fade-in"
    >
      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] glass-header">
        <div className="flex items-center gap-4">
          {movie?.posterUrl && (
            <img src={movie.posterUrl} alt="" className="w-9 h-12 rounded-xl object-cover border border-white/10 shadow-md hidden sm:block" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-display font-bold text-white tracking-tight">{movie?.title || 'Loading Media...'}</h2>
              {movie?.rating && (
                <span className="rating-badge font-mono text-[10px]">
                  <Star className="w-3 h-3 fill-accent-gold text-accent-gold" />
                  {movie.rating}
                </span>
              )}
            </div>
            <div className="text-xs text-white/40 mt-0.5 flex flex-wrap items-center gap-2 font-mono">
              <span>{movie?.year || '2026'}</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Secure Stream
              </span>
              {isAnime && (
                <>
                  <span>•</span>
                  <span className="text-primary-light font-bold">Episode {activeEpisode} of {totalEpisodes}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAnime && (
            <div className="hidden md:flex items-center gap-1 glass-card rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setIsDub(false)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${!isDub ? 'gradient-accent text-white shadow-md' : 'text-white/40 hover:text-white'}`}
              >
                SUB
              </button>
              <button
                onClick={() => setIsDub(true)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${isDub ? 'gradient-accent text-white shadow-md' : 'text-white/40 hover:text-white'}`}
              >
                DUB
              </button>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 glass-card rounded-xl px-3.5 py-1.5 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            <select
              value={selectedServer?.id || ''}
              onChange={(e) => {
                const s = activeServers.find((srv) => srv.id === e.target.value);
                if (s) handleServerChange(s);
              }}
              className="bg-transparent text-xs text-white font-bold outline-none cursor-pointer"
            >
              {activeServers.map((srv) => (
                <option key={srv.id} value={srv.id} className="bg-bg-deepest text-black">
                  {srv.name}
                </option>
              ))}
            </select>
          </div>

          <button onClick={() => setIsLoading(true)} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer glass-card">
            <RefreshCw className={`w-4 h-4 text-white/70 ${isLoading ? 'animate-spin text-primary-light' : ''}`} />
          </button>
          <button onClick={toggleFullscreen} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors hidden sm:block cursor-pointer glass-card">
            <Maximize2 className="w-4 h-4 text-white/70" />
          </button>
          <button onClick={handleClose} className="p-2.5 hover:bg-white/20 rounded-xl transition-colors gradient-accent text-white shadow-lg cursor-pointer">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Main Player Display Frame */}
      <div className="flex-1 w-full bg-black relative flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-deepest/90 z-10 gap-3 backdrop-blur-md">
            <div className="w-10 h-10 border-3 border-primary-light border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-white/50 font-mono">Connecting to stream server via {selectedServer?.name || 'Primary Server'}...</p>
          </div>
        )}

        {currentStreamUrl ? (
          <iframe
            key={currentStreamUrl}
            src={currentStreamUrl}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
            <p className="text-sm font-semibold text-white/80 font-mono">Stream Source Execution Failed</p>
          </div>
        )}
      </div>

      {/* Dynamic Episode Picker Area */}
      {isAnime && (
        <div className="bg-bg-deepest border-t border-white/[0.08] px-6 py-3 relative z-20 flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-white/40 uppercase font-mono tracking-wider shrink-0">Episodes:</span>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
              <button
                key={ep}
                onClick={() => {
                  setActiveEpisode(ep);
                  setIsLoading(true);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  activeEpisode === ep
                    ? 'gradient-accent text-white shadow-lg scale-105'
                    : 'glass-card text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                Ep {ep}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
