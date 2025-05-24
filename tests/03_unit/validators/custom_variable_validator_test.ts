/**
 * Custom Variable Validator Test Suite
 * 
 * Purpose:
 * - Test validation of custom variables with --uv- prefix
 * - Verify proper handling of variable names and values
 * - Test security validation for variable input
 * - Ensure proper error handling for invalid variables
 * 
 * Design Principles:
 * 1. Test all valid variable combinations
 * 2. Verify proper error handling for invalid inputs
 * 3. Test security validation for variable input
 * 4. Ensure proper handling of empty values
 * 
 * Related Documentation:
 * - docs/validation.md: Validation strategy and rules
 * - docs/params.md: Parameter handling guidelines
 * - docs/security.md: Security validation rules
 * - docs/variables.md: Custom variable specifications
 * 
 * Test Categories:
 * 1. Valid variable tests
 * 2. Invalid variable tests
 * 3. Security validation tests
 * 4. Empty value tests
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { CustomVariableValidator } from "../../../src/validators/custom_variable_validator.ts";
import { ErrorCode, ErrorCategory } from "../../../src/types.ts";

// Valid variable tests
Deno.test("CustomVariableValidator - valid custom variable", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test=value");
  
  assertEquals(result, undefined);
});

Deno.test("CustomVariableValidator - valid custom variable with empty value", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test=");
  
  assertEquals(result, undefined);
});

// Invalid variable tests
Deno.test("CustomVariableValidator - invalid prefix", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--invalid=value");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.INVALID_CUSTOM_VARIABLE);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - missing equals sign", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.INVALID_CUSTOM_VARIABLE);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

// Security validation tests
Deno.test("CustomVariableValidator - security error in name", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test;ls=value");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result?.category, ErrorCategory.SECURITY);
});

Deno.test("CustomVariableValidator - security error in value", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test=value;ls");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result?.category, ErrorCategory.SECURITY);
});

Deno.test("CustomVariableValidator - multiple security errors", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test;ls=value&with`backtick");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result?.category, ErrorCategory.SECURITY);
});

// Empty value tests
Deno.test("CustomVariableValidator - empty string", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.INVALID_CUSTOM_VARIABLE);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("CustomVariableValidator - valid custom variable with special characters", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test=value-with-special-chars");
  
  assertEquals(result, undefined);
});

Deno.test("CustomVariableValidator - valid custom variable with numbers", () => {
  const validator = new CustomVariableValidator();
  const result = validator.validate("--uv-test=value123");
  
  assertEquals(result, undefined);
}); 