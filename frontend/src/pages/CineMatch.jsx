import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { useMovies } from '../hooks/useMovies';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MyLibraryView from '../components/MyLibraryView';
import DiscoverView from '../components/DiscoverView';
import StatsView from '../components/StatsView';
import LiveCompanion from '../components/LiveCompanion';
import CineJamLobby from '../components/CineJamLobby';
import MoviePlayer from '../components/MoviePlayer';
import HomeFeed from './HomeFeed';
import Leaderboard from './Leaderboard';
import Analytics from './Analytics';
import Profile from './Profile';
import MatchArena from './MatchArena';
import CreateFixture from './CreateFixture';
import AdminDashboard from './AdminDashboard';
import TmdbStreamModal from '../components/TmdbStreamModal';
import { api } from '../utils/backendApi';

export default function CineMatch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useGame();
  const { movies, createMovie, deleteMovie, setMovieStatus } = useMovies();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCineJam, setShowCineJam] = useState(false);
  const [showTmdbModal, setShowTmdbModal] = useState(false);
  const [activePlayingMovie, setActivePlayingMovie] = useState(null);

  useEffect(() => {
    window.openTmdbModal = () => setShowTmdbModal(true);
    return () => { delete window.openTmdbModal; };
  }, []);

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('popcornclash_tab');
    return saved || 'discover';
  });

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (typeof location.state?.activeTab === 'string') {
      setActiveTab(location.state.activeTab);
    }
  }, [location.key]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const getActivePage = () => {
    if (location.pathname.startsWith('/match/')) return 'match';
    if (location.pathname === '/fixtures/create') return 'create-fixture';
    if (location.pathname === '/leaderboard') return 'leaderboard';
    if (location.pathname === '/analytics') return 'analytics';
    if (location.pathname === '/profile') return 'profile';
    if (location.pathname === '/admin') return 'admin';
    if (location.pathname === '/movies') return 'movies';
    return 'home';
  };

  const activePage = getActivePage();
  const activeMatchId = location.pathname.startsWith('/match/') ? location.pathname.split('/match/')[1] : null;

  const handleLogout = () => { logout(); navigate('/login'); };

  const [collections, setCollections] = useState(() => {
    const saved = localStorage.getItem('popcornclash_collections');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState([]);

  // Fetch watch history from backend
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.history.list();
        if (res.history) {
          setHistory(res.history.map(h => ({
            id: h.id,
            title: h.title,
            watchedAt: h.watched_at || 'Recently',
            progress: h.progress || 100,
            posterUrl: h.poster_url,
          })));
        }
      } catch (err) {
        console.error('Failed to load watch history:', err);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => { localStorage.setItem('popcornclash_collections', JSON.stringify(collections)); }, [collections]);
  useEffect(() => { localStorage.setItem('popcornclash_tab', activeTab); }, [activeTab]);

  const handleDeleteMovie = async (id) => { await deleteMovie(id); };

  const handleUpdateMovieStatus = async (id, patch) => {
    setMovieStatus(id, patch);
  };

  const handleAddCollection = async (name, movieIds) => {
    setCollections([...collections, {
      id: Math.random().toString(36).substring(2, 9),
      name, movieCount: movieIds.length, updatedTime: 'Just now',
      bgUrl: null,
      movieIds,
    }]);
  };

  const handleDeleteCollection = async (id) => setCollections(collections.filter((c) => c.id !== id));

  const handleDeleteHistory = async (id) => {
    setHistory(history.filter((h) => h.id !== id));
    try {
      await api.history.delete(id);
    } catch (err) {
      console.error('Failed to delete history:', err);
    }
  };

  const handleReplayMovie = async (movie) => {
    await handleUpdateMovieStatus(movie.id, { status: 'watching' });
    setActivePlayingMovie({ ...movie, progress: 0, status: 'watching' });
  };

  const handleProgressUpdate = async (id, progressVal, status) => {
    await handleUpdateMovieStatus(id, { status });
    if (progressVal >= 100) {
      const target = movies.find((m) => m.id === id) || activePlayingMovie;
      if (target) {
        const newEntry = { id: Date.now(), title: target.title, watchedAt: 'Just now', progress: 100, posterUrl: target.posterUrl };
        setHistory(prev => [newEntry, ...prev]);
        try {
          await api.history.create({ title: target.title, poster_url: target.posterUrl, progress: 100 });
        } catch (err) {
          console.error('Failed to save history:', err);
        }
      }
    }
  };

  const renderContent = () => {
    if (activePage === 'movies') {
      return (
        <>
          {activeTab === 'library' && (
            <MyLibraryView
              movies={movies} collections={collections} history={history}
              searchQuery={searchQuery} onCreateMovie={createMovie}
              onDeleteMovie={handleDeleteMovie} onUpdateMovieStatus={handleUpdateMovieStatus}
              onAddCollection={handleAddCollection} onDeleteCollection={handleDeleteCollection}
              onDeleteHistory={handleDeleteHistory}
              onReplayMovie={handleReplayMovie} onPlayMovie={setActivePlayingMovie}
            />
          )}
          {activeTab === 'discover' && (
            <DiscoverView
              onCreateMovie={createMovie}
              searchQueryFromHeader={searchQuery} onPlayMovie={setActivePlayingMovie}
            />
          )}
          {activeTab === 'anime' && (
            <DiscoverView
              mode="anime"
              onCreateMovie={createMovie}
              searchQueryFromHeader={searchQuery} onPlayMovie={setActivePlayingMovie}
            />
          )}
          {activeTab === 'series' && (
            <DiscoverView
              mode="series"
              onCreateMovie={createMovie}
              searchQueryFromHeader={searchQuery} onPlayMovie={setActivePlayingMovie}
            />
          )}
          {activeTab === 'stats' && <StatsView movies={movies} />}
          {activeTab === 'companion' && <LiveCompanion />}
        </>
      );
    }
    if (activePage === 'home') return <HomeFeed searchQuery={searchQuery} onMatchClick={(id) => navigate(`/match/${id}`)} />;
    if (activePage === 'match') return <MatchArena matchId={activeMatchId} />;
    if (activePage === 'leaderboard') return <Leaderboard />;
    if (activePage === 'analytics') return <Analytics />;
    if (activePage === 'profile') return <Profile movies={movies} collections={collections} history={history} />;
    if (activePage === 'admin') return <AdminDashboard movies={movies} onDeleteMovie={handleDeleteMovie} />;
    if (activePage === 'create-fixture') return <CreateFixture />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (location.pathname !== '/movies') {
            navigate('/movies');
          }
        }}
        activePage={activePage}
        setActivePage={(page) => {
          if (page === 'movies') navigate('/movies');
          else if (page === 'home') navigate('/');
          else navigate(`/${page}`);
        }}
        onOpenCineJam={() => setShowCineJam(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        username={user?.username || 'Cinephile'}
        streakDays={user?.streak_count || 14}
        userRole={user?.role}
        userLevel={user?.level || 'Level 1 Cinephile'}
      />

      <div className="md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          activePage={activePage}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 pt-28 px-4 md:px-10 pb-20 max-w-[1440px] w-full mx-auto">
          {renderContent()}
        </main>
      </div>

      {showCineJam && <CineJamLobby onClose={() => setShowCineJam(false)} onCreateMovie={createMovie} onPlayMovie={setActivePlayingMovie} />}
      <TmdbStreamModal isOpen={showTmdbModal} onClose={() => setShowTmdbModal(false)} onPlayMovie={setActivePlayingMovie} onCreateMovie={createMovie} />
      {activePlayingMovie && <MoviePlayer movie={activePlayingMovie} onClose={() => setActivePlayingMovie(null)} onProgressUpdate={handleProgressUpdate} />}
    </div>
  );
}
