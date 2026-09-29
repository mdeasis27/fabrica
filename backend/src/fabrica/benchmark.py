"""Benchmark — mirrors lib/fabrica/benchmark.py."""

from __future__ import annotations

from .generate import generate_eval_set


def benchmark(logs: list[dict], options: dict) -> dict:
    return generate_eval_set(logs, options)
