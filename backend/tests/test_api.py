"""Integration tests for the API using the synthetic-data fallback."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_ready() -> None:
    res = client.get("/api/v1/ready")
    assert res.status_code == 200
    body = res.json()
    assert "hmmlearn" in body
    assert "cache_backend" in body


def test_request_id_header_present() -> None:
    res = client.get("/api/v1/health")
    assert res.headers.get("X-Request-ID")
    assert res.headers.get("X-Response-Time-ms")


def test_analyze_with_fallback_and_diagnostics() -> None:
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
    diag = body["diagnostics"]
    assert {"aic", "bic", "n_params", "converged"} <= diag.keys()


def test_analyze_cache_hit_on_repeat() -> None:
    payload = {"ticker": "CACHE", "period": "1y", "n_states": 2, "forecast_days": 3}
    first = client.post("/api/v1/analyze", json=payload).json()
    second = client.post("/api/v1/analyze", json=payload).json()
    assert first["cached"] is False
    assert second["cached"] is True


def test_analyze_auto_select() -> None:
    res = client.post(
        "/api/v1/analyze",
        json={
            "ticker": "AUTOZZ",
            "period": "2y",
            "auto_select_states": True,
            "selection_criterion": "bic",
            "forecast_days": 3,
        },
    )
    assert res.status_code == 200
    diag = res.json()["diagnostics"]
    assert diag["selected_by"] == "bic"
    assert len(diag["candidates"]) >= 1


def test_backtest_endpoint() -> None:
    res = client.post(
        "/api/v1/backtest",
        json={
            "ticker": "BTZZ",
            "period": "2y",
            "n_states": 2,
            "stride": 20,
            "max_folds": 5,
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["folds"] > 0
    assert 0.0 <= body["directional_accuracy"] <= 1.0


def test_analyze_rejects_bad_input() -> None:
    res = client.post("/api/v1/analyze", json={"ticker": "bad ticker!!"})
    assert res.status_code == 422
