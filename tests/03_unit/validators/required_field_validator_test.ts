/**
 * Required Field Validator Test Suite
 * 
 * Purpose:
 * - Test validation of required fields in various contexts
 * - Verify proper handling of different field types
 * - Test handling of empty and undefined values
 * - Ensure proper error handling for missing required fields
 * 
 * Design Principles:
 * 1. Test all field type validations
 * 2. Verify proper error handling for missing fields
 * 3. Test handling of edge cases
 * 4. Ensure comprehensive type coverage
 * 
 * Related Documentation:
 * - docs/validation.md: Validation strategy and rules
 * - docs/params.md: Parameter handling guidelines
 * - docs/types.md: Field type definitions
 * 
 * Test Categories:
 * 1. String field tests
 * 2. Number field tests
 * 3. Boolean field tests
 * 4. Object field tests
 * 5. Edge case tests
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { RequiredFieldValidator } from "../../../src/validators/required_field_validator.ts";
import { ErrorCode, ErrorCategory } from "../../../src/types.ts";

// String field tests
Deno.test("RequiredFieldValidator - valid string field", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate("test", "fieldName");
  
  assertEquals(result, undefined);
});

Deno.test("RequiredFieldValidator - empty string field", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate("", "fieldName");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("RequiredFieldValidator - whitespace string field", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate("   ", "fieldName");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

// Number field tests
Deno.test("RequiredFieldValidator - valid number field", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate(42, "fieldName");
  
  assertEquals(result, undefined);
});

Deno.test("RequiredFieldValidator - zero number field", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate(0, "fieldName");
  
  assertEquals(result, undefined);
});

// Boolean field tests
Deno.test("RequiredFieldValidator - valid boolean field", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate(true, "fieldName");
  
  assertEquals(result, undefined);
});

Deno.test("RequiredFieldValidator - false boolean field", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate(false, "fieldName");
  
  assertEquals(result, undefined);
});

// Object field tests
Deno.test("RequiredFieldValidator - valid object field", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate({ key: "value" }, "fieldName");
  
  assertEquals(result, undefined);
});

Deno.test("RequiredFieldValidator - empty object field", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate({}, "fieldName");
  
  assertEquals(result, undefined);
});

// Edge case tests
Deno.test("RequiredFieldValidator - undefined field", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate(undefined, "fieldName");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("RequiredFieldValidator - null field", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate(null, "fieldName");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
});

Deno.test("RequiredFieldValidator - empty array field", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate([], "fieldName");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
}); 