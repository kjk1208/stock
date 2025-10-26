from __future__ import annotations

from dataclasses import dataclass


class RiskViolation(Exception):
    pass


@dataclass(frozen=True)
class RiskLimits:
    max_order_qty: float = 100.0
    max_notional: float = 100_000.0


class RiskManager:
    def __init__(self, limits: RiskLimits | None = None) -> None:
        self.limits = limits or RiskLimits()

    def validate(self, *, price: float, qty: float) -> None:
        if qty <= 0:
            raise RiskViolation("Quantity must be positive")
        if qty > self.limits.max_order_qty:
            raise RiskViolation(
                f"qty {qty} exceeds limit {self.limits.max_order_qty}"
            )
        notional = price * qty
        if notional > self.limits.max_notional:
            raise RiskViolation(
                f"notional {notional:.2f} exceeds limit {self.limits.max_notional:.2f}"
            )
