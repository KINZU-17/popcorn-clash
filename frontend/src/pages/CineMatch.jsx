import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MyLibraryView from '../components/MyLibraryView';
import DiscoverView from '../components/DiscoverView';
import StatsView from '../components/StatsView';
import LiveCompanion from '../components/LiveCompanion';
import CineJamLobby from '../components/CineJamLobby';
import MoviePlayer from '../components/MoviePlayer';
import Footer from '../components/Footer';
import HomeFeed from './HomeFeed';
import Leaderboard from './Leaderboard';
import Analytics from './Analytics';
import Profile from './Profile';
import MatchArena from './MatchArena';
import CreateFixture from './CreateFixture';
import { INITIAL_MOVIES, INITIAL_COLLECTIONS, INITIAL_WATCHING_HISTORY } from '../data';

export default function CineMatch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: matchIdFromRoute } = useParams();
  const { user, logout } = useGame();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCineJam, setShowCineJam] = useState(false);
  const [activePlayingMovie, setActivePlayingMovie] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const activeTab = typeof location.state?.activeTab === 'string' ? location.state.activeTab : (() => {
    const saved = localStorage.getItem('popcornclash_tab');
    return saved || 'discover';
  })();

  const getActivePage = () => {
    if (location.pathname.startsWith('/match/')) return 'match';
    if (location.pathname === '/fixtures/create') return 'create-fixture';
    if (location.pathname === '/leaderboard') return 'leaderboard';
    if (location.pathname === '/analytics') return 'analytics';
    if (location.pathname === '/profile') return 'profile';
    if (location.pathname === '/movies') return 'movies';
    return 'home';
  };

  const activePage = getActivePage();
  const activeMatchId = matchIdFromRoute || null;

  const handleLogout = () => { logout(); navigate('/login'); };
  const onSearchFocus = () => {};

  const [movies, setMovies] = useState(() => {
    const saved = localStorage.getItem('popcornclash_movies');
    return saved ? JSON.parse(saved) : INITIAL_MOVIES;
  });
  const [collections, setCollections] = useState(() => {
    const saved = localStorage.getItem('popcornclash_collections');
    return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('popcornclash_history');
    return saved ? JSON.parse(saved) : INITIAL_WATCHING_HISTORY;
  });

  useEffect(() => { localStorage.setItem('popcornclash_movies', JSON.stringify(movies)); }, [movies]);
  useEffect(() => { localStorage.setItem('popcornclash_collections', JSON.stringify(collections)); }, [collections]);
  useEffect(() => { localStorage.setItem('popcornclash_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('popcornclash_tab', activeTab); }, [activeTab]);

  const handleAddOrUpdateMovie = async (movieData) => {
    const existingIndex = movies.findIndex((m) => m.id === movieData.id || m.title === movieData.title);
    if (existingIndex > -1) {
      const updated = [...movies];
      updated[existingIndex] = { ...updated[existingIndex], ...movieData, id: updated[existingIndex].id };
      setMovies(updated);
    } else {
      setMovies(prev => [...prev, { ...movieData, id: movieData.id || Math.random().toString(36).substring(2, 9) }]);
    }
  };

  const handleDeleteMovie = async (id) => setMovies(movies.filter((m) => m.id !== id));

  const handleUpdateMovieStatus = async (id, status) => {
    const target = movies.find((m) => m.id === id);
    if (target) await handleAddOrUpdateMovie({ ...target, status });
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

  const handleDeleteHistory = async (id) => setHistory(history.filter((h) => h.id !== id));

  const handleReplayMovie = async (movie) => {
    await handleAddOrUpdateMovie({ ...movie, progress: 0, status: 'watching' });
    setHistory([{ id: Math.random().toString(36).substring(2, 9), title: movie.title, watchedAt: 'Just now', progress: 5, posterUrl: movie.posterUrl }, ...history]);
    setActivePlayingMovie({ ...movie, progress: 0, status: 'watching' });
  };

  const handleProgressUpdate = async (id, progressVal, status) => {
    const target = movies.find((m) => m.id === id);
    if (!target) return;
    await handleAddOrUpdateMovie({ ...target, progress: progressVal, status });
    if (progressVal >= 100) {
      setHistory([{ id: Math.random().toString(36).substring(2, 9), title: target.title, watchedAt: 'Just now', progress: 100, posterUrl: target.posterUrl }, ...history]);
    }
  };

  const renderContent = () => {
    if (activePage === 'movies') {
      return (
        <>
          {activeTab === 'library' && (
            <MyLibraryView
              movies={movies} collections={collections} history={history}
              searchQuery={searchQuery} onAddMovie={handleAddOrUpdateMovie}
              onDeleteMovie={handleDeleteMovie} onUpdateMovieStatus={handleUpdateMovieStatus}
              onAddCollection={handleAddCollection} onDeleteCollection={handleDeleteCollection}
              onDeleteHistory={handleDeleteHistory}
              onReplayMovie={handleReplayMovie} onPlayMovie={setActivePlayingMovie}
            />
          )}
          {activeTab === 'discover' && (
            <DiscoverView
              onAddMovieToLibrary={handleAddOrUpdateMovie} moviesInLibrary={movies}
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
    if (activePage === 'profile') return <Profile />;
    if (activePage === 'create-fixture') return <CreateFixture />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => navigate('/movies', { state: { activeTab: tab } })}
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
      />

      <div className="md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          onSearchFocus={onSearchFocus}
          onMenuClick={() => setSidebarOpen(true)}
          username={user?.username || 'Cinephile'}
          userLevel={user?.level || 'Level 1 Cinephile'}
          syncing={syncing}
          syncError={syncError}
          onSync={() => { setSyncError(null); setSyncing(false); }}
        />

        <main className="flex-1 pt-28 px-4 md:px-10 pb-20 max-w-[1440px] w-full mx-auto">
          {renderContent()}
        </main>
        <Footer />
      </div>

      {showCineJam && <CineJamLobby onClose={() => setShowCineJam(false)} onAddMovieToLibrary={handleAddOrUpdateMovie} />}
      {activePlayingMovie && <MoviePlayer movie={activePlayingMovie} onClose={() => setActivePlayingMovie(null)} onProgressUpdate={handleProgressUpdate} />}
    </div>
  );
}
