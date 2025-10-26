from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from .models import StrategyLog
from .schemas import OrderRequest, StrategyRunRequest
from .strategies.base import StrategyDecision


class StrategyLogRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def log_run(
        self,
        *,
        payload: StrategyRunRequest,
        decision: StrategyDecision,
        prices: list[float],
        suggested_order: OrderRequest | None,
        executed: bool,
        broker_response: dict[str, Any] | None,
    ) -> StrategyLog:
        entry = StrategyLog(
            symbol=payload.symbol,
            qty=payload.qty,
            fast_window=payload.fast_window,
            slow_window=payload.slow_window,
            timeframe=payload.timeframe,
            signal=decision.signal.value if decision.signal else None,
            fast_avg=decision.metadata.get("fast_avg", 0.0),
            slow_avg=decision.metadata.get("slow_avg", 0.0),
            execute=payload.execute,
            executed=executed,
            suggested_order=suggested_order.model_dump(exclude_none=True) if suggested_order else None,
            broker_response=broker_response,
            prices=prices,
        )
        self.session.add(entry)
        await self.session.commit()
        await self.session.refresh(entry)
        return entry
