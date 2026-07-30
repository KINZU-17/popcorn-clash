import { useState, useEffect } from 'react';
import { useGame } from '../context/GameStateContext';
import { TrendingUp, TrendingDown, Minus, Star, Target } from 'lucide-react';
import { api } from '../utils/backendApi';

const TABS = [
  { id: 'clubs', label: 'Club Rankings' },
  { id: 'friends', label: 'Friends' },
  { id: 'predictors', label: 'Top Predictors' },
];

function TrendIcon({ trend }) {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-clash-red" />;
  return <Minus className="w-3.5 h-3.5 text-on-surface-variant" />;
}

function RankBadge({ rank }) {
  const colors = { 1: 'text-yellow-400', 2: 'text-white', 3: 'text-amber-600' };
  return <span className={`font-black font-mono ${colors[rank] || 'text-popcorn-gold'}`}>#{rank}</span>;
}

export default function Leaderboard() {
  const { user } = useGame();
  const [activeTab, setActiveTab] = useState('clubs');
  const [teams, setTeams] = useState([]);
  const [predictors, setPredictors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [teamsData, leaderboardData] = await Promise.all([
          api.teams.list(),
          api.teams.leaderboard()
        ]);
        setTeams((teamsData.teams || []).map((team, index) => ({
          rank: index + 1,
          name: team.name,
          code: team.code,
          league: team.league || 'Unknown',
          trend: 'neutral',
          rating: team.rating_score || 0,
        })));
        const mapped = (leaderboardData.leaderboard || []).map((entry, index) => ({
          rank: index + 1,
          username: entry.username,
          streak: entry.correct_predictions || 0,
          correct: entry.correct_predictions || 0,
          total: entry.total_predictions || 0,
          accuracy: entry.total_predictions ? Math.round((entry.correct_predictions / entry.total_predictions) * 100) : 0,
          xp: entry.total_xp || 0,
          favorite_club: entry.favorite_club || '',
        }));
        setPredictors(mapped);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const friendsWithUser = predictors.map((p) =>
    p.username === (user?.username || 'You') ? { ...p, isYou: true } : { ...p, isYou: false }
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-surface-container-high bg-gradient-to-br from-surface-container to-surface-container p-6 shadow-card-glow">
        <div className="text-xs font-semibold uppercase tracking-[0.35em] text-warm-gold">Match Predictions</div>
        <h1 className="mt-2 text-3xl font-black text-white">Leaderboards</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Track clubs, friends, and the top predictors in the community.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl border border-surface-container-high bg-surface-container-low/60 p-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-[0.2em] transition-all ${
              activeTab === tab.id ? 'bg-surface-container text-white shadow-neon-glow' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-warm-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Club Rankings */}
          {activeTab === 'clubs' && (
            <div className="rounded-3xl border border-surface-container-high bg-surface-container p-6 shadow-card-glow">
              <div className="overflow-hidden rounded-2xl border border-surface-container-high">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-surface-container-low/70 text-xs uppercase tracking-[0.25em] text-on-surface-variant">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Club</th>
                      <th className="px-4 py-3">League</th>
                      <th className="px-4 py-3 text-center">Trend</th>
                      <th className="px-4 py-3 text-right">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr key={team.rank} className="border-t border-surface-container-high bg-surface-container-low/40 hover:bg-surface-container-low/70 transition-colors">
                        <td className="px-4 py-4"><RankBadge rank={team.rank} /></td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-white">{team.name}</div>
                          <div className="text-xs text-on-surface-variant">{team.code}</div>
                        </td>
                        <td className="px-4 py-4 text-on-surface-variant">{team.league}</td>
                        <td className="px-4 py-4 text-center"><TrendIcon trend={team.trend} /></td>
                        <td className="px-4 py-4 text-right font-mono font-black text-emerald-400">{team.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Friends Leaderboard */}
          {activeTab === 'friends' && (
            <div className="space-y-3">
              {friendsWithUser.map((friend) => (
                <div
                  key={friend.rank}
                  className={`rounded-3xl border p-5 transition-all ${
                    friend.isYou
                      ? 'border-warm-gold/40 bg-warm-gold/5 shadow-neon-glow'
                      : 'border-surface-container-high bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <RankBadge rank={friend.rank} />
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low border border-surface-container-high font-black text-white text-sm">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{friend.username}</span>
                          {friend.isYou && <span className="text-[9px] uppercase tracking-widest text-warm-gold font-mono px-1.5 py-0.5">You</span>}
                        </div>
                        {friend.favorite_club && <div className="text-xs text-on-surface-variant mt-0.5">{friend.favorite_club}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Star className="w-3.5 h-3.5 text-warm-gold" />
                          <span className="font-black text-white text-sm">{friend.streak}</span>
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-on-surface-variant mt-0.5">Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Star className="w-3.5 h-3.5 text-warm-gold" />
                          <span className="font-black text-white text-sm">{friend.xp.toLocaleString()}</span>
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-on-surface-variant mt-0.5">XP</div>
                      </div>
                      <div className="text-center hidden sm:block">
                        <div className="flex items-center gap-1 justify-center">
                          <Target className="w-3.5 h-3.5 text-warm-gold-light" />
                          <span className="font-black text-white text-sm">{friend.accuracy}%</span>
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-on-surface-variant mt-0.5">Accuracy</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Predictors */}
          {activeTab === 'predictors' && (
            <div className="rounded-3xl border border-surface-container-high bg-surface-container p-6 shadow-card-glow">
              <div className="overflow-hidden rounded-2xl border border-surface-container-high">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-surface-container-low/70 text-xs uppercase tracking-[0.25em] text-on-surface-variant">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Predictor</th>
                      <th className="px-4 py-3 text-center">Streak</th>
                      <th className="px-4 py-3 text-center">Correct / Total</th>
                      <th className="px-4 py-3 text-center">Accuracy</th>
                      <th className="px-4 py-3 text-right">XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictors.map((p) => (
                      <tr key={p.rank} className="border-t border-surface-container-high bg-surface-container-low/40 hover:bg-surface-container-low/70 transition-colors">
                        <td className="px-4 py-4"><RankBadge rank={p.rank} /></td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low border border-surface-container-high font-black text-white text-xs">
                              {p.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-white">{p.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 text-warm-gold" />
                            <span className="font-mono font-bold text-white">{p.streak}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-on-surface-variant">{p.correct}/{p.total}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-black font-mono ${
                            p.accuracy >= 75 ? 'text-emerald-400' : p.accuracy >= 65 ? 'text-warm-gold' : 'text-on-surface-variant'
                          }`}>{p.accuracy}%</span>
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-black text-warm-gold">{p.xp.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
