import { expect, it } from "vitest";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { questionCells, revealedQuestions, sceneCards } from "./scene-state";
import { runMission } from "./mission";

it("hides the messages not revealed yet", () => {
  expect(questionCells([{ id: "a", status: "served", dupOf: null }, { id: "b", status: "lost", dupOf: "a" }], 1)).toEqual(["served", "pending"]);
});

it("final tape counts equal the mission totals", async () => {
  const { result } = await runMission({ threshold: 0.6 }, new AbortController().signal, () => {});
  expect(tapeCounts(questionCells(result.items, result.items.length))).toEqual({ served: 22, rerouted: 7, lost: result.lost, pending: 0 });
});

it("reveals six per frame, all of it when complete or under reduced motion", () => {
  expect(revealedQuestions({ visible: 1, total: 5, complete: false }, 30, false)).toBe(6);
  expect(revealedQuestions({ visible: 5, total: 5, complete: true }, 30, false)).toBe(30);
  expect(revealedQuestions({ visible: 1, total: 5, complete: false }, 30, true)).toBe(30);
});

it("places each message on the board by topic, stapled to its twin, or in the bin", async () => {
  const { result } = await runMission({ threshold: 0.3 }, new AbortController().signal, () => {});
  const cards = sceneCards(result.items);
  expect(cards).toHaveLength(30);
  expect(cards[0]).toMatchObject({ n: 1, query: "cuál es mi saldo", topic: "saldo", status: "served", twin: null, place: { kind: "board", col: 0, row: 0 } });
  expect(cards[1]).toMatchObject({ status: "rerouted", twin: 0, place: { kind: "staple", k: 0 } });
  const bin = cards.filter(c => c.place.kind === "bin");
  expect(bin.map(c => c.status)).toEqual(["lost", "lost", "lost"]);
  expect(bin.map(c => c.place.kind === "bin" && c.place.k)).toEqual([0, 1, 2]);
  for (const c of cards) if (c.twin !== null) expect(cards[c.twin].status).toBe("served");
});
