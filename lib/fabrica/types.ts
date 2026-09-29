// lib/fabrica/types.ts
// Core data shapes for the eval-set generator demo. Plain JSON-serializable
// shapes mirrored one-to-one in backend/src/fabrica/types.py.

export interface LogEntry {
  id: string;
  query: string;
  intent: string;
}

export interface GeneratorOptions {
  simThreshold: number;
  sampleSize: number;
}

export interface GeneratorResult {
  rawCount: number;
  dedupedCount: number;
  duplicatesRemoved: number;
  dedupeRate: number;
  totalIntents: number;
  intentsCovered: number;
  coverage: number;
  evalSetSize: number;
  evalSet: LogEntry[];
}
