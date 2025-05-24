import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { RequiredFieldValidator } from "../../../src/validators/required_field_validator.ts";
import { ErrorCode, ErrorCategory } from "../../../src/types.ts";

Deno.test("RequiredFieldValidator - valid non-empty string", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate("test", "field");
  
  assertEquals(result, null);
});

Deno.test("RequiredFieldValidator - valid non-empty number", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate(123, "field");
  
  assertEquals(result, null);
});

Deno.test("RequiredFieldValidator - valid non-empty boolean", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate(true, "field");
  
  assertEquals(result, null);
});

Deno.test("RequiredFieldValidator - valid non-empty object", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate({ key: "value" }, "field");
  
  assertEquals(result, null);
});

Deno.test("RequiredFieldValidator - valid non-empty array", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate([1, 2, 3], "field");
  
  assertEquals(result, null);
});

Deno.test("RequiredFieldValidator - invalid empty string", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate("", "field");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
  assertEquals(result?.message, "field is required");
});

Deno.test("RequiredFieldValidator - invalid whitespace string", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate("   ", "field");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
  assertEquals(result?.message, "field is required");
});

Deno.test("RequiredFieldValidator - invalid null", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate(null, "field");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
  assertEquals(result?.message, "field is required");
});

Deno.test("RequiredFieldValidator - invalid undefined", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate(undefined, "field");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
  assertEquals(result?.message, "field is required");
});

Deno.test("RequiredFieldValidator - invalid empty object", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate({}, "field");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
  assertEquals(result?.message, "field is required");
});

Deno.test("RequiredFieldValidator - invalid empty array", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate([], "field");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
  assertEquals(result?.message, "field is required");
});

Deno.test("RequiredFieldValidator - invalid zero", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate(0, "field");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
  assertEquals(result?.message, "field is required");
});

Deno.test("RequiredFieldValidator - invalid false", () => {
  const validator = new RequiredFieldValidator();
  const result = validator.validate(false, "field");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result?.category, ErrorCategory.VALIDATION);
  assertEquals(result?.message, "field is required");
}); 