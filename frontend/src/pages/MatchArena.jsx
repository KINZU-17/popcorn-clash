import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

export default function MatchArena({ matchId }) {
  const [vote, setVote] = useState({ selection: null, ratio: 50 });
  const [match, setMatch] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalVotes, setGlobalVotes] = useState({ home: 0, draw: 0, away: 0 });

  useEffect(() => {
    async function loadData() {
      if (!matchId) return;
      try {
        if (API_BASE) {
          const res = await fetch(`${API_BASE}/api/fixtures/${matchId}`);
          if (res.ok) {
            const matchData = await res.json();
            setMatch(matchData);
            if (matchData.globalVotes) setGlobalVotes(matchData.globalVotes);
          }
        }
      } catch (err) {
        console.error('Failed to load match data:', err);
      }
    }
    loadData();
  }, [matchId]);

  const handleLockPrediction = async () => {
    if (!vote.selection || submitted) return;
    setSubmitting(true);
    try {
      if (API_BASE) {
        const res = await fetch(`${API_BASE}/api/predictions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({
            fixture_id: matchId,
            prediction: vote.selection,
            confidence: vote.ratio
          })
        });
        if (res.ok) setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const matchTitle = match ? `${match.homeTeam?.name || 'Home'} vs ${match.awayTeam?.name || 'Away'}` : 'Select Match';

  const totalVotes = globalVotes.home + globalVotes.draw + globalVotes.away;
  const homePercent = totalVotes ? Math.round((globalVotes.home / totalVotes) * 100) : 0;
  const drawPercent = totalVotes ? Math.round((globalVotes.draw / totalVotes) * 100) : 0;
  const awayPercent = totalVotes ? Math.round((globalVotes.away / totalVotes) * 100) : 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-gray-800/80 bg-gradient-to-br from-pitch-over to-pitch-card p-6 shadow-card-glow">
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Match Prediction</div>
          <h2 className="mt-2 text-3xl font-black text-white">{matchTitle}</h2>
          <p className="mt-3 text-sm text-gray-400">Cast your prediction and track live results.</p>
        </section>

        <section className="rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Cast Outcome Ballot</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {['HOME', 'DRAW', 'AWAY'].map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setVote({ ...vote, selection: choice })}
                className={`rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.25em] transition-all ${vote.selection === choice ? 'border-transparent bg-popcorn-gold text-pitch-dark shadow-neon-glow' : 'border-gray-800 bg-pitch-over/70 text-gray-300 hover:border-gray-700'}`}
              >
                {choice}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              <span>Confidence accuracy risk ratio</span>
              <span className="text-emerald-400">{vote.ratio}% weight</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={vote.ratio}
              onChange={(event) => setVote({ ...vote, ratio: Number(event.target.value) })}
              className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-pitch-dark accent-popcorn-gold"
            />
          </div>

          <button
            type="button"
            onClick={handleLockPrediction}
            disabled={!vote.selection || submitting || submitted}
            className={`mt-6 w-full rounded-2xl bg-gradient-to-r from-popcorn-gold to-popcorn-glow px-4 py-3 text-sm font-black uppercase tracking-[0.3em] text-pitch-dark shadow-neon-glow disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {submitted ? 'Prediction Locked' : submitting ? 'Locking...' : 'Lock In Prediction'}
          </button>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-clash-cyan">Community Predictions</div>
          <p className="mt-2 text-sm text-gray-400">Live vote split across all predictors.</p>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Home</span>
                <span>{homePercent}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-pitch-over overflow-hidden">
                <div className="h-full bg-clash-cyan transition-all" style={{ width: `${homePercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Draw</span>
                <span>{drawPercent}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-pitch-over overflow-hidden">
                <div className="h-full bg-popcorn-gold transition-all" style={{ width: `${drawPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Away</span>
                <span>{awayPercent}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-pitch-over overflow-hidden">
                <div className="h-full bg-clash-red transition-all" style={{ width: `${awayPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-3 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Total Predictions</div>
            <div className="mt-1 text-2xl font-black text-white">{totalVotes.toLocaleString()}</div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Match Chat</div>
          <div className="mt-3 rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-3 text-xs font-mono text-gray-400">ROOM: PC-2026-65X</div>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-3 text-sm text-gray-300">
              <div className="font-semibold text-popcorn-gold">Tactician_Max</div>
              <div className="mt-1 text-gray-400">Home team has a strong tactical advantage this fixture.</div>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              PopcornJam sync is active — halftime watch party ready.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
