import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type { NoParamsResult, DoubleParamsResult } from "../src/types.ts";

Deno.test("Error Cases", async (t) => {
  const parser = new ParamsParser();

  await t.step("should handle invalid demonstrative type", () => {
    const result = parser.parse(["invalid", "project"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: false,
      error: "Invalid demonstrative type: invalid"
    });
  });

  await t.step("should handle invalid layer type", () => {
    const result = parser.parse(["to", "invalid"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: false,
      error: "Invalid layer type: invalid"
    });
  });

  await t.step("should handle too many arguments", () => {
    const result = parser.parse(["to", "project", "extra"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: false,
      error: "Too many arguments. Maximum 2 arguments are allowed."
    });
  });

  await t.step("should handle missing option value", () => {
    const result = parser.parse(["to", "project", "--from"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {}
    });
  });

  await t.step("should handle invalid option", () => {
    const result = parser.parse(["to", "project", "--invalid"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {}
    });
  });

  await t.step("should handle invalid option value", () => {
    const result = parser.parse(["to", "project", "--input", "invalid"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {}
    });
  });

  await t.step("should handle option value starting with dash", () => {
    const result = parser.parse(["to", "project", "--from", "-invalid"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {}
    });
  });
}); 