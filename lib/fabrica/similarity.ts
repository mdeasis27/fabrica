// lib/fabrica/similarity.ts
// Token-set Jaccard similarity and greedy near-duplicate removal. Deterministic
// (order-preserving): a log is kept only if it is not similar to any previously
// kept log. Mirrors backend/src/fabrica/similarity.py.

import type { LogEntry } from "./types";

export function tokenize(query: string): Set<string> {
  return new Set(query.toLowerCase().split(/\s+/).filter(Boolean));
}

export function jaccard(a: string, b: string): number {
  const sa = tokenize(a);
  const sb = tokenize(b);
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function dedupe(logs: readonly LogEntry[], threshold: number): LogEntry[] {
  const kept: LogEntry[] = [];
  for (const log of logs) {
    if (kept.every((k) => jaccard(k.query, log.query) < threshold)) {
      kept.push(log);
    }
  }
  return kept;
}
