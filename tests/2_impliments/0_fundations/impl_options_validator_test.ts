import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { OptionsValidator } from "../../../src/validator/options_validator.ts";
import { OptionRule } from "../../../src/result/types.ts";

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

Deno.test("test_options_validator_implementation", () => {
  const validator = new OptionsValidator(optionRule);

  // 有効なオプションのテスト
  const validArgs = [
    "--demonstrative-type=to",
    "--layer-type=project",
    "--help",
    "--version",
  ];
  const validResult = validator.validate(validArgs);
  assertEquals(validResult.isValid, true, "Valid options should pass validation");
  assertEquals(validResult.validatedParams, validArgs, "Validated params should match input");

  // 空の値を持つオプションのテスト
  const emptyValueArgs = ["--option="];
  const emptyValueResult = validator.validate(emptyValueArgs);
  assertEquals(emptyValueResult.isValid, false, "Options with empty values should fail validation");
  assertEquals(emptyValueResult.validatedParams, [], "Validated params should be empty for invalid input");

  // 未知のオプションのテスト
  const unknownArgs = ["--unknown-option=value"];
  const unknownResult = validator.validate(unknownArgs);
  assertEquals(unknownResult.isValid, false, "Unknown options should fail validation");
  assertEquals(unknownResult.validatedParams, [], "Validated params should be empty for invalid input");

  // 重複したオプションのテスト
  const duplicateArgs = [
    "--demonstrative-type=to",
    "--demonstrative-type=summary",
  ];
  const duplicateResult = validator.validate(duplicateArgs);
  assertEquals(duplicateResult.isValid, false, "Duplicate options should fail validation");
  assertEquals(duplicateResult.validatedParams, [], "Validated params should be empty for invalid input");

  // 特殊ケースのテスト
  const specialCaseArgs = ["--help", "--version"];
  const specialCaseResult = validator.validate(specialCaseArgs);
  assertEquals(specialCaseResult.isValid, true, "Special case options should pass validation");
  assertEquals(specialCaseResult.validatedParams, specialCaseArgs, "Validated params should match input");

  // 混合ケースのテスト
  const mixedArgs = [
    "--demonstrative-type=to",
    "--unknown-option=value",
    "--help",
  ];
  const mixedResult = validator.validate(mixedArgs);
  assertEquals(mixedResult.isValid, false, "Mixed valid and invalid options should fail validation");
  assertEquals(mixedResult.validatedParams, [], "Validated params should be empty for invalid input");
}); 