import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type { NoParamsResult, SingleParamResult } from "../src/types.ts";

Deno.test("Single Parameter", async (t) => {
  const parser = new ParamsParser();

  await t.step("should handle init command", () => {
    const result = parser.parse(["init"]) as SingleParamResult;
    assertEquals(result, {
      type: "single",
      command: "init"
    });
  });

  await t.step("should handle init command with options", () => {
    const result = parser.parse(["init", "--help"]) as SingleParamResult;
    assertEquals(result, {
      type: "single",
      command: "init"
    });
  });

  await t.step("should handle invalid command", () => {
    const result = parser.parse(["invalid"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: false,
      error: "Invalid command: invalid"
    });
  });

  await t.step("should handle invalid command with options", () => {
    const result = parser.parse(["invalid", "--help"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: false,
      error: "Invalid command: invalid"
    });
  });
}); 