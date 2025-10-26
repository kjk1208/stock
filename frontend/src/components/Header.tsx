import { Activity, Sparkles } from "lucide-react";

interface HeaderProps {
  isMarketOpen?: boolean;
  nextOpen?: string;
}

export function Header({ isMarketOpen, nextOpen }: HeaderProps) {
  return (
    <header className="glass-card flex flex-col gap-4 p-6 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">alpaca robo</p>
          <h1 className="text-3xl font-semibold text-white">US Equities Command Center</h1>
        </div>
        <Sparkles className="text-accent-400" size={32} />
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${isMarketOpen ? "bg-green-500/20 text-green-300" : "bg-slate-500/20 text-slate-200"}`}
        >
          <Activity size={14} />
          {isMarketOpen ? "Market Open" : "Market Closed"}
        </span>
        {nextOpen && <span className="text-slate-400">Next opening window - {new Date(nextOpen).toLocaleString()}</span>}
      </div>
    </header>
  );
}
