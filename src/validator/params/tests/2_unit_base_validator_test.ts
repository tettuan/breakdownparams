import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { BaseValidator } from '../base_validator.ts';
import type { ValidationResult } from '../../../types/validation_result.ts';

const logger = new BreakdownLogger("param-validator");

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
  logger.debug("Base validator unit result", { data: { isValid: result.isValid, validatedParams: result.validatedParams } });
  assertEquals(result.isValid, true, 'Should return valid result');
  assertEquals(result.validatedParams, ['test'], 'Should return correct params');
});
