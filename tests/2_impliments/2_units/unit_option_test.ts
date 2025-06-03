import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { OptionRule } from "../../../src/result/types.ts";

Deno.test("test_option_rule", () => {
  // オプションルールのテスト
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

  assertEquals(typeof optionRule.format, "string", "format should be a string");
  assertEquals(Array.isArray(optionRule.validation.customVariables), true, "customVariables should be an array");
  assertEquals(typeof optionRule.validation.emptyValue, "string", "emptyValue should be a string");
  assertEquals(typeof optionRule.validation.unknownOption, "string", "unknownOption should be a string");
  assertEquals(typeof optionRule.validation.duplicateOption, "string", "duplicateOption should be a string");
  assertEquals(Array.isArray(optionRule.validation.requiredOptions), true, "requiredOptions should be an array");
  assertEquals(Array.isArray(optionRule.validation.valueTypes), true, "valueTypes should be an array");
  assertEquals(typeof optionRule.specialCases, "object", "specialCases should be an object");
}); 