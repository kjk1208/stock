from __future__ import annotations

from statistics import fmean
from typing import Sequence

from ..schemas import OrderSide
from .base import Strategy, StrategyContext, StrategyDecision


class MovingAverageCrossStrategy(Strategy):
    """Simple moving-average crossover strategy."""

    name = "sma-cross"

    def __init__(self, fast_window: int = 5, slow_window: int = 20) -> None:
        if fast_window >= slow_window:
            raise ValueError("fast_window must be smaller than slow_window")
        self.fast_window = fast_window
        self.slow_window = slow_window

    def evaluate(self, ctx: StrategyContext) -> StrategyDecision:
        prices = _ensure_enough_prices(ctx.prices, self.slow_window)
        fast_avg = _sma(prices[-self.fast_window :])
        slow_avg = _sma(prices[-self.slow_window :])

        signal: OrderSide | None = None
        if fast_avg > slow_avg:
            signal = OrderSide.buy
        elif fast_avg < slow_avg:
            signal = OrderSide.sell

        return StrategyDecision(
            signal=signal,
            metadata={
                "fast_avg": fast_avg,
                "slow_avg": slow_avg,
            },
        )


def _ensure_enough_prices(prices: Sequence[float], required: int) -> Sequence[float]:
    if len(prices) < required:
        raise ValueError(f"Strategy requires at least {required} prices, got {len(prices)}")
    return prices


def _sma(values: Sequence[float]) -> float:
    return fmean(values)
