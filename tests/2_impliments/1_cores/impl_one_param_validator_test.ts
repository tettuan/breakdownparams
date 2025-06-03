import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { OneParamValidator } from "../../../src/validator/one_param_validator.ts";
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

Deno.test("test_one_param_validator_implementation", () => {
  const validator = new OneParamValidator(optionRule);

  // 有効なパラメータのテスト
  const validArgs = ["init"];
  const validResult = validator.validate(validArgs);
  assertEquals(validResult.isValid, true, "Valid parameter should pass validation");
  assertEquals(validResult.validatedParams, validArgs, "Validated params should match input");

  // 無効なパラメータのテスト
  const invalidArgs = ["invalid"];
  const invalidResult = validator.validate(invalidArgs);
  assertEquals(invalidResult.isValid, false, "Invalid parameter should fail validation");
  assertEquals(invalidResult.validatedParams, [], "Validated params should be empty for invalid input");

  // 空の引数のテスト
  const emptyArgs: string[] = [];
  const emptyResult = validator.validate(emptyArgs);
  assertEquals(emptyResult.isValid, false, "Empty arguments should fail validation");
  assertEquals(emptyResult.validatedParams, [], "Validated params should be empty for empty input");

  // 複数の引数のテスト
  const multipleArgs = ["init", "to"];
  const multipleResult = validator.validate(multipleArgs);
  assertEquals(multipleResult.isValid, false, "Multiple arguments should fail validation");
  assertEquals(multipleResult.validatedParams, [], "Validated params should be empty for invalid input");

  // オプション付きのテスト
  const withOptionsArgs = ["init", "--help"];
  const withOptionsResult = validator.validate(withOptionsArgs);
  assertEquals(withOptionsResult.isValid, false, "Arguments with options should fail validation");
  assertEquals(withOptionsResult.validatedParams, [], "Validated params should be empty for invalid input");
}); 