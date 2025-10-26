import { Loader2, Play, RefreshCcw } from "lucide-react";
import { useState } from "react";

import api from "../lib/apiClient";
import { StrategyRunResponse } from "../types/api";

interface StrategyPanelProps {
  onResult?: (data: StrategyRunResponse) => void;
}

const defaultPayload = {
  symbol: "AAPL",
  qty: 1,
  fast_window: 5,
  slow_window: 20,
  timeframe: "1Min",
  execute: false,
};

export function StrategyPanel({ onResult }: StrategyPanelProps) {
  const [form, setForm] = useState(defaultPayload);
  const [result, setResult] = useState<StrategyRunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runStrategy = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<StrategyRunResponse>("/api/v1/strategies/run", form);
      setResult(data);
      onResult?.(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "실행 실패";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: keyof typeof form, value: string | number | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="glass-card flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">strategy</p>
          <h3 className="text-xl font-semibold text-white">단순 이평선 전략</h3>
        </div>
        <button
          onClick={() => {
            setForm(defaultPayload);
            setResult(null);
          }}
          className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/10"
          title="리셋"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-slate-300">
          티커
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-accent-400 focus:outline-none"
            value={form.symbol}
            onChange={(e) => updateField("symbol", e.target.value.toUpperCase())}
          />
        </label>
        <label className="text-sm text-slate-300">
          수량
          <input
            type="number"
            min={0.1}
            step={0.1}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-accent-400 focus:outline-none"
            value={form.qty}
            onChange={(e) => updateField("qty", Number(e.target.value))}
          />
        </label>
        <label className="text-sm text-slate-300">
          Fast Window
          <input
            type="number"
            min={2}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-accent-400 focus:outline-none"
            value={form.fast_window}
            onChange={(e) => updateField("fast_window", Number(e.target.value))}
          />
        </label>
        <label className="text-sm text-slate-300">
          Slow Window
          <input
            type="number"
            min={5}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-accent-400 focus:outline-none"
            value={form.slow_window}
            onChange={(e) => updateField("slow_window", Number(e.target.value))}
          />
        </label>
        <label className="text-sm text-slate-300 sm:col-span-2">
          타임프레임
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-accent-400 focus:outline-none"
            value={form.timeframe}
            onChange={(e) => updateField("timeframe", e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.execute}
            onChange={(e) => updateField("execute", e.target.checked)}
            className="h-5 w-5 rounded border-white/20 bg-white/10"
          />
          시그널 발생 시 즉시 주문 전송
        </label>
      </div>

      <button
        onClick={runStrategy}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-500 to-purple-500 px-4 py-3 font-semibold text-white shadow-floating transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
        전략 실행
      </button>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      {result && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">Signal: {result.signal ?? "중립"}</p>
          <p className="text-slate-400">
            Fast {result.fast_avg.toFixed(2)} vs Slow {result.slow_avg.toFixed(2)}
          </p>
          {result.suggested_order && (
            <p className="mt-2 text-slate-300">
              제안 주문: {result.suggested_order.side.toUpperCase()} {result.suggested_order.qty} {result.suggested_order.symbol}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
