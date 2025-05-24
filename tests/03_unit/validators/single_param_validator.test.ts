import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { SingleParamValidator } from "../../../src/validators/single_param_validator.ts";
import { ErrorCode, ErrorCategory, ErrorInfo } from "../../../src/types.ts";

Deno.test("SingleParamValidator - valid init command", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", []);
  
  assertEquals(result, null);
});

Deno.test("SingleParamValidator - invalid command", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("invalid", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_COMMAND);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("SingleParamValidator - empty command", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("SingleParamValidator - command with security error", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init;ls", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.SECURITY_ERROR);
  assertEquals(error.category, ErrorCategory.SECURITY);
});

Deno.test("SingleParamValidator - valid command with help flag", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--help"]);
  
  assertEquals(result, null);
});

Deno.test("SingleParamValidator - valid command with version flag", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--version"]);
  
  assertEquals(result, null);
});

Deno.test("SingleParamValidator - valid command with custom variable", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--uv-test=value"]);
  
  assertEquals(result, null);
});

Deno.test("SingleParamValidator - valid command with invalid custom variable", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--uv-test;ls"]);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.SECURITY_ERROR);
  assertEquals(error.category, ErrorCategory.SECURITY);
});

Deno.test("SingleParamValidator - valid command with unknown option", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--unknown"]);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.UNKNOWN_OPTION);
  assertEquals(error.category, ErrorCategory.SYNTAX);
});

Deno.test("SingleParamValidator - command with whitespace", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("  init  ", []);
  
  assertEquals(result, null);
});

Deno.test("SingleParamValidator - command with mixed case", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("InIt", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_COMMAND);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("SingleParamValidator - command with unicode characters", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init値", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_COMMAND);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("SingleParamValidator - command with special characters", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init@123", []);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_COMMAND);
  assertEquals(error.category, ErrorCategory.VALIDATION);
});

Deno.test("SingleParamValidator - command with multiple options", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", [
    "--from=src",
    "--destination=dist",
    "--uv-test1=value1",
    "--uv-test2=value2"
  ]);
  
  assertEquals(result, null);
});

Deno.test("SingleParamValidator - command with empty option value", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--from="]);
  
  assertEquals(result, null);
});

Deno.test("SingleParamValidator - command with whitespace option value", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--from=   "]);
  
  assertEquals(result, null);
});

Deno.test("SingleParamValidator - command with invalid option format", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--from src"]);
  
  assertExists(result);
  const error = result?.error as ErrorInfo;
  assertEquals(error.code, ErrorCode.INVALID_OPTION);
  assertEquals(error.category, ErrorCategory.SYNTAX);
}); 