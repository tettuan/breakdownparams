import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ValidatorFactory } from "../../../src/validators/validator_factory.ts";
import { NoParamsValidator } from "../../../src/validators/no_params_validator.ts";
import { SingleParamValidator } from "../../../src/validators/single_param_validator.ts";
import { DoubleParamsValidator } from "../../../src/validators/double_params_validator.ts";
import { ConfigValidator } from "../../../src/validators/config_validator.ts";
import { SecurityValidator } from "../../../src/validators/security_validator.ts";
import { CustomVariableValidator } from "../../../src/validators/custom_variable_validator.ts";
import { RequiredFieldValidator } from "../../../src/validators/required_field_validator.ts";

Deno.test("ValidatorFactory - getInstance returns singleton instance", () => {
  const instance1 = ValidatorFactory.getInstance();
  const instance2 = ValidatorFactory.getInstance();
  
  assertEquals(instance1, instance2);
});

Deno.test("ValidatorFactory - createNoParamsValidator", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createNoParamsValidator();
  
  assertExists(validator);
  assertEquals(validator instanceof NoParamsValidator, true);
});

Deno.test("ValidatorFactory - createSingleParamValidator", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createSingleParamValidator();
  
  assertExists(validator);
  assertEquals(validator instanceof SingleParamValidator, true);
});

Deno.test("ValidatorFactory - createDoubleParamsValidator", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createDoubleParamsValidator();
  
  assertExists(validator);
  assertEquals(validator instanceof DoubleParamsValidator, true);
});

Deno.test("ValidatorFactory - createConfigValidator", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createConfigValidator();
  
  assertExists(validator);
  assertEquals(validator instanceof ConfigValidator, true);
});

Deno.test("ValidatorFactory - createSecurityValidator", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createSecurityValidator();
  
  assertExists(validator);
  assertEquals(validator instanceof SecurityValidator, true);
});

Deno.test("ValidatorFactory - createCustomVariableValidator", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createCustomVariableValidator();
  
  assertExists(validator);
  assertEquals(validator instanceof CustomVariableValidator, true);
});

Deno.test("ValidatorFactory - createRequiredFieldValidator", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createRequiredFieldValidator();
  
  assertExists(validator);
  assertEquals(validator instanceof RequiredFieldValidator, true);
});

Deno.test("ValidatorFactory - createValidator with invalid type", () => {
  const factory = ValidatorFactory.getInstance();
  const validator = factory.createValidator("invalid" as any);
  
  assertEquals(validator, null);
}); 