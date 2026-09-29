"use client";

import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { MetricCard } from "@/design-system/components/metric-card";
import { StatusBadge } from "@/design-system/components/status-badge";
import { getDuplicates, getOptions, getResult } from "@/lib/fabrica/demo";

const RESULT = getResult();
const OPTIONS = getOptions();
const DUPS = getDuplicates();

const INTENTS = [...new Set(RESULT.evalSet.map((l) => l.intent))];

function pct(v: number) {
  return `${(v * 100).toFixed(0)}%`;
}

export default function AppPage() {
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
            <StatusBadge tone="info" dot className="px-3 py-1">
              Demo mode
            </StatusBadge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* ── SUMMARY BAR ─────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard
            label="Logs crudos"
            value={RESULT.rawCount}
            hint="entrada de producción"
            tone="neutral"
          />
          <MetricCard
            label="Dedupe rate"
            value={pct(RESULT.dedupeRate)}
            hint={`${RESULT.duplicatesRemoved} duplicados`}
            tone="info"
          />
          <MetricCard
            label="Cobertura de intenciones"
            value={pct(RESULT.coverage)}
            hint={`${RESULT.intentsCovered}/${RESULT.totalIntents}`}
            tone="success"
          />
          <MetricCard
            label="Tamaño del eval set"
            value={RESULT.evalSetSize}
            hint={`${RESULT.totalIntents} intenciones × ${OPTIONS.sampleSize}`}
            tone="success"
          />
        </div>

        {/* ── DUPLICATES ──────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Dedupe por similitud</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Jaccard sobre tokens con umbral {OPTIONS.simThreshold}. Seis logs son near-duplicados
            de uno ya conservado y se descartan.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {DUPS.map((d) => (
              <Card key={d.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-muted-foreground">{d.id} → dup de {d.dupOf}</span>
                  <StatusBadge tone="warning">descartado</StatusBadge>
                </div>
                <p className="font-mono text-sm text-foreground">&quot;{d.query}&quot;</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── EVAL SET ────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Eval set generado</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {RESULT.evalSetSize} casos muestreados desde {RESULT.dedupedCount} únicos, agrupados por
            intención (clustering determinista por etiqueta).
          </p>
          <div className="space-y-4">
            {INTENTS.map((intent) => (
              <Card key={intent} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge tone="info">{intent}</StatusBadge>
                  <span className="text-xs text-muted-foreground">
                    {RESULT.evalSet.filter((l) => l.intent === intent).length} casos
                  </span>
                </div>
                <ul className="space-y-1">
                  {RESULT.evalSet
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
        </section>

        {/* ── NOTE ────────────────────────────── */}
        <section>
          <Alert tone="info" title="Clustering = etiqueta committed, dedupe = matemática real">
            El clustering por intención usa la etiqueta committed (proxy documentado de un
            clasificador de intenciones real); el dedupe es Jaccard de tokens real. La promesa es
            que el eval set crezca sin labeling manual: los logs ya traen la señal, la fábrica la
            deduplica y la muestrea.
          </Alert>
        </section>

        <footer className="pt-8 border-t border-[var(--border)] flex items-center justify-between text-xs text-muted-foreground">
          <span>Fabrica · Auto-generador de datasets de eval · Demo mode</span>
          <a href="https://github.com/mdeasis27/fabrica" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors font-mono">GitHub</a>
        </footer>
      </div>
    </div>
  );
}
