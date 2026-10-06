import type { TapeStatus } from "@/design-system/demo/outcome-tape";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import type { DedupeStatus } from "@/lib/fabrica/similarity";
import { LOGS } from "./mission";

export function questionCells(items: readonly DedupeStatus[], revealed: number): TapeStatus[] {
  return items.map((c, i) => (i >= revealed ? "pending" : c.status));
}

export function revealedQuestions(frame: { visible: number; total: number; complete: boolean }, n: number, reducedMotion: boolean): number {
  if (reducedMotion || frame.complete || frame.total === 0) return n;
  return Math.ceil((n * frame.visible) / frame.total);
}

export const COMPLETE_FRAME: PlaybackFrame<TraceEvent> = { visible: 0, total: 0, event: undefined, complete: true };

/** The six topics in the order they first appear in the messages: the board's columns. */
export const TOPICS = [...new Set(LOGS.map(l => l.intent))];

export type CardPlace = { kind: "board"; col: number; row: number } | { kind: "staple"; k: number } | { kind: "bin"; k: number };
export type SceneCard = { id: string; n: number; query: string; topic: string; status: DedupeStatus["status"]; twin: number | null; place: CardPlace };

/** Joins the run's statuses with each message's text and topic, and says where the card lands. */
export function sceneCards(items: readonly DedupeStatus[]): SceneCard[] {
  const byId = new Map(LOGS.map(l => [l.id, l]));
  const index = new Map(items.map((it, i) => [it.id, i]));
  const rows = new Map<string, number>();
  const staples = new Map<string, number>();
  let lost = 0;
  return items.map((it, i) => {
    const log = byId.get(it.id);
    if (!log) throw new Error(`Unknown message ${it.id}`);
    const twin = it.dupOf === null ? null : index.get(it.dupOf) ?? null;
    let place: CardPlace;
    if (it.status === "served") {
      const row = rows.get(log.intent) ?? 0;
      rows.set(log.intent, row + 1);
      place = { kind: "board", col: TOPICS.indexOf(log.intent), row };
    } else if (it.status === "rerouted" && it.dupOf !== null) {
      const k = staples.get(it.dupOf) ?? 0;
      staples.set(it.dupOf, k + 1);
      place = { kind: "staple", k };
    } else place = { kind: "bin", k: lost++ };
    return { id: it.id, n: i + 1, query: log.query, topic: log.intent, status: it.status, twin, place };
  });
}
