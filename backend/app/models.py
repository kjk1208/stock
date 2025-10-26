from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class StrategyLog(Base):
    __tablename__ = "strategy_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    symbol: Mapped[str] = mapped_column(String(16), index=True)
    qty: Mapped[float] = mapped_column(Float)
    fast_window: Mapped[int] = mapped_column(Integer)
    slow_window: Mapped[int] = mapped_column(Integer)
    timeframe: Mapped[str] = mapped_column(String(16))
    signal: Mapped[str | None] = mapped_column(String(8), nullable=True)
    fast_avg: Mapped[float] = mapped_column(Float)
    slow_avg: Mapped[float] = mapped_column(Float)
    execute: Mapped[bool] = mapped_column(Boolean, default=False)
    executed: Mapped[bool] = mapped_column(Boolean, default=False)
    suggested_order: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    broker_response: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    prices: Mapped[list[float]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
