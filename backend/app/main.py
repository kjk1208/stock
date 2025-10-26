from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .db import get_session, init_db
from .engine import StrategyEngine
from .repositories import StrategyLogRepository
from .risk import RiskViolation
from .schemas import OrderRequest, StrategyRunRequest, StrategyRunResponse
from .services.alpaca import AlpacaAPIError, AlpacaService

app = FastAPI(
    title="Alpaca Trading Boilerplate",
    description="Minimal FastAPI backend wired to Alpaca trading and strategy APIs",
    version="0.2.0",
)


def get_alpaca_service() -> AlpacaService:
    return AlpacaService(
        api_key=settings.alpaca_api_key,
        api_secret=settings.alpaca_api_secret,
        trading_base_url=settings.trading_base_url,
        data_base_url=settings.data_base_url,
        timeout=settings.http_timeout,
    )


def get_strategy_engine(service: AlpacaService = Depends(get_alpaca_service)) -> StrategyEngine:
    return StrategyEngine(service=service)


@app.get("/", include_in_schema=False)
async def root() -> HTMLResponse:
    return HTMLResponse(
        content="""
        <html>
            <head>
                <title>Alpaca Trading Boilerplate</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 2rem; background: #f5f5f5; }
                    .card { max-width: 640px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
                    a { color: #2563eb; text-decoration: none; font-weight: 600; }
                    a:hover { text-decoration: underline; }
                    ul { padding-left: 1.25rem; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Alpaca Trading Boilerplate</h1>
                    <p>FastAPI backend wired to Alpaca account, order, and strategy endpoints.</p>
                    <ul>
                        <li><a href="/docs">Swagger UI</a></li>
                        <li><a href="/healthz">Health Check</a></li>
                        <li><a href="https://github.com/alpacahq/bkdocs/blob/master/api-documentation/api-v2/overview.md" target="_blank" rel="noopener">Alpaca API docs</a></li>
                    </ul>
                </div>
            </body>
        </html>
        """
    )


@app.on_event("startup")
async def startup_event() -> None:
    await init_db()


@app.get("/healthz", tags=["system"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/account", tags=["trading"])
async def read_account(service: AlpacaService = Depends(get_alpaca_service)):
    try:
        return await service.get_account()
    except AlpacaAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@app.get("/api/v1/clock", tags=["market"])
async def read_clock(service: AlpacaService = Depends(get_alpaca_service)):
    try:
        return await service.get_clock()
    except AlpacaAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@app.get("/api/v1/positions", tags=["trading"])
async def read_positions(service: AlpacaService = Depends(get_alpaca_service)):
    try:
        return await service.get_positions()
    except AlpacaAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@app.post("/api/v1/orders", tags=["trading"])
async def create_order(
    payload: OrderRequest,
    service: AlpacaService = Depends(get_alpaca_service),
):
    try:
        return await service.submit_order(payload.model_dump(exclude_none=True))
    except AlpacaAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@app.delete("/api/v1/orders/{order_id}", tags=["trading"])
async def cancel_order(order_id: str, service: AlpacaService = Depends(get_alpaca_service)):
    try:
        return await service.cancel_order(order_id)
    except AlpacaAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@app.post("/api/v1/strategies/run", response_model=StrategyRunResponse, tags=["strategy"])
async def run_strategy(
    payload: StrategyRunRequest,
    engine: StrategyEngine = Depends(get_strategy_engine),
    session: AsyncSession = Depends(get_session),
):
    try:
        repository = StrategyLogRepository(session)
        return await engine.run_moving_average(payload, repository=repository)
    except RiskViolation as exc:
        raise HTTPException(status_code=400, detail={"message": str(exc)}) from exc
    except AlpacaAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail={"message": str(exc)}) from exc
