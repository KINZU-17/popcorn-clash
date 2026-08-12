import { useState, useEffect } from 'react';
import { api } from '../utils/backendApi';
import { Shield, Users, Film, Star, Calendar, Trash2, RefreshCw, FileText, Ban, Activity, Vote, Trophy } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState(null);
  const [moviePage, setMoviePage] = useState(1);
  const [moviePagination, setMoviePagination] = useState(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPagination, setReviewPagination] = useState(null);
  const [fixturePage, setFixturePage] = useState(1);
  const [fixturePagination, setFixturePagination] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);

  const fetchRecentActivity = async () => {
    setActivityLoading(true);
    try {
      const res = await api.admin.getRecentActivity();
      setRecentActivity(res);
    } catch (err) {
      setError(err.message || 'Failed to load recent activity');
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'activity') fetchRecentActivity();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, moviesRes, reviewsRes, fixturesRes, statsRes] = await Promise.all([
        api.admin.listUsers(userPage).catch(() => ({ users: [], pagination: null })),
        api.admin.listMovies(moviePage).catch(() => ({ movies: [], pagination: null })),
        api.admin.listReviews(reviewPage).catch(() => ({ reviews: [], pagination: null })),
        api.admin.listFixtures(fixturePage).catch(() => ({ fixtures: [], pagination: null })),
        api.admin.getStats().catch(() => ({ stats: null })),
      ]);

      setMovies(moviesRes.movies || []);
      setMoviePagination(moviesRes.pagination || null);

      setUsers(usersRes.users || []);
      setUserPagination(usersRes.pagination || null);

      setReviews(reviewsRes.reviews || []);
      setReviewPagination(reviewsRes.pagination || null);

      setFixtures(fixturesRes.fixtures || []);
      setFixturePagination(fixturesRes.pagination || null);

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
  }, [userPage, moviePage, reviewPage, fixturePage]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (activeTab !== 'logs') return;
      setLogsLoading(true);
      try {
        const res = await api.admin.getLogs();
        setLogs(res.logs || []);
      } catch (err) {
        setError(err.message || 'Failed to load logs');
      } finally {
        setLogsLoading(false);
      }
    };
    fetchLogs();
  }, [activeTab]);
  const refreshCurrentTab = () => {
    fetchData();
  };

  const handleToggleRole = async (user) => {
    try {
      await api.admin.updateUserRole(user.id);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleBanUser = async (userId, is_banned) => {
    const action = is_banned ? 'ban' : 'unban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await api.admin.banUser(userId, is_banned);
      await refreshCurrentTab(); // Refresh data
    } catch (err) {
      alert(err.message || `Failed to ${action} user`);
    }
  };
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? All their data will be removed.')) return;
    try {
      await api.admin.deleteUser(userId);
      await refreshCurrentTab(); // Refresh data
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.admin.deleteReview(reviewId);
      await refreshCurrentTab(); // Refresh data
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await api.admin.deleteMovie(movieId);
      await refreshCurrentTab(); // Refresh data
    } catch (err) {
      alert(err.message || 'Failed to delete movie');
    }
  };
  const handleUpdateFixtureStatus = async (fixtureId, newStatus) => {
    try {
      await api.fixtures.updateStatus(fixtureId, newStatus);
      await refreshCurrentTab(); // Refresh data
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
          onClick={refreshCurrentTab}
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
          <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-mono text-white/40">ADMINS</span>
            </div>
            <p className="text-2xl font-black">{stats.total_admin_users}</p>
            <p className="text-[10px] text-white/40 mt-1 font-mono">Admin accounts</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <Ban className="w-5 h-5 text-red-400" />
              <span className="text-[10px] font-mono text-white/40">BANNED</span>
            </div>
            <p className="text-2xl font-black">{stats.total_banned_users}</p>
            <p className="text-[10px] text-white/40 mt-1 font-mono">Suspended users</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] font-mono text-white/40">ACTIVE</span>
            </div>
            <p className="text-2xl font-black">{stats.total_active_users}</p>
            <p className="text-[10px] text-white/40 mt-1 font-mono">Online now</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <Vote className="w-5 h-5 text-blue-400" />
              <span className="text-[10px] font-mono text-white/40">PREDICTIONS</span>
            </div>
            <p className="text-2xl font-black">{stats.total_predictions}</p>
            <p className="text-[10px] text-white/40 mt-1 font-mono">Total predictions</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              <span className="text-[10px] font-mono text-white/40">TEAMS</span>
            </div>
            <p className="text-2xl font-black">{stats.total_teams}</p>
            <p className="text-[10px] text-white/40 mt-1 font-mono">Teams in database</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-white/10 pb-3 font-mono text-xs overflow-x-auto">
        {[
          { id: 'users', label: `Users (${userPagination?.total || 0})`, icon: Users },
          { id: 'movies', label: `Movies (${moviePagination?.total || 0})`, icon: Film },
          { id: 'reviews', label: `Reviews (${reviewPagination?.total || 0})`, icon: Star },
          { id: 'fixtures', label: `Fixtures (${fixtures.length})`, icon: Calendar },
          { id: 'activity', label: 'Recent Activity', icon: Activity },
          { id: 'logs', label: 'Audit Logs', icon: FileText },
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
                        onClick={() => handleBanUser(u.id, !u.is_banned)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer ${
                          u.is_banned
                            ? 'bg-green-500/20 hover:bg-green-500/40 text-green-400'
                            : 'bg-orange-500/20 hover:bg-orange-500/40 text-orange-400'
                        }`}
                      >
                        {u.is_banned ? 'Unban' : 'Ban'}
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
          {userPagination && userPagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <span className="text-xs text-white/40 font-mono">
                Page {userPagination.page} of {userPagination.pages} ({userPagination.total} users)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setUserPage(p => p - 1)}
                  disabled={userPagination.page <= 1}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono transition-colors cursor-pointer disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setUserPage(p => p + 1)}
                  disabled={userPagination.page >= userPagination.pages}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono transition-colors cursor-pointer disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
                        onClick={() => handleDeleteMovie(m.id)}
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
          {moviePagination && moviePagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <span className="text-xs text-white/40 font-mono">
                Page {moviePagination.page} of {moviePagination.pages} ({moviePagination.total} movies)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setMoviePage(p => p - 1)}
                  disabled={moviePagination.page <= 1}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono transition-colors cursor-pointer disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setMoviePage(p => p + 1)}
                  disabled={moviePagination.page >= moviePagination.pages}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono transition-colors cursor-pointer disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <>
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
          {reviewPagination && reviewPagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10 mt-4 glass-card rounded-2xl">
              <span className="text-xs text-white/40 font-mono">
                Page {reviewPagination.page} of {reviewPagination.pages} ({reviewPagination.total} reviews)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setReviewPage(p => p - 1)}
                  disabled={reviewPagination.page <= 1}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono transition-colors cursor-pointer disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setReviewPage(p => p + 1)}
                  disabled={reviewPagination.page >= reviewPagination.pages}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono transition-colors cursor-pointer disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
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
          {fixturePagination && fixturePagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <span className="text-xs text-white/40 font-mono">
                Page {fixturePagination.page} of {fixturePagination.pages} ({fixturePagination.total} fixtures)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFixturePage(p => p - 1)}
                  disabled={fixturePagination.page <= 1}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono transition-colors cursor-pointer disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFixturePage(p => p + 1)}
                  disabled={fixturePagination.page >= fixturePagination.pages}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono transition-colors cursor-pointer disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <span className="text-xs text-white/40 font-mono">Online: {recentActivity?.online_user_count || 0}</span>
          </div>
          {activityLoading ? (
            <div className="text-center p-8 font-mono text-white/40">Loading activity...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl border border-white/10 p-5">
                <h3 className="text-sm font-bold text-white mb-3 font-mono uppercase tracking-wider">Newest Users</h3>
                <div className="space-y-3">
                  {recentActivity?.recent_users?.length === 0 && <p className="text-xs text-white/40 font-mono">No recent users</p>}
                  {recentActivity?.recent_users?.map((u) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-mono text-xs text-white">
                        {u.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{u.username}</div>
                        <div className="text-xs text-white/50 font-mono">{u.email}</div>
                      </div>
                      <span className={`ml-auto text-[10px] px-2 py-0.5 rounded font-mono ${
                        u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/60'
                      }`}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-2xl border border-white/10 p-5">
                <h3 className="text-sm font-bold text-white mb-3 font-mono uppercase tracking-wider">Latest Reviews</h3>
                <div className="space-y-3">
                  {recentActivity?.recent_reviews?.length === 0 && <p className="text-xs text-white/40 font-mono">No recent reviews</p>}
                  {recentActivity?.recent_reviews?.map((r) => (
                    <div key={r.id} className="flex items-start gap-3">
                      <Star className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-white text-sm">{r.movie_title}</div>
                        <div className="text-xs text-white/50 font-mono">★ {r.rating}/5</div>
                        <div className="text-xs text-white/40 mt-1 line-clamp-2">{r.text}</div>
                      </div>
                      <span className="ml-auto text-[10px] text-white/30 font-mono">{r.created_at || 'Recently'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-white/[0.04] border-b border-white/10">
            <h3 className="text-sm font-bold text-white">System Audit Logs</h3>
            <p className="text-xs text-white/50 mt-1">Showing the last 200 log entries.</p>
          </div>
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-white/[0.04] uppercase text-[10px] font-mono text-white/40 border-b border-white/10 sticky top-0">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {logsLoading ? (
                  <tr><td colSpan="4" className="text-center p-8 font-mono text-white/40">Loading logs...</td></tr>
                ) : logs.map((log, index) => (
                  <tr key={index} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-white/40 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.level === 'error' ? 'bg-red-500/20 text-red-400' :
                        log.level === 'warning' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-white/10 text-white/60'
                      }`}>{log.level}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">{log.event}</td>
                    <td className="px-6 py-4 font-mono text-white/60 text-[11px]"><pre className="whitespace-pre-wrap break-all">{JSON.stringify(log, (key, value) => ['timestamp', 'level', 'event'].includes(key) ? undefined : value, 2)}</pre></td>
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
