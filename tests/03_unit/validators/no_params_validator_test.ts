/**
 * No Params Validator Test Suite
 * 
 * Purpose:
 * - Test validation of commands with no parameters
 * - Verify handling of help and version flags
 * - Test custom variable validation in no-params context
 * - Ensure proper error handling for invalid options
 * 
 * Design Principles:
 * 1. Test all valid flag combinations
 * 2. Verify proper error handling for invalid inputs
 * 3. Test custom variable validation
 * 4. Ensure security checks are performed
 * 
 * Related Documentation:
 * - docs/validation.md: Validation strategy and rules
 * - docs/params.md: Parameter handling guidelines
 * - docs/security.md: Security validation rules
 * 
 * Test Categories:
 * 1. Help and version flag tests
 * 2. Custom variable validation
 * 3. Security validation
 * 4. Error handling
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { NoParamsValidator } from "../../../src/validators/no_params_validator.ts";
import { ErrorCode, ErrorCategory } from "../../../src/types.ts";

// Help and version flag tests
Deno.test("NoParamsValidator - help flag", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--help"]);
  
  assertEquals(result.help, true);
  assertEquals(result.version, false);
  assertEquals(result.error, undefined);
});

Deno.test("NoParamsValidator - version flag", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--version"]);
  
  assertEquals(result.help, false);
  assertEquals(result.version, true);
  assertEquals(result.error, undefined);
});

Deno.test("NoParamsValidator - short help flag", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["-h"]);
  
  assertEquals(result.help, true);
  assertEquals(result.version, false);
  assertEquals(result.error, undefined);
});

Deno.test("NoParamsValidator - short version flag", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["-v"]);
  
  assertEquals(result.help, false);
  assertEquals(result.version, true);
  assertEquals(result.error, undefined);
});

Deno.test("NoParamsValidator - multiple flags", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--help", "--version"]);
  
  assertEquals(result.help, true);
  assertEquals(result.version, true);
  assertEquals(result.error, undefined);
});

// Custom variable validation tests
Deno.test("NoParamsValidator - custom variable with security error", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--uv-test;ls"]);
  
  assertEquals(result.help, false);
  assertEquals(result.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error?.category, ErrorCategory.SECURITY);
});

Deno.test("NoParamsValidator - unknown option", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--unknown"]);
  
  assertEquals(result.help, false);
  assertEquals(result.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.UNKNOWN_OPTION);
  assertEquals(result.error?.category, ErrorCategory.SYNTAX);
});

Deno.test("NoParamsValidator - valid custom variable", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate(["--uv-test=value"]);
  
  assertEquals(result.help, false);
  assertEquals(result.version, false);
  assertEquals(result.error, undefined);
});

// Empty input test
Deno.test("NoParamsValidator - empty args", () => {
  const validator = new NoParamsValidator();
  const result = validator.validate([]);
  
  assertEquals(result.help, false);
  assertEquals(result.version, false);
  assertEquals(result.error, undefined);
}); 