import { TrendingDown, TrendingUp } from "lucide-react";

import { Position } from "../types/api";

interface PositionsTableProps {
  positions?: Position[];
  isLoading?: boolean;
}

export function PositionsTable({ positions = [], isLoading }: PositionsTableProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">positions</p>
          <h3 className="text-xl font-semibold text-white">보유 자산</h3>
        </div>
        <span className="text-sm text-slate-400">{positions.length} symbols</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-2 font-medium">Symbol</th>
              <th className="pb-2 font-medium">Qty</th>
              <th className="pb-2 font-medium">Market Value</th>
              <th className="pb-2 font-medium">Avg Price</th>
              <th className="pb-2 font-medium">PnL</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  데이터를 불러오는 중...
                </td>
              </tr>
            )}
            {!isLoading && positions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  보유 중인 포지션이 없습니다.
                </td>
              </tr>
            )}
            {!isLoading &&
              positions.map((position) => {
                const pnl = parseFloat(position.unrealized_pl ?? "0");
                const isUp = pnl >= 0;
                return (
                  <tr key={position.symbol} className="border-t border-white/5">
                    <td className="py-3 font-semibold">{position.symbol}</td>
                    <td className="py-3 text-slate-300">{Number(position.qty).toLocaleString()}</td>
                    <td className="py-3"></td>
                    <td className="py-3 text-slate-300"></td>
                    <td className={py-3 font-medium }>
                      <span className="inline-flex items-center gap-1">
                        {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
