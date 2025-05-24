/**
 * Double Params Validator Test Suite
 * 
 * Purpose:
 * - Test validation of commands with two parameters (demonstrative type and layer type)
 * - Verify validation in both standard and extended modes
 * - Test handling of help and version flags
 * - Ensure proper error handling for invalid parameters
 * - Test security validation for parameter input
 * 
 * Design Principles:
 * 1. Test all valid parameter combinations
 * 2. Verify proper error handling for invalid inputs
 * 3. Test security validation for parameter input
 * 4. Ensure proper handling of help/version flags
 * 5. Test both standard and extended mode validation
 * 
 * Related Documentation:
 * - docs/validation.md: Validation strategy and rules
 * - docs/params.md: Parameter handling guidelines
 * - docs/security.md: Security validation rules
 * - docs/types.md: Parameter type definitions
 * 
 * Test Categories:
 * 1. Standard mode validation tests
 * 2. Extended mode validation tests
 * 3. Security validation tests
 * 4. Help and version flag tests
 * 5. Error handling tests
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { DoubleParamsValidator } from "../../../src/validators/double_params_validator.ts";
import { ErrorCode, ErrorCategory, ParserConfig } from "../../../src/types.ts";

// Standard mode validation tests
Deno.test("DoubleParamsValidator - valid standard mode params", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.error, undefined);
});

// Extended mode validation tests
Deno.test("DoubleParamsValidator - valid extended mode params", () => {
  const config: ParserConfig = {
    isExtendedMode: true,
    demonstrativeType: {
      pattern: "^[a-z]+$",
      errorMessage: "Invalid demonstrative type"
    },
    layerType: {
      pattern: "^[a-z]+$",
      errorMessage: "Invalid layer type"
    }
  };
  const validator = new DoubleParamsValidator(config);
  const result = validator.validate("custom", "custom", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "custom");
  assertEquals(result.layerType, "custom");
  assertEquals(result.error, undefined);
});

// Error handling tests
Deno.test("DoubleParamsValidator - invalid demonstrative type", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("invalid", "project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "invalid");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_DEMONSTRATIVE_TYPE);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - invalid layer type", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "invalid", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "invalid");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_LAYER_TYPE);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - empty demonstrative type", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("", "project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

Deno.test("DoubleParamsValidator - empty layer type", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result.error?.category, ErrorCategory.VALIDATION);
});

// Security validation tests
Deno.test("DoubleParamsValidator - security error in demonstrative type", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to;ls", "project", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to;ls");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error?.category, ErrorCategory.SECURITY);
});

Deno.test("DoubleParamsValidator - security error in layer type", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project;ls", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project;ls");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error?.category, ErrorCategory.SECURITY);
});

// Help and version flag tests
Deno.test("DoubleParamsValidator - help flag", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--help"]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.help, true);
  assertEquals(result.version, false);
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsValidator - version flag", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--version"]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.help, false);
  assertEquals(result.version, true);
  assertEquals(result.error, undefined);
});

// Error handling tests
Deno.test("DoubleParamsValidator - invalid custom variable", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--uv-test;ls"]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error?.category, ErrorCategory.SECURITY);
});

Deno.test("DoubleParamsValidator - unknown option", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--unknown"]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.UNKNOWN_OPTION);
  assertEquals(result.error?.category, ErrorCategory.SYNTAX);
});

Deno.test("DoubleParamsValidator - multiple options", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "project", ["--help", "--version"]);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.help, true);
  assertEquals(result.version, true);
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsValidator - layer type alias", () => {
  const validator = new DoubleParamsValidator();
  const result = validator.validate("to", "pj", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "to");
  assertEquals(result.layerType, "project");
  assertEquals(result.error, undefined);
});

Deno.test("DoubleParamsValidator - invalid extended mode pattern", () => {
  const config: ParserConfig = {
    isExtendedMode: true,
    demonstrativeType: {
      pattern: "[invalid",
      errorMessage: "Invalid demonstrative type"
    },
    layerType: {
      pattern: "^[a-z]+$",
      errorMessage: "Invalid layer type"
    }
  };
  const validator = new DoubleParamsValidator(config);
  const result = validator.validate("custom", "custom", []);
  
  assertEquals(result.type, "double");
  assertEquals(result.demonstrativeType, "custom");
  assertEquals(result.layerType, "custom");
  assertExists(result.error);
  assertEquals(result.error?.code, ErrorCode.INVALID_PATTERN);
  assertEquals(result.error?.category, ErrorCategory.CONFIGURATION);
}); 