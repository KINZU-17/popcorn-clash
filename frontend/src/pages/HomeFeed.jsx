import { useState, useEffect } from 'react';
import { fetchLiveMatches, fetchUpcomingMatches } from '../utils/streamingApi';

const FOOTBALL_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;

export default function HomeFeed({ searchQuery = '', onMatchClick }) {
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFixtures() {
      setLoading(true);
      try {
        const live = await fetchLiveMatches();
        const upcoming = await fetchUpcomingMatches();
        setFixtures([...live, ...upcoming]);
      } catch (err) {
        console.error('Failed to load matches:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFixtures();
  }, []);

  const filteredFixtures = fixtures.filter((fixture) => {
    const matchesSearch =
      fixture.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fixture.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedTab === 'ALL') return matchesSearch;
    return matchesSearch && fixture.status === selectedTab;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-800/80 bg-gradient-to-br from-pitch-over to-pitch-card p-6 shadow-card-glow md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Match Predictions</div>
            <h1 className="mt-2 text-3xl font-black tracking-wide text-white md:text-4xl">Live Matches & Predictions</h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-400 md:text-base">
              Pick your fixtures, cast your predictions, and track live results — all inside PopcornClash.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-800/80 bg-pitch-dark/70 px-4 py-3 text-sm text-gray-400">
            <div className="font-semibold text-white">{filteredFixtures.length} active fixtures</div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Live collection</div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-800/80 bg-pitch-over/60 px-4 py-3">
        <div className="flex items-center gap-2">
          {['ALL', 'LIVE', 'SCHEDULED'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedTab(tab)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] transition-all ${
                selectedTab === tab ? 'bg-pitch-card text-white shadow-neon-glow' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="text-xs uppercase tracking-[0.25em] text-gray-500">Filtered by current view</div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {loading ? (
          <div className="col-span-2 rounded-3xl border border-gray-800/80 bg-pitch-card p-8 text-center">
            <p className="text-xs text-white/40 uppercase tracking-[0.2em]">Loading matches...</p>
          </div>
        ) : filteredFixtures.length === 0 ? (
          <div className="col-span-2 rounded-3xl border border-gray-800/80 bg-pitch-card p-8 text-center">
            <p className="text-xs text-white/40 uppercase tracking-[0.2em]">No matches available</p>
            <p className="text-[8px] text-white/20 mt-2">Using key: {FOOTBALL_KEY ? 'yes' : 'missing'}</p>
          </div>
        ) : null}
        {!loading && filteredFixtures.map((match) => (
          <button
             key={match.id}
             type="button"
             onClick={() => onMatchClick && onMatchClick(match.id)}
             className="flex flex-col justify-between rounded-3xl border border-gray-800/70 bg-pitch-card p-5 text-left shadow-card-glow transition-all duration-200 hover:-translate-y-1 hover:border-gray-700"
           >
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                <span>{match.league}</span>
                <span className={match.status === 'LIVE' ? 'text-emerald-400' : 'text-popcorn-gold'}>{match.status === 'LIVE' ? `${match.matchDate}` : match.matchDate}</span>
              </div>

             <div className="mt-5 flex items-center justify-between gap-3">
               <div className="flex-1">
                 <div className="inline-flex rounded-full bg-pitch-over px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-clash-cyan">
                   {match.homeTeam.code}
                 </div>
                 <div className="mt-3 text-lg font-black text-white">{match.homeTeam.name}</div>
                 {match.status === 'LIVE' && (
                   <div className="text-sm text-popcorn-gold font-mono">Score: {match.homeTeam.score} - {match.awayTeam.score}</div>
                 )}
               </div>

               <div className="rounded-full border border-gray-800 bg-pitch-over px-3 py-2 text-sm font-black text-popcorn-gold">VS</div>

               <div className="flex-1 text-right">
                 <div className="inline-flex rounded-full bg-pitch-over px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-clash-cyan">
                   {match.awayTeam.code}
                 </div>
                 <div className="mt-3 text-lg font-black text-white">{match.awayTeam.name}</div>
               </div>
             </div>
           </button>
         ))}
       </div>
    </div>
  );
}
