export default function Footer() {
  return (
    <footer className="border-t border-surface-container-high bg-[#0c0a09] py-6 px-4 md:px-10">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-surface-container-high font-mono">
          PopcornClash Matchday Arena
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-surface-container-high font-mono">
          EST. MMXIV
        </div>
      </div>
    </footer>
  );
}