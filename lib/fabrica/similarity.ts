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

export type DedupeStatus = { id: string; status: "served" | "rerouted" | "lost"; dupOf: string | null };

/**
 * What dedupe did with each log: kept (served), dropped as a twin of the same
 * intent (rerouted), or dropped as a twin of another intent (lost). The twin
 * is the first kept log that blocked it, the same one dedupe compares against.
 */
export function dedupeStatuses(logs: readonly LogEntry[], threshold: number): DedupeStatus[] {
  const kept: LogEntry[] = [];
  return logs.map((log) => {
    const twin = kept.find((k) => jaccard(k.query, log.query) >= threshold);
    if (!twin) {
      kept.push(log);
      return { id: log.id, status: "served", dupOf: null };
    }
    return { id: log.id, status: twin.intent === log.intent ? "rerouted" : "lost", dupOf: twin.id };
  });
}
