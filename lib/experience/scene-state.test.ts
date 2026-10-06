import { expect, it } from "vitest";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { questionCells, revealedQuestions } from "./scene-state";
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
