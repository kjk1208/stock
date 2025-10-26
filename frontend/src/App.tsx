import { useMemo, useState } from "react";

import { Header } from "./components/Header";
import { PerformanceChart } from "./components/PerformanceChart";
import { PositionsTable } from "./components/PositionsTable";
import { StatCard } from "./components/StatCard";
import { StrategyPanel } from "./components/StrategyPanel";
import { useApi } from "./hooks/useApi";
import { AccountSummary, ClockResponse, Position, StrategyRunResponse } from "./types/api";

const fallbackPrices = [187.2, 187.9, 188.6, 189.4, 188.8, 189.9, 190.6, 190.2, 191.1, 190.6, 191.4];

function currency(value?: string) {
  if (!value) return "-";
  return Number(value).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function App() {
  const { data: account } = useApi<AccountSummary>("/api/v1/account", { refreshInterval: 15000 });
  const { data: positions, loading: positionsLoading } = useApi<Position[]>("/api/v1/positions", { refreshInterval: 15000 });
  const { data: clock } = useApi<ClockResponse>("/api/v1/clock", { refreshInterval: 30000 });
  const [strategyResult, setStrategyResult] = useState<StrategyRunResponse | null>(null);

  const metrics = useMemo(
    () => [
      { label: "Portfolio Value", value: currency(account?.portfolio_value), helper: "총 평가 금액" },
      { label: "Buying Power", value: currency(account?.buying_power), helper: "가용 자본" },
      { label: "Cash", value: currency(account?.cash), helper: "보유 현금" },
    ],
    [account]
  );

  return (
    <div className="min-h-screen bg-navy-900 px-4 py-6 text-white sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Header isMarketOpen={clock?.is_open} nextOpen={clock?.next_open} />

        <section className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PositionsTable positions={positions ?? []} isLoading={positionsLoading} />
          </div>
          <StrategyPanel onResult={setStrategyResult} />
        </section>

        <PerformanceChart prices={strategyResult?.prices ?? fallbackPrices} />
      </div>
    </div>
  );
}
