import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { DoubleParamsValidator } from "../../../src/validators/double_params_validator.ts";
import { ErrorCode, ErrorCategory, ErrorInfo } from "../../../src/types.ts";

Deno.test("DoubleParamsValidator - valid standard mode params", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", []);
  
  assertEquals(result, null);
});

Deno.test("DoubleParamsValidator - valid extended mode params", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("custom", "custom", []);
  
  assertEquals(result, null);
});

Deno.test("DoubleParamsValidator - invalid demonstrative type", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("invalid", "project", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_DEMONSTRATIVE_TYPE);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - invalid layer type", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "invalid", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_LAYER_TYPE);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - empty demonstrative type", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("", "project", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - empty layer type", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - security error in demonstrative type", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to;ls", "project", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.SECURITY_ERROR);
  assertEquals(error.category, ErrorCategory.SECURITY);
});

Deno.test("DoubleParamsValidator - security error in layer type", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project;ls", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.SECURITY_ERROR);
  assertEquals(error.category, ErrorCategory.SECURITY);
});

Deno.test("DoubleParamsValidator - valid params with help flag", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--help"]);
  
  assertEquals(result, null);
});

Deno.test("DoubleParamsValidator - valid params with version flag", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--version"]);
  
  assertEquals(result, null);
});

Deno.test("DoubleParamsValidator - valid params with custom variable", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--uv-test=value"]);
  
  assertEquals(result, null);
});

Deno.test("DoubleParamsValidator - valid params with invalid custom variable", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--uv-test;ls"]);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.SECURITY_ERROR);
  assertEquals(error.category, ErrorCategory.SECURITY);
});

Deno.test("DoubleParamsValidator - valid params with unknown option", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--unknown"]);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.UNKNOWN_OPTION);
  assertEquals(error.category, ErrorCategory.SYNTAX);
});

Deno.test("DoubleParamsValidator - demonstrative type with whitespace", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("  to  ", "project", []);
  
  assertEquals(result, null);
});

Deno.test("DoubleParamsValidator - layer type with whitespace", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "  project  ", []);
  
  assertEquals(result, null);
});

Deno.test("DoubleParamsValidator - demonstrative type with mixed case", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("To", "project", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_DEMONSTRATIVE_TYPE);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - layer type with mixed case", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "Project", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_LAYER_TYPE);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - demonstrative type with unicode characters", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to値", "project", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_DEMONSTRATIVE_TYPE);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - layer type with unicode characters", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project値", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_LAYER_TYPE);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - demonstrative type with special characters", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to@123", "project", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_DEMONSTRATIVE_TYPE);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - layer type with special characters", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project@123", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_LAYER_TYPE);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - valid params with multiple options", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", [
    "--from=src",
    "--destination=dist",
    "--uv-test1=value1",
    "--uv-test2=value2"
  ]);
  
  assertEquals(result, null);
});

Deno.test("DoubleParamsValidator - valid params with empty option value", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--from="]);
  
  assertEquals(result, null);
});

Deno.test("DoubleParamsValidator - valid params with whitespace option value", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--from=   "]);
  
  assertEquals(result, null);
});

Deno.test("DoubleParamsValidator - valid params with invalid option format", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--from src"]);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_OPTION);
  assertEquals(error.category, ErrorCategory.SYNTAX);
}); 