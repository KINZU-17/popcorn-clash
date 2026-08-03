import { useState, useEffect } from 'react';
import { api } from '../utils/backendApi';
import { Info, X } from 'lucide-react';

export default function HomeFeed({ searchQuery = '', onMatchClick }) {
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [fixtures, setFixtures] = useState([]);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapFixtureData = (f) => ({
    id: f.id,
    league: f.home_league || f.away_league || 'Unknown',
    status: f.status,
    matchDate: f.match_date,
    stadium: f.home_stadium || f.away_stadium || 'TBD',
    homeTeam: { name: f.home_name, code: f.home_code, score: f.home_score || 0 },
    awayTeam: { name: f.away_name, code: f.away_code, score: f.away_score || 0 },
  });

  const loadFixtures = async (isUpdate = false) => {
    if (!isUpdate) setLoading(true);
    try {
      const data = await api.fixtures.list();
      const mapped = (data.fixtures || []).map(mapFixtureData);

      if (isUpdate) {
        setFixtures(currentFixtures =>
          currentFixtures.map(oldF => {
            const newF = mapped.find(f => f.id === oldF.id);
            return newF ? { ...oldF, homeTeam: { ...oldF.homeTeam, score: newF.homeTeam.score }, awayTeam: { ...oldF.awayTeam, score: newF.awayTeam.score }, status: newF.status } : oldF;
          })
        );
      } else {
        setFixtures(mapped);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      if (!isUpdate) setLoading(false);
    }
  };

  useEffect(() => {
    loadFixtures();
    const interval = setInterval(() => loadFixtures(true), 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFixtures = fixtures.filter((fixture) => {
    const homeName = fixture.homeTeam?.name || '';
    const awayName = fixture.awayTeam?.name || '';
    const matchesSearch =
      homeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      awayName.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedTab === 'ALL') return matchesSearch;
    return matchesSearch && fixture.status === selectedTab;
  });


  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-800/80 bg-linear-to-br from-pitch-over to-pitch-card p-6 shadow-card-glow md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Match Predictions</div>
            <h1 className="mt-2 text-3xl font-black tracking-wide text-white md:text-4xl">Live Matches & Predictions</h1>
            <p className="mt-3 max-w-2xl text-sm text-on-surface-variant md:text-base">
              Pick your fixtures, cast your predictions, and track live results — all inside PopcornClash.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-800/80 bg-pitch-dark/70 px-4 py-3 text-sm text-on-surface-variant">
            <div className="font-semibold text-white">{filteredFixtures.length} active fixtures</div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-on-surface-variant">Live collection</div>
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
                selectedTab === tab ? 'bg-pitch-card text-white shadow-neon-glow' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="text-xs uppercase tracking-[0.25em] text-on-surface-variant">Filtered by current view</div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {loading ? (
          <div className="col-span-2 rounded-3xl border border-gray-800/80 bg-pitch-card p-8 text-center">
            <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em]">Loading matches...</p>
          </div>
        ) : filteredFixtures.length === 0 ? (
          <div className="col-span-2 rounded-3xl border border-gray-800/80 bg-pitch-card p-8 text-center">
            <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em]">No matches available</p>
          </div>
        ) : (
          filteredFixtures.map((match) => (
            <div key={match.id} className="flip-card h-[180px]">
              <div className={`flip-card-inner ${flippedCardId === match.id ? 'is-flipped' : ''}`}>
                {/* Front of Card */}
                <div className="flip-card-front flex flex-col justify-between rounded-3xl border border-gray-800/70 bg-pitch-card p-5 text-left shadow-card-glow transition-all duration-200 hover:border-gray-700">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-on-surface-variant">
                    <span>{match.league}</span>
                    <span className={match.status === 'LIVE' ? 'text-emerald-400' : 'text-popcorn-gold'}>{match.status === 'LIVE' ? `${match.matchDate}` : match.matchDate}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="inline-flex rounded-full bg-pitch-over px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-clash-cyan">{match.homeTeam.code}</div>
                      <div className="mt-3 text-lg font-black text-white">{match.homeTeam.name}</div>
                    </div>
                    <div className="text-center">
                      {match.status === 'LIVE' ? (
                        <div className="text-2xl font-black text-white font-mono animate-pulse">{match.homeTeam.score} - {match.awayTeam.score}</div>
                      ) : (
                        <div className="rounded-full border border-gray-800 bg-pitch-over px-3 py-2 text-sm font-black text-popcorn-gold">VS</div>
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      <div className="inline-flex rounded-full bg-pitch-over px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-clash-red">{match.awayTeam.code}</div>
                      <div className="mt-3 text-lg font-black text-white">{match.awayTeam.name}</div>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    <button type="button" onClick={() => onMatchClick && onMatchClick(match.id)} className="p-1.5 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"><span className="text-[8px] font-bold">PREDICT</span></button>
                    <button type="button" onClick={() => setFlippedCardId(match.id)} className="p-1.5 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"><Info className="w-2.5 h-2.5" /></button>
                  </div>
                </div>
                {/* Back of Card */}
                <div className="flip-card-back flex flex-col justify-between rounded-3xl border border-gray-700 bg-pitch-over p-5 text-left shadow-card-glow">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-on-surface-variant">Match Details</div>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/50">League:</span>
                        <span className="font-bold text-white">{match.league}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Stadium:</span>
                        <span className="font-bold text-white">{match.stadium}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Status:</span>
                        <span className={`font-bold ${match.status === 'LIVE' ? 'text-emerald-400' : 'text-popcorn-gold'}`}>{match.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    <button type="button" onClick={() => onMatchClick && onMatchClick(match.id)} className="p-1.5 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"><span className="text-[8px] font-bold">PREDICT</span></button>
                    <button type="button" onClick={() => setFlippedCardId(null)} className="p-1.5 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"><X className="w-2.5 h-2.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
