// lib/fabrica/generate.ts
// The eval-set generator: dedupe → cluster by intent → sample. Clustering uses
// the committed intent label (a documented proxy for a real intent classifier);
// the dedupe is real text similarity. Mirrors backend/src/fabrica/generate.py.

import { dedupe } from "./similarity";
import type { GeneratorOptions, GeneratorResult, LogEntry } from "./types";

export function generateEvalSet(
  logs: readonly LogEntry[],
  options: GeneratorOptions,
): GeneratorResult {
  const unique = dedupe(logs, options.simThreshold);

  const byIntent = new Map<string, LogEntry[]>();
  for (const log of unique) {
    const group = byIntent.get(log.intent) ?? [];
    group.push(log);
    byIntent.set(log.intent, group);
  }

  const evalSet: LogEntry[] = [];
  for (const group of byIntent.values()) {
    evalSet.push(...group.slice(0, options.sampleSize));
  }

  const totalIntents = new Set(logs.map((l) => l.intent)).size;
  const intentsCovered = new Set(evalSet.map((l) => l.intent)).size;

  return {
    rawCount: logs.length,
    dedupedCount: unique.length,
    duplicatesRemoved: logs.length - unique.length,
    dedupeRate: (logs.length - unique.length) / logs.length,
    totalIntents,
    intentsCovered,
    coverage: intentsCovered / totalIntents,
    evalSetSize: evalSet.length,
    evalSet,
  };
}
