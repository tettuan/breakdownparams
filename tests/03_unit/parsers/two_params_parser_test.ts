import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { TwoParamsParser } from "../../../src/core/params/processors/two_params_parser.ts";
import { ERROR_CODES, ERROR_CATEGORIES } from "../../../src/core/errors/constants.ts";
import { TwoParamResult, ParseResult } from "../../../src/core/params/definitions/types.ts";

Deno.test("TwoParamsParser: should parse double param command", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result: ParseResult<TwoParamResult> = parser.validate(["to", "project", "--from=test.txt"]);
  assertExists(result);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - valid standard mode params", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "project", "--from=test.txt"]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - valid extended mode params", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["custom", "custom", "--from=test.txt"]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "custom");
  assertEquals(result.data?.layerType, "custom");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - invalid demonstrative type", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["invalid", "project", "--from=test.txt"]);
  
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "invalid");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - invalid layer type", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "invalid", "--from=test.txt"]);
  
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "invalid");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - empty demonstrative type", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["", "project", "--from=test.txt"]);
  
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - empty layer type", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "", "--from=test.txt"]);
  
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - security error in demonstrative type", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to;ls", "project", "--from=test.txt"]);
  
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to;ls");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - security error in layer type", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "project;ls", "--from=test.txt"]);
  
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project;ls");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - valid params with help flag", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "project", "--help", "--from=test.txt"]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - valid params with version flag", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "project", "--version", "--from=test.txt"]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - valid params with custom variable", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "project", "--uv-test=value", "--from=test.txt"]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - valid params with invalid custom variable", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "project", "--uv-test;ls", "--from=test.txt"]);
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - valid params with unknown option", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "project", "--unknown", "--from=test.txt"]);
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

// 追加のテストケース
Deno.test("TwoParamsParser - demonstrative type with whitespace", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["  to  ", "project", "--from=test.txt"]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - layer type with whitespace", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "  project  ", "--from=test.txt"]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - demonstrative type with mixed case", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["To", "project", "--from=test.txt"]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - layer type with mixed case", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "Project", "--from=test.txt"]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - demonstrative type with unicode characters", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to値", "project", "--from=test.txt"]);
  
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to値");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - layer type with unicode characters", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "project値", "--from=test.txt"]);
  
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project値");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - demonstrative type with special characters", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to@123", "project", "--from=test.txt"]);
  
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to@123");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - layer type with special characters", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "project@123", "--from=test.txt"]);
  
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project@123");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - valid params with multiple options", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate([
    "to", 
    "project", 
    "--from=src",
    "--destination=dist",
    "--uv-test1=value1",
    "--uv-test2=value2",
    "--from=test.txt"
  ]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - valid params with empty option value", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "project", "--from=", "--destination=output.txt"]);
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.destinationFile, "output.txt");
});

Deno.test("TwoParamsParser - valid params with whitespace option value", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "project", "--from=   ", "--from=test.txt"]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.fromFile, "test.txt");
});

Deno.test("TwoParamsParser - valid params with invalid option format", () => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["to", "project", "--from", "--destination=output.txt"]);
  assertEquals(result.success, false);
  assertEquals(result.data?.type, "two");
  assertEquals(result.data?.demonstrativeType, "to");
  assertEquals(result.data?.layerType, "project");
  assertEquals(result.data?.options.destinationFile, "output.txt");
});

Deno.test("TwoParamsParser - error handling with options persistence", async (t) => {
  const parser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  await t.step("should preserve options when demonstrative type is invalid", () => {
    const result = parser.validate(["invalid", "project", "--from=test.txt"]);
    assertEquals(result.success, false);
    assertEquals(result.data?.options.fromFile, "test.txt");
  });
  await t.step("should preserve options when layer type is invalid", () => {
    const result = parser.validate(["to", "invalid", "--from=test.txt"]);
    assertEquals(result.success, false);
    assertEquals(result.data?.options.fromFile, "test.txt");
  });
  await t.step("should preserve options when custom variable is invalid", () => {
    const result = parser.validate(["to", "project", "--uv-test;ls", "--from=test.txt"]);
    assertEquals(result.success, false);
    assertEquals(result.data?.options.fromFile, "test.txt");
  });
  await t.step("should preserve options when option format is invalid", () => {
    const result = parser.validate(["to", "project", "--from", "--destination=output.txt"]);
    assertEquals(result.success, false);
    assertEquals(result.data?.options.destinationFile, "output.txt");
  });
}); 