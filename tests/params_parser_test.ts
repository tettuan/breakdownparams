import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type {
  NoParamsResult,
  SingleParamResult,
  DoubleParamsResult,
} from "../src/types.ts";

/**
 * ParamsParserのテストスイート
 * 仕様書に基づいて、以下のケースをテスト
 * 1. パラメータなしのケース
 * 2. オプションのみのケース
 * 3. 単一パラメータのケース
 * 4. 2パラメータのケース
 * 5. エラーケース
 */

Deno.test("parse - no parameters", () => {
  const parser = new ParamsParser();
  const result = parser.parse([]) as NoParamsResult;
  assertEquals(result, {
    type: "no-params",
    help: false,
    version: false
  });
});

Deno.test("parse - help option", () => {
  const parser = new ParamsParser();
  const result = parser.parse(["-h"]) as NoParamsResult;
  assertEquals(result, {
    type: "no-params",
    help: true,
    version: false
  });
});

Deno.test("parse - version option", () => {
  const parser = new ParamsParser();
  const result = parser.parse(["--version"]) as NoParamsResult;
  assertEquals(result, {
    type: "no-params",
    help: false,
    version: true
  });
});

Deno.test("parse - init command", () => {
  const parser = new ParamsParser();
  const result = parser.parse(["init"]) as SingleParamResult;
  assertEquals(result, {
    type: "single",
    command: "init"
  });
});

Deno.test("parse - invalid single command", () => {
  const parser = new ParamsParser();
  const result = parser.parse(["invalid"]) as NoParamsResult;
  assertEquals(result, {
    type: "no-params",
    help: false,
    version: false,
    error: "Invalid command: invalid"
  });
});

Deno.test("parse - double parameters", () => {
  const parser = new ParamsParser();
  const result = parser.parse(["to", "project"]) as DoubleParamsResult;
  assertEquals(result, {
    type: "double",
    demonstrativeType: "to",
    layerType: "project",
    options: {}
  });
});

Deno.test("parse - double parameters with options", () => {
  const parser = new ParamsParser();
  const result = parser.parse(["to", "project", "--from", "input.txt", "--destination", "output.txt"]) as DoubleParamsResult;
  
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

Deno.test("parse - invalid demonstrative type", () => {
  const parser = new ParamsParser();
  const result = parser.parse(["invalid", "project"]) as NoParamsResult;
  assertEquals(result, {
    type: "no-params",
    help: false,
    version: false,
    error: "Invalid demonstrative type: invalid"
  });
});

Deno.test("parse - invalid layer type", () => {
  const parser = new ParamsParser();
  const result = parser.parse(["to", "invalid"]) as NoParamsResult;
  assertEquals(result, {
    type: "no-params",
    help: false,
    version: false,
    error: "Invalid layer type: invalid"
  });
});

Deno.test("parse - too many arguments", () => {
  const parser = new ParamsParser();
  const result = parser.parse(["to", "project", "extra"]) as NoParamsResult;
  assertEquals(result, {
    type: "no-params",
    help: false,
    version: false,
    error: "Too many arguments. Maximum 2 arguments are allowed."
  });
});

Deno.test("parse - layer type aliases", () => {
  const parser = new ParamsParser();
  const result = parser.parse(["to", "pj"]) as DoubleParamsResult;
  assertEquals(result, {
    type: "double",
    demonstrativeType: "to",
    layerType: "project",
    options: {}
  });
}); 