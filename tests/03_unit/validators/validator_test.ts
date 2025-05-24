/**
 * Base Validator Test Suite
 * 
 * Purpose:
 * - Test the common functionality provided by the BaseValidator class
 * - Ensure proper validation of required fields across all validator implementations
 * - Verify error handling and error message generation
 * 
 * Design Principles:
 * 1. Test the abstract base class through a concrete test implementation
 * 2. Cover all possible input types and edge cases
 * 3. Verify error codes and categories are consistent
 * 
 * Related Documentation:
 * - docs/validation.md: Validation strategy and rules
 * - docs/error_handling.md: Error handling guidelines
 * - docs/types.md: Type definitions and error codes
 * 
 * Test Categories:
 * 1. Valid input validation
 * 2. Invalid input validation (undefined, null, empty)
 * 3. Edge cases (whitespace, empty arrays)
 * 4. Type-specific validation
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { BaseValidator } from "../../../src/validators/validator.ts";
import { ErrorCode, ErrorCategory } from "../../../src/types.ts";

// Create a concrete implementation of BaseValidator for testing
// This allows us to test the abstract base class functionality
class TestValidator extends BaseValidator {
  validate(value: unknown): unknown {
    return this.validateRequired(value);
  }
}

// Valid input tests
Deno.test("BaseValidator - validateRequired with valid value", () => {
  const validator = new TestValidator();
  const result = validator.validate("test");
  
  assertEquals(result, undefined);
});

// Invalid input tests
Deno.test("BaseValidator - validateRequired with undefined", () => {
  const validator = new TestValidator();
  const result = validator.validate(undefined);
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("BaseValidator - validateRequired with null", () => {
  const validator = new TestValidator();
  const result = validator.validate(null);
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

// Edge case tests
Deno.test("BaseValidator - validateRequired with empty string", () => {
  const validator = new TestValidator();
  const result = validator.validate("");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("BaseValidator - validateRequired with whitespace string", () => {
  const validator = new TestValidator();
  const result = validator.validate("   ");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("BaseValidator - validateRequired with empty array", () => {
  const validator = new TestValidator();
  const result = validator.validate([]);
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

// Type-specific validation tests
Deno.test("BaseValidator - validateRequired with valid number", () => {
  const validator = new TestValidator();
  const result = validator.validate(123);
  
  assertEquals(result, undefined);
});

Deno.test("BaseValidator - validateRequired with valid boolean", () => {
  const validator = new TestValidator();
  const result = validator.validate(true);
  
  assertEquals(result, undefined);
});

Deno.test("BaseValidator - validateRequired with valid object", () => {
  const validator = new TestValidator();
  const result = validator.validate({ key: "value" });
  
  assertEquals(result, undefined);
}); 