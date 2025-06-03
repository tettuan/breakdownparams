import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../../../src/parser/params_parser.ts";
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

Deno.test("test_parser_validator_integration", () => {
  const parser = new ParamsParser(optionRule);

  // バリデーターの作成と検証
  const validators = parser["createValidators"](optionRule);
  assertEquals(validators.length, 5, "Should create 5 validators");
  assertEquals(validators[0] instanceof SecurityErrorValidator, true, "First validator should be SecurityErrorValidator");
  assertEquals(validators[1] instanceof OptionsValidator, true, "Second validator should be OptionsValidator");
  assertEquals(validators[2] instanceof ZeroParamsValidator, true, "Third validator should be ZeroParamsValidator");
  assertEquals(validators[3] instanceof OneParamValidator, true, "Fourth validator should be OneParamValidator");
  assertEquals(validators[4] instanceof TwoParamValidator, true, "Fifth validator should be TwoParamValidator");

  // 各バリデーターの統合テスト
  // 1. セキュリティエラーバリデーター
  const securityResult = validators[0].validate(["safe;command"]);
  assertEquals(securityResult.isValid, false, "Security validator should reject dangerous commands");

  // 2. オプションバリデーター
  const optionsResult = validators[1].validate(["--help", "--version"]);
  assertEquals(optionsResult.isValid, true, "Options validator should accept valid options");

  // 3. ゼロパラメータバリデーター
  const zeroParamsResult = validators[2].validate(["--help"]);
  assertEquals(zeroParamsResult.isValid, true, "Zero params validator should accept options only");

  // 4. 1パラメータバリデーター
  const oneParamResult = validators[3].validate(["init"]);
  assertEquals(oneParamResult.isValid, true, "One param validator should accept init command");

  // 5. 2パラメータバリデーター
  const twoParamsResult = validators[4].validate(["to", "project"]);
  assertEquals(twoParamsResult.isValid, true, "Two params validator should accept valid parameters");

  // パーサーとバリデーターの統合テスト
  // 1. ゼロパラメータケース
  const zeroParamsParseResult = parser.parse(["--help"]);
  assertEquals(zeroParamsParseResult.type, "zero", "Should parse as zero params");
  assertEquals(zeroParamsParseResult.params, ["--help"], "Should include help option");

  // 2. 1パラメータケース
  const oneParamParseResult = parser.parse(["init"]);
  assertEquals(oneParamParseResult.type, "one", "Should parse as one param");
  assertEquals(oneParamParseResult.params, ["init"], "Should include init command");

  // 3. 2パラメータケース
  const twoParamsParseResult = parser.parse(["to", "project"]);
  assertEquals(twoParamsParseResult.type, "two", "Should parse as two params");
  assertEquals(twoParamsParseResult.params, ["to", "project"], "Should include both parameters");

  // 4. エラーケース
  const errorParseResult = parser.parse(["invalid", "command"]);
  assertEquals(errorParseResult.type, "error", "Should parse as error");
  assertEquals(errorParseResult.params, [], "Should have empty params for error");
  assertEquals(typeof errorParseResult.error, "object", "Should have error object");

  // 5. 複合ケース
  const complexParseResult = parser.parse(["to", "project", "--help", "--version"]);
  assertEquals(complexParseResult.type, "two", "Should parse as two params with options");
  assertEquals(complexParseResult.params.length, 4, "Should include all parameters and options");
}); 