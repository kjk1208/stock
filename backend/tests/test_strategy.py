from app.schemas import OrderSide
from app.strategies.base import StrategyContext
from app.strategies.moving_average import MovingAverageCrossStrategy


def test_moving_average_buy_signal():
    strategy = MovingAverageCrossStrategy(fast_window=2, slow_window=4)
    ctx = StrategyContext(symbol="AAPL", prices=[1, 2, 3, 4])
    decision = strategy.evaluate(ctx)
    assert decision.signal == OrderSide.buy
    assert decision.metadata["fast_avg"] > decision.metadata["slow_avg"]


def test_moving_average_sell_signal():
    strategy = MovingAverageCrossStrategy(fast_window=2, slow_window=4)
    ctx = StrategyContext(symbol="AAPL", prices=[4, 3, 2, 1])
    decision = strategy.evaluate(ctx)
    assert decision.signal == OrderSide.sell
    assert decision.metadata["fast_avg"] < decision.metadata["slow_avg"]


def test_moving_average_flat_signal_when_equal():
    strategy = MovingAverageCrossStrategy(fast_window=2, slow_window=4)
    ctx = StrategyContext(symbol="AAPL", prices=[1, 1, 1, 1])
    decision = strategy.evaluate(ctx)
    assert decision.signal is None
