import logsRaw from "@/lib/fabrica/data/logs.json";
import { generateEvalSet } from "@/lib/fabrica/generate";
import { dedupeStatuses, jaccard, type DedupeStatus } from "@/lib/fabrica/similarity";
import type { LogEntry } from "@/lib/fabrica/types";
import type { DemoAdapter, TraceEvent } from "@/design-system/demo/types";

export type MissionInput = { threshold: number };
export type MissionResult = { items: DedupeStatus[]; lost: number; comparison: { mine: number; raw: number; topics: number } };

const STEP = 6;
const SAMPLE = 3;
/** Two exam questions at least this alike are the same question in other words (the committed setting). */
const REPEAT = 0.8;
export const LOGS = logsRaw.logs as LogEntry[];

export function cleanLogs(threshold: number): DedupeStatus[] {
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1) throw new Error("threshold must be in (0, 1].");
  return dedupeStatuses(LOGS, threshold);
}

/** Repeated questions in the 18-question exam (3 per topic); null means no cleaning at all. */
export function examRepeats(threshold: number | null): number {
  const exam = generateEvalSet(LOGS, { simThreshold: threshold ?? Number.POSITIVE_INFINITY, sampleSize: SAMPLE }).evalSet;
  return exam.filter((q, i) => exam.slice(0, i).some(p => jaccard(p.query, q.query) >= REPEAT)).length;
}

export const runMission: DemoAdapter<MissionInput, MissionResult> = async (input, signal, onEvent) => {
  const startedAt = performance.now();
  const items = cleanLogs(input.threshold);
  const trace: TraceEvent[] = [];
  for (let i = 0; i < items.length; i += STEP) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const event: TraceEvent = { id: `batch-${i / STEP + 1}`, step: i / STEP + 1, kind: "dedupe", messageKey: `batch.${i / STEP + 1}`, timestampMs: performance.now() - startedAt, evidenceIds: items.slice(i, i + STEP).map(l => l.id) };
    trace.push(event);
    onEvent(event);
  }
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  const topics = new Set(generateEvalSet(LOGS, { simThreshold: input.threshold, sampleSize: SAMPLE }).evalSet.map(l => l.intent)).size;
  return { input, result: { items, lost: items.filter(i => i.status === "lost").length, comparison: { mine: examRepeats(input.threshold), raw: examRepeats(null), topics } }, trace, executionMs: performance.now() - startedAt, mode: "local" };
};
