import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, MessageSquare, Tv2, ExternalLink } from 'lucide-react';
import { fetchStreamingLinks } from '../utils/streamingApi';

const SUBTITLES_BY_GENRE = {
  'Sci-Fi': ['Initiating quantum jump protocol...', 'Atmospheric readings nominal.', 'Cosmic interference detected.', 'Warping through dimensional gateway...', 'Stellar engines at full capacity.', 'Alien transmission intercepted.', 'Systems online.', 'Navigation locked on target.'],
  'Thriller': ['Something is not right here.', 'Trust no one.', 'The truth is hidden.', 'Time is running out.', 'No way out.', 'Someone is watching.', 'Danger everywhere.', 'Expect the unexpected.'],
  'Action': ['Time to take action!', 'Ready for combat.', 'Enemies approaching!', 'Operation initiated.', 'Target locked.', 'Weapons hot.', 'Moving to position.', 'Mission critical.'],
  'Animation': ['What a wonderful world!', 'Magic surrounds us.', 'Adventure awaits!', 'Dream big.', 'Believe in yourself.', 'Together anything is possible!', 'Look at the bright side!', 'Never give up!'],
  'Default': ['Beautiful scene.', 'Remarkable moment.', 'Cinematic brilliance.', 'Pure artistry.', 'Unforgettable.', 'A masterpiece.', 'Stunning visuals.', 'Breathtaking.']
};

export default function MoviePlayer({ movie, onClose, onProgressUpdate }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(movie.progress || 0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState('1x');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [lightingMode, setLightingMode] = useState('glow');
  const [showCinemaSound, setShowCinemaSound] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [streamingLinks, setStreamingLinks] = useState([]);
  const [showWhereToWatch, setShowWhereToWatch] = useState(false);

  const canvasRef = useRef(null);
  const gainsRef = useRef([]);

  // Strip all non-digits to get a clean numeric TMDB ID lookup string
  const cleanTmdbId = String(movie.tmdbId || movie.id).replace(/\D/g, '');
  const targetRedirectUrl = `https://vidsrc.to/embed/movie/${cleanTmdbId}`;

  // Automatically trigger the search redirect on mount
  useEffect(() => {
    window.open(targetRedirectUrl, '_blank', 'noopener,noreferrer');
  }, [targetRedirectUrl]);

  // Fetch alternative streaming links once on mount
  useEffect(() => {
    if (cleanTmdbId) {
      fetchStreamingLinks(cleanTmdbId).then(setStreamingLinks);
    }
  }, [cleanTmdbId]);

  // Progress simulation
  useEffect(() => {
    if (!isPlaying || progress >= 100) return;
    const speedMultiplier = { '1x': 1, '2x': 2, '5x': 5 }[speed] || 1;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 0.8 * speedMultiplier;
        if (next >= 100) { setIsPlaying(false); setShowCompletion(true); return 100; }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, speed, progress]);

  // Subtitles calculation based on progression index
  useEffect(() => {
    if (!subtitlesEnabled) { setCurrentSubtitle(''); return; }
    const set = SUBTITLES_BY_GENRE[movie.genre] || SUBTITLES_BY_GENRE['Default'];
    const idx = Math.floor((progress / 100) * set.length);
    setCurrentSubtitle(set[Math.min(idx, set.length - 1)]);
  }, [progress, subtitlesEnabled, movie.genre]);

  // Canvas projector visual backdrop effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const genreColors = {
      'Sci-Fi': [0, 200, 255], 'Thriller': [200, 50, 50], 'Action': [255, 150, 0],
      'Animation': [150, 100, 200], 'Drama': [100, 150, 180], 'Horror': [100, 0, 50]
    };
    const [r, g, b] = genreColors[movie.genre] || [100, 100, 100];
    let rafId;

    const animate = () => {
      if (lightingMode === 'pitch-black') {
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = lightingMode === 'dimmed' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const alpha = lightingMode === 'glow' ? 0.15 : 0.05;
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, canvas.width * 0.6, canvas.height * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        if (isPlaying && Math.random() > 0.95) {
          ctx.fillStyle = `rgba(${r},${g},${b},${Math.random() * alpha})`;
          ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 5);
        }
        if (lightingMode === 'glow') {
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = `rgba(${r},${g},${b},${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(cx + (Math.random() - 0.5) * canvas.width, cy + (Math.random() - 0.5) * canvas.height, Math.random() * 3 + 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, [isPlaying, lightingMode, movie.genre]);

  // Web Audio Context Synthesizer
  useEffect(() => {
    if (!showCinemaSound || !isPlaying) return;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = {
      'Sci-Fi': [65.41, 87.31], 'Thriller': [48.99, 65.41], 'Action': [82.41, 110.0],
      'Animation': [110.0, 146.83], 'Drama': [55.0, 73.42], 'Horror': [41.2, 55.0]
    };
    const [f1, f2] = freqs[movie.genre] || [60, 80];
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const masterGain = audioCtx.createGain();
    filter.type = 'lowpass';
    filter.frequency.value = 450;
    osc1.frequency.value = f1; osc1.type = 'sine';
    osc2.frequency.value = f2; osc2.type = 'sine';
    masterGain.gain.value = (volume / 100) * (isMuted ? 0 : 0.15);
    osc1.connect(filter); osc2.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(audioCtx.destination);
    osc1.start(); osc2.start();
    gainsRef.current = [masterGain];
    return () => {
      try { osc1.stop(); osc2.stop(); } catch { /* ignore cleanup errors */ }
      audioCtx.close();
    };
  }, [showCinemaSound, isPlaying, movie.genre, isMuted, volume]);

  useEffect(() => {
    const gain = gainsRef.current[0];
    if (gain) gain.gain.value = (volume / 100) * (isMuted ? 0 : 0.15);
  }, [volume, isMuted]);

  const handleProgressUpdate = (newProgress) => {
    const clamped = Math.max(0, Math.min(100, newProgress));
    setProgress(clamped);
    onProgressUpdate(movie.id, clamped, 'watching');
  };

  const handleClose = () => {
    const gain = gainsRef.current[0];
    if (gain) gain.gain.value = 0;
    onProgressUpdate(movie.id, progress, progress >= 100 ? 'watched' : 'watching');
    onClose();
  };

  if (showCompletion) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-serif font-light italic text-white mb-4">Congratulations, Cinephile!</h2>
          <p className="text-white/60 text-sm mb-8">
            You've completed watching <span className="font-bold text-white">"{movie.title}"</span>
          </p>
          <div className="p-4 bg-white/5 border border-white/10 mb-8 text-left">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono mb-3">Achievement Unlocked</p>
            <p className="text-white text-xs">+150 XP earned</p>
            <p className="text-white/60 text-xs mt-1">Your level progress updated</p>
          </div>

          {streamingLinks.length > 0 && (
            <div className="mb-8 text-left">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono mb-3">Watch the Full Film On</p>
              <div className="flex flex-wrap gap-2">
                {streamingLinks.map((s, i) => (
                  <a key={i} href={s.link} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white/10 border border-white/20 text-xs text-white hover:bg-white/20 transition-colors capitalize">
                    {s.service} {s.type === 'subscription' ? '' : `(${s.type})`}
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => { setProgress(0); setShowCompletion(false); }}
              className="flex-1 py-3 px-4 bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              Watch Again
            </button>
            <button
              onClick={handleClose}
              className="flex-1 py-3 px-4 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Return to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 md:p-8">
        
        {/* Top bar details */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-3xl font-serif font-light italic text-white">{movie.title}</h2>
            <p className="text-xs md:text-sm text-white/60 mt-2">{movie.year} • {movie.genre} • {movie.duration || '2h 15m'}</p>
          </div>
          <div className="flex items-center gap-2">
            {streamingLinks.length > 0 && (
              <button
                onClick={() => setShowWhereToWatch(w => !w)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                  showWhereToWatch ? 'bg-white/20 border-white/40 text-white' : 'border-white/20 text-white/60 hover:text-white'
                }`}
              >
                <Tv2 className="w-3.5 h-3.5" /> Where to Watch
              </button>
            )}
            <button onClick={handleClose} className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Where to Watch Dropdown Container */}
        {showWhereToWatch && streamingLinks.length > 0 && (
          <div className="absolute top-20 right-4 md:right-8 z-20 bg-black/80 border border-white/20 backdrop-blur-sm p-4 min-w-[220px]">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono mb-3">Stream This Film On</p>
            <div className="flex flex-col gap-2">
              {streamingLinks.map((s, i) => (
                <a key={i} href={s.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 bg-white/10 hover:bg-white/20 transition-colors text-xs text-white capitalize">
                  <span>{s.service}</span>
                  <span className="text-white/40 text-[10px]">{s.type === 'subscription' ? 'Included' : s.type}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Redirect Interactive Display Panel */}
        <div className="w-full max-w-xl mx-auto border border-white/10 bg-zinc-900/80 p-8 rounded-xl shadow-2xl backdrop-blur text-center space-y-6">
          <div className="w-16 h-16 bg-white/5 border border-white/10 text-white rounded-full flex items-center justify-center mx-auto animate-pulse">
            <ExternalLink className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">Opening External Media Player</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              We've triggered the video player link in a separate window to prevent internal iframe embedding restrictions.
            </p>
          </div>

          <div className="pt-2">
            <a 
              href={targetRedirectUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider transition-all rounded shadow-lg"
            >
              Click Here to Resume Playback
            </a>
          </div>
        </div>

        {/* Timeline Control Trackers */}
        <div className="space-y-4">
          <div className="space-y-2">
            <input
              type="range" min="0" max="100" value={progress}
              onChange={(e) => handleProgressUpdate(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/20 cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>{Math.floor(progress)}%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 bg-black/40 p-4 rounded-lg backdrop-blur-sm">
            <button onClick={() => handleProgressUpdate(Math.max(0, progress - 10))} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white">
              <SkipBack className="w-5 h-5" />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer rounded-full">
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            <button onClick={() => handleProgressUpdate(Math.min(100, progress + 10))} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white">
              <SkipForward className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            <select value={speed} onChange={(e) => setSpeed(e.target.value)}
              className="bg-black/60 border border-white/20 text-xs px-2 py-1 text-white cursor-pointer hover:border-white/40 transition-colors outline-none rounded">
              <option value="1x">1x</option>
              <option value="2x">2x</option>
              <option value="5x">5x</option>
            </select>

            <button onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${subtitlesEnabled ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}>
              <MessageSquare className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range" min="0" max="100" value={isMuted ? 0 : volume}
                onChange={(e) => { setVolume(parseInt(e.target.value)); setIsMuted(false); }}
                className="w-20 h-1 bg-white/20 cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            <select value={lightingMode} onChange={(e) => setLightingMode(e.target.value)}
              className="bg-black/60 border border-white/20 text-xs px-2 py-1 text-white cursor-pointer hover:border-white/40 transition-colors outline-none rounded">
              <option value="glow">Glow</option>
              <option value="dimmed">Dimmed</option>
              <option value="pitch-black">Pitch Black</option>
            </select>

            <button onClick={() => setShowCinemaSound(!showCinemaSound)}
              className={`text-xs px-2.5 py-1.5 rounded border transition-colors cursor-pointer font-mono uppercase tracking-wider ${showCinemaSound ? 'bg-white/20 border-white/40 text-white' : 'border-white/20 text-white/40 hover:text-white'}`}>
              Cinema Sound: {showCinemaSound ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}