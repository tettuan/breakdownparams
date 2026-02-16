import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { ZeroParamsValidator } from '../zero_params_validator.ts';

const logger = new BreakdownLogger("param-validator");

Deno.test('test_zero_params_validator_unit', () => {
  const validator = new ZeroParamsValidator();

  // Normal case test
  const validResult = validator.validate([]);
  logger.debug("Valid zero params result", { data: { isValid: validResult.isValid, validatedParams: validResult.validatedParams } });
  assertEquals(validResult.isValid, true, 'Empty params should be valid');
  assertEquals(validResult.validatedParams, [], 'Should return empty params');

  // Abnormal case test
  const invalidResult = validator.validate(['test']);
  logger.debug("Invalid zero params result", { data: { isValid: invalidResult.isValid, errorCode: invalidResult.errorCode } });
  assertEquals(invalidResult.isValid, false, 'Non-empty params should be invalid');
  assertEquals(
    invalidResult.errorMessage,
    'Expected zero parameters',
    'Should return correct error message',
  );
  assertEquals(invalidResult.errorCode, 'INVALID_PARAMS', 'Should return correct error code');
});
