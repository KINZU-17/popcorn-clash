import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { api } from '../utils/backendApi';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', favorite_club: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const navigate = useNavigate();
  const { setUser } = useGame();

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

  const leagues = [...new Set(teams.map(t => t.league).filter(Boolean))];
  const clubsInLeague = teams.filter(t => t.league === selectedLeague);

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
    <div className="max-w-md mx-auto mt-6 bg-surface-container border border-surface-container-high p-8 rounded-2xl shadow-card-glow">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Create Account</h2>
        <p className="text-xs text-on-surface-variant mt-1">Set up your PopcornClash profile.</p>
      </div>
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
          <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-surface-container-low border border-surface-container-high focus:border-warm-gold outline-none p-2.5 rounded-lg text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Favorite League</label>
          <select value={selectedLeague} onChange={e => { setSelectedLeague(e.target.value); setForm({...form, favorite_club: ''}); }} className="w-full bg-surface-container-low border border-surface-container-high focus:border-warm-gold outline-none p-2.5 rounded-lg text-sm text-white">
            <option value="">Select a league</option>
            {leagues.map(league => (
              <option key={league} value={league}>{league}</option>
            ))}
          </select>
        </div>
        {selectedLeague && (
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Favorite Club</label>
            <select value={form.favorite_club} onChange={e => setForm({...form, favorite_club: e.target.value})} className="w-full bg-surface-container-low border border-surface-container-high focus:border-warm-gold outline-none p-2.5 rounded-lg text-sm text-white">
              <option value="">Select a club</option>
              {clubsInLeague.map(club => (
                <option key={club.id} value={club.name}>{club.name} ({club.code})</option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" disabled={loading || !form.favorite_club} className="w-full py-3 bg-gradient-to-r from-warm-gold to-warm-gold-light text-on-primary-container font-black rounded-lg text-sm uppercase tracking-wider mt-4 disabled:opacity-50">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-xs text-on-surface-variant mt-4">
        Already have an account? <Link to="/login" className="text-warm-gold font-bold hover:underline">Sign In</Link>
      </p>
    </div>
  );
}
