/**
 * Validator Factory Test Suite
 * 
 * Purpose:
 * - Test the ValidatorFactory's ability to create and manage validator instances
 * - Verify the singleton pattern implementation
 * - Ensure proper validator type creation and caching
 * 
 * Design Principles:
 * 1. Test factory's singleton behavior
 * 2. Verify correct validator type creation
 * 3. Test validator instance caching
 * 4. Ensure proper initialization of validators with required parameters
 * 
 * Related Documentation:
 * - docs/factory.md: Factory pattern implementation details
 * - docs/validation.md: Validation strategy and rules
 * - docs/types.md: Type definitions and validator interfaces
 * 
 * Test Categories:
 * 1. Singleton pattern tests
 * 2. Validator creation tests
 * 3. Validator type verification
 * 4. Instance caching tests
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ValidatorFactory } from "../../../src/validators/validator_factory.ts";
import { NoParamsValidator } from "../../../src/validators/no_params_validator.ts";
import { SingleParamValidator } from "../../../src/validators/single_param_validator.ts";
import { DoubleParamsValidator } from "../../../src/validators/double_params_validator.ts";
import { SecurityValidator } from "../../../src/validators/security_validator.ts";
import { CustomVariableValidator } from "../../../src/validators/custom_variable_validator.ts";
import { RequiredFieldValidator } from "../../../src/validators/required_field_validator.ts";

// Singleton pattern tests
Deno.test("ValidatorFactory - singleton instance", () => {
  const instance1 = ValidatorFactory.getInstance();
  const instance2 = ValidatorFactory.getInstance();
  
  assertEquals(instance1, instance2);
});

// Validator creation tests
Deno.test("ValidatorFactory - NoParamsValidator creation", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createNoParamsValidator();
  
  assertExists(validator);
  assertEquals(validator instanceof NoParamsValidator, true);
});

Deno.test("ValidatorFactory - SingleParamValidator creation", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createSingleParamValidator();
  
  assertExists(validator);
  assertEquals(validator instanceof SingleParamValidator, true);
});

Deno.test("ValidatorFactory - DoubleParamsValidator creation", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createDoubleParamsValidator();
  
  assertExists(validator);
  assertEquals(validator instanceof DoubleParamsValidator, true);
});

Deno.test("ValidatorFactory - SecurityValidator creation", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createSecurityValidator();
  
  assertExists(validator);
  assertEquals(validator instanceof SecurityValidator, true);
});

Deno.test("ValidatorFactory - CustomVariableValidator creation", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createCustomVariableValidator();
  
  assertExists(validator);
  assertEquals(validator instanceof CustomVariableValidator, true);
});

Deno.test("ValidatorFactory - RequiredFieldValidator creation", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createRequiredFieldValidator("test");
  
  assertExists(validator);
  assertEquals(validator instanceof RequiredFieldValidator, true);
});

// Instance caching tests
Deno.test("ValidatorFactory - validator caching", () => {
  const factory = ValidatorFactory.getInstance();
  const validator1 = factory.createNoParamsValidator();
  const validator2 = factory.createNoParamsValidator();
  
  assertEquals(validator1, validator2);
}); 