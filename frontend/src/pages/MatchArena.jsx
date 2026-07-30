import { useState, useEffect } from 'react';
import { api } from '../utils/backendApi';

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
        const fixtureData = await api.fixtures.get(matchId);
        setMatch(fixtureData.fixture);

        const predictionsData = await api.predictions.listForFixture(matchId);
        const predictions = predictionsData.predictions || [];
        const votes = { home: 0, draw: 0, away: 0 };
        predictions.forEach((p) => {
          if (p.predicted_winner_id === fixtureData.fixture.team_home_id) votes.home += 1;
          else if (p.predicted_winner_id === fixtureData.fixture.team_away_id) votes.away += 1;
          else votes.draw += 1;
        });
        setGlobalVotes(votes);
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
      const predicted_winner_id = vote.selection === 'HOME'
        ? match.team_home_id
        : vote.selection === 'AWAY'
          ? match.team_away_id
          : null;

      await api.predictions.create({
        fixture_id: matchId,
        predicted_winner_id,
        confidence: vote.ratio,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const matchTitle = match ? `${match.home_name || 'Home'} vs ${match.away_name || 'Away'}` : 'Select Match';

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
          <p className="mt-3 text-sm text-on-surface-variant">Cast your prediction and track live results.</p>
        </section>

        <section className="rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Cast Outcome Ballot</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {['HOME', 'DRAW', 'AWAY'].map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setVote({ ...vote, selection: choice })}
                className={`rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.25em] transition-all ${vote.selection === choice ? 'border-transparent bg-popcorn-gold text-pitch-dark shadow-neon-glow' : 'border-gray-800 bg-pitch-over/70 text-white hover:border-gray-700'}`}
              >
                {choice}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-on-surface-variant">
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
          <p className="mt-2 text-sm text-on-surface-variant">Live vote split across all predictors.</p>

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
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-on-surface-variant">Total Predictions</div>
            <div className="mt-1 text-2xl font-black text-white">{totalVotes.toLocaleString()}</div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Match Chat</div>
          <div className="mt-3 rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-3 text-xs font-mono text-on-surface-variant">ROOM: PC-2026-65X</div>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-3 text-sm text-white">
              <div className="font-semibold text-popcorn-gold">Tactician_Max</div>
              <div className="mt-1 text-on-surface-variant">Home team has a strong tactical advantage this fixture.</div>
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