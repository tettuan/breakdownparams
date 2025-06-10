import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BaseValidator } from '../base_validator.ts';

Deno.test('test_base_validator_architecture', () => {
  class TestValidator extends BaseValidator {
    validate(params: string[]): { isValid: boolean; validatedParams: string[] } {
      return {
        isValid: true,
        validatedParams: params,
      };
    }
  }

  const baseValidator = new TestValidator();
  assertEquals(baseValidator instanceof BaseValidator, true, 'Should be instance of BaseValidator');
  assertEquals(typeof baseValidator.validate, 'function', 'Should have validate method');
});
