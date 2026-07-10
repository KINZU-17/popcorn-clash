export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0A0A] py-6 px-4 md:px-10">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-mono">
          PopcornClash Matchday Arena
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-mono">
          EST. MMXIV
        </div>
      </div>
    </footer>
  );
}
