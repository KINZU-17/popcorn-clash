
import { TrendingUp } from 'lucide-react';
import { useGame } from '../context/GameStateContext';

export default function StatsView({ movies = [] }) {
  const { user } = useGame();

  const totalMovies = movies.length;
  const watchedCount = movies.filter(m => m.status === 'watched').length;
  const watchlistCount = movies.filter(m => m.status === 'watchlist').length;
  const watchingCount = movies.filter(m => m.status === 'watching').length;
  const hoursWatched = watchedCount * 2;
  const favoriteCount = movies.filter(m => m.isFavorite).length;

  const genreCount = {};
  movies.forEach(m => { if (m.genre) genreCount[m.genre] = (genreCount[m.genre] || 0) + 1; });

  const xp = user.current_xp || 0;
  const xpToNext = user.xp_to_next_level || 100;
  const level = user.current_level || 1;
  const xpPercent = Math.min((xp / (xp + xpToNext)) * 100, 100);

  const leaderboard = [
    { name: user.username || 'You', points: xp, level: `Level ${level} Cinephile` },
    { name: 'Jordan', points: 2180, level: 'Level 38 Film Expert' },
    { name: 'Taylor', points: 1920, level: 'Level 35 Cinephile' },
    { name: 'Morgan', points: 1650, level: 'Level 30 Film Buff' },
  ].sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 }));

  return (
    <div className="space-y-10">

      {/* XP progress card */}
      <div className="p-6 bg-gradient-to-r from-white/10 to-white/5 border border-surface-container-high">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif font-light italic text-white mb-1">{user.username || 'Cinephile'}</h2>
            <p className="text-white/60 text-xs uppercase tracking-[0.15em] font-medium">Level {level} Cinephile</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white mb-1">{xp.toLocaleString()} pts</p>
            <p className="text-xs text-on-surface-variant">{xpToNext} pts to Level {level + 1}</p>
          </div>
        </div>
        <div className="relative h-2 bg-surface-container-low border border-surface-container-high">
          <div className="absolute h-full bg-white transition-all duration-500" style={{ width: `${xpPercent}%` }} />
        </div>
        <p className="text-[9px] text-on-surface-variant uppercase tracking-[0.1em] mt-3 font-mono">{xp} / {xp + xpToNext} XP</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total in Library', value: totalMovies },
          { label: 'Hours Watched', value: hoursWatched },
          { label: 'Day Streak', value: user.streak_count || 0 },
          { label: 'Favourites', value: favoriteCount },
        ].map((stat, idx) => (
          <div key={idx} className="p-4 bg-surface-container-low border border-surface-container-high text-center hover:border-surface-container-high transition-all">
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-[9px] text-on-surface-variant uppercase tracking-[0.15em] font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'On Watchlist', value: watchlistCount, color: 'text-popcorn-gold' },
          { label: 'Currently Watching', value: watchingCount, color: 'text-clash-cyan' },
          { label: 'Finished', value: watchedCount, color: 'text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="p-4 bg-surface-container-low border border-surface-container-high text-center">
            <p className={`text-2xl font-bold mb-1 ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-on-surface-variant uppercase tracking-[0.15em]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Genre breakdown */}
      {Object.keys(genreCount).length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-6">What you watch most</h3>
          <div className="space-y-4">
            {Object.entries(genreCount).sort(([, a], [, b]) => b - a).slice(0, 6).map(([genre, count]) => (
              <div key={genre}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">{genre}</span>
                  <span className="text-[9px] text-on-surface-variant">{count} {count === 1 ? 'film' : 'films'}</span>
                </div>
                <div className="relative h-2 bg-surface-container-low border border-surface-container-high">
                  <div className="absolute h-full bg-white transition-all duration-500"
                    style={{ width: `${(count / Math.max(...Object.values(genreCount))) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends leaderboard */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-white" />
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">How you stack up</h3>
        </div>
        <div className="border border-surface-container-high">
          <div className="grid grid-cols-4 gap-4 p-4 bg-surface-container-low border-b border-surface-container-high font-bold text-[9px] uppercase tracking-[0.1em] text-white">
            <div>Rank</div><div>Name</div><div>Points</div><div>Level</div>
          </div>
          {leaderboard.map((u, idx) => (
            <div key={idx} className={`grid grid-cols-4 gap-4 p-4 border-b border-surface-container-high text-xs transition-all ${
              u.name === (user.username || 'You') ? 'bg-surface-container-low' : 'hover:bg-surface-container-low'
            }`}>
              <div className="font-bold text-white">#{u.rank}</div>
              <div className="text-white font-medium truncate">{u.name}</div>
              <div className="text-white/60">{u.points.toLocaleString()}</div>
              <div className="text-on-surface-variant text-[8px] uppercase tracking-wider truncate">{u.level}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
