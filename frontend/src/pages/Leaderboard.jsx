import { useState } from 'react';
import { useGame } from '../context/GameStateContext';
import { TrendingUp, TrendingDown, Minus, Star, Target } from 'lucide-react';
import { INITIAL_TEAMS, INITIAL_FRIENDS, INITIAL_PREDICTORS } from '../data';

const TABS = [
  { id: 'clubs', label: 'Club Rankings' },
  { id: 'friends', label: 'Friends' },
  { id: 'predictors', label: 'Top Predictors' },
];

const teams = INITIAL_TEAMS;

const friends = INITIAL_FRIENDS;

const predictors = INITIAL_PREDICTORS;

function TrendIcon({ trend }) {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-clash-red" />;
  return <Minus className="w-3.5 h-3.5 text-gray-500" />;
}

function RankBadge({ rank }) {
  const colors = { 1: 'text-yellow-400', 2: 'text-gray-300', 3: 'text-amber-600' };
  return <span className={`font-black font-mono ${colors[rank] || 'text-popcorn-gold'}`}>#{rank}</span>;
}

export default function Leaderboard() {
  const { user } = useGame();
  const [activeTab, setActiveTab] = useState('clubs');

  const friendsWithUser = friends.map((f) =>
    f.isYou ? { ...f, username: user.username || 'You', streak: user.streak_count || 0, xp: user.current_xp || 0, favorite_club: user.favorite_club || '' } : f
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-800/80 bg-gradient-to-br from-pitch-over to-pitch-card p-6 shadow-card-glow">
        <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Match Predictions</div>
        <h1 className="mt-2 text-3xl font-black text-white">Leaderboards</h1>
        <p className="mt-2 text-sm text-gray-400">Track clubs, friends, and the top predictors in the community.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl border border-gray-800/80 bg-pitch-over/60 p-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-[0.2em] transition-all ${
              activeTab === tab.id ? 'bg-pitch-card text-white shadow-neon-glow' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Club Rankings */}
      {activeTab === 'clubs' && (
        <div className="rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
          <div className="overflow-hidden rounded-2xl border border-gray-800/80">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-pitch-over/70 text-xs uppercase tracking-[0.25em] text-gray-400">
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
                  <tr key={team.rank} className="border-t border-gray-800/80 bg-pitch-over/40 hover:bg-pitch-over/70 transition-colors">
                    <td className="px-4 py-4"><RankBadge rank={team.rank} /></td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">{team.name}</div>
                      <div className="text-xs text-gray-500">{team.code}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-400">{team.league}</td>
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
                  ? 'border-popcorn-gold/40 bg-popcorn-gold/5 shadow-neon-glow'
                  : 'border-gray-800/80 bg-pitch-card'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <RankBadge rank={friend.rank} />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pitch-over border border-white/10 font-black text-white text-sm">
                    {friend.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{friend.username}</span>
                      {friend.isYou && <span className="text-[9px] uppercase tracking-widest text-popcorn-gold font-mono border border-popcorn-gold/30 px-1.5 py-0.5 rounded">You</span>}
                    </div>
                    {friend.favorite_club && <div className="text-xs text-gray-500 mt-0.5">{friend.favorite_club}</div>}
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Star className="w-3.5 h-3.5 text-popcorn-gold" />
                      <span className="font-black text-white text-sm">{friend.streak}</span>
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-500 mt-0.5">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Star className="w-3.5 h-3.5 text-popcorn-gold" />
                      <span className="font-black text-white text-sm">{friend.xp.toLocaleString()}</span>
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-500 mt-0.5">XP</div>
                  </div>
                  <div className="text-center hidden sm:block">
                    <div className="flex items-center gap-1 justify-center">
                      <Target className="w-3.5 h-3.5 text-clash-cyan" />
                      <span className="font-black text-white text-sm">{friend.accuracy}%</span>
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-500 mt-0.5">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Predictors */}
      {activeTab === 'predictors' && (
        <div className="rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
          <div className="overflow-hidden rounded-2xl border border-gray-800/80">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-pitch-over/70 text-xs uppercase tracking-[0.25em] text-gray-400">
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
                  <tr key={p.rank} className="border-t border-gray-800/80 bg-pitch-over/40 hover:bg-pitch-over/70 transition-colors">
                    <td className="px-4 py-4"><RankBadge rank={p.rank} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pitch-over border border-white/10 font-black text-white text-xs">
                          {p.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{p.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 text-popcorn-gold" />
                        <span className="font-mono font-bold text-white">{p.streak}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-gray-400">{p.correct}/{p.total}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`font-black font-mono ${
                        p.accuracy >= 75 ? 'text-emerald-400' : p.accuracy >= 65 ? 'text-popcorn-gold' : 'text-gray-400'
                      }`}>{p.accuracy}%</span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-black text-popcorn-gold">{p.xp.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
