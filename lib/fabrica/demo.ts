// lib/fabrica/demo.ts
// Wires committed production logs into every number the dashboard displays.

import logsRaw from "./data/logs.json";
import { benchmark } from "./benchmark";
import { dedupe, jaccard } from "./similarity";
import type { GeneratorOptions, GeneratorResult, LogEntry } from "./types";

const LOGS = logsRaw.logs as LogEntry[];
const OPTIONS: GeneratorOptions = { simThreshold: 0.8, sampleSize: 3 };

let memo: GeneratorResult | null = null;

export function getOptions(): GeneratorOptions {
  return OPTIONS;
}

export function getResult(): GeneratorResult {
  if (!memo) {
    memo = benchmark(LOGS, OPTIONS);
  }
  return memo;
}

export function getDuplicates() {
  const kept = dedupe(LOGS, OPTIONS.simThreshold);
  const keptIds = new Set(kept.map((l) => l.id));
  return LOGS.filter((l) => !keptIds.has(l.id)).map((l) => {
    const twin = kept.find((k) => jaccard(k.query, l.query) >= OPTIONS.simThreshold);
    return { id: l.id, query: l.query, intent: l.intent, dupOf: twin?.id ?? null };
  });
}
