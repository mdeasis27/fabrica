import { describe, expect, it } from "vitest";

import { dedupe, jaccard, tokenize } from "./similarity";

describe("jaccard", () => {
  it("is 1.0 for identical token sets", () => {
    expect(jaccard("cuál es mi saldo", "cuál es mi saldo")).toBe(1);
  });

  it("is 0.8 for a base + one extra word", () => {
    expect(jaccard("cuál es mi saldo", "cuál es mi saldo hoy")).toBeCloseTo(0.8, 10);
  });

  it("is low for unrelated queries", () => {
    expect(jaccard("cuál es mi saldo", "quiero pagar mi tarjeta")).toBeLessThan(0.5);
  });
});

describe("tokenize", () => {
  it("lowercases and splits on whitespace", () => {
    expect(tokenize("Cuál ES mi  Saldo")).toEqual(new Set(["cuál", "es", "mi", "saldo"]));
  });
});

describe("dedupe", () => {
  it("keeps the first of a near-duplicate pair", () => {
    const logs = [
      { id: "a", query: "cuál es mi saldo", intent: "saldo" },
      { id: "b", query: "cuál es mi saldo hoy", intent: "saldo" },
      { id: "c", query: "quiero pagar", intent: "pago" },
    ];
    expect(dedupe(logs, 0.8).map((l) => l.id)).toEqual(["a", "c"]);
  });
});
