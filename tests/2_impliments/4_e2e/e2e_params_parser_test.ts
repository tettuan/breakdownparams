import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../../../src/parser/params_parser.ts";
import { OptionRule, OneParamResult, TwoParamResult } from "../../../src/result/types.ts";

const optionRule: OptionRule = {
  format: "--key=value",
  validation: {
    customVariables: ["--demonstrative-type", "--layer-type"],
    emptyValue: "error",
    unknown: "error",
    duplicate: "error",
  },
  specialCases: {
    "--help": "help",
    "--version": "version",
  },
};

Deno.test("test_params_parser_e2e", () => {
  const parser = new ParamsParser(optionRule);

  // ヘルプコマンドのテスト
  const helpResult = parser.parse(["--help"]);
  assertEquals(helpResult.type, "zero", "Help command should return zero params result");
  assertEquals(helpResult.params, ["--help"], "Help command should be included in params");
  assertEquals(Object.keys(helpResult.options).length, 0, "Help command should have no options");

  // バージョンコマンドのテスト
  const versionResult = parser.parse(["--version"]);
  assertEquals(versionResult.type, "zero", "Version command should return zero params result");
  assertEquals(versionResult.params, ["--version"], "Version command should be included in params");
  assertEquals(Object.keys(versionResult.options).length, 0, "Version command should have no options");

  // initコマンドのテスト
  const initResult = parser.parse(["init"]) as OneParamResult;
  assertEquals(initResult.type, "one", "Init command should return one param result");
  assertEquals(initResult.params, ["init"], "Init command should be included in params");
  assertEquals(Object.keys(initResult.options).length, 0, "Init command should have no options");
  assertEquals(initResult.demonstrativeType, "init", "Demonstrative type should be init");

  // toコマンドのテスト
  const toResult = parser.parse(["to", "project"]) as TwoParamResult;
  assertEquals(toResult.type, "two", "To command should return two params result");
  assertEquals(toResult.params, ["to", "project"], "To command should be included in params");
  assertEquals(Object.keys(toResult.options).length, 0, "To command should have no options");
  assertEquals(toResult.demonstrativeType, "to", "Demonstrative type should be to");
  assertEquals(toResult.layerType, "project", "Layer type should be project");

  // オプション付きコマンドのテスト
  const optionsResult = parser.parse(["to", "project", "--demonstrative-type=test", "--layer-type=component"]) as TwoParamResult;
  assertEquals(optionsResult.type, "two", "Command with options should return two params result");
  assertEquals(optionsResult.params, ["to", "project"], "Command params should be included");
  assertEquals(Object.keys(optionsResult.options).length, 2, "Command should have two options");
  assertEquals(optionsResult.options["--demonstrative-type"], "test", "Demonstrative type option should be set");
  assertEquals(optionsResult.options["--layer-type"], "component", "Layer type option should be set");

  // エラーケースのテスト
  const errorResult = parser.parse(["invalid;command"]);
  assertEquals(errorResult.type, "error", "Invalid command should return error result");
  assertEquals(errorResult.error?.code, "SECURITY_ERROR", "Error should be security error");
  assertEquals(errorResult.error?.category, "security", "Error category should be security");

  // 複合ケースのテスト
  const complexResult = parser.parse(["to", "project", "--help", "--version", "--demonstrative-type=test"]) as TwoParamResult;
  assertEquals(complexResult.type, "two", "Complex command should return two params result");
  assertEquals(complexResult.params, ["to", "project", "--help", "--version"], "All params should be included");
  assertEquals(Object.keys(complexResult.options).length, 1, "Command should have one option");
  assertEquals(complexResult.options["--demonstrative-type"], "test", "Demonstrative type option should be set");
}); 