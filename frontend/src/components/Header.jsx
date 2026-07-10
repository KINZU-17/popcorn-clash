import { useState } from 'react';
import { Search, Bell, Film, Award, Menu } from 'lucide-react';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  onSearchFocus,
  onMenuClick,
  username = 'Alex Rivers',
  userLevel = 'Level 42 Cinephile',
  syncing,
  syncError,
  onSync
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'Taylor added 2 movies to your "Classic Noir" collection.', time: '2h ago', icon: Film },
    { id: 2, text: 'Jordan is waiting for you in "PopcornJam" lobby!', time: '5h ago', icon: Bell },
    { id: 3, text: 'You unlocked the "Sci-Fi Voyager" badge!', time: 'Yesterday', icon: Award }
  ];

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-260px)] h-20 border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md z-40 flex justify-between items-center px-4 md:px-10">
      
      <div className="flex items-center gap-3 w-3/5 md:w-1/2">
        <button
          onClick={onMenuClick}
          className="p-2 border border-white/10 text-white/50 hover:text-white md:hidden cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 group-focus-within:text-white transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={onSearchFocus}
            className="w-full bg-transparent border-b border-white/10 rounded-none py-2 pl-9 pr-4 text-xs tracking-wide focus:border-white focus:outline-none transition-all text-white placeholder-white/30"
            placeholder={
              activeTab === 'discover'
                ? "Describe your ideal film mood, e.g. 'cozy rain neo-noir'..."
                : "Search your library by title, genre, or year..."
            }
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6 shrink-0">
        {syncError && (
          <button 
            onClick={onSync}
            title={`Click to retry synchronizing: ${syncError}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[9px] uppercase tracking-wider hover:bg-red-500/20 hover:text-white transition-all cursor-pointer"
          >
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
            Sync Error - Retry
          </button>
        )}
        {syncing && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/50 font-mono text-[9px] uppercase tracking-wider select-none">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"></span>
            Syncing...
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-white/50 hover:text-white transition-colors focus:outline-none cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-72 sm:w-80 bg-[#141414] border border-white/10 rounded-none p-5 shadow-2xl z-50">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <span className="font-sans font-bold text-[9px] uppercase tracking-[0.2em] text-white">Notifications</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[9px] text-white/40 hover:text-white uppercase font-bold tracking-wider"
                >
                  Close
                </button>
              </div>
              <div className="space-y-4">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="flex items-start gap-3 p-1 hover:bg-white/5 transition-colors">
                      <div className="p-1.5 bg-white/5 border border-white/10 rounded-none text-white shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white/80 leading-normal font-light">{n.text}</p>
                        <span className="text-[9px] text-white/30 mt-1 block tracking-wider uppercase font-mono">{n.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold uppercase tracking-wider text-white max-w-[120px] truncate">{username}</p>
            <p className="text-[9px] text-white/40 uppercase tracking-[0.15em] mt-0.5 truncate max-w-[120px]">{userLevel}</p>
          </div>
          <div className="w-9 h-9 rounded-none border border-white/20 bg-neutral-900 flex items-center justify-center font-serif italic text-white text-sm hover:border-white transition-colors cursor-pointer select-none">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
