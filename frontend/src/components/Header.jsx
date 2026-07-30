import { Search, Menu } from 'lucide-react';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  activePage,
  onSearchFocus,
  onMenuClick
}) {
  const isMovieHub = activePage === 'movies' && (activeTab === 'discover' || activeTab === 'library');
  const placeholder = isMovieHub
    ? (activeTab === 'discover'
        ? "Describe your ideal film mood, e.g. 'adventurous'..."
        : "Search your library by title, genre, or year...")
    : "Search matches by team name...";
  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-260px)] h-20 border-b border-surface-container-high bg-[#0c0a09]/90 backdrop-blur-md z-40 flex items-center justify-center px-4 md:px-10">
      <div className="flex items-center gap-3 w-full max-w-2xl relative">
        <button
          onClick={onMenuClick}
          className="p-2 border border-surface-container-high text-on-surface-variant hover:text-white md:hidden cursor-pointer absolute left-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-container-high group-focus-within:text-warm-gold-light transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={onSearchFocus}
            className="w-full bg-transparent border-b border-surface-container-high rounded-none py-2 pl-9 pr-4 text-xs tracking-wide focus:border-warm-gold focus:outline-none transition-all text-white placeholder-surface-container-high"
            placeholder={placeholder}
          />
        </div>
      </div>
    </header>
  );
}
