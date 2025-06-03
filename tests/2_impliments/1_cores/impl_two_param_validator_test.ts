import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { TwoParamValidator } from "../../../src/validator/two_param_validator.ts";
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

Deno.test("test_two_param_validator_implementation", () => {
  const validator = new TwoParamValidator(optionRule);

  // 有効なパラメータのテスト
  const validArgs = ["to", "project"];
  const validResult = validator.validate(validArgs);
  assertEquals(validResult.isValid, true, "Valid parameters should pass validation");
  assertEquals(validResult.validatedParams, validArgs, "Validated params should match input");
  assertEquals(validResult.demonstrativeType, "to", "Demonstrative type should match");
  assertEquals(validResult.layerType, "project", "Layer type should match");

  // 無効なパラメータのテスト
  const invalidArgs = ["invalid", "invalid"];
  const invalidResult = validator.validate(invalidArgs);
  assertEquals(invalidResult.isValid, false, "Invalid parameters should fail validation");
  assertEquals(invalidResult.validatedParams, [], "Validated params should be empty for invalid input");

  // 空の引数のテスト
  const emptyArgs: string[] = [];
  const emptyResult = validator.validate(emptyArgs);
  assertEquals(emptyResult.isValid, false, "Empty arguments should fail validation");
  assertEquals(emptyResult.validatedParams, [], "Validated params should be empty for empty input");

  // 1つの引数のテスト
  const singleArg = ["to"];
  const singleResult = validator.validate(singleArg);
  assertEquals(singleResult.isValid, false, "Single argument should fail validation");
  assertEquals(singleResult.validatedParams, [], "Validated params should be empty for invalid input");

  // 3つの引数のテスト
  const tripleArgs = ["to", "project", "extra"];
  const tripleResult = validator.validate(tripleArgs);
  assertEquals(tripleResult.isValid, false, "Three arguments should fail validation");
  assertEquals(tripleResult.validatedParams, [], "Validated params should be empty for invalid input");

  // オプション付きのテスト
  const withOptionsArgs = ["to", "project", "--help"];
  const withOptionsResult = validator.validate(withOptionsArgs);
  assertEquals(withOptionsResult.isValid, false, "Arguments with options should fail validation");
  assertEquals(withOptionsResult.validatedParams, [], "Validated params should be empty for invalid input");
}); 