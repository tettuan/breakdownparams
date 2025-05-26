import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { ResultFactory } from "../../src/core/errors/result_factory.ts";
import { ErrorCode, ErrorCategory } from "../../src/core/errors/types.ts";

Deno.test("ResultFactory - createResult", () => {
  const result = ResultFactory.createResult(true, { data: "test" });
  assertEquals(result.success, true);
  assertEquals(result.data, { data: "test" });
  assertEquals(result.error, undefined);
});

Deno.test("ResultFactory - createParamResult", () => {
  const args = ["arg1", "arg2"];
  const result = ResultFactory.createParamResult(true, args, { data: "test" });
  assertEquals(result.success, true);
  assertEquals(result.args, args);
  assertEquals(result.data, { data: "test" });
  assertEquals(result.error, undefined);
});

Deno.test("ResultFactory - createParseResult", () => {
  const args = ["arg1", "arg2"];
  const result = ResultFactory.createParseResult(true, args, { data: "test" });
  assertEquals(result.success, true);
  assertEquals(result.args, args);
  assertEquals(result.data, { data: "test" });
  assertEquals(result.error, undefined);
});

Deno.test("ResultFactory - createValidationResult", () => {
  const args = ["arg1", "arg2"];
  const result = ResultFactory.createValidationResult(true, args, { data: "test" });
  assertEquals(result.success, true);
  assertEquals(result.args, args);
  assertEquals(result.data, { data: "test" });
  assertEquals(result.error, undefined);
});

Deno.test("ResultFactory - createBusinessRuleResult", () => {
  const args = ["arg1", "arg2"];
  const result = ResultFactory.createBusinessRuleResult(true, args, { data: "test" });
  assertEquals(result.success, true);
  assertEquals(result.args, args);
  assertEquals(result.data, { data: "test" });
  assertEquals(result.error, undefined);
});

Deno.test("ResultFactory - createError", () => {
  const error = ResultFactory.createError(
    "Test error",
    ErrorCode.INVALID_FORMAT,
    ErrorCategory.VALIDATION,
    { detail: "test" }
  );
  assertEquals(error.message, "Test error");
  assertEquals(error.code, ErrorCode.INVALID_FORMAT);
  assertEquals(error.category, ErrorCategory.VALIDATION);
  assertEquals(error.details, { detail: "test" });
});

Deno.test("ResultFactory - createParseError", () => {
  const error = ResultFactory.createParseError(
    "Parse error",
    ErrorCode.INVALID_FORMAT,
    1,
    "expected"
  );
  assertEquals(error.message, "Parse error");
  assertEquals(error.code, ErrorCode.INVALID_FORMAT);
  assertEquals(error.category, ErrorCategory.SYNTAX);
  assertEquals(error.details, { position: 1, expected: "expected" });
});

Deno.test("ResultFactory - createValidationError", () => {
  const provided = ["value1", "value2"];
  const error = ResultFactory.createValidationError(
    "Validation error",
    ErrorCode.TYPE_MISMATCH,
    provided,
    "expected"
  );
  assertEquals(error.message, "Validation error");
  assertEquals(error.code, ErrorCode.TYPE_MISMATCH);
  assertEquals(error.category, ErrorCategory.VALIDATION);
  assertEquals(error.details, { provided, expected: "expected" });
});

Deno.test("ResultFactory - createBusinessRuleError", () => {
  const error = ResultFactory.createBusinessRuleError(
    "Business rule error",
    ErrorCode.BUSINESS_RULE_VIOLATION,
    "rule1",
    { context: "test" }
  );
  assertEquals(error.message, "Business rule error");
  assertEquals(error.code, ErrorCode.BUSINESS_RULE_VIOLATION);
  assertEquals(error.category, ErrorCategory.BUSINESS);
  assertEquals(error.details, { context: { context: "test" } });
  assertEquals(error.rule, "rule1");
});

Deno.test("ResultFactory - error handling in results", () => {
  const error = ResultFactory.createError(
    "Test error",
    ErrorCode.INVALID_FORMAT,
    ErrorCategory.VALIDATION
  );
  
  const result = ResultFactory.createResult(false, undefined, error);
  assertEquals(result.success, false);
  assertEquals(result.data, undefined);
  assertExists(result.error);
  assertEquals(result.error, error);
}); 