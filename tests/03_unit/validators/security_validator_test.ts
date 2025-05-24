/**
 * Security Validator Test Suite
 * 
 * Purpose:
 * - Test validation of input for security vulnerabilities
 * - Verify detection of potentially dangerous characters and patterns
 * - Test handling of various security scenarios
 * - Ensure proper error handling for security violations
 * 
 * Design Principles:
 * 1. Test all security validation rules
 * 2. Verify proper error handling for security violations
 * 3. Test handling of edge cases
 * 4. Ensure comprehensive security coverage
 * 
 * Related Documentation:
 * - docs/validation.md: Validation strategy and rules
 * - docs/security.md: Security validation rules
 * - docs/params.md: Parameter handling guidelines
 * 
 * Test Categories:
 * 1. Command injection tests
 * 2. Special character tests
 * 3. Pattern matching tests
 * 4. Edge case tests
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { SecurityValidator } from "../../../src/validators/security_validator.ts";
import { ErrorCode, ErrorCategory } from "../../../src/types.ts";

// Command injection tests
Deno.test("SecurityValidator - command injection with semicolon", () => {
  const validator = new SecurityValidator();
  const result = validator.validate("test;ls");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result?.category, ErrorCategory.SECURITY);
});

Deno.test("SecurityValidator - command injection with pipe", () => {
  const validator = new SecurityValidator();
  const result = validator.validate("test|ls");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result?.category, ErrorCategory.SECURITY);
});

Deno.test("SecurityValidator - command injection with ampersand", () => {
  const validator = new SecurityValidator();
  const result = validator.validate("test&ls");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result?.category, ErrorCategory.SECURITY);
});

// Special character tests
Deno.test("SecurityValidator - backtick injection", () => {
  const validator = new SecurityValidator();
  const result = validator.validate("test`ls`");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result?.category, ErrorCategory.SECURITY);
});

Deno.test("SecurityValidator - dollar sign injection", () => {
  const validator = new SecurityValidator();
  const result = validator.validate("test$(ls)");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result?.category, ErrorCategory.SECURITY);
});

// Pattern matching tests
Deno.test("SecurityValidator - multiple security violations", () => {
  const validator = new SecurityValidator();
  const result = validator.validate("test;ls|cat&rm`file`$(pwd)");
  
  assertExists(result);
  assertEquals(result?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result?.category, ErrorCategory.SECURITY);
});

Deno.test("SecurityValidator - valid input", () => {
  const validator = new SecurityValidator();
  const result = validator.validate("valid-input");
  
  assertEquals(result, undefined);
});

// Edge case tests
Deno.test("SecurityValidator - empty string", () => {
  const validator = new SecurityValidator();
  const result = validator.validate("");
  
  assertEquals(result, undefined);
});

Deno.test("SecurityValidator - whitespace only", () => {
  const validator = new SecurityValidator();
  const result = validator.validate("   ");
  
  assertEquals(result, undefined);
});

Deno.test("SecurityValidator - special characters in valid context", () => {
  const validator = new SecurityValidator();
  const result = validator.validate("test-with-hyphens");
  
  assertEquals(result, undefined);
}); 