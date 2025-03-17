import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type { DoubleParamsResult } from "../src/types.ts";

Deno.test("Double Parameters", async (t) => {
  const parser = new ParamsParser();

  await t.step("should handle to project", () => {
    const result = parser.parse(["to", "project"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {}
    });
  });

  await t.step("should handle summary issue", () => {
    const result = parser.parse(["summary", "issue"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "summary",
      layerType: "issue",
      options: {}
    });
  });

  await t.step("should handle defect task", () => {
    const result = parser.parse(["defect", "task"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "defect",
      layerType: "task",
      options: {}
    });
  });

  await t.step("should handle with options", () => {
    const result = parser.parse([
      "to",
      "project",
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

  await t.step("should handle with short form options", () => {
    const result = parser.parse([
      "to",
      "project",
      "-f",
      "input.txt",
      "-o",
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