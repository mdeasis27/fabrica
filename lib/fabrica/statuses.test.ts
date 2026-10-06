import { describe, expect, it } from "vitest";
import logsRaw from "./data/logs.json";
import fixture from "./fixtures/statuses.json";
import { dedupeStatuses } from "./similarity";
import type { LogEntry } from "./types";

const LOGS = logsRaw.logs as LogEntry[];
const count = (t: number) => {
  const s = dedupeStatuses(LOGS, t);
  return { served: s.filter(x => x.status === "served").length, rerouted: s.filter(x => x.status === "rerouted").length, lost: s.filter(x => x.status === "lost").length };
};

describe("dedupeStatuses", () => {
  it("at 0.80 keeps 24 and folds 6 into a same-topic twin", () => {
    expect(count(0.8)).toEqual({ served: 24, rerouted: 6, lost: 0 });
  });

  it("at 0.60 throws out l23 as a twin of l01 from another topic", () => {
    const lost = dedupeStatuses(LOGS, 0.6).filter(x => x.status === "lost");
    expect(lost).toEqual([{ id: "l23", status: "lost", dupOf: "l01" }]);
    expect(count(0.65).lost).toBe(0);
  });

  it("matches the per-log statuses pinned for Python", () => {
    for (const [t, expected] of Object.entries(fixture.statuses)) expect(dedupeStatuses(LOGS, Number(t))).toEqual(expected);
  });
});
