"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { MetricCard } from "@/design-system/components/metric-card";
import { StatusBadge } from "@/design-system/components/status-badge";
import type { LogEntry } from "@/lib/fabrica/types";

interface GenerateResult {
  rawCount?: number;
  dedupedCount?: number;
  duplicatesRemoved?: number;
  dedupeRate?: number;
  totalIntents?: number;
  intentsCovered?: number;
  coverage?: number;
  evalSetSize?: number;
  evalSet?: LogEntry[];
  error?: string;
}

interface HistoryItem {
  id: number;
  logs_count: number;
  eval_size: number;
  coverage: string;
  dedupe_rate: string;
  created_at: string;
}

const PREFILL = `cuál es mi saldo | saldo
cuál es mi saldo hoy | saldo
dame mi saldo | saldo
quiero pagar mi tarjeta | pago
quiero pagar mi tarjeta hoy | pago
realizar un pago | pago
reporto cargo no reconocido | disputa
reporto cargo no reconocido hoy | disputa`;

function pct(v: number) {
  return `${(v * 100).toFixed(0)}%`;
}

export default function AppPage() {
  const [logsText, setLogsText] = useState(PREFILL);
  const [threshold, setThreshold] = useState(0.8);
  const [sampleSize, setSampleSize] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: logsText, simThreshold: threshold, sampleSize }),
      });
      const data = await res.json();
      setResult(data);
      if (res.ok) loadHistory();
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Error de red" });
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.evalSets ?? []);
      }
    } catch {
      /* history is best-effort */
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const evalSet = result?.evalSet ?? [];
  const intents = [...new Set(evalSet.map((l) => l.intent))];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Inicio
            </Link>
            <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.126-.598 48.07 48.07 0 0 0-.317-4.907.657.657 0 0 1 .658-.663v0c.355 0 .676.186.959.401.29.221.634.349 1.003.349 1.035 0 1.875-1.007 1.875-2.25s-.84-2.25-1.875-2.25c-.369 0-.713.128-1.003.349-.283.215-.604.401-.959.401v0a.656.656 0 0 1-.659-.643 48.39 48.39 0 0 1 .316-4.907 48.05 48.05 0 0 0-4.908-.317.656.656 0 0 1-.657-.657v0c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.035-1.007-1.875-2.25-1.875-1.242 0-2.25.84-2.25 1.875 0 .37.128.713.349 1.003.215.283.401.604.401.96v0" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground leading-tight">Fabrica</h1>
                <p className="text-xs text-muted-foreground">Auto-generador de datasets de eval</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone="success" dot className="px-3 py-1">
              Postgres en vivo
            </StatusBadge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Genera un eval set desde logs reales</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Pega logs de producción, uno por línea, con formato{" "}
            <code className="font-mono text-xs">query | intent</code>. La fábrica deduplica por
            Jaccard, muestrea por intención y <strong>persiste el resultado en Postgres</strong>.
            Cada generación queda guardada en el historial.
          </p>
        </div>

        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Logs</p>
          <textarea
            value={logsText}
            onChange={(e) => setLogsText(e.target.value)}
            rows={8}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">Umbral de similitud</span>
                <span className="font-mono text-sm tabular-nums text-foreground">{threshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={1}
                step={0.05}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-foreground"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">Muestras por intención</span>
                <span className="font-mono text-sm tabular-nums text-foreground">{sampleSize}</span>
              </div>
              <input
                type="number"
                min={1}
                max={10}
                step={1}
                value={sampleSize}
                onChange={(e) => setSampleSize(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
              />
            </div>
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="mt-4 w-full rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-medium text-[#ffffff] hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Generando…" : "Generar eval set"}
          </button>
        </Card>

        {result && (
          <div className="space-y-5">
            {result.error && (
              <Alert tone="danger" title="No se pudo generar">{result.error}</Alert>
            )}

            {!result.error && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MetricCard
                    label="Logs crudos"
                    value={result.rawCount ?? 0}
                    hint="líneas parseadas"
                    tone="neutral"
                  />
                  <MetricCard
                    label="Dedupe rate"
                    value={pct(result.dedupeRate ?? 0)}
                    hint={`${result.duplicatesRemoved ?? 0} duplicados`}
                    tone="info"
                  />
                  <MetricCard
                    label="Cobertura de intenciones"
                    value={pct(result.coverage ?? 0)}
                    hint={`${result.intentsCovered ?? 0}/${result.totalIntents ?? 0}`}
                    tone="success"
                  />
                  <MetricCard
                    label="Tamaño del eval set"
                    value={result.evalSetSize ?? 0}
                    hint={`${result.dedupedCount ?? 0} únicos`}
                    tone="success"
                  />
                </div>

                <div className="space-y-4">
                  {intents.map((intent) => (
                    <Card key={intent} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge tone="info">{intent}</StatusBadge>
                        <span className="text-xs text-muted-foreground">
                          {evalSet.filter((l) => l.intent === intent).length} casos
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {evalSet
                          .filter((l) => l.intent === intent)
                          .map((l) => (
                            <li key={l.id} className="flex items-center gap-2 text-sm">
                              <span className="font-mono text-xs text-muted-foreground">{l.id}</span>
                              <span className="text-foreground">{l.query}</span>
                            </li>
                          ))}
                      </ul>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {history.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Historial de generaciones (persistido en Postgres)</h3>
            <div className="overflow-x-auto rounded-[var(--radius-md)] shadow-[var(--shadow-card)] bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--gray-50)]">
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Logs</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Eval size</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cobertura</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dedupe</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td className="px-4 py-2.5 text-foreground tabular-nums">{h.logs_count}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{h.eval_size}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{pct(Number(h.coverage))}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{pct(Number(h.dedupe_rate))}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                        {new Date(h.created_at).toLocaleString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
