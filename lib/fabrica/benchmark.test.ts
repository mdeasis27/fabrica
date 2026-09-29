import { describe, expect, it } from "vitest";

import logsRaw from "./data/logs.json";
import fixture from "./fixtures/generator.json";
import { benchmark } from "./benchmark";
import type { GeneratorOptions, LogEntry } from "./types";

const LOGS = logsRaw.logs as LogEntry[];
const OPTIONS: GeneratorOptions = { simThreshold: 0.8, sampleSize: 3 };

describe("pinned fixture: generator", () => {
  it("reproduces dedupe, coverage and eval-set size", () => {
    const result = benchmark(LOGS, OPTIONS);

    expect(result.rawCount).toBe(fixture.rawCount);
    expect(result.dedupedCount).toBe(fixture.dedupedCount);
    expect(result.duplicatesRemoved).toBe(fixture.duplicatesRemoved);
    expect(result.dedupeRate).toBeCloseTo(fixture.dedupeRate, 10);
    expect(result.totalIntents).toBe(fixture.totalIntents);
    expect(result.intentsCovered).toBe(fixture.intentsCovered);
    expect(result.coverage).toBeCloseTo(fixture.coverage, 10);
    expect(result.evalSetSize).toBe(fixture.evalSetSize);
    expect(result.evalSet.map((l) => l.id)).toEqual(fixture.evalSetIds);
  });

  it("covers every intent and removes exactly 6 duplicates", () => {
    const result = benchmark(LOGS, OPTIONS);
    expect(result.coverage).toBe(1);
    expect(result.duplicatesRemoved).toBe(6);
    expect(result.evalSetSize).toBe(18);
  });
});
