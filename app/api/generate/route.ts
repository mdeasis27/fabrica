import { NextResponse } from "next/server";
import { getSql } from "@/lib/db/client";
import { generateEvalSet } from "@/lib/fabrica/generate";
import type { LogEntry } from "@/lib/fabrica/types";

function parseLogs(text: string): LogEntry[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const idx = line.lastIndexOf("|");
      if (idx === -1) return null;
      return {
        id: `l${i + 1}`,
        query: line.slice(0, idx).trim(),
        intent: line.slice(idx + 1).trim(),
      };
    })
    .filter((l): l is LogEntry => l !== null);
}

export async function POST(request: Request) {
  let logsText: string;
  let simThreshold = 0.8;
  let sampleSize = 3;
  try {
    const body = await request.json();
    logsText = typeof body.logs === "string" ? body.logs : "";
    if (typeof body.simThreshold === "number") simThreshold = body.simThreshold;
    if (typeof body.sampleSize === "number") sampleSize = body.sampleSize;
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  if (!logsText.trim()) {
    return NextResponse.json({ error: "Pega logs con formato query | intent" }, { status: 400 });
  }

  const logs = parseLogs(logsText);
  if (logs.length === 0) {
    return NextResponse.json(
      { error: "No reconocí ningún log. Usa una línea por log con formato query | intent." },
      { status: 400 },
    );
  }

  const result = generateEvalSet(logs, { simThreshold, sampleSize });

  try {
    const db = getSql();
    await db`INSERT INTO fabrica.eval_sets (logs_count, eval_size, coverage, dedupe_rate) VALUES (${result.rawCount}, ${result.evalSetSize}, ${result.coverage}, ${result.dedupeRate})`;
    for (const log of logs) {
      await db`INSERT INTO fabrica.log_entries (query, intent) VALUES (${log.query}, ${log.intent})`;
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error guardando en Postgres" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    rawCount: result.rawCount,
    dedupedCount: result.dedupedCount,
    duplicatesRemoved: result.duplicatesRemoved,
    dedupeRate: result.dedupeRate,
    totalIntents: result.totalIntents,
    intentsCovered: result.intentsCovered,
    coverage: result.coverage,
    evalSetSize: result.evalSetSize,
    evalSet: result.evalSet,
  });
}
