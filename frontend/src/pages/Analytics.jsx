

export default function Analytics() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-800/80 bg-pitch-card p-6 shadow-card-glow">
        <div className="text-xs font-semibold uppercase tracking-[0.35em] text-popcorn-gold">Match Predictions</div>
        <h2 className="mt-2 text-2xl font-black text-white">Prediction Analytics</h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Home Advantage Ratio</div>
            <div className="mt-3 text-3xl font-black text-white">52.4%</div>
            <div className="mt-2 text-sm text-gray-400">Baseline across all fixtures</div>
          </div>
          <div className="rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Averaged Prediction Margin</div>
            <div className="mt-3 text-3xl font-black text-clash-cyan">68.2%</div>
            <div className="mt-2 text-sm text-gray-400">Community prediction accuracy</div>
          </div>
          <div className="rounded-2xl border border-gray-800/80 bg-pitch-over/70 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Total Predictions Cast</div>
            <div className="mt-3 text-3xl font-black text-white">14,820</div>
            <div className="mt-2 text-sm text-gray-400">Predictions submitted by all users</div>
          </div>
        </div>
      </section>
    </div>
  );
}
