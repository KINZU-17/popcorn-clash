import { Compass, Library, BarChart2, Tv, MessageSquare, LogOut, X, Home, Trophy, BarChart, User, PlusSquare } from 'lucide-react';

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
  userRole = null
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

      <nav className={`fixed left-0 top-0 h-full w-[260px] bg-[#0A0A0A] border-r border-white/10 z-50 flex flex-col py-10 px-6 justify-between shrink-0 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="space-y-8 overflow-y-auto">
          <div className="flex md:hidden justify-end -mb-4">
            <button onClick={onClose} className="p-1.5 border border-white/10 text-white/50 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Brand */}
          <div className="cursor-pointer group" onClick={() => handleMovieTab('library')}>
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/50 block mb-2 font-mono">PopcornClash</div>
            <h1 className="font-serif text-3xl font-light italic text-white tracking-tight leading-none group-hover:text-neutral-300 transition-colors">Movie Hub</h1>
            <div className="w-8 h-px bg-white/20 mt-4 group-hover:w-16 transition-all duration-500"></div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mt-3 font-medium">{streakDays}-day Streak</p>
          </div>

          {/* Movie Hub tabs */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.35em] text-white/25 font-mono mb-3">Movies</div>
            <div className="flex flex-col space-y-1">
              {movieTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === 'movies' && activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMovieTab(item.id)}
                    className={`w-full flex items-center space-x-3 py-2.5 transition-all duration-200 text-left border-b border-transparent ${
                      isActive ? 'text-white border-b border-white/20 font-medium' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/30'}`} />
                    <span className="font-sans text-[11px] uppercase tracking-[0.2em]">{item.label}</span>
                    {item.id === 'companion' && (
                      <span className="ml-auto text-[7px] font-mono uppercase tracking-[0.15em] text-white/30 bg-white/5 border border-white/10 px-1.5 py-0.5">Soon</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match Predictions section */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.35em] text-white/25 font-mono mb-3">Match Predictions</div>
            <div className="flex flex-col space-y-1">
              {matchPages.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePage(item.id)}
                    className={`w-full flex items-center space-x-3 py-2.5 transition-all duration-200 text-left border-b border-transparent ${
                      isActive ? 'text-white border-b border-white/20 font-medium' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/30'}`} />
                    <span className="font-sans text-[11px] uppercase tracking-[0.2em]">{item.label}</span>
                  </button>
                );
              })}
              {userRole === 'admin' && (
                <button
                  onClick={() => handlePage('create-fixture')}
                  className={`w-full flex items-center space-x-3 py-2.5 transition-all duration-200 text-left border-b border-transparent ${
                    activePage === 'create-fixture' ? 'text-clash-cyan border-b border-clash-cyan/20 font-medium' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <PlusSquare className="w-4 h-4 shrink-0 text-clash-cyan/60" />
                  <span className="font-sans text-[11px] uppercase tracking-[0.2em]">Create Fixture</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-3">
          <button
            onClick={() => { onOpenCineJam(); onClose(); }}
            className="w-full py-3.5 px-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-[11px] transition-colors duration-300 hover:bg-[#E0E0E0] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Start a PopcornJam</span>
          </button>

          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full flex items-center space-x-3 py-3 text-left text-white/40 hover:text-white/80 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0 text-white/20" />
            <span className="font-sans text-[11px] uppercase tracking-[0.2em]">Sign Out</span>
          </button>

          <div className="pt-1 text-[9px] uppercase tracking-[0.3em] text-white/20 font-mono text-center">
            EST. MMXIV || Hello {username.split(' ')[0] || username}
          </div>
        </div>
      </nav>
    </>
  );
}
