import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type { DoubleParamsResult } from "../src/types.ts";

Deno.test("Options", async (t) => {
  const parser = new ParamsParser();

  await t.step("should handle from option only", () => {
    const result = parser.parse([
      "to",
      "project",
      "--from",
      "input.txt"
    ]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {
        fromFile: "input.txt"
      }
    });
  });

  await t.step("should handle destination option only", () => {
    const result = parser.parse([
      "to",
      "project",
      "--destination",
      "output.txt"
    ]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {
        destinationFile: "output.txt"
      }
    });
  });

  await t.step("should handle input option only", () => {
    const result = parser.parse([
      "to",
      "project",
      "--input",
      "task"
    ]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {
        fromLayerType: "task"
      }
    });
  });

  await t.step("should handle all options together", () => {
    const result = parser.parse([
      "to",
      "project",
      "--from",
      "input.txt",
      "--destination",
      "output.txt",
      "--input",
      "task"
    ]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {
        fromFile: "input.txt",
        destinationFile: "output.txt",
        fromLayerType: "task"
      }
    });
  });

  await t.step("should handle options in different order", () => {
    const result = parser.parse([
      "--from",
      "input.txt",
      "to",
      "project",
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

  await t.step("should handle mixed long and short form options", () => {
    const result = parser.parse([
      "to",
      "project",
      "--from",
      "input.txt",
      "-o",
      "output.txt",
      "-i",
      "task"
    ]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {
        fromFile: "input.txt",
        destinationFile: "output.txt",
        fromLayerType: "task"
      }
    });
  });
}); 