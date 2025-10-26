from __future__ import annotations

from dataclasses import dataclass, field
from typing import Mapping, Sequence

from ..schemas import OrderSide


@dataclass(frozen=True)
class StrategyContext:
    symbol: str
    prices: Sequence[float]


@dataclass(frozen=True)
class StrategyDecision:
    signal: OrderSide | None
    metadata: Mapping[str, float] = field(default_factory=dict)


class Strategy:
    """Abstract strategy definition that maps market data to an order signal."""

    name: str = "base"

    def evaluate(self, ctx: StrategyContext) -> StrategyDecision:
        raise NotImplementedError
