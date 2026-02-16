import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { BaseValidator } from '../base_validator.ts';
import type { ValidationResult } from '../../../types/validation_result.ts';

const logger = new BreakdownLogger('param-validator');

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
  logger.debug('Base validator result', {
    data: { isValid: baseResult.isValid, validatedParams: baseResult.validatedParams },
  });
  assert(baseResult.isValid, 'Base validator should return valid result');
  assertEquals(baseResult.validatedParams, ['test'], 'Base validator should return correct params');
});
