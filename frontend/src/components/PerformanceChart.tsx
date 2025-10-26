import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from "recharts";

interface PerformanceChartProps {
  prices: number[];
}

export function PerformanceChart({ prices }: PerformanceChartProps) {
  const data = prices.map((value, idx) => ({ idx, value }));

  return (
    <div className="glass-card p-6">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">trend</p>
        <h3 className="text-xl font-semibold text-white">최근 가격 흐름</h3>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="idx" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "#111932", border: "1px solid #1f2a44", borderRadius: "12px" }} />
            <Area type="monotone" dataKey="value" stroke="#a5b4fc" strokeWidth={2.4} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
