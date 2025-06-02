import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { OptionRule } from "../../src/result/types.ts";

Deno.test("test_option_rule_structure", () => {
  const rule: OptionRule = {
    format: "--key=value",
    validation: {
      customVariables: ["--demonstrative-type", "--layer-type"],
      emptyValue: "error",
      unknownOption: "error",
      duplicateOption: "error",
      requiredOptions: [],
      valueTypes: ["string"],
    },
    specialCases: {
      "--help": "help",
      "--version": "version",
    },
  };

  // 基本構造のテスト
  assertEquals(typeof rule.format, "string", "format should be a string");
  assertEquals(typeof rule.validation, "object", "validation should be an object");
  assertEquals(typeof rule.specialCases, "object", "specialCases should be an object");

  // バリデーション設定のテスト
  assertEquals(Array.isArray(rule.validation.customVariables), true, "customVariables should be an array");
  assertEquals(typeof rule.validation.emptyValue, "string", "emptyValue should be a string");
  assertEquals(typeof rule.validation.unknownOption, "string", "unknownOption should be a string");
  assertEquals(typeof rule.validation.duplicateOption, "string", "duplicateOption should be a string");
  assertEquals(Array.isArray(rule.validation.requiredOptions), true, "requiredOptions should be an array");
  assertEquals(Array.isArray(rule.validation.valueTypes), true, "valueTypes should be an array");

  // 特殊ケースのテスト
  assertEquals(typeof rule.specialCases["--help"], "string", "special case value should be a string");
  assertEquals(typeof rule.specialCases["--version"], "string", "special case value should be a string");
}); 