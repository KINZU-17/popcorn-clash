import { useState } from 'react';

export default function CreateFixture() {
  const [form, setForm] = useState({ home: '', away: '', date: '', league: '' });

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
      <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Admin — Create Fixture</div>
      <h2 className="mt-2 text-2xl font-black text-white">Add a new match fixture</h2>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          alert('Fixture created.');
        }}
        className="mt-6 space-y-4"
      >
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Home Team</label>
          <input type="text" required value={form.home} onChange={(event) => setForm({ ...form, home: event.target.value })} className="w-full rounded-2xl border border-gray-800/80 bg-pitch-over/70 px-3 py-3 text-sm text-white outline-none transition focus:border-popcorn-gold" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Away Team</label>
          <input type="text" required value={form.away} onChange={(event) => setForm({ ...form, away: event.target.value })} className="w-full rounded-2xl border border-gray-800/80 bg-pitch-over/70 px-3 py-3 text-sm text-white outline-none transition focus:border-popcorn-gold" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">League</label>
          <input type="text" required value={form.league} onChange={(event) => setForm({ ...form, league: event.target.value })} className="w-full rounded-2xl border border-gray-800/80 bg-pitch-over/70 px-3 py-3 text-sm text-white outline-none transition focus:border-popcorn-gold" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Match Date & Time</label>
          <input type="datetime-local" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="w-full rounded-2xl border border-gray-800/80 bg-pitch-over/70 px-3 py-3 text-sm text-white outline-none transition focus:border-popcorn-gold" />
        </div>

        <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-popcorn-gold to-popcorn-glow px-4 py-3 text-sm font-black uppercase tracking-[0.3em] text-pitch-dark shadow-neon-glow">
          Create Fixture
        </button>
      </form>
    </div>
  );
}