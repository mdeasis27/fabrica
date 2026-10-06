"use client";
import { useEffect, useState } from "react";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import type { MissionResult } from "./mission";
import { TOPICS, questionCells, revealedQuestions, sceneCards, type SceneCard } from "./scene-state";
import { STORY } from "./story";

type Pt = { x: number; y: number };
type Layout = {
  w: number; h: number; pile: Pt; desk: Pt; deskW: number; bin: Pt;
  board: { x: number; y: number; w: number; h: number }; col: (i: number) => number; row: (r: number) => number;
  labels: { pile: Pt; desk: Pt; board: Pt; bin: Pt; left: Pt; tally: Pt; note: Pt };
};

// Two drawings of the same scene: landscape when the stage is wide, portrait on a phone so the text stays readable.
const WIDE: Layout = {
  w: 640, h: 380, pile: { x: 60, y: 120 }, desk: { x: 205, y: 180 }, deskW: 170, bin: { x: 205, y: 318 },
  board: { x: 298, y: 50, w: 334, h: 236 }, col: i => 328 + i * 55, row: r => 106 + r * 38,
  labels: { pile: { x: 60, y: 36 }, desk: { x: 205, y: 120 }, board: { x: 465, y: 36 }, bin: { x: 205, y: 278 }, left: { x: 60, y: 196 }, tally: { x: 465, y: 318 }, note: { x: 465, y: 344 } },
};
const NARROW: Layout = {
  w: 360, h: 590, pile: { x: 80, y: 80 }, desk: { x: 262, y: 80 }, deskW: 176, bin: { x: 180, y: 488 },
  board: { x: 8, y: 162, w: 344, h: 256 }, col: i => 37 + i * 57, row: r => 212 + r * 40,
  labels: { pile: { x: 80, y: 22 }, desk: { x: 262, y: 22 }, board: { x: 180, y: 154 }, bin: { x: 180, y: 446 }, left: { x: 80, y: 148 }, tally: { x: 180, y: 556 }, note: { x: 180, y: 580 } },
};

const CW = 150, CH = 60, SMALL = 0.32;
const FILL = { served: "var(--success)", rerouted: "var(--info)", lost: "var(--danger)" } as const;
const MARK = { served: "✓", rerouted: "=", lost: "×" } as const;
const STEP_MS = 120;

function wrap(q: string): string[] {
  const lines: string[] = [];
  let line = "";
  for (const w of q.split(" ")) {
    if (line && `${line} ${w}`.length > 19) { lines.push(line); line = w; } else line = line ? `${line} ${w}` : w;
  }
  lines.push(line);
  return lines.slice(0, 2);
}

function slot(L: Layout, cards: readonly SceneCard[], c: SceneCard): Pt & { s: number } {
  const p = c.place;
  if (p.kind === "board") return { x: L.col(p.col), y: L.row(p.row), s: SMALL };
  if (p.kind === "staple" && c.twin !== null) {
    const t = slot(L, cards, cards[c.twin]);
    return { x: t.x + 3 * (p.k + 1), y: t.y - 4 * (p.k + 1), s: SMALL };
  }
  const k = p.kind === "bin" ? p.k : 0;
  return { x: L.bin.x - 20 + (k % 2) * 40, y: L.bin.y + 12 + Math.floor(k / 2) * 14, s: SMALL * 0.8 };
}

function Drawing({ L, cards, count, current, copy, counts, reduced, className }: { L: Layout; cards: SceneCard[]; count: number; current: SceneCard | undefined; copy: (typeof STORY)["en"]["scene"]; counts: { served: number; rerouted: number; lost: number }; reduced: boolean; className: string }) {
  const twin = current && current.twin !== null ? slot(L, cards, cards[current.twin]) : null;
  const text = (p: Pt, s: string, size = 13, fill = "var(--muted-foreground)") => <text x={p.x} y={p.y} fontSize={size} fill={fill} textAnchor="middle">{s}</text>;
  return <svg viewBox={`0 0 ${L.w} ${L.h}`} className={`h-auto w-full ${className}`} role="img" aria-label={copy.ariaLabel(counts.served, counts.rerouted, counts.lost)}>
    {text(L.labels.pile, copy.pile)}
    {[5, 4, 3, 2, 1, 0].map(k => k < Math.ceil((cards.length - count) / 5) || k === 0 ? <rect key={k} x={L.pile.x - 45 + k * 3} y={L.pile.y - 26 + k * 4} width={90} height={44} rx={5} fill="#e9e2d2" stroke="#bbb" opacity={count >= cards.length ? 0.25 : 1} /> : null)}
    {text(L.labels.left, copy.left(cards.length - count), 12)}
    {text(L.labels.desk, copy.desk)}
    <rect x={L.desk.x - L.deskW / 2} y={L.desk.y - 45} width={L.deskW} height={90} rx={10} fill="#5a4632" stroke="#3a2a1a" opacity={0.9} />
    {text(L.labels.board, copy.board)}
    <rect x={L.board.x} y={L.board.y} width={L.board.w} height={L.board.h} rx={8} fill="var(--background)" stroke="var(--border)" />
    {TOPICS.map((t, i) => <text key={t} x={L.col(i)} y={L.board.y + 22} fontSize={12} fill="var(--foreground)" textAnchor="middle">{copy.topics[t] ?? t}</text>)}
    {text(L.labels.bin, copy.bin)}
    <path d={`M${L.bin.x - 40} ${L.bin.y - 26} h80 l-8 58 h-64 z`} fill="var(--muted)" stroke="var(--border)" strokeWidth={2} />
    <text x={L.bin.x} y={L.bin.y - 6} fontSize={18} fontWeight={700} fill="var(--danger)" textAnchor="middle">{counts.lost}</text>
    {text(L.labels.tally, copy.tally(counts.served, counts.rerouted, counts.lost), 13, "var(--foreground)")}
    {text(L.labels.note, copy.examNote, 12)}
    {twin && current ? <line x1={L.desk.x} y1={L.desk.y} x2={twin.x} y2={twin.y} stroke={FILL[current.status]} strokeWidth={2} strokeDasharray="5 4" /> : null}
    {/* Repeats are drawn first so each one sits behind its twin, stapled. */}
    {[...cards.slice(0, count)].sort((a, b) => Number(a.place.kind !== "staple") - Number(b.place.kind !== "staple")).map(c => {
      const atDesk = c === current;
      const p = atDesk ? { ...L.desk, s: 1 } : slot(L, cards, c);
      return <g key={c.id} data-card={c.status} style={{ transform: `translate(${p.x}px, ${p.y}px) scale(${p.s})`, transition: reduced ? "none" : "transform 300ms ease-in-out" }}>
        <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} rx={6} fill={atDesk ? "#f4efe3" : FILL[c.status]} stroke={atDesk ? "#bbb" : "#111"} strokeWidth={2} />
        {atDesk
          ? <>{wrap(c.query).map((l, i, a) => <text key={i} x={0} y={(i - (a.length - 1) / 2) * 18 + 9} fontSize={15} fill="#222" textAnchor="middle">{l}</text>)}<text x={-CW / 2 + 8} y={-CH / 2 + 14} fontSize={11} fill="#666">#{c.n}</text></>
          : <text x={0} y={14} fontSize={40} fontWeight={700} fill="#fff" textAnchor="middle">{MARK[c.status]} {c.n}</text>}
      </g>;
    })}
  </svg>;
}

export function FabricaStoryScene({ frame, result, locale }: { frame: PlaybackFrame<TraceEvent>; result: MissionResult; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const reduced = useReducedMotion();
  const target = revealedQuestions(frame, result.items.length, reduced);
  // Cards leave the pile one at a time inside each trace step; a new run starts from the pile again.
  const [shown, setShown] = useState({ result, n: 0 });
  if (shown.result !== result) setShown({ result, n: 0 });
  const n = reduced ? target : Math.min(shown.result === result ? shown.n : 0, target);
  useEffect(() => {
    if (reduced || shown.n >= target) return;
    const t = setTimeout(() => setShown(v => ({ result: v.result, n: v.n + 1 })), target - shown.n > 6 ? 30 : STEP_MS);
    return () => clearTimeout(t);
  }, [reduced, shown, target]);
  // One extra beat after the last card so it also leaves the desk.
  const [settledFor, setSettledFor] = useState<MissionResult | null>(null);
  const allOut = n === result.items.length;
  useEffect(() => {
    if (!allOut || reduced) return;
    const t = setTimeout(() => setSettledFor(result), STEP_MS * 2);
    return () => clearTimeout(t);
  }, [allOut, reduced, result]);
  const settled = allOut && (reduced || settledFor === result);

  const cards = sceneCards(result.items);
  const cells = questionCells(result.items, n);
  const c = tapeCounts(cells);
  const placed = settled ? c : tapeCounts(questionCells(result.items, Math.max(0, n - 1)));
  const drawCount = settled ? cards.length : n;
  const current = !settled && n > 0 ? cards[n - 1] : undefined;
  const now = settled ? copy.done(c.served, c.rerouted, c.lost)
    : !current ? copy.waiting
    : current.status === "served" ? copy.nowServed(current.n, current.query, copy.topics[current.topic] ?? current.topic)
    : current.twin === null ? copy.waiting
    : current.status === "rerouted" ? copy.nowRerouted(current.n, current.query, cards[current.twin].n)
    : copy.nowLost(current.n, current.query, cards[current.twin].n, copy.topics[cards[current.twin].topic] ?? cards[current.twin].topic);

  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <div className="@container" data-fabrica-scene data-settled={settled ? "true" : "false"}>
      {([[NARROW, "@md:hidden"], [WIDE, "hidden @md:block"]] as const).map(([L, cls]) =>
        <Drawing key={L.w} L={L} cards={cards} count={drawCount} current={current} copy={copy} counts={placed} reduced={reduced} className={cls} />)}
    </div>
    <p className="mt-4 min-h-12 text-sm leading-6" data-scene-now>{now}</p>
    <div className="mt-4">
      <OutcomeTape cells={cells} labels={copy.tape} ariaLabel={copy.tapeLabel} columns={10} />
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight">{copy.lostOf(c.lost)}</p>
    </div>
  </StoryStage>;
}
