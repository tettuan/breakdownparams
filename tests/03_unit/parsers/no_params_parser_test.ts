import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { NoParamsParser } from "../../../src/parsers/no_params_parser.ts";
import { ValidatorFactory } from "../../../src/validators/validator_factory.ts";
import { ErrorCode, ErrorCategory } from "../../../src/types.ts";

Deno.test("NoParamsParser - help flag", () => {
  const parser = new NoParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse(["--help"]);
  
  assertEquals(result.type, "no-params");
  assertEquals(result.help, true);
  assertEquals(result.version, false);
  assertEquals(result.error, undefined);
});

Deno.test("NoParamsParser - version flag", () => {
  const parser = new NoParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse(["--version"]);
  
  assertEquals(result.type, "no-params");
  assertEquals(result.help, false);
  assertEquals(result.version, true);
  assertEquals(result.error, undefined);
});

Deno.test("NoParamsParser - short help flag", () => {
  const parser = new NoParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse(["-h"]);
  
  assertEquals(result.type, "no-params");
  assertEquals(result.help, true);
  assertEquals(result.version, false);
  assertEquals(result.error, undefined);
});

Deno.test("NoParamsParser - short version flag", () => {
  const parser = new NoParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse(["-v"]);
  
  assertEquals(result.type, "no-params");
  assertEquals(result.help, false);
  assertEquals(result.version, true);
  assertEquals(result.error, undefined);
});

Deno.test("NoParamsParser - multiple flags", () => {
  const parser = new NoParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse(["--help", "--version"]);
  
  assertEquals(result.type, "no-params");
  assertEquals(result.help, true);
  assertEquals(result.version, true);
  assertEquals(result.error, undefined);
});

Deno.test("NoParamsParser - custom variable with security error", () => {
  const parser = new NoParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse(["--uv-test;ls"]);
  
  assertEquals(result.type, "no-params");
  assertEquals(result.help, false);
  assertEquals(result.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error?.category, ErrorCategory.SECURITY);
});

Deno.test("NoParamsParser - unknown option", () => {
  const parser = new NoParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse(["--unknown"]);
  
  assertEquals(result.type, "no-params");
  assertEquals(result.help, false);
  assertEquals(result.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.UNKNOWN_OPTION);
  assertEquals(result.error?.category, ErrorCategory.SYNTAX);
});

Deno.test("NoParamsParser - valid custom variable", () => {
  const parser = new NoParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse(["--uv-test=value"]);
  
  assertEquals(result.type, "no-params");
  assertEquals(result.help, false);
  assertEquals(result.version, false);
  assertEquals(result.error, undefined);
});

Deno.test("NoParamsParser - empty args", () => {
  const parser = new NoParamsParser(ValidatorFactory.getInstance());
  const result = parser.parse([]);
  
  assertEquals(result.type, "no-params");
  assertEquals(result.help, false);
  assertEquals(result.version, false);
  assertEquals(result.error, undefined);
}); 