"""Similarity — mirrors lib/fabrica/similarity.py."""

from __future__ import annotations


def tokenize(query: str) -> set[str]:
    return set(query.lower().split())


def jaccard(a: str, b: str) -> float:
    sa, sb = tokenize(a), tokenize(b)
    inter = len(sa & sb)
    union = len(sa | sb)
    return 0.0 if union == 0 else inter / union


def dedupe(logs: list[dict], threshold: float) -> list[dict]:
    kept: list[dict] = []
    for log in logs:
        if all(jaccard(k["query"], log["query"]) < threshold for k in kept):
            kept.append(log)
    return kept


def dedupe_statuses(logs: list[dict], threshold: float) -> list[dict]:
    """What dedupe did with each log: kept (served), twin of the same intent (rerouted) or of another intent (lost)."""
    kept: list[dict] = []
    out: list[dict] = []
    for log in logs:
        twin = next((k for k in kept if jaccard(k["query"], log["query"]) >= threshold), None)
        if twin is None:
            kept.append(log)
            out.append({"id": log["id"], "status": "served", "dupOf": None})
        else:
            out.append({"id": log["id"], "status": "rerouted" if twin["intent"] == log["intent"] else "lost", "dupOf": twin["id"]})
    return out
