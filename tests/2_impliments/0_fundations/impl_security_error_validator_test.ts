import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { SecurityErrorValidator } from "../../../src/validator/security_error_validator.ts";
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

Deno.test("test_security_error_validator_implementation", () => {
  const validator = new SecurityErrorValidator(optionRule);

  // 安全なパラメータのテスト
  const safeArgs = ["test", "--option=value", "normal-param"];
  const safeResult = validator.validate(safeArgs);
  assertEquals(safeResult.isValid, true, "Safe parameters should pass validation");
  assertEquals(safeResult.validatedParams, safeArgs, "Validated params should match input");

  // 危険な文字を含むパラメータのテスト
  const dangerousArgs = [
    "test;rm -rf /",
    "test|cat /etc/passwd",
    "test&echo 'hack'",
    "test>malicious.txt",
    "test<malicious.txt",
    "test`rm -rf /`",
    "test$PATH",
    "test(rm -rf /)",
    "test{rm -rf /}",
    "test[rm -rf /]",
    "test*",
    "test?",
    "test~",
    "test!",
    "test@",
    "test#",
    "test%",
    "test^",
    "test+",
    "test=",
  ];

  dangerousArgs.forEach(arg => {
    const result = validator.validate([arg]);
    assertEquals(result.isValid, false, `Parameter with dangerous character should fail validation: ${arg}`);
    assertEquals(result.validatedParams, [], "Validated params should be empty for dangerous input");
  });

  // 複数のパラメータのテスト
  const mixedArgs = ["safe-param", "dangerous;param", "another-safe"];
  const mixedResult = validator.validate(mixedArgs);
  assertEquals(mixedResult.isValid, false, "Parameters with any dangerous character should fail validation");
  assertEquals(mixedResult.validatedParams, [], "Validated params should be empty for mixed input");
}); 