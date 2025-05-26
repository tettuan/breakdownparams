import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { OneParamParser } from "../../../src/core/params/processors/one_param_parser.ts";
import { ERROR_CODES, ERROR_CATEGORIES } from "../../../src/core/errors/constants.ts";
import { ValidatorFactory } from "../../../src/validators/validator_factory.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();

Deno.test("OneParamParser - valid init command", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init"]);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "one");
  assertEquals(result.data?.command, "init");
});

Deno.test("OneParamParser - invalid command", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["invalid"]);
  assertEquals(result.success, false);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test("OneParamParser - empty command", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate([""]);
  assertEquals(result.success, false);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test("OneParamParser - command with security error", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init;ls"]);
  logger.debug("Security error test result:", { result });
  assertEquals(result.success, false);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test("OneParamParser - valid command with help flag", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init", "--help"]);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "one");
  assertEquals(result.data?.command, "init");
});

Deno.test("OneParamParser - valid command with version flag", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init", "--version"]);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "one");
  assertEquals(result.data?.command, "init");
});

Deno.test("OneParamParser - valid command with custom variable", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init", "--uv-test=value"]);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "one");
  assertEquals(result.data?.command, "init");
  assertEquals(result.data?.options?.["uv-test"], "value");
});

Deno.test("OneParamParser - valid command with invalid custom variable", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init", "--uv-test;ls"]);
  logger.debug("Invalid custom variable test result:", { result });
  assertEquals(result.success, false);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test("OneParamParser - valid command with unknown option", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init", "--unknown"]);
  logger.debug("Unknown option test result:", { result });
  assertEquals(result.success, false);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test("OneParamParser - valid command with options", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init", "--from=src", "--destination=dist"]);
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "one");
  assertEquals(result.data?.command, "init");
  assertEquals(result.data?.options?.["fromFile"], "src");
  assertEquals(result.data?.options?.["destinationFile"], "dist");
});

// 追加のテストケース
Deno.test("OneParamParser - command with whitespace", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["  init  "]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "one");
  assertEquals(result.data?.command, "init");
  assertEquals(result.error, undefined);
});

Deno.test("OneParamParser - command with mixed case", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["InIt"]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "one");
  assertEquals(result.data?.command, "init");
  assertEquals(result.error, undefined);
});

Deno.test("OneParamParser - command with unicode characters", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init値"]);
  
  assertEquals(result.success, false);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test("OneParamParser - command with special characters", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init@123"]);
  
  assertEquals(result.success, false);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test("OneParamParser - command with multiple options", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate([
    "init",
    "--from=src",
    "--destination=dist",
    "--uv-test1=value1",
    "--uv-test2=value2"
  ]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "one");
  assertEquals(result.data?.command, "init");
  assertEquals(result.error, undefined);
  assertEquals(result.data?.options?.["fromFile"], "src");
  assertEquals(result.data?.options?.["destinationFile"], "dist");
});

Deno.test("OneParamParser - command with empty option value", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init", "--from="]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "one");
  assertEquals(result.data?.command, "init");
  assertEquals(result.error, undefined);
  assertEquals(result.data?.options?.["fromFile"], "");
});

Deno.test("OneParamParser - command with whitespace option value", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init", "--from=   "]);
  
  assertEquals(result.success, true);
  assertEquals(result.data?.type, "one");
  assertEquals(result.data?.command, "init");
  assertEquals(result.error, undefined);
  assertEquals(result.data?.options?.["fromFile"], "   ");
});

Deno.test("OneParamParser - command with invalid option format", () => {
  const parser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(["init", "--from src"]);
  logger.debug("Invalid option format test result:", { result });
  assertEquals(result.success, false);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});
