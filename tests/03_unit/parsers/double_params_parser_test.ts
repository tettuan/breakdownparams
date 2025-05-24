import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { DoubleParamsParser } from "../../../src/parsers/double_params_parser.ts";
import { ValidatorFactory } from "../../../src/validators/validator_factory.ts";
import { ErrorCode, ErrorCategory } from "../../../src/types.ts";

Deno.test("DoubleParamsParser - valid standard mode params", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsParser - valid extended mode params", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("custom", "custom", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "custom");
  assertEquals(result.layerType, "custom");
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsParser - invalid demonstrative type", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("invalid", "project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "invalid");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_DEMONSTRATIVE_TYPE);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsParser - invalid layer type", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "invalid", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "invalid");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_LAYER_TYPE);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsParser - empty demonstrative type", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("", "project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsParser - empty layer type", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsParser - security error in demonstrative type", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to;ls", "project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to;ls");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error?.category, ErrorCategory.SECURITY);
});

Deno.test("DoubleParamsParser - security error in layer type", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project;ls", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project;ls");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error?.category, ErrorCategory.SECURITY);
});

Deno.test("DoubleParamsParser - valid params with help flag", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project", ["--help"]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsParser - valid params with version flag", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project", ["--version"]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsParser - valid params with custom variable", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project", ["--uv-test=value"]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsParser - valid params with invalid custom variable", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project", ["--uv-test;ls"]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error?.category, ErrorCategory.SECURITY);
});

Deno.test("DoubleParamsParser - valid params with unknown option", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project", ["--unknown"]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.UNKNOWN_OPTION);
  assertEquals(result.error?.category, ErrorCategory.SYNTAX);
});

// 追加のテストケース
Deno.test("DoubleParamsParser - demonstrative type with whitespace", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("  to  ", "project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsParser - layer type with whitespace", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "  project  ", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsParser - demonstrative type with mixed case", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("To", "project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "To");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_DEMONSTRATIVE_TYPE);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsParser - layer type with mixed case", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "Project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "Project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_LAYER_TYPE);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsParser - demonstrative type with unicode characters", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to値", "project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to値");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_DEMONSTRATIVE_TYPE);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsParser - layer type with unicode characters", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project値", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project値");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_LAYER_TYPE);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsParser - demonstrative type with special characters", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to@123", "project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to@123");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_DEMONSTRATIVE_TYPE);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsParser - layer type with special characters", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project@123", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project@123");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_LAYER_TYPE);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsParser - valid params with multiple options", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project", [
    "--from=src",
    "--destination=dist",
    "--uv-test1=value1",
    "--uv-test2=value2"
  ]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsParser - valid params with empty option value", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project", ["--from="]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsParser - valid params with whitespace option value", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project", ["--from=   "]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsParser - valid params with invalid option format", () => {
  const parser = new DoubleParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse("to", "project", ["--from src"]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_OPTION);
  assertEquals(result.error?.category, ErrorCategory.SYNTAX);
}); 