
import { useGame } from '../context/GameStateContext';

export default function Profile() {
  const { user } = useGame();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-popcorn-gold to-popcorn-glow text-xl font-black text-pitch-dark">
              CV
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">PopcornClash Member</div>
              <h2 className="mt-1 text-2xl font-black text-white">{user.username}</h2>
              <div className="mt-1 text-sm text-gray-400">Favorite Club: {user.favorite_club}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-800/80 bg-pitch-over/70 px-4 py-3 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Profile Level</div>
            <div className="mt-1 text-3xl font-black text-white">{user.current_level}</div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
        <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Historical Forecast Ledger</div>
        <div className="mt-4 rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold text-white">Arsenal vs Chelsea</div>
              <div className="mt-1 text-sm text-gray-400">Forecast target: Arsenal Victory</div>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-right">
              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-400">Verified Correct</div>
              <div className="mt-1 text-sm font-semibold text-white">+350 XP</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
