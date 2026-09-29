// lib/fabrica/benchmark.ts
// Runs the generator over the log set and returns the metrics.

import { generateEvalSet } from "./generate";
import type { GeneratorOptions, GeneratorResult, LogEntry } from "./types";

export function benchmark(
  logs: readonly LogEntry[],
  options: GeneratorOptions,
): GeneratorResult {
  return generateEvalSet(logs, options);
}
