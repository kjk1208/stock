import pytest

from app.risk import RiskLimits, RiskManager, RiskViolation


def test_risk_manager_allows_safe_order():
    manager = RiskManager(RiskLimits(max_order_qty=10, max_notional=1_000))
    manager.validate(price=50, qty=5)


def test_risk_manager_blocks_large_qty():
    manager = RiskManager(RiskLimits(max_order_qty=1, max_notional=1_000))
    with pytest.raises(RiskViolation):
        manager.validate(price=10, qty=2)


def test_risk_manager_blocks_notional():
    manager = RiskManager(RiskLimits(max_order_qty=100, max_notional=100))
    with pytest.raises(RiskViolation):
        manager.validate(price=25, qty=5)
