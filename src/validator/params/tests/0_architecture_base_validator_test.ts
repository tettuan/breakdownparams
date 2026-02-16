import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { BaseValidator } from '../base_validator.ts';

const logger = new BreakdownLogger('param-validator');

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
  logger.debug('BaseValidator instance check', {
    data: { isBaseValidator: baseValidator instanceof BaseValidator },
  });
  assert(baseValidator instanceof BaseValidator, 'Should be instance of BaseValidator');
  assertEquals(typeof baseValidator.validate, 'function', 'Should have validate method');
});
