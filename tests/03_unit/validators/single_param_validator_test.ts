/**
 * Single Param Validator Test Suite
 * 
 * Purpose:
 * - Test validation of commands with a single parameter
 * - Verify command validation against allowed commands
 * - Test handling of help and version flags
 * - Ensure proper error handling for invalid commands
 * - Test security validation for command input
 * 
 * Design Principles:
 * 1. Test all valid command combinations
 * 2. Verify proper error handling for invalid inputs
 * 3. Test security validation for command input
 * 4. Ensure proper handling of help/version flags
 * 
 * Related Documentation:
 * - docs/validation.md: Validation strategy and rules
 * - docs/params.md: Parameter handling guidelines
 * - docs/security.md: Security validation rules
 * - docs/commands.md: Command structure and rules
 * 
 * Test Categories:
 * 1. Command validation tests
 * 2. Security validation tests
 * 3. Help and version flag tests
 * 4. Error handling tests
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { SingleParamValidator } from "../../../src/validators/single_param_validator.ts";
import { ErrorCode, ErrorCategory } from "../../../src/types.ts";

// Command validation tests
Deno.test("SingleParamValidator - valid command", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", []);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertEquals(result.error, undefined);
});

Deno.test("SingleParamValidator - invalid command", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("invalid", []);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "invalid");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_COMMAND);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("SingleParamValidator - empty command", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("", []);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

// Security validation tests
Deno.test("SingleParamValidator - security error in command", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init;ls", []);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init;ls");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error?.category, ErrorCategory.SECURITY);
});

// Help and version flag tests
Deno.test("SingleParamValidator - help flag", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--help"]);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertEquals(result.help, true);
  assertEquals(result.version, false);
  assertEquals(result.error, undefined);
});

Deno.test("SingleParamValidator - version flag", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--version"]);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertEquals(result.help, false);
  assertEquals(result.version, true);
  assertEquals(result.error, undefined);
});

// Error handling tests
Deno.test("SingleParamValidator - invalid custom variable", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--uv-test;ls"]);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error?.category, ErrorCategory.SECURITY);
});

Deno.test("SingleParamValidator - unknown option", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--unknown"]);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.UNKNOWN_OPTION);
  assertEquals(result.error?.category, ErrorCategory.SYNTAX);
});

Deno.test("SingleParamValidator - multiple options", () => {
  const validator = new SingleParamValidator();
  const result = validator.validate("init", ["--help", "--version"]);
  
  assertEquals(result.type, "single");
  assertEquals(result.command, "init");
  assertEquals(result.help, true);
  assertEquals(result.version, true);
  assertEquals(result.error, undefined);
}); 