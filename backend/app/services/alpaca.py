from __future__ import annotations

from typing import Any, Dict

import httpx


class AlpacaAPIError(Exception):
    """Wrap Alpaca HTTP errors for FastAPI."""

    def __init__(self, status_code: int, detail: Any):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class AlpacaService:
    def __init__(
        self,
        *,
        api_key: str,
        api_secret: str,
        trading_base_url: str,
        data_base_url: str,
        timeout: float,
    ) -> None:
        self._headers = {
            "APCA-API-KEY-ID": api_key,
            "APCA-API-SECRET-KEY": api_secret,
            "Content-Type": "application/json",
        }
        self._trading_base_url = trading_base_url.rstrip("/")
        self._data_base_url = data_base_url.rstrip("/")
        self._timeout = timeout

    async def _request(self, method: str, path: str, *, base: str = "trading", **kwargs: Any) -> Dict[str, Any]:
        base_url = self._trading_base_url if base == "trading" else self._data_base_url
        async with httpx.AsyncClient(
            base_url=base_url,
            headers=self._headers,
            timeout=self._timeout,
        ) as client:
            response = await client.request(method, path, **kwargs)

        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            try:
                detail = exc.response.json()
            except ValueError:
                detail = {"message": exc.response.text}
            raise AlpacaAPIError(exc.response.status_code, detail) from exc

        return response.json()

    async def get_account(self) -> Dict[str, Any]:
        return await self._request("GET", "/v2/account")

    async def get_clock(self) -> Dict[str, Any]:
        return await self._request("GET", "/v2/clock")

    async def get_positions(self) -> Dict[str, Any]:
        return await self._request("GET", "/v2/positions")

    async def submit_order(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return await self._request("POST", "/v2/orders", json=payload)

    async def cancel_order(self, order_id: str) -> Dict[str, Any]:
        return await self._request("DELETE", f"/v2/orders/{order_id}")

    async def get_bars(self, symbol: str, timeframe: str, limit: int) -> Dict[str, Any]:
        params = {"timeframe": timeframe, "limit": limit}
        return await self._request(
            "GET",
            f"/v2/stocks/{symbol}/bars",
            base="data",
            params=params,
        )
