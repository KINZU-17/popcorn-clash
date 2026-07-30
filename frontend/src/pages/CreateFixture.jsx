import { useState, useEffect } from 'react';
import { api } from '../utils/backendApi';

export default function CreateFixture() {
  const [form, setForm] = useState({ team_home_id: '', team_away_id: '', match_date: '', status: 'SCHEDULED' });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadTeams() {
      try {
        const data = await api.teams.list();
        setTeams(data.teams || []);
      } catch (err) {
        console.error('Failed to load teams:', err);
      }
    }
    loadTeams();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      await api.fixtures.create({
        team_home_id: Number(form.team_home_id),
        team_away_id: Number(form.team_away_id),
        match_date: form.match_date,
        status: form.status,
      });
      setMessage('Fixture created successfully');
      setForm({ team_home_id: '', team_away_id: '', match_date: '', status: 'SCHEDULED' });
    } catch (err) {
      setMessage(err.message || 'Failed to create fixture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
      <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Admin — Create Fixture</div>
      <h2 className="mt-2 text-2xl font-black text-white">Add a new match fixture</h2>

      {message && (
        <div className={`mt-4 p-3 text-xs ${message.includes('success') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-on-surface-variant">Home Team</label>
          <select required value={form.team_home_id} onChange={(event) => setForm({ ...form, team_home_id: event.target.value })} className="w-full rounded-2xl border border-gray-800/80 bg-pitch-over/70 px-3 py-3 text-sm text-white outline-none transition focus:border-popcorn-gold">
            <option value="">Select home team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name} ({team.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-on-surface-variant">Away Team</label>
          <select required value={form.team_away_id} onChange={(event) => setForm({ ...form, team_away_id: event.target.value })} className="w-full rounded-2xl border border-gray-800/80 bg-pitch-over/70 px-3 py-3 text-sm text-white outline-none transition focus:border-popcorn-gold">
            <option value="">Select away team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name} ({team.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-on-surface-variant">Match Date & Time</label>
          <input type="datetime-local" required value={form.match_date} onChange={(event) => setForm({ ...form, match_date: event.target.value })} className="w-full rounded-2xl border border-gray-800/80 bg-pitch-over/70 px-3 py-3 text-sm text-white outline-none transition focus:border-popcorn-gold" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-on-surface-variant">Status</label>
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-2xl border border-gray-800/80 bg-pitch-over/70 px-3 py-3 text-sm text-white outline-none transition focus:border-popcorn-gold">
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live</option>
            <option value="FINISHED">Finished</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-popcorn-gold to-popcorn-glow px-4 py-3 text-sm font-black uppercase tracking-[0.3em] text-pitch-dark shadow-neon-glow disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Fixture'}
        </button>
      </form>
    </div>
  );
}