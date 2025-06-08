import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BaseValidator } from '../base_validator.ts';
import { ValidationResult } from '../../../types/validation_result.ts';

Deno.test('test_base_validator_structure', () => {
  class TestValidator extends BaseValidator {
    validate(params: string[]): ValidationResult {
      return {
        isValid: true,
        validatedParams: params,
      };
    }
  }

  const baseValidator = new TestValidator();
  const baseResult = baseValidator.validate(['test']);
  assertEquals(baseResult.isValid, true, 'Base validator should return valid result');
  assertEquals(baseResult.validatedParams, ['test'], 'Base validator should return correct params');
});
