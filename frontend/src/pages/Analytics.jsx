import { useState, useEffect } from 'react';
import { api } from '../utils/backendApi';
import { useGame } from '../context/GameStateContext';

export default function Analytics() {
  const { user } = useGame();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const data = await api.users.profile();
        setStats(data.user);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-gray-800/80 bg-pitch-card p-8 text-center">
        <p className="text-xs text-white/40 uppercase tracking-[0.2em]">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
        <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Match Predictions</div>
        <h2 className="mt-2 text-2xl font-black text-white">Prediction Analytics</h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Your Prediction Streak</div>
            <div className="mt-3 text-3xl font-black text-white">{stats?.prediction_streak || 0}</div>
            <div className="mt-2 text-sm text-gray-400">Consecutive correct predictions</div>
          </div>
          <div className="rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Accuracy Rate</div>
            <div className="mt-3 text-3xl font-black text-clash-cyan">
              {stats?.total_predictions ? Math.round((stats.correct_predictions / stats.total_predictions) * 100) : 0}%
            </div>
            <div className="mt-2 text-sm text-gray-400">Your prediction accuracy</div>
          </div>
          <div className="rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Total XP Earned</div>
            <div className="mt-3 text-3xl font-black text-white">{stats?.total_xp?.toLocaleString() || 0}</div>
            <div className="mt-2 text-sm text-gray-400">From match predictions</div>
          </div>
        </div>
      </section>
    </div>
  );
}
