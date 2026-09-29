import json
from pathlib import Path

import pytest

from fabrica.benchmark import benchmark
from fabrica.similarity import dedupe, jaccard

FIXTURES = Path(__file__).parent / "fixtures"


def _load(name: str):
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


def test_jaccard():
    assert jaccard("cuál es mi saldo", "cuál es mi saldo") == 1.0
    assert jaccard("cuál es mi saldo", "cuál es mi saldo hoy") == pytest.approx(0.8, abs=1e-12)
    assert jaccard("cuál es mi saldo", "quiero pagar mi tarjeta") < 0.5


def test_dedupe_keeps_first_of_pair():
    logs = [
        {"id": "a", "query": "cuál es mi saldo", "intent": "saldo"},
        {"id": "b", "query": "cuál es mi saldo hoy", "intent": "saldo"},
        {"id": "c", "query": "quiero pagar", "intent": "pago"},
    ]
    assert [l["id"] for l in dedupe(logs, 0.8)] == ["a", "c"]


def test_generator_matches_fixture():
    logs = _load("logs.json")["logs"]
    fixture = _load("generator.json")

    result = benchmark(logs, {"simThreshold": 0.8, "sampleSize": 3})
    assert result["rawCount"] == fixture["rawCount"]
    assert result["dedupedCount"] == fixture["dedupedCount"]
    assert result["duplicatesRemoved"] == fixture["duplicatesRemoved"]
    assert result["dedupeRate"] == pytest.approx(fixture["dedupeRate"], abs=1e-12)
    assert result["totalIntents"] == fixture["totalIntents"]
    assert result["intentsCovered"] == fixture["intentsCovered"]
    assert result["coverage"] == pytest.approx(fixture["coverage"], abs=1e-12)
    assert result["evalSetSize"] == fixture["evalSetSize"]
    assert [l["id"] for l in result["evalSet"]] == fixture["evalSetIds"]
