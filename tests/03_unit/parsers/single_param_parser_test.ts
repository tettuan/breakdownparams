import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { SingleParamParser } from "../../../src/parsers/single_param_parser.ts";
import { ValidatorFactory } from "../../../src/validators/validator_factory.ts";
import { ErrorCode, ErrorCategory } from "../../../src/types.ts";

Deno.test("SingleParamParser - valid init command", () => {
  const parser = new SingleParamParser(ValidatorFactory.getInstance());
  const result = parser.parse("init", []);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertEquals(result.error, undefined);
});

Deno.test("SingleParamParser - invalid command", () => {
  const parser = new SingleParamParser(ValidatorFactory.getInstance());
  const result = parser.parse("invalid", []);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_COMMAND);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("SingleParamParser - empty command", () => {
  const parser = new SingleParamParser(ValidatorFactory.getInstance());
  const result = parser.parse("", []);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("SingleParamParser - command with security error", () => {
  const parser = new SingleParamParser(ValidatorFactory.getInstance());
  const result = parser.parse("init;ls", []);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error?.category, ErrorCategory.SECURITY);
});

Deno.test("SingleParamParser - valid command with help flag", () => {
  const parser = new SingleParamParser(ValidatorFactory.getInstance());
  const result = parser.parse("init", ["--help"]);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertEquals(result.error, undefined);
});

Deno.test("SingleParamParser - valid command with version flag", () => {
  const parser = new SingleParamParser(ValidatorFactory.getInstance());
  const result = parser.parse("init", ["--version"]);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertEquals(result.error, undefined);
});

Deno.test("SingleParamParser - valid command with custom variable", () => {
  const parser = new SingleParamParser(ValidatorFactory.getInstance());
  const result = parser.parse("init", ["--uv-test=value"]);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertEquals(result.error, undefined);
});

Deno.test("SingleParamParser - valid command with invalid custom variable", () => {
  const parser = new SingleParamParser(ValidatorFactory.getInstance());
  const result = parser.parse("init", ["--uv-test;ls"]);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error?.category, ErrorCategory.SECURITY);
});

Deno.test("SingleParamParser - valid command with unknown option", () => {
  const parser = new SingleParamParser(ValidatorFactory.getInstance());
  const result = parser.parse("init", ["--unknown"]);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.UNKNOWN_OPTION);
  assertEquals(result.error?.category, ErrorCategory.SYNTAX);
});

Deno.test("SingleParamParser - valid command with options", () => {
  const parser = new SingleParamParser(ValidatorFactory.getInstance());
  const result = parser.parse("init", ["--from=src", "--destination=dist"]);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertEquals(result.error, undefined);
  assertEquals(result.options.from, "src");
  assertEquals(result.options.destination, "dist");
}); 