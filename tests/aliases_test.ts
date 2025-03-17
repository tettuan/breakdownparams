import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type { DoubleParamsResult } from "../src/types.ts";

Deno.test("Layer Type Aliases", async (t) => {
  const parser = new ParamsParser();

  await t.step("should handle project aliases", () => {
    const aliases = ["project", "pj", "prj"];
    for (const alias of aliases) {
      const result = parser.parse(["to", alias]) as DoubleParamsResult;
      assertEquals(result, {
        type: "double",
        demonstrativeType: "to",
        layerType: "project",
        options: {}
      });
    }
  });

  await t.step("should handle issue aliases", () => {
    const aliases = ["issue", "story"];
    for (const alias of aliases) {
      const result = parser.parse(["to", alias]) as DoubleParamsResult;
      assertEquals(result, {
        type: "double",
        demonstrativeType: "to",
        layerType: "issue",
        options: {}
      });
    }
  });

  await t.step("should handle task aliases", () => {
    const aliases = ["task", "todo", "chore", "style", "fix", "error", "bug"];
    for (const alias of aliases) {
      const result = parser.parse(["to", alias]) as DoubleParamsResult;
      assertEquals(result, {
        type: "double",
        demonstrativeType: "to",
        layerType: "task",
        options: {}
      });
    }
  });

  await t.step("should handle case-insensitive aliases", () => {
    const result = parser.parse(["to", "PJ"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {}
    });
  });

  await t.step("should handle aliases with options", () => {
    const result = parser.parse([
      "to",
      "pj",
      "--from",
      "input.txt",
      "--destination",
      "output.txt"
    ]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {
        fromFile: "input.txt",
        destinationFile: "output.txt"
      }
    });
  });
}); 