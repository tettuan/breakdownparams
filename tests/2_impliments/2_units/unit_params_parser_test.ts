import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../../../src/parser/params_parser.ts";
import { OptionRule, OneParamResult, TwoParamResult } from "../../../src/result/types.ts";

const optionRule: OptionRule = {
  format: "--key=value",
  validation: {
    customVariables: ["--demonstrative-type", "--layer-type"],
    emptyValue: "error",
    unknownOption: "error",
    duplicateOption: "error",
    requiredOptions: [],
    valueTypes: ["string"]
  },
  specialCases: {
    "--help": "help",
    "--version": "version",
  },
};

Deno.test("test_params_parser_unit", () => {
  const parser = new ParamsParser(optionRule);

  // オプションのみのテスト
  const optionsOnlyResult = parser.parse(["--help", "--version"]);
  console.log("[DEBUG] optionsOnlyResult:", optionsOnlyResult);
  assertEquals(optionsOnlyResult.type, "zero", "Options only should be zero type");
  assertEquals(optionsOnlyResult.params, ["--help", "--version"], "Params should match input");
  assertEquals(optionsOnlyResult.options, {}, "Options should be empty");

  // 1つの引数のテスト
  const oneParamResult = parser.parse(["init"]) as OneParamResult;
  console.log("[DEBUG] oneParamResult:", oneParamResult);
  assertEquals(oneParamResult.type, "one", "One parameter should be one type");
  assertEquals(oneParamResult.params, ["init"], "Params should match input");
  assertEquals(oneParamResult.options, {}, "Options should be empty");
  assertEquals(oneParamResult.demonstrativeType, "init", "Demonstrative type should match");

  // 2つの引数のテスト
  const twoParamResult = parser.parse(["to", "project"]) as TwoParamResult;
  console.log("[DEBUG] twoParamResult:", twoParamResult);
  assertEquals(twoParamResult.type, "two", "Two parameters should be two type");
  assertEquals(twoParamResult.params, ["to", "project"], "Params should match input");
  assertEquals(twoParamResult.options, {}, "Options should be empty");
  assertEquals(twoParamResult.demonstrativeType, "to", "Demonstrative type should match");
  assertEquals(twoParamResult.layerType, "project", "Layer type should match");

  // オプション付きの2つの引数のテスト
  const twoParamWithOptionsResult = parser.parse(["to", "project", "--help", "--version"]) as TwoParamResult;
  console.log("[DEBUG] twoParamWithOptionsResult:", twoParamWithOptionsResult);
  assertEquals(twoParamWithOptionsResult.type, "two", "Two parameters with options should be two type");
  assertEquals(twoParamWithOptionsResult.params, ["to", "project", "--help", "--version"], "Params should match input");
  assertEquals(twoParamWithOptionsResult.options, {}, "Options should be empty");
  assertEquals(twoParamWithOptionsResult.demonstrativeType, "to", "Demonstrative type should match");
  assertEquals(twoParamWithOptionsResult.layerType, "project", "Layer type should match");

  // 無効な引数のテスト
  const invalidResult = parser.parse(["invalid"]);
  console.log("[DEBUG] invalidResult:", invalidResult);
  assertEquals(invalidResult.type, "error", "Invalid arguments should be error type");
  assertEquals(invalidResult.params, [], "Params should be empty for invalid input");
  assertEquals(invalidResult.options, {}, "Options should be empty for invalid input");
}); 