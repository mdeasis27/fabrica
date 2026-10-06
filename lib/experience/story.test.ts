import { describe, expect, it } from "vitest";
import { STORY } from "./story";
import { lintStory, storyStrings as strings } from "@/design-system/demo/copy-lint";

describe("Fabrica story copy", () => {
  it("has the same shape in English and Spanish", () => {
    const keys = (o: unknown): string[] => o && typeof o === "object" && !Array.isArray(o) ? Object.entries(o).filter(([k]) => k !== "before" && k !== "after").flatMap(([k, v]) => [k, ...keys(v).map(x => `${k}.${x}`)]) : [];
    expect(keys(STORY.es)).toEqual(keys(STORY.en));
    expect(STORY.es.analogy.dictionary).toHaveLength(STORY.en.analogy.dictionary.length);
  });

  it("has no empty strings except the owner-supplied why note", () => {
    for (const locale of ["en", "es"] as const) {
      const { why, ...rest } = STORY[locale];
      expect(why.title.trim()).not.toBe("");
      for (const s of strings(rest)) expect(s.trim(), `${locale}: empty string`).not.toBe("");
    }
  });

  it("avoids AI-sounding patterns and brand names", () => {
    for (const locale of ["en", "es"] as const) expect(lintStory(STORY[locale]), locale).toEqual([]);
  });

  it("states the comparison truthfully at zero, one, a tie and the reverse case", () => {
    expect(STORY.en.compare.sentence(0, 6, 6)).toBe("Your exam has no repeated questions and covers all six topics. Without cleaning, 6 of the 18 questions repeat an earlier one.");
    expect(STORY.es.compare.sentence(1, 6, 5)).toContain("1 pregunta repetida y cubre 5 de los seis temas");
    expect(STORY.es.compare.sentence(6, 6, 6)).toBe("Los dos exámenes tienen 6 preguntas repetidas. El tuyo cubre los seis temas.");
    expect(STORY.en.compare.sentence(7, 6, 6)).toContain("cleaning made it worse");
  });

  it("asks the bet about the setting the visitor chose and states the graded quantity", () => {
    expect(STORY.en.tryIt.question(80)).toContain("80% alike or more");
    expect(STORY.es.tryIt.question(60)).toContain("se parecen 60% o más");
    expect([0, 1, 2].map(STORY.es.compare.verdict)).toEqual(["No se tiró ningún mensaje de otro tema", "Se tiró 1 mensaje de otro tema", "Se tiraron 2 mensajes de otros temas"]);
  });
});
