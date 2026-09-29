"""Generator — mirrors lib/fabrica/generate.py."""

from __future__ import annotations

from .similarity import dedupe


def generate_eval_set(logs: list[dict], options: dict) -> dict:
    unique = dedupe(logs, options["simThreshold"])

    by_intent: dict[str, list[dict]] = {}
    for log in unique:
        by_intent.setdefault(log["intent"], []).append(log)

    eval_set: list[dict] = []
    for group in by_intent.values():
        eval_set.extend(group[: options["sampleSize"]])

    total_intents = len({l["intent"] for l in logs})
    intents_covered = len({l["intent"] for l in eval_set})

    return {
        "rawCount": len(logs),
        "dedupedCount": len(unique),
        "duplicatesRemoved": len(logs) - len(unique),
        "dedupeRate": (len(logs) - len(unique)) / len(logs),
        "totalIntents": total_intents,
        "intentsCovered": intents_covered,
        "coverage": intents_covered / total_intents if total_intents else 0.0,
        "evalSetSize": len(eval_set),
        "evalSet": eval_set,
    }
