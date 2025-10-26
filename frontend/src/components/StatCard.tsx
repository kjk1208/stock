import clsx from "clsx";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  delta?: string;
  tone?: "positive" | "negative";
  helper?: string;
}

const toneMap: Record<NonNullable<StatCardProps["tone"]>, string> = {
  positive: "text-emerald-300",
  negative: "text-rose-300",
};

export function StatCard({ label, value, delta, tone = "positive", helper }: StatCardProps) {
  return (
    <div className="glass-card flex flex-col gap-2 p-6">
      <p className="text-sm uppercase tracking-widest text-slate-400">{label}</p>
      <div className="text-3xl font-semibold text-white">{value}</div>
      <div className="flex items-center justify-between text-sm text-slate-400">
        {helper && <span>{helper}</span>}
        {delta && <span className={clsx("font-medium", toneMap[tone])}>{delta}</span>}
      </div>
    </div>
  );
}
