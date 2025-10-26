from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class OrderSide(str, Enum):
    buy = "buy"
    sell = "sell"


class OrderType(str, Enum):
    market = "market"
    limit = "limit"
    stop = "stop"
    stop_limit = "stop_limit"


class TimeInForce(str, Enum):
    day = "day"
    gtc = "gtc"
    opg = "opg"
    cls = "cls"
    ioc = "ioc"
    fok = "fok"


class OrderRequest(BaseModel):
    symbol: str = Field(..., min_length=1, description="Ticker symbol")
    qty: float = Field(..., gt=0, description="Order quantity")
    side: OrderSide
    type: OrderType = OrderType.market
    time_in_force: TimeInForce = TimeInForce.day
    limit_price: Optional[float] = Field(None, gt=0)
    stop_price: Optional[float] = Field(None, gt=0)

    class Config:
        json_schema_extra = {
            "example": {
                "symbol": "AAPL",
                "qty": 1,
                "side": "buy",
                "type": "market",
                "time_in_force": "day",
            }
        }


class StrategyRunRequest(BaseModel):
    symbol: str = Field(..., min_length=1)
    qty: float = Field(..., gt=0)
    fast_window: int = Field(5, ge=2)
    slow_window: int = Field(20, gt=5)
    timeframe: str = Field("1Min", description="Alpaca data timeframe, e.g., 1Min")
    execute: bool = Field(False, description="Submit the order immediately when True")

    @field_validator("slow_window")
    @classmethod
    def validate_windows(cls, value, info):
        fast = info.data.get("fast_window", 5)
        if value <= fast:
            raise ValueError("slow_window must be greater than fast_window")
        return value


class StrategyRunResponse(BaseModel):
    symbol: str
    signal: Optional[OrderSide]
    fast_avg: float
    slow_avg: float
    prices: list[float]
    suggested_order: Optional[OrderRequest]
    executed: bool = False
    broker_response: Optional[dict]
