import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { CustomVariableValidator } from "../../../src/validators/custom_variable_validator.ts";
import { ErrorCode, ErrorCategory } from "../../../src/types.ts";

Deno.test("CustomVariableValidator - valid custom variable", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test=value");
  
  assertEquals(result, null);
});

Deno.test("CustomVariableValidator - valid custom variable with empty value", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test=");
  
  assertEquals(result, null);
});

Deno.test("CustomVariableValidator - valid custom variable with whitespace value", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test=   ");
  
  assertEquals(result, null);
});

Deno.test("CustomVariableValidator - valid custom variable with special characters", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test=value@123");
  
  assertEquals(result, null);
});

Deno.test("CustomVariableValidator - valid custom variable with unicode characters", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test=値");
  
  assertEquals(result, null);
});

Deno.test("CustomVariableValidator - invalid custom variable with security error", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test;ls");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result?.category, ErrorCategory.SECURITY);
});

Deno.test("CustomVariableValidator - invalid custom variable with invalid name", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test@name=value");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.INVALID_CUSTOM_VARIABLE);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - invalid custom variable with invalid format", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test value");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.INVALID_OPTION);
  assertEquals(result?.category, ErrorCategory.SYNTAX);
});

Deno.test("CustomVariableValidator - invalid custom variable without prefix", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("uv-test=value");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.INVALID_CUSTOM_VARIABLE);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - invalid custom variable with short prefix", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("-uv-test=value");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.INVALID_CUSTOM_VARIABLE);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - invalid custom variable with invalid prefix", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("---uv-test=value");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.INVALID_CUSTOM_VARIABLE);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - invalid custom variable with empty name", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--=value");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.INVALID_CUSTOM_VARIABLE);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - invalid custom variable with whitespace name", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--  =value");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.INVALID_CUSTOM_VARIABLE);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
}); 