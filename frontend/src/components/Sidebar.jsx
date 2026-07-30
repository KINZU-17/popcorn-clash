import { Compass, Library, BarChart2, Tv, MessageSquare, LogOut, X, Home, Trophy, BarChart, User, PlusSquare, Bell } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  activePage,
  setActivePage,
  onOpenCineJam,
  isOpen,
  onClose,
  onLogout,
  username = 'Cinephile',
  streakDays = 14,
  userRole = null,
  userLevel = 'Level 1 Cinephile',
  notifications = []
}) {
  const movieTabs = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'library', label: 'My Library', icon: Library },
    { id: 'stats', label: 'Film Stats', icon: BarChart2 },
    { id: 'companion', label: 'Live Session', icon: MessageSquare },
  ];

  const matchPages = [
    { id: 'home', label: 'Match Feed', icon: Home },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleMovieTab = (id) => { setActiveTab(id); onClose(); };
  const handlePage = (id) => { setActivePage(id); onClose(); };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
          onClick={onClose}
        />
      )}

      <nav className={`fixed left-0 top-0 h-full w-[260px] bg-[#0c0a09] border-r border-surface-container-high z-50 flex flex-col py-10 px-6 justify-between shrink-0 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="space-y-6 overflow-y-auto">
          <div className="flex md:hidden justify-end -mb-4">
            <button onClick={onClose} className="p-1.5 border border-surface-container-high text-on-surface-variant hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

           {/* Brand */}
          <div className="cursor-pointer group" onClick={() => handleMovieTab('discover')}>
            <div className="text-[10px] uppercase tracking-[0.4em] text-on-surface-variant block mb-2 font-mono">PopcornClash</div>
            <h1 className="font-serif text-3xl font-light italic text-white tracking-tight leading-none group-hover:text-on-surface-variant transition-colors">Matchday Arena</h1>
            <div className="w-8 h-px bg-surface-container-high mt-4 group-hover:w-16 transition-all duration-500"></div>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mt-3 font-medium">{streakDays}-day Streak</p>
          </div>

          {/* PopcornJam / watch-party tabs */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.35em] text-on-surface-variant font-mono mb-3">PopcornJam</div>
            <div className="flex flex-col space-y-1">
              {movieTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === 'movies' && activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMovieTab(item.id)}
                    className={`w-full flex items-center space-x-3 py-2.5 transition-all duration-200 text-left border-b border-transparent ${
                      isActive ? 'text-white border-b border-warm-gold/30 font-medium' : 'text-on-surface-variant hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-warm-gold-light' : 'text-surface-container-high'}`} />
                    <span className="font-sans text-[11px] uppercase tracking-[0.2em]">{item.label}</span>
                    {item.id === 'companion' && (
                      <span className="ml-auto text-[7px] font-mono uppercase tracking-[0.15em] text-on-surface-variant bg-surface-container-low border border-surface-container-high px-1.5 py-0.5">Soon</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

           {/* Matchday section */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.35em] text-on-surface-variant font-mono mb-3">Matchday</div>
            <div className="flex flex-col space-y-1">
              {matchPages.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePage(item.id)}
                    className={`w-full flex items-center space-x-3 py-2.5 transition-all duration-200 text-left border-b border-transparent ${
                      isActive ? 'text-white border-b border-warm-gold/30 font-medium' : 'text-on-surface-variant hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-warm-gold-light' : 'text-surface-container-high'}`} />
                    <span className="font-sans text-[11px] uppercase tracking-[0.2em]">{item.label}</span>
                  </button>
                );
              })}
              {userRole === 'admin' && (
                <button
                  onClick={() => handlePage('create-fixture')}
                  className={`w-full flex items-center space-x-3 py-2.5 transition-all duration-200 text-left border-b border-transparent ${
                    activePage === 'create-fixture' ? 'text-warm-gold border-b border-warm-gold/30 font-medium' : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  <PlusSquare className="w-4 h-4 shrink-0 text-warm-gold/60" />
                  <span className="font-sans text-[11px] uppercase tracking-[0.2em]">Create Fixture</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div>
              <div className="text-[9px] uppercase tracking-[0.35em] text-on-surface-variant font-mono mb-3 flex items-center gap-2">
                <Bell className="w-3 h-3" />
                Notifications
              </div>
              <div className="space-y-2">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-2.5 bg-surface-container-low border border-surface-container-high">
                    <p className="text-[10px] text-on-surface-variant leading-relaxed">{n.text}</p>
                    <span className="text-[8px] text-surface-container-high mt-1 block tracking-wider uppercase font-mono">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-surface-container-high space-y-4">
          {/* User Details */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none border border-surface-container-high bg-surface-container-low flex items-center justify-center font-serif italic text-white text-sm">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-white truncate">{username}</p>
              <p className="text-[9px] text-on-surface-variant uppercase tracking-[0.15em] truncate">{userLevel}</p>
            </div>
          </div>

          <button
            onClick={() => { onOpenCineJam(); onClose(); }}
            className="w-full py-3.5 px-4 bg-primary text-on-primary-container font-bold uppercase tracking-[0.2em] text-[11px] transition-colors duration-300 hover:bg-primary-container active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Start a PopcornJam</span>
          </button>

          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full flex items-center space-x-3 py-3 text-left text-on-surface-variant hover:text-white/80 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0 text-surface-container-high" />
            <span className="font-sans text-[11px] uppercase tracking-[0.2em]">Sign Out</span>
          </button>

          <div className="pt-1 text-[9px] uppercase tracking-[0.3em] text-surface-container-high font-mono text-center">
            EST. MMXIV || Hello {username.split(' ')[0] || username}
          </div>
        </div>
      </nav>
    </>
  );
}
