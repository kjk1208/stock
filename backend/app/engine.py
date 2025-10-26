from __future__ import annotations

from typing import List

from .repositories import StrategyLogRepository
from .risk import RiskManager, RiskViolation
from .schemas import OrderRequest, OrderType, StrategyRunRequest, StrategyRunResponse, TimeInForce
from .services.alpaca import AlpacaService
from .strategies.base import StrategyContext
from .strategies.moving_average import MovingAverageCrossStrategy


class StrategyEngine:
    def __init__(self, service: AlpacaService, risk_manager: RiskManager | None = None) -> None:
        self.service = service
        self.risk = risk_manager or RiskManager()

    async def run_moving_average(
        self,
        payload: StrategyRunRequest,
        *,
        repository: StrategyLogRepository | None = None,
    ) -> StrategyRunResponse:
        bars = await self._fetch_closes(payload.symbol, payload.timeframe, payload.slow_window)
        ctx = StrategyContext(symbol=payload.symbol, prices=bars)
        strategy = MovingAverageCrossStrategy(payload.fast_window, payload.slow_window)
        decision = strategy.evaluate(ctx)

        order = None
        executed = False
        broker_response = None

        if decision.signal is not None:
            last_price = bars[-1]
            self.risk.validate(price=last_price, qty=payload.qty)
            order = OrderRequest(
                symbol=payload.symbol,
                qty=payload.qty,
                side=decision.signal,
                type=OrderType.market,
                time_in_force=TimeInForce.day,
            )
            if payload.execute:
                broker_response = await self.service.submit_order(order.model_dump(exclude_none=True))
                executed = True

        response = StrategyRunResponse(
            symbol=payload.symbol,
            signal=decision.signal,
            fast_avg=decision.metadata.get("fast_avg", 0.0),
            slow_avg=decision.metadata.get("slow_avg", 0.0),
            prices=bars,
            suggested_order=order,
            executed=executed,
            broker_response=broker_response,
        )
        if repository:
            await repository.log_run(
                payload=payload,
                decision=decision,
                prices=bars,
                suggested_order=order,
                executed=executed,
                broker_response=broker_response,
            )
        return response

    async def _fetch_closes(self, symbol: str, timeframe: str, limit: int) -> List[float]:
        data = await self.service.get_bars(symbol, timeframe, limit)
        bars = (data or {}).get("bars") or []
        closes = [bar["c"] for bar in bars if "c" in bar]
        if len(closes) < limit:
            raise ValueError(f"Not enough bars returned (expected {limit}, got {len(closes)})")
        return closes
