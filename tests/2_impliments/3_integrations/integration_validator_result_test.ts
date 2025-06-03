import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { SecurityErrorValidator } from "../../../src/validator/security_error_validator.ts";
import { OptionsValidator } from "../../../src/validator/options_validator.ts";
import { ZeroParamsValidator } from "../../../src/validator/zero_params_validator.ts";
import { OneParamValidator } from "../../../src/validator/one_param_validator.ts";
import { TwoParamValidator } from "../../../src/validator/two_param_validator.ts";
import { OptionRule } from "../../../src/result/types.ts";

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

Deno.test("test_validator_result_integration", () => {
  // セキュリティエラーバリデーターの結果テスト
  const securityValidator = new SecurityErrorValidator(optionRule);
  const securityResult = securityValidator.validate(["safe;command"]);
  assertEquals(securityResult.isValid, false, "Security validation should fail for dangerous command");
  assertEquals(securityResult.validatedParams, [], "Validated params should be empty for security error");
  assertEquals(typeof securityResult.errorMessage, "string", "Should have error message");
  assertEquals(typeof securityResult.errorCode, "string", "Should have error code");
  assertEquals(typeof securityResult.errorCategory, "string", "Should have error category");

  // オプションバリデーターの結果テスト
  const optionsValidator = new OptionsValidator(optionRule);
  const optionsResult = optionsValidator.validate(["--help", "--version"]);
  assertEquals(optionsResult.isValid, true, "Options validation should pass for valid options");
  assertEquals(optionsResult.validatedParams, ["--help", "--version"], "Validated params should match input");

  // ゼロパラメータバリデーターの結果テスト
  const zeroParamsValidator = new ZeroParamsValidator(optionRule);
  const zeroParamsResult = zeroParamsValidator.validate(["--help"]);
  assertEquals(zeroParamsResult.isValid, true, "Zero params validation should pass for options only");
  assertEquals(zeroParamsResult.validatedParams, ["--help"], "Validated params should match input");

  // 1パラメータバリデーターの結果テスト
  const oneParamValidator = new OneParamValidator(optionRule);
  const oneParamResult = oneParamValidator.validate(["init"]);
  assertEquals(oneParamResult.isValid, true, "One param validation should pass for init command");
  assertEquals(oneParamResult.validatedParams, ["init"], "Validated params should match input");

  // 2パラメータバリデーターの結果テスト
  const twoParamsValidator = new TwoParamValidator(optionRule);
  const twoParamsResult = twoParamsValidator.validate(["to", "project"]);
  assertEquals(twoParamsResult.isValid, true, "Two params validation should pass for valid parameters");
  assertEquals(twoParamsResult.validatedParams, ["to", "project"], "Validated params should match input");

  // エラーケースの結果テスト
  const invalidOptionsResult = optionsValidator.validate(["--invalid-option"]);
  assertEquals(invalidOptionsResult.isValid, false, "Options validation should fail for invalid option");
  assertEquals(invalidOptionsResult.validatedParams, [], "Validated params should be empty for invalid option");
  assertEquals(typeof invalidOptionsResult.errorMessage, "string", "Should have error message");
  assertEquals(typeof invalidOptionsResult.errorCode, "string", "Should have error code");
  assertEquals(typeof invalidOptionsResult.errorCategory, "string", "Should have error category");

  // 複合ケースの結果テスト
  const complexResult = twoParamsValidator.validate(["to", "project", "--help", "--version"]);
  assertEquals(complexResult.isValid, true, "Complex validation should pass for valid parameters and options");
  assertEquals(complexResult.validatedParams, ["to", "project", "--help", "--version"], "Validated params should match input");

  // エラー詳細のテスト
  const errorResult = securityValidator.validate(["dangerous;command"]);
  assertEquals(errorResult.isValid, false, "Validation should fail for dangerous command");
  assertEquals(typeof errorResult.errorDetails, "object", "Should have error details");
  assertEquals(errorResult.errorDetails?.command, "dangerous;command", "Error details should include command");
}); 