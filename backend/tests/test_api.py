"""Integration tests for the API using the synthetic-data fallback."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_analyze_with_fallback() -> None:
    # A bogus ticker forces the synthetic-data fallback path, keeping the test
    # fully offline and deterministic.
    res = client.post(
        "/api/v1/analyze",
        json={
            "ticker": "ZZZZ",
            "period": "2y",
            "interval": "1d",
            "n_states": 3,
            "forecast_days": 5,
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["n_states"] == 3
    assert len(body["forecast"]) == 5
    assert len(body["states"]) == 3
    assert body["currency"] in {"USD", "DEMO"}


def test_analyze_rejects_bad_input() -> None:
    res = client.post("/api/v1/analyze", json={"ticker": "bad ticker!!"})
    assert res.status_code == 422
