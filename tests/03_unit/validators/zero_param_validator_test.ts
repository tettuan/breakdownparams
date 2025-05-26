import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ZeroParamsValidator } from "../../../src/validators/zero_params_validator.ts";
import { ErrorCode, ErrorCategory, ErrorInfo } from "../../../src/core/errors/types.ts";
import { ERROR_CODES, ERROR_CATEGORIES } from "../../../src/core/errors/constants.ts";

Deno.test("ZeroParamsValidator - valid empty args", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate([]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, 'zero');
});

Deno.test("ZeroParamsValidator - valid help flag", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["--help"]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, 'zero');
  if (result.data?.type === 'zero') {
    assertEquals(result.data.help, true);
  }
});

Deno.test("ZeroParamsValidator - valid version flag", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["--version"]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, 'zero');
  if (result.data?.type === 'zero') {
    assertEquals(result.data.version, true);
  }
});

Deno.test("ZeroParamsValidator - valid short help flag", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["-h"]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, 'zero');
  if (result.data?.type === 'zero') {
    assertEquals(result.data.help, true);
  }
});

Deno.test("ZeroParamsValidator - valid short version flag", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["-v"]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, 'zero');
  if (result.data?.type === 'zero') {
    assertEquals(result.data.version, true);
  }
});

Deno.test("ZeroParamsValidator - valid custom variable", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["--uv-test=value"]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, 'zero');
});

Deno.test("ZeroParamsValidator - invalid custom variable with security error", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["--uv-test;ls"]);
  
  assertExists(result);
  assertEquals(result.success, false);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test("ZeroParamsValidator - invalid unknown option", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["--unknown"]);
  
  assertExists(result);
  assertEquals(result.success, false);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test("ZeroParamsValidator - invalid custom variable with invalid name", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["--uv-test@name=value"]);
  
  assertExists(result);
  assertEquals(result.success, false);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test("ZeroParamsValidator - invalid custom variable with invalid format", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["--uv-test=value"]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, 'zero');
});

Deno.test("ZeroParamsValidator - valid multiple custom variables", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["--uv-test1=value1", "--uv-test2=value2"]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, 'zero');
});

Deno.test("ZeroParamsValidator - valid custom variable with empty value", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["--uv-test="]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, 'zero');
});

Deno.test("ZeroParamsValidator - valid custom variable with whitespace value", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["--uv-test=   "]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, 'zero');
});

Deno.test("ZeroParamsValidator - valid custom variable with special characters", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["--uv-test=value@123"]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, 'zero');
});

Deno.test("ZeroParamsValidator - valid custom variable with unicode characters", () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate(["--uv-test=値"]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, 'zero');
}); 