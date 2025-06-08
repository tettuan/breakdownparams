import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BaseValidator } from '../base_validator.ts';
import { ValidationResult } from '../../../types/validation_result.ts';

Deno.test('test_base_validator_unit', () => {
  class TestValidator extends BaseValidator {
    validate(params: string[]): ValidationResult {
      return {
        isValid: true,
        validatedParams: params,
      };
    }
  }

  const validator = new TestValidator();
  const result = validator.validate(['test']);
  assertEquals(result.isValid, true, 'Should return valid result');
  assertEquals(result.validatedParams, ['test'], 'Should return correct params');
}); 