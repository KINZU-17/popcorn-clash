import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Copy, Check, MessageSquare, Clock } from 'lucide-react';
import { fetchMovies } from '../utils/streamingApi';

export default function CineJamLobby({ onClose, onAddMovieToLibrary }) {
  const [step, setStep] = useState(1);
  const [participants, setParticipants] = useState(['You']);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [matchedMovie, setMatchedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const availableFriends = [];

  const moods = [
    { name: 'Moody Neon' }, { name: 'Deep Space' }, { name: 'Cosy Cottage' },
    { name: 'Urban Grit' }, { name: 'Fantasy Quest' }, { name: 'Romance' },
    { name: 'Psychological Thriller' },
  ];

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Animation', 'Documentary', 'Romance'];

  const partyLink = 'popclash.app/jam/XK92PL';

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleAddFriend = (friend) => {
    const name = friend.replace(' (You)', '');
    if (!participants.includes(name) && participants.length < 5) setParticipants([...participants, name]);
  };

  const handleRemoveFriend = (friend) => {
    if (friend !== 'You') setParticipants(participants.filter(f => f !== friend));
  };

  const handleToggleMood = (name) =>
    setSelectedMoods(prev => prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]);

  const handleToggleGenre = (name) =>
    setSelectedGenres(prev => prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(partyLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now(), user: 'You', text: chatInput.trim(), time: 'Just now' }]);
    setChatInput('');
  };

  const handleFindMatch = async () => {
    if (selectedMoods.length === 0) return;
    setLoading(true);
    try {
      const query = selectedGenres.length > 0 ? selectedGenres[0] : 'Drama';
      const results = await fetchMovies({ query, genre: selectedGenres[0] || '' });
      const movie = results[0] || {
        id: `cinejam_${Date.now()}`,
        title: 'No match found',
        genre: selectedGenres[0] || 'Drama',
        year: null,
        duration: null,
        rating: null,
        posterUrl: null,
        overview: 'Try a different mood or genre combination.',
        pitch: `Based on the moods ${selectedMoods.join(', ')}${selectedGenres.length ? ` and genres ${selectedGenres.join(', ')}` : ''}, we could not find an exact match.`,
      };
      setMatchedMovie(movie);
      setCountdown(10);
      setStep(3);
    } catch (err) {
      console.error('CineJam error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">

        <div className="sticky top-0 bg-[#0A0A0A] border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-white">
              {step === 1 ? 'PopcornJam Lobby' : step === 2 ? 'Vibe & Genre' : 'Your Match!'}
            </h2>
            <p className="text-[9px] text-white/40 uppercase tracking-[0.1em] mt-1 font-mono">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">

          {step === 1 && (
            <>
              {/* Invite link */}
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-3 block">Invite Link</label>
                <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10">
                  <span className="flex-1 text-[10px] text-white/50 font-mono truncate">{partyLink}</span>
                  <button onClick={handleCopyLink} className="text-white/40 hover:text-white transition-colors cursor-pointer shrink-0">
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Participants */}
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4 block">
                  Participants ({participants.length}/5)
                </label>
                <div className="space-y-3 mb-6">
                  {participants.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                      <div>
                        <p className="text-xs font-bold text-white">{p === 'You' ? 'You (Host)' : p}</p>
                        <p className="text-[8px] text-white/40 mt-0.5">{p === 'You' ? 'Level 42 Cinephile' : 'Friend'}</p>
                      </div>
                      {p !== 'You' && (
                        <button onClick={() => handleRemoveFriend(p)} className="p-1 text-white/40 hover:text-red-400 transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add friends */}
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-3 block">Add Friends</label>
                <div className="grid gap-2 mb-6">
                  {availableFriends
                    .filter(f => !participants.includes(f.replace(' (You)', '')))
                    .map(friend => (
                      <button
                        key={friend}
                        onClick={() => handleAddFriend(friend)}
                        className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 hover:border-white/20 text-xs text-white font-medium transition-all cursor-pointer text-left"
                      >
                        <Plus className="w-4 h-4" />
                        {friend}
                      </button>
                    ))}
                </div>
              </div>

              {/* Lobby chat */}
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-3 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Lobby Chat
                </label>
                <div className="bg-white/5 border border-white/10 p-3 space-y-2 max-h-32 overflow-y-auto mb-2">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="flex items-start gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider shrink-0 ${msg.user === 'You' ? 'text-white' : 'text-white/50'}`}>{msg.user}</span>
                      <span className="text-[9px] text-white/60 flex-1">{msg.text}</span>
                      <span className="text-[8px] text-white/20 shrink-0">{msg.time}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    placeholder="Say something..."
                    className="flex-1 bg-white/5 border-b border-white/10 focus:border-white px-3 py-2 text-[10px] outline-none text-white placeholder-white/20 transition-colors"
                  />
                  <button onClick={handleSendChat} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] transition-colors cursor-pointer">
                    Send
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={participants.length < 2}
                className="w-full py-3 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs transition-all hover:bg-neutral-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue to Vibe Selection
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-2 block">Select Moods</label>
                <p className="text-[9px] text-white/40 mb-4">Pick one or more moods that match your group's vibe</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {moods.map(mood => (
                    <button
                      key={mood.name}
                      onClick={() => handleToggleMood(mood.name)}
                      className={`p-4 border transition-all text-center cursor-pointer ${
                        selectedMoods.includes(mood.name)
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 border-white/10 text-white hover:border-white/20'
                      }`}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em]">{mood.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-2 block">
                  Filter by Genre <span className="text-white/30 normal-case tracking-normal font-normal text-[9px]">(optional)</span>
                </label>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {genres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => handleToggleGenre(genre)}
                      className={`py-2 px-1 border transition-all text-center cursor-pointer ${
                        selectedGenres.includes(genre)
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <p className="text-[8px] font-bold uppercase tracking-[0.05em]">{genre}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-white/20 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleFindMatch}
                  disabled={selectedMoods.length === 0 || loading}
                  className="flex-1 py-3 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs transition-all hover:bg-neutral-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Finding Match...' : 'Find Match'}
                </button>
              </div>
            </>
          )}

          {step === 3 && matchedMovie && (
            <>
              <div className="text-center mb-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Perfect Match Found!</h3>
                <p className="text-[9px] text-white/40 mt-1 uppercase tracking-wider font-mono">
                  For {participants.join(', ')}
                </p>
              </div>

              {/* Countdown */}
              {countdown !== null && countdown > 0 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-[10px] text-white/60 uppercase tracking-[0.15em]">Starting in</span>
                  <span className="text-lg font-bold font-mono text-white w-6 text-center">{countdown}</span>
                </div>
              )}
              {countdown === 0 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-white border border-white">
                  <span className="text-[10px] font-bold text-black uppercase tracking-[0.2em]">Watch Party Started!</span>
                </div>
              )}

              <div className="mb-6">
                <div className="w-full aspect-3/4 bg-linear-to-br from-white/10 to-white/5 border border-white/10 mb-4 overflow-hidden">
                  <img src={matchedMovie.posterUrl} alt={matchedMovie.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{matchedMovie.title}</h4>
                <p className="text-[9px] text-white/60 mb-3">
                  {matchedMovie.year} • {matchedMovie.genre} • {matchedMovie.duration} • {matchedMovie.rating}
                </p>
                <p className="text-[10px] text-white/70 leading-relaxed mb-4 italic">{matchedMovie.pitch}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {[...selectedMoods, ...selectedGenres].map(tag => (
                    <span key={tag} className="text-[8px] font-mono uppercase tracking-[0.1em] text-white/40 bg-white/5 border border-white/10 px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="p-3 bg-white/5 border border-white/10">
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/60 mb-2">Overview</p>
                  <p className="text-[9px] text-white/60">{matchedMovie.overview}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(2); setMatchedMovie(null); setSelectedMoods([]); setCountdown(null); }}
                  className="flex-1 py-3 border border-white/20 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Re-Match
                </button>
                <button
                  onClick={() => { onAddMovieToLibrary({ ...matchedMovie, status: 'watchlist', isFavorite: false }); onClose(); }}
                  className="flex-1 py-3 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs transition-all hover:bg-neutral-200 active:scale-95 cursor-pointer"
                >
                  Save & Watch
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
