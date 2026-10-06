import { describe, expect, it } from "vitest";
import { runExperience } from "./adapter";

describe("evaluation factory experience", () => {
  it("removes duplicates and does not claim coverage for empty input", async () => {
    const duplicate = await runExperience({ logsText: "refund order | refund\nrefund my order | refund\ntrack shipment | tracking", threshold: 0.5, sampleSize: 1 });
    const empty = await runExperience({ logsText: "", threshold: 0.8, sampleSize: 2 });
    expect(duplicate.result.duplicatesRemoved).toBeGreaterThan(0);
    expect(empty.result.coverage).toBe(0);
  });
});
