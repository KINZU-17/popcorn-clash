
import { MessageSquare, Bell } from 'lucide-react';

export default function LiveCompanion() {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-[#0A0A0A] text-center px-6">
      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <MessageSquare className="w-7 h-7 text-white/30" />
      </div>

      <div className="mb-2">
        <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/30 bg-white/5 border border-white/10 px-3 py-1">
          Coming Soon
        </span>
      </div>

      <h2 className="text-2xl font-serif font-light italic text-white mt-4 mb-3">Live Session</h2>
      <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] max-w-xs leading-relaxed">
        Watch together, chat in real-time, and share reactions with your crew — all in sync.
      </p>

      <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm w-full">
        {['Sync Playback', 'Live Reactions', 'Group Chat'].map((feat) => (
          <div key={feat} className="p-3 bg-white/5 border border-white/10 text-center">
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/40">{feat}</p>
          </div>
        ))}
      </div>

      <button className="mt-8 flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all text-[10px] uppercase tracking-[0.2em] cursor-pointer">
        <Bell className="w-3.5 h-3.5" />
        Notify Me
      </button>
    </div>
  );
}
