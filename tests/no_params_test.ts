import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type { NoParamsResult } from "../src/types.ts";

Deno.test("No Parameters", async (t) => {
  const parser = new ParamsParser();

  await t.step("should handle empty arguments", () => {
    const result = parser.parse([]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: false
    });
  });

  await t.step("should handle help option with long form", () => {
    const result = parser.parse(["--help"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: true,
      version: false
    });
  });

  await t.step("should handle help option with short form", () => {
    const result = parser.parse(["-h"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: true,
      version: false
    });
  });

  await t.step("should handle version option with long form", () => {
    const result = parser.parse(["--version"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: true
    });
  });

  await t.step("should handle version option with short form", () => {
    const result = parser.parse(["-v"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: true
    });
  });

  await t.step("should handle both help and version options", () => {
    const result = parser.parse(["-h", "--version"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: true,
      version: true
    });
  });
}); 