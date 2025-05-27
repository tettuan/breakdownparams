import { assertEquals, assertExists } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ValidatorFactory } from '../../../src/validators/validator_factory.ts';
import { SecurityErrorValidator } from '../../../src/core/errors/validators/security_error_validator.ts';
import { OneParamValidator } from '../../../src/validators/one_param_validator.ts';
import { TwoParamValidator } from '../../../src/validators/two_params_validator.ts';
import { ZeroParamsValidator } from '../../../src/validators/zero_params_validator.ts';
import { CustomVariableValidator } from '../../../src/validators/custom_variable_validator.ts';

Deno.test('ValidatorFactory', async (t) => {
  const factory = ValidatorFactory.getInstance();

  await t.step('should return singleton instance', () => {
    const instance1 = ValidatorFactory.getInstance();
    const instance2 = ValidatorFactory.getInstance();
    assertEquals(instance1, instance2);
  });

  await t.step('should return security validator', () => {
    const validator = factory.getValidator('security');
    assertExists(validator);
    assertEquals(validator instanceof SecurityErrorValidator, true);
  });

  await t.step('should return single param validator', () => {
    const validator = factory.getValidator('one');
    assertExists(validator);
    assertEquals(validator instanceof OneParamValidator, true);
  });

  await t.step('should return double params validator', () => {
    const validator = factory.getValidator('two');
    assertExists(validator);
    assertEquals(validator instanceof TwoParamValidator, true);
  });

  await t.step('should return no params validator', () => {
    const validator = factory.getValidator('zero');
    assertExists(validator);
    assertEquals(validator instanceof ZeroParamsValidator, true);
  });

  await t.step('should return custom variable validator', () => {
    const validator = factory.getValidator('custom_variable');
    assertExists(validator);
    assertEquals(validator instanceof CustomVariableValidator, true);
  });

  await t.step('should throw error for unknown validator type', () => {
    try {
      factory.getValidator('unknown');
      throw new Error('Expected error was not thrown');
    } catch (error: unknown) {
      if (error instanceof Error) {
        assertEquals(error.message, 'Validator not found: unknown');
      } else {
        throw new Error('Unexpected error type');
      }
    }
  });
});
