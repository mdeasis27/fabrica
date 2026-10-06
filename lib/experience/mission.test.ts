import { expect, it } from "vitest";
import { examRepeats, cleanLogs, runMission } from "./mission";

const count = (t: number) => {
  const items = cleanLogs(t);
  return { served: items.filter(i => i.status === "served").length, rerouted: items.filter(i => i.status === "rerouted").length, lost: items.filter(i => i.status === "lost").length };
};

it("at 80% alike keeps 24 logs, folds 6 repeats and throws out no other topic", () => {
  expect(count(0.8)).toEqual({ served: 24, rerouted: 6, lost: 0 });
});

it("flips the bet between 65% and 60%", () => {
  expect(count(0.65).lost).toBe(0);
  expect(count(0.6).lost).toBe(1);
});

it("sweep: both bet answers are reachable on the slider, and the default says no", () => {
  const answers = new Set<boolean>();
  for (let p = 30; p <= 95; p += 5) answers.add(count(p / 100).lost > 0);
  expect([...answers].sort()).toEqual([false, true]);
  expect(count(0.8).lost > 0).toBe(false);
});

it("the 18-question exam has no repeats when cleaned at 80% and 6 without cleaning", () => {
  expect(examRepeats(0.8)).toBe(0);
  expect(examRepeats(null)).toBe(6);
});

it("runs the mission, reveals in groups of six and stops when cancelled", async () => {
  const ids: string[] = [];
  const run = await runMission({ threshold: 0.8 }, new AbortController().signal, e => ids.push(e.id));
  expect(run.result.items).toHaveLength(30);
  expect(run.result.lost).toBe(0);
  expect(run.result.comparison).toEqual({ mine: 0, raw: 6, topics: 6 });
  expect(ids).toHaveLength(5);
  const c = new AbortController(); c.abort();
  await expect(runMission({ threshold: 0.8 }, c.signal, () => {})).rejects.toThrow();
});
