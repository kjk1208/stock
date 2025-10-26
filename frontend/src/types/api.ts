export interface AccountSummary {
  id: string;
  currency: string;
  buying_power: string;
  portfolio_value: string;
  cash: string;
  last_equity: string;
}

export interface Position {
  symbol: string;
  qty: string;
  market_value: string;
  avg_entry_price: string;
  current_price: string;
  unrealized_pl: string;
  change_today?: string;
}

export interface StrategyRunResponse {
  symbol: string;
  signal: "buy" | "sell" | null;
  fast_avg: number;
  slow_avg: number;
  prices: number[];
  suggested_order: {
    symbol: string;
    qty: number;
    side: "buy" | "sell";
  } | null;
  executed: boolean;
  broker_response?: Record<string, unknown> | null;
}

export interface ClockResponse {
  is_open: boolean;
  next_open: string;
  next_close: string;
  timestamp?: string;
}
