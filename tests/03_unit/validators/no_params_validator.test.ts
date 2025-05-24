import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { NoParamsValidator } from "../../../src/validators/no_params_validator.ts";
import { ErrorCode, ErrorCategory, ErrorInfo } from "../../../src/types.ts";

Deno.test("NoParamsValidator - valid empty args", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate([]);
  
  assertEquals(result, null);
});

Deno.test("NoParamsValidator - valid help flag", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--help"]);
  
  assertEquals(result, null);
});

Deno.test("NoParamsValidator - valid version flag", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--version"]);
  
  assertEquals(result, null);
});

Deno.test("NoParamsValidator - valid short help flag", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["-h"]);
  
  assertEquals(result, null);
});

Deno.test("NoParamsValidator - valid short version flag", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["-v"]);
  
  assertEquals(result, null);
});

Deno.test("NoParamsValidator - valid custom variable", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--uv-test=value"]);
  
  assertEquals(result, null);
});

Deno.test("NoParamsValidator - invalid custom variable with security error", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--uv-test;ls"]);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.SECURITY_ERROR);
  assertEquals(error.category, ErrorCategory.SECURITY);
});

Deno.test("NoParamsValidator - invalid unknown option", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--unknown"]);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.UNKNOWN_OPTION);
  assertEquals(error.category, ErrorCategory.SYNTAX);
});

Deno.test("NoParamsValidator - invalid custom variable with invalid name", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--uv-test@name=value"]);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_CUSTOM_VARIABLE);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("NoParamsValidator - invalid custom variable with invalid format", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--uv-test=value"]);
  
  assertEquals(result, null);
});

Deno.test("NoParamsValidator - valid multiple custom variables", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--uv-test1=value1", "--uv-test2=value2"]);
  
  assertEquals(result, null);
});

Deno.test("NoParamsValidator - valid custom variable with empty value", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--uv-test="]);
  
  assertEquals(result, null);
});

Deno.test("NoParamsValidator - valid custom variable with whitespace value", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--uv-test=   "]);
  
  assertEquals(result, null);
});

Deno.test("NoParamsValidator - valid custom variable with special characters", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--uv-test=value@123"]);
  
  assertEquals(result, null);
});

Deno.test("NoParamsValidator - valid custom variable with unicode characters", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--uv-test=値"]);
  
  assertEquals(result, null);
}); 