import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { api } from '../utils/backendApi';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff } from 'lucide-react';
import AuthBackground from '../components/AuthBackground';
import logo from '../assets/logo.png';

const MOCK_LEAGUES = [
  {
    name: 'Premier League',
    code: 'EPL',
    clubs: [
      { id: 'arsenal', name: 'Arsenal', code: 'ARS' },
      { id: 'chelsea', name: 'Chelsea', code: 'CHE' },
      { id: 'man-city', name: 'Man City', code: 'MCI' },
      { id: 'liverpool', name: 'Liverpool', code: 'LIV' },
      { id: 'man-utd', name: 'Man Utd', code: 'MUN' },
      { id: 'tottenham', name: 'Tottenham', code: 'TOT' },
    ],
  },
  {
    name: 'La Liga',
    code: 'LL',
    clubs: [
      { id: 'real-madrid', name: 'Real Madrid', code: 'RMA' },
      { id: 'barcelona', name: 'Barcelona', code: 'BAR' },
      { id: 'atletico', name: 'Atletico Madrid', code: 'ATM' },
      { id: 'sevilla', name: 'Sevilla', code: 'SEV' },
      { id: 'villarreal', name: 'Villarreal', code: 'VIL' },
    ],
  },
  {
    name: 'Serie A',
    code: 'SA',
    clubs: [
      { id: 'juventus', name: 'Juventus', code: 'JUV' },
      { id: 'inter', name: 'Inter Milan', code: 'INT' },
      { id: 'ac-milan', name: 'AC Milan', code: 'ACM' },
      { id: 'roman', name: 'Roma', code: 'ROM' },
      { id: 'napoli', name: 'Napoli', code: 'NAP' },
    ],
  },
  {
    name: 'Bundesliga',
    code: 'BL',
    clubs: [
      { id: 'bayern', name: 'Bayern Munich', code: 'BAY' },
      { id: 'dortmund', name: 'Dortmund', code: 'BVB' },
      { id: 'leipzig', name: 'Leipzig', code: 'RBL' },
      { id: 'leverkusen', name: 'Leverkusen', code: 'B04' },
    ],
  },
  {
    name: 'Ligue 1',
    code: 'L1',
    clubs: [
      { id: 'psg', name: 'PSG', code: 'PSG' },
      { id: 'marseille', name: 'Marseille', code: 'OM' },
      { id: 'lyon', name: 'Lyon', code: 'OL' },
      { id: 'monaco', name: 'Monaco', code: 'ASM' },
    ],
  },
];

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', favorite_club: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser, loginWithGoogle } = useGame();

  useEffect(() => {
    async function loadTeams() {
      try {
        const data = await api.teams.list();
        setTeams(data.teams || []);
      } catch (err) {
        console.error('Failed to load teams:', err);
      }
    }
    loadTeams();
  }, []);

  const apiLeagues = [...new Set(teams.map(t => t.league).filter(Boolean))];
  const apiClubsInLeague = (league) => teams.filter(t => t.league === league);

  const allLeagues = [...MOCK_LEAGUES.map(l => l.name), ...apiLeagues.filter(l => !MOCK_LEAGUES.find(ml => ml.name === l))];

  const getClubs = (league) => {
    const mock = MOCK_LEAGUES.find(ml => ml.name === league);
    if (mock) return mock.clubs;
    return apiClubsInLeague(league);
  };

  const clubsInLeague = selectedLeague ? getClubs(selectedLeague) : [];

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.auth.register(form);
      localStorage.setItem('token', data.token);
      setUser({
        isAuthenticated: true,
        username: data.user.username,
        role: data.user.role,
        streak_count: data.user.prediction_streak,
        current_level: data.user.current_level,
        current_xp: data.user.total_xp,
        xp_to_next_level: 100,
        favorite_club: data.user.favorite_club,
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center relative overflow-hidden px-4">
      <AuthBackground api={api} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a09]/80 via-[#0c0a09]/60 to-[#0c0a09]/90 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="PopcornClash" className="w-16 h-16 mx-auto mb-4 rounded-2xl shadow-lg" />
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Create Account</h2>
          <p className="text-xs text-on-surface-variant mt-1">Pick your league and club to get started.</p>
        </div>
        <div className="max-w-md mx-auto glass-panel p-8 rounded-2xl shadow-card-glow">
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Username</label>
              <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full bg-surface-container-low border border-surface-container-high focus:border-warm-gold outline-none p-2.5 rounded-lg text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Email Address</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-surface-container-low border border-surface-container-high focus:border-warm-gold outline-none p-2.5 rounded-lg text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full bg-surface-container-low border border-surface-container-high focus:border-warm-gold outline-none p-2.5 rounded-lg text-sm text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Favorite League</label>
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`.league-scroll::-webkit-scrollbar { display: none; }`}</style>
                {allLeagues.map(league => (
                  <button
                    key={league}
                    type="button"
                    onClick={() => { setSelectedLeague(league); setForm({...form, favorite_club: ''}); }}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border snap-start ${
                      selectedLeague === league
                        ? 'gradient-accent text-white border-accent-gold shadow-lg'
                        : 'bg-surface-container-low border-surface-container-high text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {league}
                  </button>
                ))}
              </div>
            </div>
            {selectedLeague && clubsInLeague.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Favorite Club</label>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style>{`.club-scroll::-webkit-scrollbar { display: none; }`}</style>
                  {clubsInLeague.map(club => (
                    <button
                      key={club.id}
                      type="button"
                      onClick={() => setForm({...form, favorite_club: club.name})}
                      className={`shrink-0 w-32 py-2 rounded-xl text-center transition-all cursor-pointer border snap-start ${
                        form.favorite_club === club.name
                          ? 'gradient-accent text-white border-accent-gold shadow-lg scale-105'
                          : 'bg-surface-container-low border-surface-container-high text-on-surface-variant hover:bg-surface-container-high hover:scale-102'
                      }`}
                    >
                      <div className="w-full aspect-[2/3] rounded-lg mb-1 bg-gradient-to-br from-surface-container-high to-surface-container-low flex items-center justify-center overflow-hidden relative">
                        <img
                          src={`https://images.unsplash.com/photo-1461896836934-bd45ba8fcf98?w=120&h=160&fit=crop&q=80`}
                          alt={club.name}
                          className="w-full h-full object-cover opacity-50"
                          onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-gradient-to-br', 'from-warm-gold/40', 'to-warm-gold-light/20'); }}
                        />
                        <span className="absolute text-xs font-bold text-white drop-shadow-lg">{club.code}</span>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider truncate px-1">{club.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button type="submit" disabled={loading || !form.favorite_club} className="w-full py-3 bg-gradient-to-r from-warm-gold to-warm-gold-light text-on-primary-container font-black rounded-lg text-sm uppercase tracking-wider mt-4 disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-container-high"></div></div>
            <div className="relative bg-surface-container px-4"><span className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">or</span></div>
          </div>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const data = await loginWithGoogle(credentialResponse.credential);
                localStorage.setItem('token', data.token);
                setUser({
                  isAuthenticated: true,
                  username: data.user.username,
                  role: data.user.role,
                  streak_count: data.user.prediction_streak,
                  current_level: data.user.current_level,
                  current_xp: data.user.total_xp,
                  xp_to_next_level: 100,
                  favorite_club: data.user.favorite_club,
                });
                navigate('/');
              } catch (err) {
                setError(err.message || 'Google sign-up failed');
              }
            }}
            onError={() => setError('Google sign-up failed')}
            useOneTap
          />
          <p className="text-center text-xs text-on-surface-variant mt-4">
            Already have an account? <Link to="/login" className="text-warm-gold font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
