import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { ZeroParamsValidator } from '../zero_params_validator.ts';

const logger = new BreakdownLogger("param-validator");

Deno.test('test_zero_params_validator_structure', () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate([]);
  logger.debug("Zero params validation result", { data: { isValid: result.isValid, validatedParams: result.validatedParams } });
  assertEquals(result.isValid, true, 'Zero params validator should accept empty params');
  assertEquals(result.validatedParams, [], 'Zero params validator should return empty params');
});
