import { useState, useEffect } from 'react';
import { api } from '../utils/backendApi';
import { Shield, Users, Film, Star, Calendar, Trash2, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export default function AdminDashboard({ movies = [], onDeleteMovie }) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, reviewsRes, fixturesRes, statsRes] = await Promise.all([
        api.users.list().catch(() => ({ users: [] })),
        api.reviews.list().catch(() => ({ reviews: [] })),
        api.fixtures.list().catch(() => ({ fixtures: [] })),
        api.admin.getStats().catch(() => ({ stats: null })),
      ]);

      setUsers(usersRes.users || []);
      setReviews(reviewsRes.reviews || []);
      setFixtures(fixturesRes.fixtures || []);
      setStats(statsRes.stats || null);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'member' : 'admin';
    try {
      await api.admin.updateUserRole(user.id, newRole);
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? All their data will be removed.')) return;
    try {
      await api.admin.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.reviews.delete(reviewId);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const handleUpdateFixtureStatus = async (fixtureId, newStatus) => {
    try {
      await api.fixtures.updateStatus(fixtureId, newStatus);
      setFixtures(fixtures.map(f => f.id === fixtureId ? { ...f, status: newStatus } : f));
    } catch (err) {
      alert(err.message || 'Failed to update fixture status');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary-light text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-warm-gold" />
            <span>Admin Console</span>
          </div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight">System Control Center</h1>
          <p className="text-xs text-white/50 mt-1">Manage users, moderate content, oversee fixtures, and monitor platform health.</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono rounded-xl transition-all flex items-center gap-2 w-fit cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-primary-light" />
              <span className="text-[10px] font-mono text-white/40">USERS</span>
            </div>
            <p className="text-2xl font-black">{stats.total_users}</p>
            <p className="text-[10px] text-white/40 mt-1 font-mono">Registered accounts</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <Film className="w-5 h-5 text-secondary" />
              <span className="text-[10px] font-mono text-white/40">MOVIES</span>
            </div>
            <p className="text-2xl font-black">{stats.total_movies}</p>
            <p className="text-[10px] text-white/40 mt-1 font-mono">In database</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-accent-gold" />
              <span className="text-[10px] font-mono text-white/40">REVIEWS</span>
            </div>
            <p className="text-2xl font-black">{stats.total_reviews}</p>
            <p className="text-[10px] text-white/40 mt-1 font-mono">Community posts</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-mono text-white/40">FIXTURES</span>
            </div>
            <p className="text-2xl font-black">{stats.total_fixtures}</p>
            <p className="text-[10px] text-white/40 mt-1 font-mono">Matchday events</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-white/10 pb-3 font-mono text-xs overflow-x-auto">
        {[
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'movies', label: `Movies (${movies.length})`, icon: Film },
          { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
          { id: 'fixtures', label: `Fixtures (${fixtures.length})`, icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer font-bold ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-white/[0.04] uppercase text-[10px] font-mono text-white/40 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Club</th>
                  <th className="px-6 py-4">Level / XP</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-white/40">#{u.id}</td>
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-mono text-xs">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      {u.username}
                    </td>
                    <td className="px-6 py-4 font-mono text-white/60">{u.email}</td>
                    <td className="px-6 py-4">{u.favorite_club || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono text-white/60">
                      Lvl {u.current_level || 1} • {u.total_xp || 0} XP
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                            : 'bg-white/10 border border-white/20 text-white/70'
                        }`}
                      >
                        {u.role || 'member'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(u)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono transition-colors cursor-pointer"
                      >
                        {u.role === 'admin' ? 'Make Member' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movies Tab */}
      {activeTab === 'movies' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-white/[0.04] uppercase text-[10px] font-mono text-white/40 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Genre</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {movies.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-white/40">#{m.id}</td>
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                      {m.posterUrl && <img src={m.posterUrl} alt="" className="w-8 h-10 object-cover rounded" />}
                      <span>{m.title}</span>
                    </td>
                    <td className="px-6 py-4">{m.genre}</td>
                    <td className="px-6 py-4 font-mono text-white/60">{m.year || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono text-amber-400">★ {m.rating || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onDeleteMovie(m.id)}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="glass-card p-5 rounded-2xl border border-white/10 flex justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">{r.movie_title || r.movieTitle}</h4>
                  <span className="text-amber-400 font-mono text-xs">★ {r.rating}/5</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-3">{r.text}</p>
                <div className="text-[10px] text-white/40 font-mono">Posted: {r.created_at || 'Recently'}</div>
              </div>
              <button
                onClick={() => handleDeleteReview(r.id)}
                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl h-fit transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Fixtures Tab */}
      {activeTab === 'fixtures' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-white/[0.04] uppercase text-[10px] font-mono text-white/40 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Matchup</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {fixtures.map((f) => (
                  <tr key={f.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-white/40">#{f.id}</td>
                    <td className="px-6 py-4 font-bold text-white">
                      {f.home_name || f.team_home_id} vs {f.away_name || f.team_away_id}
                    </td>
                    <td className="px-6 py-4 font-mono text-white/60">{f.match_date}</td>
                    <td className="px-6 py-4 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.status === 'LIVE'
                            ? 'bg-red-500/20 text-red-400 animate-pulse'
                            : f.status === 'FINISHED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {['SCHEDULED', 'LIVE', 'FINISHED'].map((st) => (
                        <button
                          key={st}
                          disabled={f.status === st}
                          onClick={() => handleUpdateFixtureStatus(f.id, st)}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                            f.status === st
                              ? 'bg-white/20 text-white/40 cursor-not-allowed'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
