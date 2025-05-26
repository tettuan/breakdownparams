import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { CustomVariableValidator } from "../../../src/validators/custom_variable_validator.ts";
import { ErrorCode, ErrorCategory } from "../../../src/core/errors/types.ts";

Deno.test("CustomVariableValidator - valid custom variable", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["--uv-test=value"]);
  
  assertEquals(result.success, true);
});

Deno.test("CustomVariableValidator - valid custom variable with empty value", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["--uv-test="]);
  
  assertEquals(result.success, true);
});

Deno.test("CustomVariableValidator - valid custom variable with whitespace value", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["--uv-test=   "]);
  
  assertEquals(result.success, true);
});

Deno.test("CustomVariableValidator - valid custom variable with special characters", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["--uv-test=value@123"]);
  
  assertEquals(result.success, true);
});

Deno.test("CustomVariableValidator - valid custom variable with unicode characters", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["--uv-test=値"]);
  
  assertEquals(result.success, true);
});

Deno.test("CustomVariableValidator - invalid custom variable with security error", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["--uv-test;ls"]);
  
  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.VALIDATION_ERROR);
  assertEquals(result.error.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - invalid custom variable with invalid name", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["--uv-test@name=value"]);
  
  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.VALIDATION_ERROR);
  assertEquals(result.error.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - invalid custom variable with invalid format", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["--uv-test value"]);
  
  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.VALIDATION_ERROR);
  assertEquals(result.error.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - invalid custom variable without prefix", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["uv-test=value"]);
  
  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.VALIDATION_ERROR);
  assertEquals(result.error.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - invalid custom variable with short prefix", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["-uv-test=value"]);
  
  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.VALIDATION_ERROR);
  assertEquals(result.error.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - invalid custom variable with invalid prefix", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["---uv-test=value"]);
  
  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.VALIDATION_ERROR);
  assertEquals(result.error.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - invalid custom variable with empty name", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["--=value"]);
  
  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.VALIDATION_ERROR);
  assertEquals(result.error.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - invalid custom variable with whitespace name", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate(["--  =value"]);
  
  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.VALIDATION_ERROR);
  assertEquals(result.error.category, ErrorCategory.VALIDATION);
}); 